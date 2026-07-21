import hashlib
from typing import List, Dict, Any
from rag_chatbot.vector_storage.base import BaseVectorStore
from rag_chatbot.config import config

def deduplicate_chunks(results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Removes exact or near duplicate content from search results to preserve context space."""
    seen_hashes = set()
    deduped = []
    
    for item in results:
        text = item["text"]
        text_hash = hashlib.md5(text.strip().lower().encode('utf-8')).hexdigest()
        if text_hash in seen_hashes:
            continue
        seen_hashes.add(text_hash)
        deduped.append(item)
        
    return deduped

def retrieve_context(query_embedding: List[float], store: BaseVectorStore, top_k: int = None) -> List[Dict[str, Any]]:
    """Runs semantic query search, runs deduplication logic, and ranks items up to Top K limit."""
    k = top_k or config.top_k
    # Fetch double the requested K to ensure we have enough results left after deduplication
    raw_results = store.similarity_search(query_embedding, top_k=k * 2)
    
    deduped_results = deduplicate_chunks(raw_results)
    
    ranked = sorted(deduped_results, key=lambda x: x["score"], reverse=True)
    return ranked[:k]
