import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Color Palette (Dark Noir / Slate)
    BG_COLOR = RGBColor(11, 14, 23)        # #0B0E17
    CARD_BG = RGBColor(22, 28, 45)         # #161C2D
    CARD_BORDER = RGBColor(40, 52, 80)     # #283450
    PRIMARY = RGBColor(56, 189, 248)       # #38BDF8 Sky Cyan
    SUCCESS = RGBColor(52, 211, 153)       # #34D399 Emerald
    ACCENT = RGBColor(168, 85, 247)        # #A855F7 Purple
    TEXT_LIGHT = RGBColor(248, 250, 252)   # #F8FAFC
    TEXT_MUTED = RGBColor(148, 163, 184)   # #94A3B8
    TEXT_DARK = RGBColor(15, 23, 42)

    blank_layout = prs.slide_layouts[6]

    def set_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_COLOR
        bg.line.fill.background()
        return bg

    def add_header(slide, title_text, category_tag="SIH 2024 / INTERNAL EVALUATION — PROBLEM STATEMENT: SIH26108"):
        # Tag
        tb_tag = slide.shapes.add_textbox(Inches(0.8), Inches(0.45), Inches(11.7), Inches(0.4))
        tf_tag = tb_tag.text_frame
        tf_tag.word_wrap = True
        p_tag = tf_tag.paragraphs[0]
        p_tag.text = category_tag.upper()
        p_tag.font.size = Pt(10)
        p_tag.font.bold = True
        p_tag.font.color.rgb = PRIMARY

        # Title
        tb_title = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.7), Inches(0.8))
        tf_title = tb_title.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(24)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_LIGHT

    def add_card(slide, left, top, width, height, title, items, badge=""):
        # Card Background
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        card.line.width = Pt(1)

        # Card Content
        tb = slide.shapes.add_textbox(left + Inches(0.25), top + Inches(0.2), width - Inches(0.5), height - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True

        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(15)
        p_t.font.bold = True
        p_t.font.color.rgb = PRIMARY
        p_t.space_after = Pt(10)

        for item in items:
            p = tf.add_paragraph()
            p.text = "• " + item
            p.font.size = Pt(11)
            p.font.color.rgb = TEXT_MUTED
            p.space_after = Pt(6)

    # -------------------------------------------------------------
    # SLIDE 1: Title & Overview
    # -------------------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)
    set_bg(s1)

    # Main Title Box
    tb1 = s1.shapes.add_textbox(Inches(1.0), Inches(1.5), Inches(11.333), Inches(4.5))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p0 = tf1.paragraphs[0]
    p0.text = "SMART INDIA HACKATHON — PS: SIH26108"
    p0.font.size = Pt(13)
    p0.font.bold = True
    p0.font.color.rgb = PRIMARY
    p0.space_after = Pt(12)

    p1 = tf1.add_paragraph()
    p1.text = "STANDMAP"
    p1.font.size = Pt(46)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_LIGHT
    p1.space_after = Pt(8)

    p2 = tf1.add_paragraph()
    p2.text = "Automated Bureau of Indian Standards (BIS) Mapping & Applicability Platform"
    p2.font.size = Pt(20)
    p2.font.bold = True
    p2.font.color.rgb = SUCCESS
    p2.space_after = Pt(16)

    p3 = tf1.add_paragraph()
    p3.text = "A deterministic, standards-backed decision support engine for public procurement tenders, eliminating specification ambiguity, version obsolescence, and compliance litigation."
    p3.font.size = Pt(13)
    p3.font.color.rgb = TEXT_MUTED
    p3.space_after = Pt(28)

    p4 = tf1.add_paragraph()
    p4.text = "Live Deployment: https://standmap-sih26108.vercel.app  |  Private Repository: github.com/praveenmutyala2006/STANDMAP-SIH26108"
    p4.font.size = Pt(11)
    p4.font.bold = True
    p4.font.color.rgb = PRIMARY

    # -------------------------------------------------------------
    # SLIDE 2: Problem Statement & Real-World Gaps
    # -------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    set_bg(s2)
    add_header(s2, "The Real-World Procurement Bottlenecks (SIH26108)")

    add_card(s2, Inches(0.8), Inches(1.8), Inches(3.6), Inches(4.8), 
             "1. Fragmented Catalog", [
                 "Over 21,000 active Indian Standards exist across mechanical, electrical, and civil domains.",
                 "Procurement officers manually navigate Gazette notifications, Quality Control Orders (QCOs), and product manuals.",
                 "Zero centralized automation exists to link tender clauses directly to applicable standards."
             ])

    add_card(s2, Inches(4.8), Inches(1.8), Inches(3.6), Inches(4.8), 
             "2. Version Obsolescence", [
                 "Tender documents routinely cite withdrawn or superseded legacy standards.",
                 "Example: Citing IS 1180:1989 for distribution transformers instead of the mandated IS 1180 (Part 1):2014.",
                 "Citing obsolete standards leads to bid rejections, vendor disqualifications, and costly arbitration."
             ])

    add_card(s2, Inches(8.8), Inches(1.8), Inches(3.6), Inches(4.8), 
             "3. Ambiguity & AI Risks", [
                 "Tenders often omit critical subtypes (e.g., 1.1 kV cable with unspecified PVC vs XLPE insulation).",
                 "Generic LLMs hallucinate fabricated IS numbers or misclassify subtypes (Monoset vs Regenerative pump).",
                 "Procurement requires deterministic, legally auditable standards recommendations."
             ])

    # -------------------------------------------------------------
    # SLIDE 3: Proposed Solution
    # -------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    set_bg(s3)
    add_header(s3, "Proposed Solution: STANDMAP Core Platform")

    add_card(s3, Inches(0.8), Inches(1.8), Inches(5.6), Inches(2.3),
             "Deterministic Applicability Engine", [
                 "Subtype-accurate rules engine distinguishing Monoset Pumps (IS 9079:2018) from Regenerative Pumps (IS 8472:2019).",
                 "Matches operating conditions (head, discharge, medium) against exact BIS standard scopes."
             ])

    add_card(s3, Inches(6.8), Inches(1.8), Inches(5.6), Inches(2.3),
             "Honest Ambiguity Escalation", [
                 "Detects underspecified tenders (e.g. 1.1 kV power cable without polymer specification).",
                 "Refuses to guess; surfaces Candidate A (IS 694 - PVC) and Candidate B (IS 7098 Pt 1 - XLPE) for officer review."
             ])

    add_card(s3, Inches(0.8), Inches(4.4), Inches(5.6), Inches(2.3),
             "6-Step Traceability & Audit Chain", [
                 "Full provenance attached to every standard: originating clause, page number, and source excerpt.",
                 "Decouples BIS Certification Scheme (Scheme-I) from Legal Status (Mandatory QCO vs Voluntary)."
             ])

    add_card(s3, Inches(6.8), Inches(4.4), Inches(5.6), Inches(2.3),
             "Standards Dependency Graph", [
                 "Traverses multi-tiered relationships: links primary product standards to mandatory test codes (IS 9652) and motors (IS 12615).",
                 "Generates Standards-Backed Technical Procurement Reports (PDF/HTML)."
             ])

    # -------------------------------------------------------------
    # SLIDE 4: Architecture & Workflow Pipeline
    # -------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    set_bg(s4)
    add_header(s4, "System Architecture & 6-Step End-to-End Pipeline")

    steps = [
        ("Step 1: Document Ingestion", "Upload tender (PDF/DOCX/Text) or select benchmark procurement specification."),
        ("Step 2: Atomic Extraction", "Extract technical clauses with preserved page numbers, clause IDs, and context."),
        ("Step 3: Applicability Matching", "Deterministic engine tests category, product subtype, head, discharge, and voltage limits."),
        ("Step 4: Ambiguity & Graph Expansion", "Identifies multi-candidate conflicts and expands linked test codes & motor standards."),
        ("Step 5: Version Audit", "Checks publication dates against active gazette status; alerts on superseded standards."),
        ("Step 6: Officer Review & Report", "Procuring officer records justifications; generates formal Standards-Backed Report.")
    ]

    for idx, (stitle, sdesc) in enumerate(steps):
        top_offset = Inches(1.7 + (idx * 0.9))
        c = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), top_offset, Inches(11.7), Inches(0.75))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = CARD_BORDER
        c.line.width = Pt(1)

        tb = s4.shapes.add_textbox(Inches(1.0), top_offset + Inches(0.1), Inches(11.3), Inches(0.55))
        tf = tb.text_frame
        p = tf.paragraphs[0]
        p.text = stitle + "  —  "
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = PRIMARY

        run = p.add_run()
        run.text = sdesc
        run.font.size = Pt(11)
        run.font.color.rgb = TEXT_MUTED

    # -------------------------------------------------------------
    # SLIDE 5: Technical Innovations & Differentiators
    # -------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    set_bg(s5)
    add_header(s5, "Key Innovations: Moving Beyond Black-Box AI")

    add_card(s5, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "Why Generic AI Fails in Standards", [
                 "Hallucination Risk: General LLMs invent nonexistent standard numbers (e.g. claiming IS 9079 covers solar pumps).",
                 "Legal Inaccuracy: Cannot distinguish between voluntary recommendations and Gazette-notified mandatory QCOs.",
                 "Subtype Blindness: Confuses monoset centrifugal pumps with regenerative peripheral pumps, invalidating tender criteria.",
                 "Zero Accountability: Cannot prove which sentence in a 90-page tender led to a specific compliance clause."
             ])

    add_card(s5, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "STANDMAP Deterministic Defense", [
                 "Curated BIS Verification Matrix: Source-verified metadata for 15 core standards with Gazette citations.",
                 "Subtype Applicability Engine: IS 9079:2018 (Monoset) vs IS 8472:2019 (Regenerative) verified against engineering boundaries.",
                 "Unbiased Ambiguity Escalation: Surfacing multi-candidate options (IS 694 vs IS 7098 Pt 1) instead of making false guesses.",
                 "Strict Provenance Anchor: Every recommendation directly cites tender clause and page number."
             ])

    # -------------------------------------------------------------
    # SLIDE 6: Tech Stack & Feasibility
    # -------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    set_bg(s6)
    add_header(s6, "Technology Stack & Operational Feasibility")

    add_card(s6, Inches(0.8), Inches(1.8), Inches(3.6), Inches(4.8),
             "Frontend & Interaction", [
                 "Glassy Noir UI: Premium dark slate aesthetic, backdrop-blur panels, and fluid responsive dock navigation.",
                 "Typography & Icons: Google Outfit typography and Lucide icon suite.",
                 "Interactive Graph: SVG dependency network visualization of test and parent standards.",
                 "Zero-friction web interface running without complex local dependencies."
             ])

    add_card(s6, Inches(4.8), Inches(1.8), Inches(3.6), Inches(4.8),
             "Backend & Logic Core", [
                 "Python 3.12 & FastAPI: High-throughput asynchronous REST microservices.",
                 "NetworkX: Standards dependency and hierarchical graph resolution engine.",
                 "ReportLab Engine: Server-side programmatic PDF generation for official procurement reports.",
                 "SQLite / Relational Schema: In-memory auto-seeding with < 20 ms startup time."
             ])

    add_card(s6, Inches(8.8), Inches(1.8), Inches(3.6), Inches(4.8),
             "Cloud & Verification", [
                 "Vercel Serverless: Live production deployment (https://standmap-sih26108.vercel.app).",
                 "GitHub Version Control: Full CI/CD pipeline on private repository.",
                 "Automated Test Suite: 100% test pass rate across retrieval, applicability, versioning, and reports.",
                 "Sub-second latency (< 250ms) for end-to-end tender parsing."
             ])

    # -------------------------------------------------------------
    # SLIDE 7: Impact, Scalability & Roadmap
    # -------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    set_bg(s7)
    add_header(s7, "Future Scope, GeM Integration & Scale")

    add_card(s7, Inches(0.8), Inches(1.8), Inches(5.6), Inches(2.3),
             "Government e-Marketplace (GeM) API", [
                 "Integration as an automated pre-publish compliance plugin on GeM portal.",
                 "Flags ambiguous or obsolete standards during bid creation before tenders go public."
             ])

    add_card(s7, Inches(6.8), Inches(1.8), Inches(5.6), Inches(2.3),
             "Full BIS Catalog Indexing", [
                 "Scalable ingestion pipeline to expand from current 15 seed standards to all 21,000+ BIS standards.",
                 "Automated scraping of weekly Gazette QCO notifications for real-time legal status updates."
             ])

    add_card(s7, Inches(0.8), Inches(4.4), Inches(5.6), Inches(2.3),
             "Vendor Bid Conformance Checking", [
                 "Reverse-mode analysis: Compares vendor technical compliance sheets directly against tender standards.",
                 "Instantly detects non-compliant product claims during bid evaluation stage."
             ])

    add_card(s7, Inches(6.8), Inches(4.4), Inches(5.6), Inches(2.3),
             "Multi-Language Tender Processing", [
                 "Support for regional language procurement documents using multilingual clause segmentation.",
                 "Exportable CVC-aligned audit logs for government vigilance archives."
             ])

    # -------------------------------------------------------------
    # SLIDE 8: Live Prototype & Submission Summary
    # -------------------------------------------------------------
    s8 = prs.slides.add_slide(blank_layout)
    set_bg(s8)
    add_header(s8, "Live Prototype & Submission Deliverables (SIH26108)")

    tb8 = s8.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.3), Inches(4.8))
    tf8 = tb8.text_frame
    tf8.word_wrap = True

    p = tf8.paragraphs[0]
    p.text = "PROTOTYPE STATUS: LIVE & VERIFIED IN PRODUCTION"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = SUCCESS
    p.space_after = Pt(16)

    deliverables = [
        ("Live Web Application", "https://standmap-sih26108.vercel.app (Full Glassy Noir UI, 4 benchmark tenders)"),
        ("Private GitHub Repository", "https://github.com/praveenmutyala2006/STANDMAP-SIH26108 (Full source, tests, API)"),
        ("Problem Statement", "SIH26108 — Automated BIS Mapping & Applicability Platform"),
        ("Key Differentiators", "Deterministic Subtype Matching | Ambiguity Escalation | Provenance Chain | Version Alerts"),
        ("Demonstrated Workflows", "1. Monoset Pump (IS 9079)  |  2. Cable Ambiguity (IS 694 vs IS 7098)  |  3. Legacy Version Alert (IS 1180)")
    ]

    for title, desc in deliverables:
        p_d = tf8.add_paragraph()
        p_d.text = f"• {title}: "
        p_d.font.size = Pt(13)
        p_d.font.bold = True
        p_d.font.color.rgb = PRIMARY

        run = p_d.add_run()
        run.text = desc
        run.font.size = Pt(12)
        run.font.color.rgb = TEXT_LIGHT
        p_d.space_after = Pt(12)

    # Save presentation
    output_path = "SIH26108_STANDMAP_Presentation.pptx"
    prs.save(output_path)
    print(f"Presentation saved successfully to {output_path}")

if __name__ == "__main__":
    create_presentation()
