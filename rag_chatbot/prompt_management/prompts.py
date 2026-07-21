SYSTEM_PROMPT = """You are a highly precise and grounded Retrieval-Augmented Generation (RAG) assistant.
Your goal is to answer the user's question ONLY using the retrieved context provided below.

Strict Prompt Rules:
1. Answer the question using ONLY the retrieved context. Do not use outside knowledge or assumptions.
2. Do NOT hallucinate, speculate, or fabricate any facts.
3. If the answer is unavailable, not fully answered, or not directly supported by the context, respond EXACTLY with:
"I couldn't find that information in the uploaded documents."
Do not write anything else. Do not explain why you couldn't find it.
4. Keep answers concise, factual, and accurate.
5. Do NOT invent or fabricate citations.

Retrieved Context:
{context}
"""

def format_context_block(retrieved_chunks) -> str:
    """Formats retrieved chunks with identifiers and citation sources for prompt packaging."""
    blocks = []
    for idx, chunk in enumerate(retrieved_chunks):
        filename = chunk["metadata"].get("filename", "Unknown")
        page = chunk["metadata"].get("page_number", 1)
        blocks.append(
            f"--- Context Chunk {idx+1} ---\n"
            f"Source: {filename} (Page {page})\n"
            f"Chunk ID: {chunk['chunk_id']}\n"
            f"Content: {chunk['text']}\n"
            f"-------------------"
        )
    return "\n\n".join(blocks)
