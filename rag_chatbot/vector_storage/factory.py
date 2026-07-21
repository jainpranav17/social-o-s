from rag_chatbot.config import config
from rag_chatbot.vector_storage.base import BaseVectorStore
from rag_chatbot.vector_storage.chroma_store import ChromaVectorStore
from rag_chatbot.vector_storage.supabase_store import SupabaseVectorStore

def get_vector_store() -> BaseVectorStore:
    """Dynamic factory resolving the configured vector database client."""
    db_type = config.vector_db.lower()
    if db_type == "chroma":
        return ChromaVectorStore()
    elif db_type in ["supabase", "pgvector"]:
        return SupabaseVectorStore()
    else:
        print(f"Warning: Unsupported vector DB type '{db_type}'. Defaulting to 'chroma'.")
        return ChromaVectorStore()
