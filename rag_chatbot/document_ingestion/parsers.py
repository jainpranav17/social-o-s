import os
import csv
from typing import Dict, Any, Tuple
import pypdf
import docx
import pandas as pd

def parse_txt(file_path: str) -> str:
    """Parses plain text and markdown files."""
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()

def parse_pdf(file_path: str) -> Tuple[str, Dict[int, str]]:
    """Parses PDF files and returns full text and a page-by-page mapping."""
    reader = pypdf.PdfReader(file_path)
    text = []
    page_map = {}
    for idx, page in enumerate(reader.pages):
        page_text = page.extract_text() or ""
        text.append(page_text)
        page_map[idx + 1] = page_text
    return "\n".join(text), page_map

def parse_docx(file_path: str) -> str:
    """Parses DOCX Word files."""
    doc = docx.Document(file_path)
    text = []
    for paragraph in doc.paragraphs:
        if paragraph.text:
            text.append(paragraph.text)
    return "\n".join(text)

def parse_csv(file_path: str) -> str:
    """Parses CSV files into tabular text representation."""
    df = pd.read_csv(file_path)
    return df.to_string()

def get_parser_for_file(file_path: str):
    """Factory helper to fetch matching parser based on extension."""
    ext = os.path.splitext(file_path)[1].lower()
    if ext in [".txt", ".md", ".markdown"]:
        return lambda p: (parse_txt(p), {})
    elif ext == ".pdf":
        return parse_pdf
    elif ext == ".docx":
        return lambda p: (parse_docx(p), {})
    elif ext == ".csv":
        return lambda p: (parse_csv(p), {})
    else:
        raise ValueError(f"Unsupported file format: {ext}")
