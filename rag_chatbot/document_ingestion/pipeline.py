import os
import time
import hashlib
from typing import Dict, Any, List, Optional
from rag_chatbot.document_ingestion.parsers import get_parser_for_file

class IngestedDocument:
    def __init__(self, doc_id: str, filename: str, filepath: str, text: str, page_map: Dict[int, str], metadata: Dict[str, Any]):
        self.doc_id = doc_id
        self.filename = filename
        self.filepath = filepath
        self.text = text
        self.page_map = page_map
        self.metadata = metadata

def normalize_text(text: str) -> str:
    """Cleans up text formatting by stripping trailing whitespace and reducing redundant empty lines."""
    lines = [line.strip() for line in text.splitlines()]
    non_empty = [line for line in lines if line]
    return "\n".join(non_empty)

def ingest_document(file_path: str) -> IngestedDocument:
    """Ingests a document by choosing the correct parser, normalizing its text, and assembling metadata."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    filename = os.path.basename(file_path)
    # Generate unique document ID based on file path string hash
    filepath_bytes = file_path.encode('utf-8')
    doc_id = "doc_" + hashlib.md5(filepath_bytes).hexdigest()[:12]
    
    # Load parser
    parser = get_parser_for_file(file_path)
    res = parser(file_path)
    
    if isinstance(res, tuple):
        raw_text, page_map = res
    else:
        raw_text = res
        page_map = {}
        
    cleaned_text = normalize_text(raw_text)
    
    metadata = {
        "doc_id": doc_id,
        "filename": filename,
        "filepath": file_path,
        "upload_timestamp": time.time(),
        "size_bytes": os.path.getsize(file_path)
    }
    
    return IngestedDocument(
        doc_id=doc_id,
        filename=filename,
        filepath=file_path,
        text=cleaned_text,
        page_map=page_map,
        metadata=metadata
    )
