import time
from typing import List, Dict, Any, Tuple
from openai import OpenAI
from rag_chatbot.config import config
from rag_chatbot.embeddings.provider import get_embedding_provider
from rag_chatbot.vector_storage.factory import get_vector_store
from rag_chatbot.retrieval.pipeline import retrieve_context
from rag_chatbot.prompt_management.prompts import SYSTEM_PROMPT, format_context_block
from rag_chatbot.memory.session import get_session_memory
from rag_chatbot.utilities.logger import log_query, log_retrieval, log_response, log_error
from rag_chatbot.document_ingestion.pipeline import ingest_document
from rag_chatbot.chunking.splitter import create_chunks

class RAGChatbotEngine:
    def __init__(self):
        self.embeddings = get_embedding_provider()
        self.store = get_vector_store()
        self.memory = get_session_memory()
        self.api_key = config.openai_api_key
        
        self.is_mock = not self.api_key
        if not self.is_mock:
            self.client = OpenAI(api_key=self.api_key)

    def upload_document(self, filepath: str) -> str:
        """Ingests, chunks, embeds, and indexes a file into the vector store."""
        try:
            doc = ingest_document(filepath)
            chunks = create_chunks(doc, config.chunk_size, config.chunk_overlap)
            
            if not chunks:
                return "The document contains no valid text segments."
                
            # Generate embeddings
            texts = [c.text for c in chunks]
            vectors = self.embeddings.get_embeddings(texts)
            
            # Store in database
            self.store.add_chunks(chunks, vectors)
            return f"Ingested '{doc.filename}' successfully! ID: {doc.doc_id} | Created {len(chunks)} chunks."
        except Exception as e:
            log_error(f"Failed to ingest document: {filepath}", e)
            raise e

    def _query_mock_llm(self, question: str, context_chunks: List[Dict[str, Any]]) -> Tuple[str, Dict[str, int]]:
        """Processes query context offline to answer questions when OpenAI API key is missing."""
        if not context_chunks:
            return "I couldn't find that information in the uploaded documents.", {"prompt_tokens": 0, "completion_tokens": 0}
            
        # Match keywords in retrieved chunks
        q_words = [w for w in question.lower().split() if len(w) > 3]
        best_chunk = None
        best_matches = 0
        for chunk in context_chunks:
            matches = sum(1 for w in q_words if w in chunk["text"].lower())
            if matches > best_matches:
                best_matches = matches
                best_chunk = chunk
                
        if not best_chunk:
            best_chunk = context_chunks[0]
            
        summary_text = best_chunk['text']
        # Shorten text to look like a precise snippet
        if len(summary_text) > 300:
            summary_text = summary_text[:300] + "..."
            
        reply = f"[Offline Mode] Based on context: {summary_text}"
        return reply, {"prompt_tokens": 100, "completion_tokens": 40}

    def ask(self, question: str, session_id: str = "default_session") -> Tuple[str, List[Dict[str, Any]]]:
        """Resolves queries using vector similarity search, prompts, memory turns, and appends source citations."""
        log_query(question, session_id)
        
        try:
            # 1. Embed query
            query_vector = self.embeddings.get_embedding(question)
            
            # 2. Retrieve contexts
            retrieval_start = time.time()
            context_chunks = retrieve_context(query_vector, self.store)
            # Filter out chunks below minimum relevance threshold (0.35) to prevent hallucinations
            context_chunks = [c for c in context_chunks if c["score"] >= 0.35]
            
            retrieval_latency = (time.time() - retrieval_start) * 1000
            log_retrieval(context_chunks, retrieval_latency)
            
            if not context_chunks:
                reply = "I couldn't find that information in the uploaded documents."
                self.memory.add_message(session_id, "user", question)
                self.memory.add_message(session_id, "assistant", reply)
                return reply, []
                
            # 3. Build Prompt with Context & History
            context_str = format_context_block(context_chunks)
            system_instructions = SYSTEM_PROMPT.format(context=context_str)
            
            history = self.memory.get_history(session_id)
            messages = [{"role": "system", "content": system_instructions}]
            for turn in history:
                messages.append({"role": turn["role"], "content": turn["content"]})
            messages.append({"role": "user", "content": question})
            
            # 4. Invoke LLM
            llm_start = time.time()
            if self.is_mock:
                reply, token_usage = self._query_mock_llm(question, context_chunks)
            else:
                response = self.client.chat.completions.create(
                    model=config.llm_model,
                    messages=messages,
                    temperature=config.temperature,
                    max_tokens=config.max_tokens
                )
                reply = response.choices[0].message.content or ""
                token_usage = {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens
                }
                
            llm_latency = (time.time() - llm_start) * 1000
            log_response(reply, token_usage, llm_latency)
            
            # 5. Format citations
            sources = []
            seen_sources = set()
            for chunk in context_chunks:
                meta = chunk["metadata"]
                filename = meta.get("filename", "Unknown")
                page = meta.get("page_number", 1)
                chunk_id = chunk["chunk_id"]
                source_key = f"{filename} (Page {page})"
                if source_key not in seen_sources:
                    seen_sources.add(source_key)
                    sources.append(f"• {filename} (Page {page}) [ID: {chunk_id}]")
            
            if reply != "I couldn't find that information in the uploaded documents." and sources:
                reply += "\n\n**Sources:**\n" + "\n".join(sources)
                
            # 6. Save turn in memory
            self.memory.add_message(session_id, "user", question)
            self.memory.add_message(session_id, "assistant", reply)
            
            return reply, context_chunks
            
        except Exception as e:
            log_error("Exception in query resolution loop", e)
            return "An internal error occurred while processing your request. Please check RAG configuration.", []
