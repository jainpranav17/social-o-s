from typing import List, Dict, Any
from rag_chatbot.document_ingestion.pipeline import IngestedDocument

class Chunk:
    def __init__(self, chunk_id: str, text: str, doc_id: str, page_number: int, metadata: Dict[str, Any]):
        self.chunk_id = chunk_id
        self.text = text
        self.doc_id = doc_id
        self.page_number = page_number
        self.metadata = metadata

def split_text_recursive(text: str, chunk_size: int, chunk_overlap: int, separators: List[str] = None) -> List[str]:
    """Recursively splits a text block using paragraph, line, and word boundaries to stay within bounds."""
    if separators is None:
        separators = ["\n\n", "\n", ". ", " ", ""]
        
    def _split(text_segment: str, current_seps: List[str]) -> List[str]:
        if len(text_segment) <= chunk_size:
            return [text_segment]
            
        if not current_seps:
            # Fallback to character slicing if no separators remain
            return [text_segment[i:i+chunk_size] for i in range(0, len(text_segment), chunk_size - chunk_overlap)]
            
        sep = current_seps[0]
        splits = text_segment.split(sep)
        
        chunks = []
        current_chunk = ""
        
        for part in splits:
            piece = part + sep if sep != "" else part
            if len(current_chunk) + len(piece) <= chunk_size:
                current_chunk += piece
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                if len(piece) > chunk_size:
                    chunks.extend(_split(piece, current_seps[1:]))
                    current_chunk = ""
                else:
                    current_chunk = piece
                    
        if current_chunk:
            chunks.append(current_chunk)
            
        # Add sliding overlap
        overlapped_chunks = []
        for i, chk in enumerate(chunks):
            if i == 0:
                overlapped_chunks.append(chk)
            else:
                prev_chk = chunks[i-1]
                overlap_text = prev_chk[-chunk_overlap:] if len(prev_chk) >= chunk_overlap else prev_chk
                overlapped_chunks.append(overlap_text + chk)
                
        return overlapped_chunks

    return _split(text, separators)

def create_chunks(doc: IngestedDocument, chunk_size: int, chunk_overlap: int) -> List[Chunk]:
    """Chunking pipeline dividing IngestedDocuments and mapping metadata page number fields."""
    chunks = []
    
    if doc.page_map:
        chunk_idx = 0
        for page_num, page_text in doc.page_map.items():
            if not page_text.strip():
                continue
            split_segments = split_text_recursive(page_text, chunk_size, chunk_overlap)
            for seg in split_segments:
                chunk_id = f"{doc.doc_id}_page{page_num}_chunk{chunk_idx}"
                metadata = {
                    **doc.metadata,
                    "chunk_id": chunk_id,
                    "page_number": page_num,
                    "chunk_index": chunk_idx
                }
                chunks.append(Chunk(
                    chunk_id=chunk_id,
                    text=seg,
                    doc_id=doc.doc_id,
                    page_number=page_num,
                    metadata=metadata
                ))
                chunk_idx += 1
    else:
        split_segments = split_text_recursive(doc.text, chunk_size, chunk_overlap)
        for idx, seg in enumerate(split_segments):
            chunk_id = f"{doc.doc_id}_chunk{idx}"
            metadata = {
                **doc.metadata,
                "chunk_id": chunk_id,
                "page_number": 1,
                "chunk_index": idx
            }
            chunks.append(Chunk(
                chunk_id=chunk_id,
                text=seg,
                doc_id=doc.doc_id,
                page_number=1,
                metadata=metadata
            ))
            
    return chunks
