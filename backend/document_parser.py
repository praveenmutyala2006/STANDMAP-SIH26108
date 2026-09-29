"""
STANDMAP - Multi-Format Document Ingestion Engine
Extracts technical text from PDF, DOCX, TXT, and raw text while preserving structural anchors:
page numbers, section headings, paragraphs, and table contents.
"""

import os
import re
from typing import Dict, Any, List

def parse_document(file_path: str, filename: str) -> Dict[str, Any]:
    ext = os.path.splitext(filename)[1].lower()
    
    if ext == ".pdf":
        return parse_pdf(file_path, filename)
    elif ext in [".docx", ".doc"]:
        return parse_docx(file_path, filename)
    elif ext in [".txt", ".md", ".json"]:
        return parse_text(file_path, filename)
    else:
        # Fallback to plain text read
        return parse_text(file_path, filename)

def parse_pdf(file_path: str, filename: str) -> Dict[str, Any]:
    pages = []
    full_text = ""
    
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(file_path)
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            page_text = page.get_text("text") or ""
            pages.append({
                "page_num": page_idx + 1,
                "text": page_text
            })
            full_text += f"\n--- Page {page_idx + 1} ---\n" + page_text
        doc.close()
    except Exception as e:
        print(f"PyMuPDF parse error: {e}, falling back to plain reading...")
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                raw = f.read()
                pages.append({"page_num": 1, "text": raw})
                full_text = raw
        except Exception:
            pages.append({"page_num": 1, "text": "Document content unreadable."})
            full_text = "Document content unreadable."

    return {
        "filename": filename,
        "document_type": "PDF Document",
        "page_count": len(pages),
        "pages": pages,
        "full_text": full_text.strip()
    }

def parse_docx(file_path: str, filename: str) -> Dict[str, Any]:
    paragraphs = []
    full_text = ""
    
    try:
        import docx
        doc = docx.Document(file_path)
        
        # Read Paragraphs
        for p in doc.paragraphs:
            if p.text.strip():
                paragraphs.append(p.text.strip())
                
        # Read Tables
        for table in doc.tables:
            for row in table.rows:
                row_text = " | ".join([cell.text.strip() for cell in row.cells if cell.text.strip()])
                if row_text:
                    paragraphs.append(row_text)
                    
        full_text = "\n\n".join(paragraphs)
    except Exception as e:
        print(f"python-docx error: {e}, falling back...")
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            full_text = f.read()
            paragraphs = full_text.splitlines()

    return {
        "filename": filename,
        "document_type": "DOCX Technical Specification",
        "page_count": max(1, len(paragraphs) // 15),
        "pages": [{"page_num": 1, "text": full_text}],
        "full_text": full_text.strip()
    }

def parse_text(file_path: str, filename: str) -> Dict[str, Any]:
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
    except Exception as e:
        content = f"Error reading text file: {e}"

    return {
        "filename": filename,
        "document_type": "Plain Text / Markdown",
        "page_count": 1,
        "pages": [{"page_num": 1, "text": content}],
        "full_text": content.strip()
    }
