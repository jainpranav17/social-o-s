import os
import shutil
from rag_chatbot.document_ingestion.pipeline import ingest_document
from rag_chatbot.chunking.splitter import create_chunks
from rag_chatbot.embeddings.provider import get_embedding_provider
from rag_chatbot.vector_storage.chroma_store import ChromaVectorStore
from rag_chatbot.retrieval.pipeline import retrieve_context
from rag_chatbot.chatbot_engine.core import RAGChatbotEngine

def run_tests():
    print("=" * 60)
    print("Running RAG Chatbot Backend Verification Tests")
    print("=" * 60)
    
    # 1. Setup a test document
    test_filepath = "test_document.txt"
    with open(test_filepath, "w", encoding="utf-8") as f:
        f.write(
            "SocialOS FAQ and Guide Document.\n\n"
            "Question: How do I link an Instagram profile?\n"
            "Answer: Go to Connected Platforms and click Link Instagram. "
            "Complete the login details to authorize SocialOS.\n\n"
            "Question: What is the virality score?\n"
            "Answer: The virality score is a percentage estimate of content performance "
            "predicted by Gemini."
        )
    print("[TEST] Created temporary test document.")

    try:
        # 2. Test Ingestion
        doc = ingest_document(test_filepath)
        assert doc.filename == "test_document.txt", "Ingestion filename mismatch"
        assert "SocialOS" in doc.text, "Ingestion content parsed incorrectly"
        print("[TEST] Ingestion parses plain text correctly.")

        # 3. Test Chunking Splitter
        chunks = create_chunks(doc, chunk_size=100, chunk_overlap=10)
        assert len(chunks) > 1, f"Expected multiple chunks, got {len(chunks)}"
        assert chunks[0].doc_id == doc.doc_id, "Chunk doc_id mismatch"
        print(f"[TEST] Chunking generated {len(chunks)} overlapping segments.")

        # 4. Test Embedding Provider Mock Vector Output
        provider = get_embedding_provider()
        v = provider.get_embedding("Instagram link setup")
        assert len(v) == 1536, f"Mock vector size mismatch, expected 1536, got {len(v)}"
        print("[TEST] Embeddings module returns correct 1536-dimensional mock vectors.")

        # 5. Test local Chroma Indexing & Retrieval
        persist_dir = "./test_chroma_db"
        # Reset any existing test DB
        if os.path.exists(persist_dir):
            shutil.rmtree(persist_dir)
            
        store = ChromaVectorStore(persist_dir=persist_dir)
        vectors = provider.get_embeddings([c.text for c in chunks])
        store.add_chunks(chunks, vectors)
        
        # Ingested items check
        indexed = store.list_documents()
        assert len(indexed) == 1, f"Expected 1 document, got {len(indexed)}"
        assert indexed[0]["filename"] == "test_document.txt", "Indexed document name mismatch"
        print("[TEST] Vector Storage correctly indexed chunks and listed documents.")

        # 6. Test Similarity Search
        query_v = provider.get_embedding("How do I link an Instagram profile?")
        retrieved = retrieve_context(query_v, store, top_k=2)
        assert len(retrieved) > 0, "No chunks retrieved"
        assert any("instagram" in item["text"].lower() for item in retrieved), "Did not retrieve relevant chunk"
        print("[TEST] Retrieval pipeline matched relevant query chunks successfully.")

        # 7. Test Chatbot Engine core answer resolving (Offline Mode)
        engine = RAGChatbotEngine()
        # Set engine store to the test store
        engine.store = store
        
        # Test Query inside document context
        reply, context = engine.ask("How do I link an Instagram profile?", session_id="test_session")
        assert "[Offline Mode]" in reply or "instagram" in reply.lower(), f"Unexpected bot response: {reply}"
        assert len(context) > 0, "No context chunks returned by ask()"
        print("[TEST] Ask query returned correct summary output with cited sources.")
        
        # Test Query OUTSIDE document context (Groundedness Refusal Test)
        reply_outside, context_outside = engine.ask("What is the capital of France?", session_id="test_session")
        assert reply_outside == "I couldn't find that information in the uploaded documents.", f"Constraint failed. Bot replied: {reply_outside}"
        assert len(context_outside) == 0, "Context chunks should be empty for unrelated query"
        print("[TEST] Groundedness Rules validated: Bot correctly refused to answer unrelated question.")

        # 8. Test voice synthesis (TTS)
        tts_output = "test_response.mp3"
        if os.path.exists(tts_output):
            try: os.remove(tts_output)
            except Exception: pass
        engine.synthesize_response("This is a test response", output_path=tts_output)
        assert os.path.exists(tts_output), "Failed to generate speech audio output file"
        print("[TEST] Text-to-Speech (TTS) synthesized response output successfully.")
        
        # 9. Test voice transcription query (STT)
        dummy_audio = "test_instagram_query.wav"
        with open(dummy_audio, "w") as f:
            f.write("dummy audio content")
        try:
            q, r, c = engine.ask_voice(dummy_audio, session_id="test_session")
            assert "instagram" in q.lower(), f"Unexpected transcribed query: {q}"
            assert len(c) > 0, "Failed to retrieve relevant chunks via voice query transcription"
            print("[TEST] Speech-to-Text (STT) query transcription and RAG route validated.")
        finally:
            if os.path.exists(dummy_audio):
                try: os.remove(dummy_audio)
                except Exception: pass
            if os.path.exists(tts_output):
                try: os.remove(tts_output)
                except Exception: pass

        print("=" * 60)
        print("ALL RAG CHATBOT MODULE VERIFICATIONS COMPLETED SUCCESSFULLY")
        print("=" * 60)

    finally:
        # Cleanup test files safely on Windows environments
        if os.path.exists(test_filepath):
            try:
                os.remove(test_filepath)
            except Exception:
                pass
        if os.path.exists(persist_dir):
            try:
                shutil.rmtree(persist_dir)
            except Exception:
                pass

if __name__ == "__main__":
    run_tests()
