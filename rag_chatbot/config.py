import os
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

class RAGConfig(BaseSettings):
    # LLM configurations
    openai_api_key: str = Field(default="", validation_alias="OPENAI_API_KEY")
    llm_provider: str = Field(default="openai", validation_alias="LLM_PROVIDER")
    llm_model: str = Field(default="gpt-4o-mini", validation_alias="LLM_MODEL")
    temperature: float = Field(default=0.0, validation_alias="TEMPERATURE")
    max_tokens: int = Field(default=1024, validation_alias="MAX_TOKENS")

    # Embeddings configurations
    embedding_model: str = Field(default="text-embedding-3-small", validation_alias="EMBEDDING_MODEL")

    # Chunking configurations
    chunk_size: int = Field(default=500, validation_alias="CHUNK_SIZE")
    chunk_overlap: int = Field(default=50, validation_alias="CHUNK_OVERLAP")

    # Retrieval configurations
    top_k: int = Field(default=5, validation_alias="TOP_K")

    # Vector Storage configurations
    vector_db: str = Field(default="chroma", validation_alias="VECTOR_DB")
    chroma_persist_directory: str = Field(default="./chroma_db", validation_alias="CHROMA_PERSIST_DIRECTORY")
    
    # Supabase / pgvector config
    supabase_url: str = Field(default="", validation_alias="SUPABASE_URL")
    supabase_service_role_key: str = Field(default="", validation_alias="SUPABASE_SERVICE_ROLE_KEY")

    # Audio Voice configurations
    tts_model: str = Field(default="tts-1", validation_alias="TTS_MODEL")
    tts_voice: str = Field(default="alloy", validation_alias="TTS_VOICE")
    stt_model: str = Field(default="whisper-1", validation_alias="STT_MODEL")

    # Allow loading from environment variables directly
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

# Instantiate a global configuration object
config = RAGConfig()
