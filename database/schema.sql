-- STANDMAP Database Schema (SIH26108)
-- Standards Mapping & Applicability Platform

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
    verification_status TEXT DEFAULT 'VERIFIED_BIS_PUBLIC_CATALOGUE',
    keywords_json TEXT,
    relationships_json TEXT,
    applicable_conditions_json TEXT
);

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
