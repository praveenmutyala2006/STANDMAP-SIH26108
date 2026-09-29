"""
STANDMAP - Certification & Statutory Conformity Assessment Engine
Identifies mandatory certification requirements (Quality Control Orders - QCOs, Mandatory ISI Mark Scheme-I,
and Compulsory Registration Scheme - CRS) applicable to recommended standards.
"""

from typing import List, Dict, Any

class CertificationChecker:
    @staticmethod
    def evaluate_certifications(recommendations: List[Dict[str, Any]], all_standards_map: Dict[str, Any]) -> List[Dict[str, Any]]:
        cert_results = []
        seen_stds = set()
        
        for rec in recommendations:
            std_id = rec["standard_id"]
            if std_id in seen_stds:
                continue
            seen_stds.add(std_id)
            
            std_obj = all_standards_map.get(std_id, {})
            cert_status = std_obj.get("certification_status", "VOLUNTARY")
            cert_scheme = std_obj.get("certification_scheme", "Voluntary BIS Standard")
            is_num = std_obj.get("is_number", std_id)
            
            if cert_status == "MANDATORY_QCO":
                cert_results.append({
                    "id": f"CERT-{std_id}",
                    "standard_id": std_id,
                    "scheme_name": cert_scheme,
                    "mandate_level": "MANDATORY_QCO",
                    "statutory_order": f"Quality Control Order (QCO) issued under Section 16 of BIS Act, 2016",
                    "reason": f"Under Central Government QCO, no person shall manufacture, import, or sell products conforming to {is_num} without standard ISI mark under valid BIS License. Tenders must reject bids lacking BIS certification."
                })
            elif "CRS" in cert_scheme or cert_status == "CRS_REGISTRATION":
                cert_results.append({
                    "id": f"CERT-{std_id}",
                    "standard_id": std_id,
                    "scheme_name": cert_scheme,
                    "mandate_level": "CRS_MANDATORY",
                    "statutory_order": f"Electronics & Solar PV Goods (Requirements for Compulsory Registration) Order",
                    "reason": f"Products under {is_num} require mandatory self-declaration of conformity and registration number on packaging before customs clearance and public procurement."
                })
            else:
                cert_results.append({
                    "id": f"CERT-{std_id}",
                    "standard_id": std_id,
                    "scheme_name": cert_scheme,
                    "mandate_level": "VOLUNTARY_RECOMMENDED",
                    "statutory_order": "Voluntary / National Building Code (NBC) Guideline",
                    "reason": f"Conformity assessment under {is_num} is voluntary unless explicitly made mandatory by the procuring authority in tender conditions."
                })
                
        return cert_results
