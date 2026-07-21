import os
import chromadb
from typing import List, Dict, Any
from rag_chatbot.vector_storage.base import BaseVectorStore
from rag_chatbot.chunking.splitter import Chunk
from rag_chatbot.config import config

class ChromaVectorStore(BaseVectorStore):
    def __init__(self, persist_dir: str = None):
        self.persist_dir = persist_dir or config.chroma_persist_directory
        self.client = chromadb.PersistentClient(path=self.persist_dir)
        self.collection = self.client.get_or_create_collection("socialos_rag")

    def add_chunks(self, chunks: List[Chunk], embeddings: List[List[float]]) -> None:
        ids = [chunk.chunk_id for chunk in chunks]
        documents = [chunk.text for chunk in chunks]
        
        metadatas = []
        for chunk in chunks:
            meta = {}
            for k, v in chunk.metadata.items():
                if isinstance(v, (str, int, float, bool)):
                    meta[k] = v
                else:
                    meta[k] = str(v)
            metadatas.append(meta)
            
        self.collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
        )

    def similarity_search(self, query_embedding: List[float], top_k: int) -> List[Dict[str, Any]]:
        res = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )
        
        results = []
        if not res or "ids" not in res or not res["ids"] or not res["ids"][0]:
            return results
            
        ids = res["ids"][0]
        distances = res["distances"][0] if "distances" in res and res["distances"] else [0.0]*len(ids)
        documents = res["documents"][0]
        metadatas = res["metadatas"][0]
        
        for idx in range(len(ids)):
            # Distances in Chroma are normally L2 distances, we can present a clean mapping
            d = distances[idx] if idx < len(distances) else 0.0
            results.append({
                "chunk_id": ids[idx],
                "text": documents[idx],
                "metadata": metadatas[idx],
                "score": round(max(0.0, 1.0 - d), 4)
            })
        return results

    def delete_document(self, doc_id: str) -> None:
        self.collection.delete(where={"doc_id": doc_id})

    def list_documents(self) -> List[Dict[str, Any]]:
        data = self.collection.get()
        if not data or "metadatas" not in data or not data["metadatas"]:
            return []
            
        docs = {}
        for meta in data["metadatas"]:
            doc_id = meta.get("doc_id")
            if doc_id and doc_id not in docs:
                docs[doc_id] = {
                    "doc_id": doc_id,
                    "filename": meta.get("filename", "Unknown"),
                    "size_bytes": meta.get("size_bytes", 0),
                    "upload_timestamp": meta.get("upload_timestamp", 0.0)
                }
        return list(docs.values())
