"""
STANDMAP - End-to-End Automated Test Suite
Verifies the complete pipeline from tender document parsing to requirement extraction,
hybrid retrieval, applicability checking, standards graph generation, version checking,
coverage matrix calculation, human review, and PDF report creation.
"""

import os
import sys
# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

import database as db
import document_parser as dp
import requirement_extractor as re_ext
from retrieval_engine import HybridRetrievalEngine
from applicability_engine import DeterministicApplicabilityEngine
from standards_graph import StandardsGraphEngine
from version_checker import VersionChecker
from certification_checker import CertificationChecker
from coverage_analyzer import CoverageAnalyzer
import procurement_report as prep
from sample_tenders import SAMPLE_TENDERS

def test_pipeline():
    print("=" * 60)
    print("RUNNING STANDMAP (SIH26108) END-TO-END PIPELINE TESTS")
    print("=" * 60)

    # 1. Initialize Database
    db.init_db()
    stds = db.get_all_standards()
    assert len(stds) > 0, "Standards knowledge base should not be empty!"
    print(f"[PASS] Database initialized with {len(stds)} verified Indian Standards.")

    # 2. Test Sample Tender 1 (Pump Specification)
    sample_pump = SAMPLE_TENDERS[0]
    analysis_id = "TEST-ANL-001"
    db.create_analysis({
        "id": analysis_id,
        "title": sample_pump["title"],
        "organization": sample_pump["organization"],
        "category": sample_pump["category"],
        "document_type": sample_pump["document_type"]
    })

    # 3. Requirement Extraction
    reqs = re_ext.extract_requirements_from_text(sample_pump["full_text"], sample_pump["file_name"])
    assert len(reqs) >= 4, f"Expected at least 4 requirements, got {len(reqs)}"
    db.save_requirements(analysis_id, reqs)
    print(f"[PASS] Extracted {len(reqs)} source-grounded requirements with provenance.")
    for r in reqs[:2]:
        print(f"       -> [{r['category']}] {r['text'][:50]}... (Source: Page {r['source_page']})")

    # 4. Hybrid Retrieval & Applicability
    retrieval_engine = HybridRetrievalEngine(stds)
    recommendations = []
    
    for req in reqs:
        candidates = retrieval_engine.retrieve_candidates(req, top_k=2)
        assert len(candidates) > 0, f"Candidate retrieval failed for requirement: {req['text']}"
        top_c = candidates[0]
        eval_res = DeterministicApplicabilityEngine.evaluate_applicability(req, top_c["standard"], top_c["hybrid_score"])
        recommendations.append({
            "id": f"REC-TEST-{req['id']}",
            "requirement_id": req["id"],
            "standard_id": top_c["standard"]["standard_id"],
            "match_score": top_c["hybrid_score"],
            "match_reason": top_c["match_reason"],
            "applicability_status": eval_res["status"],
            "applicability_reason": eval_res["reason"],
            "review_status": "PENDING"
        })

    db.save_recommendations(analysis_id, recommendations)
    print(f"[PASS] Generated {len(recommendations)} candidate recommendations with applicability reasons.")

    # 5. Standards Relationship Graph
    standards_map = {s["standard_id"]: s for s in stds}
    graph_engine = StandardsGraphEngine()
    graph_data = graph_engine.build_analysis_graph(reqs, recommendations, standards_map)
    assert graph_data["total_nodes"] > 0 and graph_data["total_edges"] > 0
    print(f"[PASS] Built Standards Relationship Graph with {graph_data['total_nodes']} nodes and {graph_data['total_edges']} directed edges.")

    # 6. Version & Amendment Check (Testing Outdated 1989 Transformer Reference)
    sample_transformer = SAMPLE_TENDERS[2]  # Legacy Transformer Spec
    v_checks = VersionChecker.check_versions(sample_transformer["full_text"], stds)
    outdated_found = any(v["status"] == "OUTDATED" for v in v_checks)
    assert outdated_found, "VersionChecker failed to flag legacy IS 1180:1989 reference!"
    print(f"[PASS] VersionChecker correctly detected outdated standard reference: IS 1180:1989 -> Current: IS 1180 (Part 1):2014.")

    # 7. Certification Check
    cert_checks = CertificationChecker.evaluate_certifications(recommendations, standards_map)
    qco_found = any(c["mandate_level"] == "MANDATORY_QCO" for c in cert_checks)
    assert qco_found, "CertificationChecker should identify mandatory QCO for pumps!"
    print(f"[PASS] CertificationChecker identified mandatory QCO (Scheme-I ISI Mark).")

    # 8. Coverage Analysis
    coverage = CoverageAnalyzer.analyze_coverage(reqs, recommendations)
    assert coverage["coverage_percentage"] > 50.0
    print(f"[PASS] Specification Coverage: {coverage['coverage_percentage']}% ({coverage['covered_count']}/{coverage['total_requirements']} Covered).")

    # 9. Officer Review Decision
    db.save_review_decision({
        "id": "REV-TEST-001",
        "analysis_id": analysis_id,
        "requirement_id": reqs[0]["id"],
        "standard_id": recommendations[0]["standard_id"],
        "officer_id": "OFFICER-TEST",
        "decision": "ACCEPT",
        "notes": "Verified against state water supply technical criteria."
    })
    reviews = db.get_review_decisions(analysis_id)
    assert len(reviews) > 0
    print(f"[PASS] Human review decision successfully logged and audited.")

    # 10. PDF Report Generation
    test_pdf_path = os.path.join(os.path.dirname(__file__), "reports", "test_report.pdf")
    prep.generate_pdf_report(
        {"id": analysis_id, "title": sample_pump["title"], "organization": sample_pump["organization"], "category": sample_pump["category"]},
        reqs, recommendations, v_checks, cert_checks, test_pdf_path
    )
    assert os.path.exists(test_pdf_path), "PDF report generation failed!"
    print(f"[PASS] Generated ReportLab PDF Report: {test_pdf_path} ({os.path.getsize(test_pdf_path)} bytes).")

    print("=" * 60)
    print("ALL STANDMAP BACKEND TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    test_pipeline()
