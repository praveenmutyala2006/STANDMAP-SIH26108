"""
STANDMAP - Standards Mapping & Applicability Platform
FastAPI Application Backend (SIH26108)
Department of Consumer Affairs • Smart Automation for Public Procurement
"""

import os
import uuid
import shutil
from typing import List, Dict, Any, Optional
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles

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

app = FastAPI(
    title="STANDMAP — Standards Mapping & Applicability Platform",
    description="AI-Powered Recommendation Engine for Identifying Applicable Indian Standards for Procurement Specifications (SIH26108)",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "/tmp/uploads" if os.getenv("VERCEL") else os.path.join(os.path.dirname(__file__), "uploads")
REPORTS_DIR = "/tmp/reports" if os.getenv("VERCEL") else os.path.join(os.path.dirname(__file__), "reports")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.on_event("startup")
def on_startup():
    db.init_db()

@app.get("/")
def root():
    html_path = os.path.join(os.path.dirname(__file__), "static_ui.html")
    if os.path.exists(html_path):
        with open(html_path, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    return HTMLResponse(content="<h1>STANDMAP Server Online</h1><p><a href='/docs'>Swagger API Docs</a></p>")

@app.get("/bg_noir.jpg")
def get_bg_noir():
    bg_path = os.path.join(os.path.dirname(__file__), "bg_noir.jpg")
    if os.path.exists(bg_path):
        return FileResponse(bg_path, media_type="image/jpeg")
    return HTTPException(status_code=404, detail="Background not found")

@app.get("/favicon.png")
def get_favicon():
    fav_path = os.path.join(os.path.dirname(__file__), "favicon.png")
    if os.path.exists(fav_path):
        return FileResponse(fav_path, media_type="image/png")
    return HTTPException(status_code=404, detail="Favicon not found")

@app.get("/logo.png")
def get_logo():
    logo_path = os.path.join(os.path.dirname(__file__), "logo.png")
    if os.path.exists(logo_path):
        return FileResponse(logo_path, media_type="image/png")
    return HTTPException(status_code=404, detail="Logo not found")


@app.get("/api/sample-tenders")
def get_sample_tenders():
    return SAMPLE_TENDERS

# 1. Create Analysis Endpoint
@app.post("/api/analyses")
def create_analysis_endpoint(
    title: str = Form("Procurement of Industrial Water Pump Sets"),
    organization: str = Form("Department of Rural Water Supply"),
    category: str = Form("PUMPS_AND_MOTORS"),
    document_type: str = Form("Tender Technical Specification"),
    raw_text: Optional[str] = Form(None)
):
    analysis_id = f"ANL-{int(datetime.now().timestamp()) % 100000}"
    db.create_analysis({
        "id": analysis_id,
        "title": title,
        "organization": organization,
        "category": category,
        "document_type": document_type,
        "raw_text": raw_text or "",
        "status": "DRAFT"
    })
    
    # If raw_text is supplied directly, auto-extract requirements
    if raw_text and len(raw_text.strip()) > 30:
        reqs = re_ext.extract_requirements_from_text(raw_text, "Pasted_Specification.txt")
        db.save_requirements(analysis_id, reqs)
        db.update_analysis_status(analysis_id, "REQUIREMENTS_EXTRACTED")
        
    return {"analysis_id": analysis_id, "status": "DRAFT"}

# 2. Upload Document Endpoint
@app.post("/api/analyses/{analysis_id}/document")
async def upload_document_endpoint(
    analysis_id: str,
    file: UploadFile = File(...)
):
    analysis = db.get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis session not found")
        
    doc_id = f"DOC-{uuid.uuid4().hex[:8]}"
    ext_name = os.path.splitext(file.filename)[1] or ".txt"
    saved_filename = f"{doc_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, saved_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    file_size = os.path.getsize(file_path)
    parsed_doc = dp.parse_document(file_path, file.filename)
    
    db.save_document_record({
        "id": doc_id,
        "analysis_id": analysis_id,
        "filename": file.filename,
        "file_path": file_path,
        "file_size": file_size,
        "page_count": parsed_doc.get("page_count", 1),
        "extracted_text": parsed_doc.get("full_text", "")
    })
    
    # Extract requirements from parsed text
    reqs = re_ext.extract_requirements_from_text(parsed_doc.get("full_text", ""), file.filename)
    db.save_requirements(analysis_id, reqs)
    db.update_analysis_status(analysis_id, "REQUIREMENTS_EXTRACTED")
    
    return {
        "document_id": doc_id,
        "filename": file.filename,
        "page_count": parsed_doc.get("page_count", 1),
        "requirements_count": len(reqs),
        "extracted_text_preview": parsed_doc.get("full_text", "")[:300]
    }

# 3. 1-Click Load Sample Tender Endpoint
@app.post("/api/analyses/{analysis_id}/load-sample")
def load_sample_tender_endpoint(
    analysis_id: str,
    sample_id: str = Form("DEMO-TENDER-01")
):
    sample = next((s for s in SAMPLE_TENDERS if s["id"] == sample_id), SAMPLE_TENDERS[0])
    
    db.update_analysis_status(analysis_id, "DRAFT", category=sample["category"])
    
    # Save as document
    doc_id = f"DOC-{analysis_id}-DEMO"
    db.save_document_record({
        "id": doc_id,
        "analysis_id": analysis_id,
        "filename": sample["file_name"],
        "file_path": None,
        "file_size": len(sample["full_text"]),
        "page_count": 2,
        "extracted_text": sample["full_text"]
    })
    
    # Extract requirements
    reqs = re_ext.extract_requirements_from_text(sample["full_text"], sample["file_name"])
    db.save_requirements(analysis_id, reqs)
    db.update_analysis_status(analysis_id, "REQUIREMENTS_EXTRACTED")
    
    return {
        "analysis_id": analysis_id,
        "sample_loaded": sample["title"],
        "category": sample["category"],
        "requirements_count": len(reqs)
    }

# 4. Get Extracted Requirements Endpoint
@app.get("/api/analyses/{analysis_id}/requirements")
def get_requirements_endpoint(analysis_id: str):
    analysis = db.get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    reqs = db.get_requirements(analysis_id)
    return {"analysis_id": analysis_id, "requirements": reqs, "total": len(reqs)}

# 5. Run Standards Recommendation Engine
@app.post("/api/analyses/{analysis_id}/recommend")
@app.post("/api/analyses/{analysis_id}/process")
def run_recommendation_pipeline_endpoint(analysis_id: str):
    analysis = db.get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    reqs = db.get_requirements(analysis_id)
    if not reqs:
        # If no requirements extracted yet, check documents or sample
        docs = db.get_analysis_documents(analysis_id)
        if docs:
            full_text = "\n".join([d.get("extracted_text", "") for d in docs])
            reqs = re_ext.extract_requirements_from_text(full_text, docs[0]["filename"])
            db.save_requirements(analysis_id, reqs)
        else:
            # Fallback to demo tender
            sample = SAMPLE_TENDERS[0]
            reqs = re_ext.extract_requirements_from_text(sample["full_text"], sample["file_name"])
            db.save_requirements(analysis_id, reqs)
            
    all_standards = db.get_all_standards()
    standards_map = {s["standard_id"]: s for s in all_standards}
    
    retrieval_engine = HybridRetrievalEngine(all_standards)
    recommendations = []
    
    # 1. Hybrid Retrieval & Applicability Checking for each requirement
    for req in reqs:
        candidates = retrieval_engine.retrieve_candidates(req, top_k=2)
        for c in candidates:
            std = c["standard"]
            eval_res = DeterministicApplicabilityEngine.evaluate_applicability(req, std, c["hybrid_score"])
            
            rec_id = f"REC-{analysis_id}-{uuid.uuid4().hex[:6]}"
            recommendations.append({
                "id": rec_id,
                "requirement_id": req["id"],
                "standard_id": std["standard_id"],
                "match_score": c["hybrid_score"],
                "match_reason": c["match_reason"],
                "applicability_status": eval_res["status"],
                "applicability_reason": eval_res["reason"],
                "review_status": "PENDING"
            })
            
    db.save_recommendations(analysis_id, recommendations)
    
    # 2. Version & Amendment Checks
    full_tender_text = ""
    docs = db.get_analysis_documents(analysis_id)
    if docs:
        full_tender_text = "\n".join([d.get("extracted_text", "") for d in docs])
    else:
        full_tender_text = "\n".join([r["text"] for r in reqs])
        
    version_checks = VersionChecker.check_versions(full_tender_text, all_standards)
    db.save_version_checks(analysis_id, version_checks)
    
    # 3. Certification Checks
    cert_checks = CertificationChecker.evaluate_certifications(recommendations, standards_map)
    db.save_certification_checks(analysis_id, cert_checks)
    
    # 4. Coverage Analysis
    coverage = CoverageAnalyzer.analyze_coverage(reqs, recommendations)
    db.save_coverage_result({
        "id": f"COV-{analysis_id}",
        "analysis_id": analysis_id,
        "total_requirements": coverage["total_requirements"],
        "covered_count": coverage["covered_count"],
        "partial_count": coverage["partial_count"],
        "no_match_count": coverage["no_match_count"],
        "review_count": coverage["review_count"],
        "coverage_percentage": coverage["coverage_percentage"],
        "gaps_summary": coverage["gaps_summary"]
    })
    
    # Update requirement coverage statuses in DB
    db.save_requirements(analysis_id, coverage["updated_requirements"])
    
    # Set final analysis status
    final_status = "COMPLETED" if coverage["coverage_percentage"] >= 75 else "REVIEW_REQUIRED"
    db.update_analysis_status(analysis_id, final_status)
    
    return {
        "analysis_id": analysis_id,
        "status": final_status,
        "total_requirements": len(reqs),
        "total_recommendations": len(recommendations),
        "coverage_percentage": coverage["coverage_percentage"],
        "version_alerts_count": len([v for v in version_checks if v["status"] == "OUTDATED"]),
        "gaps_count": len(coverage["gaps_summary"])
    }

# 6. Get Recommended Standards Endpoint
@app.get("/api/analyses/{analysis_id}/standards")
def get_standards_endpoint(analysis_id: str):
    analysis = db.get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    recs = db.get_recommendations(analysis_id)
    return {"analysis_id": analysis_id, "recommendations": recs}

# 7. Get Standards Relationship Graph Endpoint
@app.get("/api/analyses/{analysis_id}/graph")
def get_graph_endpoint(analysis_id: str):
    analysis = db.get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    reqs = db.get_requirements(analysis_id)
    recs = db.get_recommendations(analysis_id)
    all_standards = db.get_all_standards()
    standards_map = {s["standard_id"]: s for s in all_standards}
    
    graph_engine = StandardsGraphEngine()
    graph_data = graph_engine.build_analysis_graph(reqs, recs, standards_map)
    return graph_data

# 8. Get Specification Coverage Endpoint
@app.get("/api/analyses/{analysis_id}/coverage")
def get_coverage_endpoint(analysis_id: str):
    analysis = db.get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    cov = db.get_coverage_result(analysis_id)
    reqs = db.get_requirements(analysis_id)
    return {"analysis_id": analysis_id, "coverage": cov, "requirements": reqs}

# 9. Submit Officer Review Decision Endpoint
@app.post("/api/analyses/{analysis_id}/review")
def submit_review_decision_endpoint(
    analysis_id: str,
    requirement_id: str = Form(...),
    standard_id: Optional[str] = Form(None),
    decision: str = Form("ACCEPT"),
    override_is: Optional[str] = Form(None),
    notes: Optional[str] = Form(""),
    officer_id: str = Form("PROCUREMENT-OFFICER-01")
):
    rev_id = f"REV-{uuid.uuid4().hex[:6]}"
    db.save_review_decision({
        "id": rev_id,
        "analysis_id": analysis_id,
        "requirement_id": requirement_id,
        "standard_id": standard_id,
        "officer_id": officer_id,
        "decision": decision,
        "override_is": override_is,
        "notes": notes
    })
    return {"status": "SUCCESS", "review_id": rev_id}

# 10. Get Full Analysis Details Endpoint
@app.get("/api/analyses/{analysis_id}")
def get_analysis_endpoint(analysis_id: str):
    analysis = db.get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    docs = db.get_analysis_documents(analysis_id)
    reqs = db.get_requirements(analysis_id)
    recs = db.get_recommendations(analysis_id)
    version_checks = db.get_version_checks(analysis_id)
    cert_checks = db.get_certification_checks(analysis_id)
    coverage = db.get_coverage_result(analysis_id)
    reviews = db.get_review_decisions(analysis_id)
    
    return {
        "analysis": analysis,
        "documents": docs,
        "requirements": reqs,
        "recommendations": recs,
        "version_checks": version_checks,
        "certification_checks": cert_checks,
        "coverage": coverage,
        "review_decisions": reviews
    }

# 11. List All Analyses Endpoint
@app.get("/api/analyses")
def list_analyses_endpoint():
    return db.get_all_analyses()

# 12. Delete Analysis Endpoint
@app.delete("/api/analyses/{analysis_id}")
def delete_analysis_endpoint(analysis_id: str):
    db.delete_analysis(analysis_id)
    return {"status": "DELETED", "analysis_id": analysis_id}

# 13. HTML Report Endpoint
@app.get("/api/analyses/{analysis_id}/report", response_class=HTMLResponse)
def get_report_html_endpoint(analysis_id: str):
    analysis = db.get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    reqs = db.get_requirements(analysis_id)
    recs = db.get_recommendations(analysis_id)
    version_checks = db.get_version_checks(analysis_id)
    cert_checks = db.get_certification_checks(analysis_id)
    coverage = db.get_coverage_result(analysis_id) or {}
    reviews = db.get_review_decisions(analysis_id)
    
    html = prep.generate_html_report(analysis, reqs, recs, version_checks, cert_checks, coverage, reviews)
    return HTMLResponse(content=html)

# 14. PDF Report Endpoint
@app.get("/api/analyses/{analysis_id}/report/pdf")
def get_report_pdf_endpoint(analysis_id: str):
    analysis = db.get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    reqs = db.get_requirements(analysis_id)
    recs = db.get_recommendations(analysis_id)
    version_checks = db.get_version_checks(analysis_id)
    cert_checks = db.get_certification_checks(analysis_id)
    
    pdf_path = os.path.join(REPORTS_DIR, f"STANDMAP_Report_{analysis_id}.pdf")
    prep.generate_pdf_report(analysis, reqs, recs, version_checks, cert_checks, pdf_path)
    return FileResponse(pdf_path, media_type="application/pdf", filename=f"STANDMAP_Standards_Report_{analysis_id}.pdf")

# 15. Export Draft Tender Clause Endpoint
@app.get("/api/analyses/{analysis_id}/export/clause")
def export_tender_clause_endpoint(analysis_id: str):
    analysis = db.get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    recs = db.get_recommendations(analysis_id)
    version_checks = db.get_version_checks(analysis_id)
    cert_checks = db.get_certification_checks(analysis_id)
    
    clause_text = prep.generate_tender_clause_text(analysis, recs, version_checks, cert_checks)
    return {"analysis_id": analysis_id, "tender_clause": clause_text}

# 16. Dashboard Metrics Endpoint
@app.get("/api/dashboard/stats")
def get_dashboard_stats_endpoint():
    return db.get_dashboard_metrics()
