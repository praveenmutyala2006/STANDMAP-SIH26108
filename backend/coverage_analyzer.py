"""
STANDMAP - Specification Coverage & Gap Analysis Engine
Analyzes the entire procurement specification requirement-by-requirement to determine standard coverage completeness,
identify unstandardized clauses (gaps), and calculate coverage metrics.
"""

from typing import List, Dict, Any

class CoverageAnalyzer:
    @staticmethod
    def analyze_coverage(requirements: List[Dict[str, Any]], recommendations: List[Dict[str, Any]]) -> Dict[str, Any]:
        recs_by_req = {}
        for r in recommendations:
            recs_by_req.setdefault(r["requirement_id"], []).append(r)
            
        covered = 0
        partial = 0
        no_match = 0
        review = 0
        
        gaps = []
        
        for req in requirements:
            req_id = req["id"]
            req_recs = recs_by_req.get(req_id, [])
            
            if not req_recs:
                no_match += 1
                req["coverage_status"] = "NO_MATCH"
                gaps.append({
                    "requirement_id": req_id,
                    "requirement_text": req["text"],
                    "category": req["category"],
                    "gap_type": "UNMAPPED_REQUIREMENT",
                    "explanation": "No matching Indian Standard identified in public catalogue. May require custom testing specification in tender.",
                    "source": f"Page {req.get('source_page', 1)} | {req.get('source_section', '')}"
                })
            else:
                top_rec = req_recs[0]
                app_status = top_rec.get("applicability_status", "APPLICABLE")
                
                if app_status == "APPLICABLE":
                    covered += 1
                    req["coverage_status"] = "COVERED"
                elif app_status == "POSSIBLY_APPLICABLE":
                    partial += 1
                    req["coverage_status"] = "PARTIAL"
                    gaps.append({
                        "requirement_id": req_id,
                        "requirement_text": req["text"],
                        "category": req["category"],
                        "gap_type": "PARTIAL_ALIGNMENT",
                        "explanation": f"Matched with {top_rec.get('standard_id')}, but specific duty points or parameters need verification.",
                        "source": f"Page {req.get('source_page', 1)} | {req.get('source_section', '')}"
                    })
                else:
                    review += 1
                    req["coverage_status"] = "REVIEW"
                    gaps.append({
                        "requirement_id": req_id,
                        "requirement_text": req["text"],
                        "category": req["category"],
                        "gap_type": "AMBIGUOUS_MATCH",
                        "explanation": "Low confidence or conflicting scope detected. Procurement officer review required.",
                        "source": f"Page {req.get('source_page', 1)} | {req.get('source_section', '')}"
                    })
                    
        total = len(requirements)
        coverage_pct = round((covered / max(1, total)) * 100, 1)
        
        return {
            "total_requirements": total,
            "covered_count": covered,
            "partial_count": partial,
            "no_match_count": no_match,
            "review_count": review,
            "coverage_percentage": coverage_pct,
            "gaps_summary": gaps,
            "updated_requirements": requirements
        }
