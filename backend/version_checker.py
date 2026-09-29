"""
STANDMAP - Version & Amendment Intelligence Engine
Detects referenced standard years within tender text, checks them against the latest BIS gazette publications,
and generates actionable alerts for outdated editions or active amendments.
"""

import re
from typing import List, Dict, Any

class VersionChecker:
    @staticmethod
    def check_versions(full_text: str, standards_kb: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        checks = []
        kb_by_base = {s["base_is"].lower(): s for s in standards_kb}
        
        # Regex to match patterns like "IS 1180:1989", "IS 2026:2011", "IS 8472:2019", "IS 456:2000"
        pattern = r'(IS\s*(?:\/[A-Z]+)?\s*\d+(?:\s*\([^\)]+\))?)(?:\:(\d{4}))?'
        matches = re.finditer(pattern, full_text, re.IGNORECASE)
        
        seen_refs = set()
        
        for m in matches:
            ref_std_raw = m.group(1).strip()
            ref_year_str = m.group(2)
            ref_year = int(ref_year_str) if ref_year_str else None
            
            # Normalize base string
            clean_base = re.sub(r'\s+', ' ', ref_std_raw).upper()
            ref_key = f"{clean_base}:{ref_year}" if ref_year else clean_base
            
            if ref_key in seen_refs:
                continue
            seen_refs.add(ref_key)
            
            # Look up in Knowledge Base
            matched_std = None
            for base_key, std in kb_by_base.items():
                if base_key in clean_base.lower() or clean_base.lower() in base_key:
                    matched_std = std
                    break
                    
            if matched_std:
                current_yr = matched_std.get("publication_year")
                current_is = matched_std.get("is_number")
                edition_title = matched_std.get("title")
                edition_name = matched_std.get("edition", "Current Revision")
                amendments = matched_std.get("amendments", [])
                source_prov = f"{matched_std.get('source_name', 'Bureau of Indian Standards')} ({matched_std.get('source_url', '')})"
                
                if ref_year and current_yr and ref_year < current_yr:
                    # Outdated version referenced!
                    checks.append({
                        "id": f"VER-{matched_std['standard_id']}",
                        "standard_id": matched_std["standard_id"],
                        "referenced_string": f"{clean_base}:{ref_year}",
                        "referenced_is": f"{clean_base}:{ref_year}",
                        "referenced_year": ref_year,
                        "current_kb_record": current_is,
                        "current_year": current_yr,
                        "status": "OUTDATED",
                        "source": source_prov,
                        "warning_message": f"OUTDATED REFERENCE: Specification cites legacy {clean_base}:{ref_year}. The current authoritative edition in knowledge base is {current_is} ({edition_name}). Citing superseded standards in public procurement risks technical disputes.",
                        "current_edition_title": current_is
                    })
                elif amendments:
                    # Current with active amendments
                    amd_text = ", ".join([a.get("amendment_no", "") for a in amendments])
                    checks.append({
                        "id": f"VER-{matched_std['standard_id']}",
                        "standard_id": matched_std["standard_id"],
                        "referenced_string": ref_key,
                        "referenced_is": ref_key,
                        "referenced_year": ref_year or current_yr,
                        "current_kb_record": current_is,
                        "current_year": current_yr,
                        "status": "AMENDED",
                        "source": source_prov,
                        "warning_message": f"CURRENT WITH AMENDMENTS: Standard {current_is} is current, but contains {len(amendments)} active amendment(s) ({amd_text}) published in BIS Gazette that must be adhered to.",
                        "current_edition_title": current_is
                    })
                else:
                    checks.append({
                        "id": f"VER-{matched_std['standard_id']}",
                        "standard_id": matched_std["standard_id"],
                        "referenced_string": ref_key,
                        "referenced_is": ref_key,
                        "referenced_year": ref_year or current_yr,
                        "current_kb_record": current_is,
                        "current_year": current_yr,
                        "status": "CURRENT",
                        "source": source_prov,
                        "warning_message": f"CURRENT: Standard {current_is} is verified as the active published edition in the knowledge base.",
                        "current_edition_title": current_is
                    })
                    
        return checks
