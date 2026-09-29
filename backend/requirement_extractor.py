"""
STANDMAP - Source-Grounded Requirement Extraction Engine
Decomposes procurement specifications into structured, categorized requirements while retaining
strict source provenance (document name, page number, section header, and exact excerpt).
"""

import re
import uuid
from typing import List, Dict, Any

CATEGORY_PATTERNS = [
    (
        "PRODUCT",
        r"(?:supply|procurement|delivery|manufacture|design|scope of work|product definition|item)\s*(?:of|for|:)\s*([^\n\.\;]{10,180})",
        ["pump", "cable", "transformer", "module", "cement", "extinguisher", "helmet", "pipe", "tmt", "pvc", "switchgear", "panel", "valve", "wire", "motor"]
    ),
    (
        "PERFORMANCE",
        r"(?:discharge|capacity|head|flow rate|rpm|speed|efficiency|rating|power output|flow|torque|loss|losses)\s*(?:of|is|shall be|:)\s*([^\n\.\;]{5,150})",
        ["lpm", "m3/hr", "metres", "head", "rpm", "efficiency", "%", "hp", "kw", "kva", "losses", "duty point", "star rating", "star 2", "discharge"]
    ),
    (
        "ELECTRICAL",
        r"(?:voltage|power supply|phase|frequency|insulation|current|operating voltage|electrical)\s*(?:of|is|shall be|:)\s*([^\n\.\;]{5,150})",
        ["415v", "400v", "230v", "11kv", "33kv", "1.1 kv", "1100v", "3-phase", "50 hz", "class f", "class b", "induction motor", "squirrel cage", "ie3", "ie2"]
    ),
    (
        "SAFETY",
        r"(?:safety|protection|enclosure|ip code|earthing|grounding|insulation|overload|fire rating|shock)\s*(?:of|is|shall be|:)\s*([^\n\.\;]{5,150})",
        ["ip55", "ip68", "ip65", "earthing", "grounding", "thermal overload", "dry run", "fire rating", "shock", "anti-islanding", "dielectric"]
    ),
    (
        "TESTING",
        r"(?:test|testing|inspection|fat|routine test|type test|hydrostatic|spark test|cube test)\s*(?:of|is|shall be|:)\s*([^\n\.\;]{5,150})",
        ["hydrostatic", "routine test", "type test", "acceptance test", "spark test", "cube test", "pressure test", "shut-off", "dielectric breakdown", "loss evaluation"]
    ),
    (
        "MATERIAL",
        r"(?:material|impeller|casing|conductor|insulation material|armour|steel|aggregate|cement)\s*(?:of|is|shall be|:)\s*([^\n\.\;]{5,150})",
        ["stainless steel", "cast iron", "aisi 304", "copper", "aluminium", "xlpe", "pvc", "frls", "galvanized steel", "tmt", "fe 500d", "fe 550d", "opc 43", "opc 53"]
    ),
    (
        "INSTALLATION_ENVIRONMENT",
        r"(?:installation|environment|ambient|temperature|mounting|outdoor|trenching|depth|burial)\s*(?:of|is|shall be|:)\s*([^\n\.\;]{5,150})",
        ["outdoor", "indoor", "ambient", "borewell", "underground", "direct burial", "plinth", "sump", "tropical", "50 deg c", "trench"]
    ),
    (
        "CERTIFICATION",
        r"(?:certification|standard|bis|isi mark|qco|crs|compliance|license|approval)\s*(?:of|is|shall be|:)\s*([^\n\.\;]{5,150})",
        ["bis", "isi mark", "qco", "crs", "almm", "bee star", "is 1180", "is 8472", "is 694", "is 7098", "is 14286", "is 269", "quality control order"]
    ),
    (
        "TELEMETRY_CUSTOM",
        r"(?:telemetry|iot|cloud api|sim|remote monitoring|proprietary protocol)\s*(?:of|is|shall be|:)\s*([^\n\.\;]{5,150})",
        ["iot", "telemetry", "cloud api", "4g/5g", "sim", "proprietary", "remote telemetry"]
    )
]

def extract_requirements_from_text(full_text: str, document_name: str = "Tender_Document.pdf") -> List[Dict[str, Any]]:
    requirements = []
    lines = [l.strip() for l in full_text.splitlines() if l.strip()]
    
    current_section = "General Specifications"
    current_page = 1
    
    for line in lines:
        if line.startswith("--- Page ") and line.endswith(" ---"):
            try:
                current_page = int(re.search(r'\d+', line).group())
            except Exception:
                pass
            continue
            
        # Check for section headers
        sec_match = re.match(r'^(?:SECTION|\d+\.|\d+\.\d+|CLAUSE|PART)\s*([^\:]{3,60})', line, re.IGNORECASE)
        if sec_match:
            current_section = line[:60]
            
        line_lower = line.lower()
        
        # Skip pure title / document metadata headers without specification payload
        if line_lower.startswith(("tender specification no", "tender document", "tender notice", "section 4:", "section 3:", "technical particulars", "technical specifications")):
            continue
            
        if len(line) < 15 and not any(char.isdigit() for char in line):
            continue
            
        detected_category = None
        confidence = 0.85
        
        for cat, pattern, keywords in CATEGORY_PATTERNS:
            matching_kw = [kw for kw in keywords if kw in line_lower]
            if matching_kw:
                detected_category = cat
                confidence = min(0.98, 0.75 + (0.05 * len(matching_kw)))
                break
                
        if detected_category:
            req_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"
            
            clean_text = line.strip(" -•*\t")
            if clean_text.startswith(current_section):
                clean_text = clean_text[len(current_section):].strip(" :-")
                
            if len(clean_text) < 12:
                continue

            requirements.append({
                "id": req_id,
                "text": clean_text,
                "normalized_value": clean_text[:120],
                "category": detected_category,
                "source_document": document_name,
                "source_page": current_page,
                "source_section": current_section,
                "source_excerpt": f"§ {current_section} | \"{clean_text}\"",
                "confidence": round(confidence, 2),
                "extraction_status": "EXTRACTED",
                "coverage_status": "PENDING"
            })
            
    # Deduplicate
    unique_reqs = []
    seen_texts = set()
    for r in requirements:
        key = r["text"].lower()[:40]
        if key not in seen_texts:
            seen_texts.add(key)
            unique_reqs.append(r)
            
    return unique_reqs
