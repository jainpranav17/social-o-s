from typing import List, Dict, Any
from rag_chatbot.chunking.splitter import Chunk

class BaseVectorStore:
    def add_chunks(self, chunks: List[Chunk], embeddings: List[List[float]]) -> None:
        """Stores chunks alongside their embedding vectors and metadata."""
        raise NotImplementedError

    def similarity_search(self, query_embedding: List[float], top_k: int) -> List[Dict[str, Any]]:
        """Returns the top K chunks similar to the query vector."""
        raise NotImplementedError

    def delete_document(self, doc_id: str) -> None:
        """Removes all indexed chunks associated with a specific document ID."""
        raise NotImplementedError

    def list_documents(self) -> List[Dict[str, Any]]:
        """Lists metadata details of all successfully ingested documents."""
        raise NotImplementedError
