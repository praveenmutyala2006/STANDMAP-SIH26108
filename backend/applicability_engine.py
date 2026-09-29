"""
STANDMAP - Deterministic Applicability & Validation Engine
Verifies whether a candidate standard is legally and technically applicable to a procurement specification requirement
based on product domain, operating conditions, scope bounds, and explicit exclusion criteria.
"""

from typing import Dict, Any, List

class DeterministicApplicabilityEngine:
    @staticmethod
    def evaluate_applicability(requirement: Dict[str, Any], standard: Dict[str, Any], match_score: float) -> Dict[str, Any]:
        req_text = requirement.get("text", "").lower()
        req_cat = requirement.get("category", "")
        std_cat = standard.get("category", "")
        base_is = standard.get("base_is", "").upper()
        
        # 1. Check for Unstandardized / Custom Gaps (e.g. proprietary cloud IoT telemetry)
        if req_cat == "TELEMETRY_CUSTOM" or "proprietary" in req_text or "custom cloud" in req_text:
            return {
                "status": "REVIEW_REQUIRED",
                "reason": "Specification requests proprietary/custom telemetry protocols without a standardized national BIS test code. Specification gap flagged for officer review."
            }
            
        # 2. Category mismatch exclusions
        if std_cat == "ELECTRICAL_CABLES" and any(w in req_text for w in ["cement", "concrete", "pump", "transformer"]):
            return {
                "status": "NOT_APPLICABLE",
                "reason": f"Standard {standard['is_number']} governs electrical cables and is not applicable to non-cable requirements."
            }
        if std_cat == "CIVIL_CONSTRUCTION" and any(w in req_text for w in ["cable", "inverter", "transformer", "pump"]):
            return {
                "status": "NOT_APPLICABLE",
                "reason": f"Standard {standard['is_number']} governs construction materials and is not applicable to electrical/mechanical machinery."
            }

        # 3. Strict Pump Subtype Scope Checking
        if base_is == "IS 8472":
            # IS 8472 is strictly for Centrifugal Regenerative / Peripheral Pumps
            if any(w in req_text for w in ["regenerative", "peripheral", "turbine pump"]):
                return {
                    "status": "APPLICABLE",
                    "reason": "Requirement specifies centrifugal regenerative/peripheral pump construction directly governed by IS 8472:2019."
                }
            elif any(w in req_text for w in ["monoset", "agricultural pump", "irrigation", "rural water"]):
                return {
                    "status": "POSSIBLY_APPLICABLE",
                    "reason": "Standard IS 8472 specifically covers regenerative impeller pumps. For agricultural monoset pumps, IS 9079 is normally applicable unless regenerative duty is intended."
                }

        if base_is == "IS 9079":
            # IS 9079 is for Monoset Pumps for Clear, Cold Water (Agricultural / Water Supply)
            if any(w in req_text for w in ["monoset", "agricultural", "rural water", "water supply", "monobloc", "discharge", "head", "250 lpm", "45 metres", "hydraulic efficiency"]):
                return {
                    "status": "APPLICABLE",
                    "reason": "Requirement specifies electric monoset/monobloc centrifugal pump for water supply within IS 9079 scope."
                }

        # 4. Strict Cable Insulation Subtype & Ambiguity Checking
        if std_cat == "ELECTRICAL_CABLES":
            has_xlpe = "xlpe" in req_text or "crosslinked" in req_text
            has_pvc = "pvc" in req_text or "polyvinyl chloride" in req_text or "building wire" in req_text or "flexible cord" in req_text
            has_ambiguity_flag = "unspecified" in req_text or "ambiguity" in req_text or "material ambiguity" in req_text
            
            if base_is == "IS 694":
                if has_xlpe and not has_pvc:
                    return {
                        "status": "NOT_APPLICABLE",
                        "reason": "Requirement specifies XLPE insulation, which is excluded from IS 694 (PVC insulation only)."
                    }
                if has_ambiguity_flag or (("1.1 kv" in req_text or "power" in req_text) and not has_pvc and not has_xlpe):
                    return {
                        "status": "REVIEW_REQUIRED",
                        "reason": "Candidate A (PVC Insulated): Matches 1.1 kV voltage scope, but tender lacks explicit insulation material specification (PVC vs XLPE). Officer review required."
                    }
                if has_pvc:
                    return {
                        "status": "APPLICABLE",
                        "reason": "Requirement specifies PVC insulated wiring/cables complying directly with IS 694:2010 scope."
                    }

            if base_is == "IS 7098 (PART 1)":
                if has_pvc and not has_xlpe and ("building wire" in req_text or "flexible" in req_text):
                    return {
                        "status": "NOT_APPLICABLE",
                        "reason": "Requirement specifies flexible building wire which is governed by IS 694, not IS 7098 (Part 1)."
                    }
                if has_ambiguity_flag or (("1.1 kv" in req_text or "power" in req_text) and not has_pvc and not has_xlpe):
                    return {
                        "status": "REVIEW_REQUIRED",
                        "reason": "Candidate B (XLPE Insulated): Matches 1.1 kV power distribution scope, but tender lacks explicit insulation material specification. Officer review required."
                    }
                if has_xlpe or "armour" in req_text or "underground" in req_text:
                    return {
                        "status": "APPLICABLE",
                        "reason": "Requirement specifies XLPE insulated armoured power distribution cable within IS 7098 (Part 1) scope."
                    }

        # 5. Electric Motors IE3 Efficiency
        if base_is == "IS 12615":
            if any(w in req_text for w in ["motor", "induction motor", "ie3", "ie2", "415 v", "415v", "50 hz", "3-phase", "squirrel cage"]):
                return {
                    "status": "APPLICABLE",
                    "reason": "Requirement specifies 3-phase line operated AC induction motor and IE3 efficiency classes within IS 12615:2018 scope."
                }

        # 6. Transformers
        if base_is == "IS 1180 (PART 1)":
            if any(w in req_text for w in ["transformer", "kva", "oil immersed", "11 kv", "33 kv", "433 v", "bee star"]):
                return {
                    "status": "APPLICABLE",
                    "reason": "Requirement specifies outdoor/indoor oil-immersed distribution transformer and loss evaluation within IS 1180 (Part 1):2014 scope."
                }

        # 7. Solar PV & Inverters
        if base_is == "IS 14286" and any(w in req_text for w in ["solar", "photovoltaic", "pv module", "pv array", "mono perc"]):
            return {
                "status": "APPLICABLE",
                "reason": "Crystalline silicon terrestrial photovoltaic module parameters align with IS 14286:2010 type approval scope."
            }
        if base_is == "IS 16221 (PART 2)" and any(w in req_text for w in ["inverter", "vfd", "power converter", "mppt", "solar pump controller"]):
            return {
                "status": "APPLICABLE",
                "reason": "PV power converter and solar inverter safety requirements align directly with IS 16221 (Part 2):2015."
            }

        # 8. Civil & Other Standard Domains
        if match_score >= 0.40:
            return {
                "status": "APPLICABLE",
                "reason": f"Core requirement parameters satisfy the technical scope of {standard['title']}."
            }
        elif match_score >= 0.22:
            return {
                "status": "POSSIBLY_APPLICABLE",
                "reason": f"Domain aligns with {standard['is_number']}, but detailed operating parameters or specification context require officer verification."
            }
        else:
            return {
                "status": "REVIEW_REQUIRED",
                "reason": "Context insufficient to confirm exact standard applicability. Routed to officer review queue."
            }
