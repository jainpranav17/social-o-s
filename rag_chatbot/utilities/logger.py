import time
import logging
from typing import Dict, Any, List

# Setup logging configuration (both console stream and file log)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("rag_chatbot.log", encoding="utf-8"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("RAGChatbot")

def log_query(query: str, session_id: str) -> None:
    logger.info(f"[Session: {session_id}] User Query: {query}")

def log_retrieval(chunks: List[Dict[str, Any]], latency_ms: float) -> None:
    logger.info(f"Retrieved {len(chunks)} chunks in {latency_ms:.2f}ms")
    for idx, c in enumerate(chunks):
        logger.info(f"  Chunk {idx+1} ID: {c['chunk_id']} | File: {c['metadata'].get('filename')} | Score: {c['score']:.4f}")

def log_response(reply: str, token_usage: Dict[str, int], latency_ms: float) -> None:
    logger.info(f"LLM Response generated in {latency_ms:.2f}ms")
    logger.info(f"Tokens - Prompt: {token_usage.get('prompt_tokens', 0)} | Completion: {token_usage.get('completion_tokens', 0)}")

def log_error(err_msg: str, exception: Exception = None) -> None:
    if exception:
        logger.error(f"Exception encountered: {err_msg}", exc_info=exception)
    else:
        logger.error(f"Error: {err_msg}")
