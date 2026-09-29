import os
import json
import sqlite3
from typing import List, Dict, Any, Optional
from datetime import datetime

DB_PATH = os.getenv("DB_PATH", "/tmp/standmap.db" if os.getenv("VERCEL") else os.path.join(os.path.dirname(__file__), "..", "database", "standmap.db"))
STANDARDS_JSON_PATH = os.path.join(os.path.dirname(__file__), "standards_data.json")

def get_connection():
    os.makedirs(os.path.dirname(os.path.abspath(DB_PATH)), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. Analyses table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS analyses (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        organization TEXT,
        category TEXT,
        document_type TEXT,
        status TEXT DEFAULT 'DRAFT',
        raw_text TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Documents table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        analysis_id TEXT NOT NULL,
        filename TEXT NOT NULL,
        file_path TEXT,
        file_size INTEGER,
        page_count INTEGER,
        extracted_text TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(analysis_id) REFERENCES analyses(id)
    );
    """)

    # 3. Requirements table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS requirements (
        id TEXT PRIMARY KEY,
        analysis_id TEXT NOT NULL,
        text TEXT NOT NULL,
        normalized_value TEXT,
        category TEXT NOT NULL,
        source_document TEXT,
        source_page INTEGER,
        source_section TEXT,
        source_excerpt TEXT,
        confidence REAL DEFAULT 1.0,
        extraction_status TEXT DEFAULT 'EXTRACTED',
        coverage_status TEXT DEFAULT 'PENDING',
        FOREIGN KEY(analysis_id) REFERENCES analyses(id)
    );
    """)

    # 4. Standards Knowledge Base
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS standards (
        standard_id TEXT PRIMARY KEY,
        is_number TEXT NOT NULL,
        base_is TEXT NOT NULL,
        title TEXT NOT NULL,
        domain TEXT,
        category TEXT,
        scope TEXT,
        status TEXT DEFAULT 'CURRENT',
        publication_year INTEGER,
        edition TEXT,
        amendments_json TEXT,
        certification_status TEXT,
        certification_scheme TEXT,
        source_name TEXT,
        source_url TEXT,
        keywords_json TEXT,
        relationships_json TEXT,
        applicable_conditions_json TEXT
    );
    """)

    # 5. Recommendations table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS recommendations (
        id TEXT PRIMARY KEY,
        analysis_id TEXT NOT NULL,
        requirement_id TEXT NOT NULL,
        standard_id TEXT NOT NULL,
        match_score REAL,
        match_reason TEXT,
        applicability_status TEXT,
        applicability_reason TEXT,
        review_status TEXT DEFAULT 'PENDING',
        FOREIGN KEY(analysis_id) REFERENCES analyses(id),
        FOREIGN KEY(requirement_id) REFERENCES requirements(id),
        FOREIGN KEY(standard_id) REFERENCES standards(standard_id)
    );
    """)

    # 6. Version Checks table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS version_checks (
        id TEXT PRIMARY KEY,
        analysis_id TEXT NOT NULL,
        standard_id TEXT,
        referenced_string TEXT,
        referenced_year INTEGER,
        current_year INTEGER,
        status TEXT,
        warning_message TEXT,
        current_edition_title TEXT,
        FOREIGN KEY(analysis_id) REFERENCES analyses(id)
    );
    """)

    # 7. Certification Checks table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS certification_checks (
        id TEXT PRIMARY KEY,
        analysis_id TEXT NOT NULL,
        standard_id TEXT,
        scheme_name TEXT,
        mandate_level TEXT,
        statutory_order TEXT,
        reason TEXT,
        FOREIGN KEY(analysis_id) REFERENCES analyses(id)
    );
    """)

    # 8. Coverage Results table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS coverage_results (
        id TEXT PRIMARY KEY,
        analysis_id TEXT NOT NULL UNIQUE,
        total_requirements INTEGER,
        covered_count INTEGER,
        partial_count INTEGER,
        no_match_count INTEGER,
        review_count INTEGER,
        coverage_percentage REAL,
        gaps_summary TEXT,
        FOREIGN KEY(analysis_id) REFERENCES analyses(id)
    );
    """)

    # 9. Review Decisions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS review_decisions (
        id TEXT PRIMARY KEY,
        analysis_id TEXT NOT NULL,
        requirement_id TEXT,
        standard_id TEXT,
        officer_id TEXT,
        decision TEXT,
        override_is TEXT,
        notes TEXT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(analysis_id) REFERENCES analyses(id)
    );
    """)

    # Seed standards if empty
    cursor.execute("SELECT COUNT(*) FROM standards")
    count = cursor.fetchone()[0]
    if count == 0 and os.path.exists(STANDARDS_JSON_PATH):
        with open(STANDARDS_JSON_PATH, "r", encoding="utf-8") as f:
            std_list = json.load(f)
            for s in std_list:
                cursor.execute("""
                INSERT OR REPLACE INTO standards (
                    standard_id, is_number, base_is, title, domain, category, scope, status,
                    publication_year, edition, amendments_json, certification_status,
                    certification_scheme, source_name, source_url, keywords_json,
                    relationships_json, applicable_conditions_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    s["standard_id"], s["is_number"], s["base_is"], s["title"], s.get("domain"),
                    s.get("category"), s.get("scope"), s.get("status", "CURRENT"),
                    s.get("publication_year"), s.get("edition"), json.dumps(s.get("amendments", [])),
                    s.get("certification_status"), s.get("certification_scheme"),
                    s.get("source_name", "BIS"), s.get("source_url"),
                    json.dumps(s.get("keywords", [])), json.dumps(s.get("relationships", [])),
                    json.dumps(s.get("applicable_conditions", {}))
                ))
    
    conn.commit()
    conn.close()

# ----------------- Analyses CRUD -----------------

def create_analysis(data: Dict[str, Any]) -> str:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO analyses (id, title, organization, category, document_type, status, raw_text, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["id"], data.get("title", "Untitled Procurement Specification"),
        data.get("organization", "Procuring Authority"), data.get("category", "GENERAL"),
        data.get("document_type", "Tender Specification"), data.get("status", "DRAFT"),
        data.get("raw_text", ""), datetime.now().isoformat()
    ))
    conn.commit()
    conn.close()
    return data["id"]

def get_analysis(analysis_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM analyses WHERE id = ?", (analysis_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_all_analyses() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM analyses ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def update_analysis_status(analysis_id: str, status: str, category: Optional[str] = None):
    conn = get_connection()
    cursor = conn.cursor()
    if category:
        cursor.execute("UPDATE analyses SET status = ?, category = ?, updated_at = ? WHERE id = ?", 
                       (status, category, datetime.now().isoformat(), analysis_id))
    else:
        cursor.execute("UPDATE analyses SET status = ?, updated_at = ? WHERE id = ?", 
                       (status, datetime.now().isoformat(), analysis_id))
    conn.commit()
    conn.close()

def delete_analysis(analysis_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM requirements WHERE analysis_id = ?", (analysis_id,))
    cursor.execute("DELETE FROM recommendations WHERE analysis_id = ?", (analysis_id,))
    cursor.execute("DELETE FROM version_checks WHERE analysis_id = ?", (analysis_id,))
    cursor.execute("DELETE FROM certification_checks WHERE analysis_id = ?", (analysis_id,))
    cursor.execute("DELETE FROM coverage_results WHERE analysis_id = ?", (analysis_id,))
    cursor.execute("DELETE FROM review_decisions WHERE analysis_id = ?", (analysis_id,))
    cursor.execute("DELETE FROM documents WHERE analysis_id = ?", (analysis_id,))
    cursor.execute("DELETE FROM analyses WHERE id = ?", (analysis_id,))
    conn.commit()
    conn.close()

# ----------------- Documents CRUD -----------------

def save_document_record(data: Dict[str, Any]):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO documents (id, analysis_id, filename, file_path, file_size, page_count, extracted_text)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        data["id"], data["analysis_id"], data["filename"], data.get("file_path"),
        data.get("file_size", 0), data.get("page_count", 1), data.get("extracted_text", "")
    ))
    conn.commit()
    conn.close()

def get_analysis_documents(analysis_id: str) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM documents WHERE analysis_id = ? ORDER BY created_at ASC", (analysis_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ----------------- Requirements CRUD -----------------

def save_requirements(analysis_id: str, reqs: List[Dict[str, Any]]):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM requirements WHERE analysis_id = ?", (analysis_id,))
    for r in reqs:
        cursor.execute("""
        INSERT INTO requirements (
            id, analysis_id, text, normalized_value, category, source_document,
            source_page, source_section, source_excerpt, confidence, extraction_status, coverage_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            r["id"], analysis_id, r["text"], r.get("normalized_value"),
            r["category"], r.get("source_document"), r.get("source_page", 1),
            r.get("source_section", "General"), r.get("source_excerpt", ""),
            r.get("confidence", 1.0), r.get("extraction_status", "EXTRACTED"),
            r.get("coverage_status", "PENDING")
        ))
    conn.commit()
    conn.close()

def get_requirements(analysis_id: str) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM requirements WHERE analysis_id = ? ORDER BY rowid ASC", (analysis_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ----------------- Standards Knowledge Base -----------------

def get_all_standards() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM standards ORDER BY is_number ASC")
    rows = cursor.fetchall()
    conn.close()
    results = []
    for r in rows:
        d = dict(r)
        d["amendments"] = json.loads(d.get("amendments_json") or "[]")
        d["keywords"] = json.loads(d.get("keywords_json") or "[]")
        d["relationships"] = json.loads(d.get("relationships_json") or "[]")
        d["applicable_conditions"] = json.loads(d.get("applicable_conditions_json") or "{}")
        results.append(d)
    return results

def get_standard_by_id(std_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM standards WHERE standard_id = ? OR is_number = ? OR base_is = ?", (std_id, std_id, std_id))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    d["amendments"] = json.loads(d.get("amendments_json") or "[]")
    d["keywords"] = json.loads(d.get("keywords_json") or "[]")
    d["relationships"] = json.loads(d.get("relationships_json") or "[]")
    d["applicable_conditions"] = json.loads(d.get("applicable_conditions_json") or "{}")
    return d

# ----------------- Recommendations CRUD -----------------

def save_recommendations(analysis_id: str, recs: List[Dict[str, Any]]):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM recommendations WHERE analysis_id = ?", (analysis_id,))
    for r in recs:
        cursor.execute("""
        INSERT INTO recommendations (
            id, analysis_id, requirement_id, standard_id, match_score, match_reason,
            applicability_status, applicability_reason, review_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            r["id"], analysis_id, r["requirement_id"], r["standard_id"],
            r.get("match_score", 0.0), r.get("match_reason", ""),
            r.get("applicability_status", "APPLICABLE"),
            r.get("applicability_reason", ""), r.get("review_status", "PENDING")
        ))
    conn.commit()
    conn.close()

def get_recommendations(analysis_id: str) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT rec.*, s.is_number, s.base_is, s.title as standard_title, s.domain, s.status as standard_status,
           s.publication_year, s.edition, s.certification_status, s.certification_scheme, s.source_name, s.source_url,
           s.amendments_json, s.relationships_json,
           req.text as requirement_text, req.category as requirement_category,
           req.source_page, req.source_section, req.source_excerpt
    FROM recommendations rec
    JOIN standards s ON rec.standard_id = s.standard_id
    JOIN requirements req ON rec.requirement_id = req.id
    WHERE rec.analysis_id = ?
    ORDER BY rec.match_score DESC
    """, (analysis_id,))
    rows = cursor.fetchall()
    conn.close()
    res = []
    for r in rows:
        d = dict(r)
        d["amendments"] = json.loads(d.get("amendments_json") or "[]")
        d["relationships"] = json.loads(d.get("relationships_json") or "[]")
        res.append(d)
    return res

# ----------------- Version Checks CRUD -----------------

def save_version_checks(analysis_id: str, checks: List[Dict[str, Any]]):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM version_checks WHERE analysis_id = ?", (analysis_id,))
    for c in checks:
        cursor.execute("""
        INSERT INTO version_checks (
            id, analysis_id, standard_id, referenced_string, referenced_year,
            current_year, status, warning_message, current_edition_title
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            c["id"], analysis_id, c.get("standard_id"), c.get("referenced_string"),
            c.get("referenced_year"), c.get("current_year"), c.get("status", "CURRENT"),
            c.get("warning_message", ""), c.get("current_edition_title", "")
        ))
    conn.commit()
    conn.close()

def get_version_checks(analysis_id: str) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM version_checks WHERE analysis_id = ?", (analysis_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ----------------- Certification Checks CRUD -----------------

def save_certification_checks(analysis_id: str, certs: List[Dict[str, Any]]):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM certification_checks WHERE analysis_id = ?", (analysis_id,))
    for c in certs:
        cursor.execute("""
        INSERT INTO certification_checks (
            id, analysis_id, standard_id, scheme_name, mandate_level, statutory_order, reason
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            c["id"], analysis_id, c.get("standard_id"), c.get("scheme_name"),
            c.get("mandate_level"), c.get("statutory_order"), c.get("reason")
        ))
    conn.commit()
    conn.close()

def get_certification_checks(analysis_id: str) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM certification_checks WHERE analysis_id = ?", (analysis_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ----------------- Coverage Results CRUD -----------------

def save_coverage_result(data: Dict[str, Any]):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO coverage_results (
        id, analysis_id, total_requirements, covered_count, partial_count,
        no_match_count, review_count, coverage_percentage, gaps_summary
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["id"], data["analysis_id"], data.get("total_requirements", 0),
        data.get("covered_count", 0), data.get("partial_count", 0),
        data.get("no_match_count", 0), data.get("review_count", 0),
        data.get("coverage_percentage", 0.0), json.dumps(data.get("gaps_summary", []))
    ))
    conn.commit()
    conn.close()

def get_coverage_result(analysis_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM coverage_results WHERE analysis_id = ?", (analysis_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    d["gaps_summary"] = json.loads(d.get("gaps_summary") or "[]")
    return d

# ----------------- Review Decisions CRUD -----------------

def save_review_decision(data: Dict[str, Any]):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO review_decisions (
        id, analysis_id, requirement_id, standard_id, officer_id, decision, override_is, notes, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["id"], data["analysis_id"], data.get("requirement_id"),
        data.get("standard_id"), data.get("officer_id", "OFFICER-001"),
        data["decision"], data.get("override_is"), data.get("notes", ""),
        data.get("timestamp", datetime.now().isoformat())
    ))
    # Update recommendation review status
    if data.get("requirement_id"):
        cursor.execute("UPDATE recommendations SET review_status = ? WHERE analysis_id = ? AND requirement_id = ?", 
                       (data["decision"], data["analysis_id"], data["requirement_id"]))
    conn.commit()
    conn.close()

def get_review_decisions(analysis_id: str) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM review_decisions WHERE analysis_id = ? ORDER BY timestamp DESC", (analysis_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ----------------- Dashboard Analytics -----------------

def get_dashboard_metrics():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM analyses")
    total_analyses = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM requirements")
    total_reqs = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM standards")
    total_standards = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM recommendations WHERE applicability_status = 'APPLICABLE'")
    applicable_matches = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM recommendations WHERE review_status = 'PENDING'")
    pending_reviews = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM version_checks WHERE status = 'OUTDATED'")
    outdated_alerts = cursor.fetchone()[0]
    
    cursor.execute("SELECT category, COUNT(*) as count FROM analyses GROUP BY category")
    category_counts = [{"category": r[0], "count": r[1]} for r in cursor.fetchall()]
    
    cursor.execute("""
    SELECT s.is_number, s.title, COUNT(rec.id) as match_count 
    FROM recommendations rec 
    JOIN standards s ON rec.standard_id = s.standard_id 
    GROUP BY s.standard_id 
    ORDER BY match_count DESC LIMIT 5
    """)
    top_standards = [{"is_number": r[0], "title": r[1], "count": r[2]} for r in cursor.fetchall()]
    
    conn.close()
    return {
        "total_analyses": total_analyses,
        "total_requirements": total_reqs,
        "total_standards_indexed": total_standards,
        "applicable_matches": applicable_matches,
        "pending_reviews": pending_reviews,
        "outdated_alerts": outdated_alerts,
        "category_counts": category_counts,
        "top_standards": top_standards
    }
