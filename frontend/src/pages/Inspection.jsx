import React, { useState, useEffect } from 'react'
import { FileSearch, CheckCircle2, AlertTriangle, XCircle, HelpCircle, ArrowRight, ShieldCheck, Layers, BookOpen, ExternalLink, Network, Check, X, AlertOctagon, Info } from 'lucide-react'

export default function Inspection({ analysisId, onNavigateReview, onNavigateReport }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedReqId, setSelectedReqId] = useState(null)
  const [filterCategory, setFilterCategory] = useState('ALL')
  const [activeTabRight, setActiveTabRight] = useState('STANDARDS') // STANDARDS or GRAPH

  const fetchAnalysisData = async () => {
    if (!analysisId) return
    setLoading(true)
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/analyses/${analysisId}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
        if (json.requirements && json.requirements.length > 0) {
          setSelectedReqId(json.requirements[0].id)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalysisData()
  }, [analysisId])

  const handleReviewAction = async (rec, decision) => {
    try {
      const formData = new FormData()
      formData.append('requirement_id', rec.requirement_id)
      formData.append('standard_id', rec.standard_id)
      formData.append('decision', decision)
      formData.append('notes', `Quick action from Requirements & Standards view: ${decision}`)

      const res = await fetch(`http://127.0.0.1:8000/api/analyses/${analysisId}/review`, {
        method: 'POST',
        body: formData
      })
      if (res.ok) {
        await fetchAnalysisData()
      }
    } catch (err) {
      console.error(err)
      alert('Review action failed.')
    }
  }

  if (!analysisId) {
    return (
      <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
        <FileSearch className="w-12 h-12 text-blue-500/40 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">No Active Analysis Selected</h3>
        <p className="text-sm text-slate-400 mt-1">Please initialize or select a procurement tender from the Analyze tab.</p>
      </div>
    )
  }

  const requirements = data?.requirements || []
  const recommendations = data?.recommendations || []
  const versionChecks = data?.version_checks || []
  const coverage = data?.coverage || {}
  const selectedReq = requirements.find((r) => r.id === selectedReqId) || requirements[0]
  const matchedRec = recommendations.find((rec) => rec.requirement_id === selectedReq?.id)

  const filteredRequirements = requirements.filter((r) => {
    if (filterCategory === 'ALL') return true
    return r.category === filterCategory
  })

  const getCoverageBadge = (status) => {
    switch (status) {
      case 'COVERED':
        return <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 font-bold text-[10px] rounded border border-emerald-500/30 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> COVERED</span>
      case 'PARTIAL':
        return <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 font-bold text-[10px] rounded border border-amber-500/30 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> PARTIAL</span>
      case 'REVIEW':
        return <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 font-bold text-[10px] rounded border border-indigo-500/30 flex items-center gap-1"><HelpCircle className="w-3 h-3" /> REVIEW</span>
      default:
        return <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 font-bold text-[10px] rounded border border-rose-500/30 flex items-center gap-1"><XCircle className="w-3 h-3" /> NO MATCH</span>
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded border border-blue-500/20 font-bold">
              Step 2 • Requirements Extraction & Deterministic Standards Engine
            </span>
            <span className="text-xs font-mono text-slate-400">ID: {analysisId}</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Technical Specification & Standards Analysis
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Trace source requirements, evaluate deterministic applicability rules, inspect connected normative standards, and audit version status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateReview}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition"
          >
            Review Queue ({recommendations.filter(r => r.applicability_status === 'REVIEW_REQUIRED' || r.applicability_status === 'POSSIBLY_APPLICABLE').length})
          </button>
          <button
            onClick={onNavigateReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/20"
          >
            Standards Report <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 2-Pane Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Pane (col-span-6): Extracted Requirements & Source Provenance */}
        <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-blue-400" />
                Extracted Requirements & Provenance
              </h3>
              <span className="text-xs font-mono text-slate-400">{requirements.length} Requirements</span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {['ALL', 'PRODUCT', 'PERFORMANCE', 'MATERIAL', 'TESTING', 'SAFETY'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition ${
                    filterCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Requirements List */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredRequirements.map((req) => {
                const isSelected = selectedReq?.id === req.id
                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedReqId(req.id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-slate-950 border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/30'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {req.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Page {req.source_page} • {req.source_section}
                        </span>
                      </div>
                      <div>{getCoverageBadge(req.coverage_status)}</div>
                    </div>

                    <p className="text-slate-200 font-medium mt-2 leading-relaxed">
                      {req.text}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Selected Requirement Evidence Provenance Box (like original INSIST fact box) */}
          {selectedReq ? (
            <div className="p-3.5 bg-slate-950 border border-blue-500/30 rounded-xl space-y-1.5 animate-fadeIn mt-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-blue-400 font-bold uppercase">Source Provenance: {selectedReq.id}</span>
                <span className="text-slate-400">Page {selectedReq.source_page} • {selectedReq.source_section}</span>
              </div>
              <p className="text-xs text-slate-200 font-mono italic bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                "{selectedReq.source_excerpt || selectedReq.text}"
              </p>
              <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1">
                <span>Domain: {selectedReq.category}</span>
                <span>Extraction Confidence: {Math.round((selectedReq.confidence || 1.0) * 100)}%</span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-xs text-slate-500">
              Select any requirement above to trace source excerpt.
            </div>
          )}
        </div>

        {/* Right Pane (col-span-6): Deterministic Standards Verdicts & Normative Relations */}
        <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Deterministic Standards Recommendations
            </h3>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
              <button
                onClick={() => setActiveTabRight('STANDARDS')}
                className={`px-2.5 py-0.5 rounded font-semibold transition ${
                  activeTabRight === 'STANDARDS' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setActiveTabRight('GRAPH')}
                className={`px-2.5 py-0.5 rounded font-semibold transition ${
                  activeTabRight === 'GRAPH' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Connected Graph
              </button>
            </div>
          </div>

          {/* Version Findings Alert Box (if present for this analysis) */}
          {versionChecks.filter(v => v.status === 'OUTDATED').length > 0 && (
            <div className="p-3 bg-rose-950/30 border border-rose-500/50 rounded-xl text-xs text-rose-200 space-y-1">
              <div className="flex items-center justify-between font-mono font-bold">
                <span className="flex items-center gap-1.5"><AlertOctagon className="w-3.5 h-3.5 text-rose-400" /> Outdated Reference Warning</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300">OUTDATED</span>
              </div>
              {versionChecks.filter(v => v.status === 'OUTDATED').map((v, i) => (
                <p key={i} className="text-[11px] opacity-90">{v.warning_message}</p>
              ))}
            </div>
          )}

          {matchedRec ? (
            <div className="space-y-4 text-xs">
              {/* Recommendation Card */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold text-blue-400">{matchedRec.is_number}</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        Source-verified metadata
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-xs mt-1">{matchedRec.standard_title}</h4>
                  </div>
                  <span className="px-2 py-0.5 font-mono text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {matchedRec.applicability_status}
                  </span>
                </div>

                {/* Subtype Applicability Proof */}
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] space-y-1">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">Applicability Proof:</span>
                  <p className="text-slate-200">{matchedRec.applicability_reason}</p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Edition / Revision</span>
                    <span className="font-bold text-slate-200">{matchedRec.edition || 'Current Edition'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Legal Status</span>
                    <span className={`font-bold ${matchedRec.certification_status === 'MANDATORY_QCO' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {matchedRec.certification_status === 'MANDATORY_QCO' ? 'Mandatory (under QCO)' : 'Voluntary Standard'}
                    </span>
                  </div>
                </div>

                {/* Certification Scheme & Provenance */}
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] space-y-1">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">BIS Certification Scheme:</span>
                    <span className="text-indigo-300 font-semibold">{matchedRec.certification_scheme?.includes('Scheme-I') ? 'Scheme-I (Conformity Assessment / ISI Mark)' : (matchedRec.certification_scheme?.includes('Scheme-II') ? 'Scheme-II (Compulsory Registration - CRS)' : 'Scheme-I / Product Certification')}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-950">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Statutory Order / Provenance:</span>
                    <span className="text-slate-300">{matchedRec.certification_scheme || 'Voluntary standard under BIS Act / National Building Code reference.'}</span>
                  </div>
                </div>

                {/* Quick Review Actions */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">Decision: {matchedRec.review_status}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleReviewAction(matchedRec, 'ACCEPT')}
                      className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg text-[11px] font-bold border border-emerald-500/40 transition flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Accept
                    </button>
                    <button
                      onClick={() => handleReviewAction(matchedRec, 'FLAG_FOR_REVIEW')}
                      className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 rounded-lg text-[11px] font-bold border border-amber-500/40 transition flex items-center gap-1"
                    >
                      <HelpCircle className="w-3 h-3" /> Review
                    </button>
                    <button
                      onClick={() => handleReviewAction(matchedRec, 'REJECT')}
                      className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 rounded-lg text-[11px] font-bold border border-rose-500/40 transition flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Reject
                    </button>
                  </div>
                </div>
              </div>

              {/* Connected Normative Standards Box */}
              {activeTabRight === 'GRAPH' || matchedRec.relationships?.length > 0 ? (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Network className="w-3.5 h-3.5 text-indigo-400" />
                      Connected Normative Standards ({matchedRec.relationships?.length || 0})
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Testing • Safety • Motors</span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {matchedRec.relationships?.map((rel, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="font-bold font-mono text-indigo-400">{rel.target_is}</span>
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/20">
                            {rel.relationship_type}
                          </span>
                        </div>
                        <p className="font-medium text-slate-200 mt-0.5">{rel.target_title}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{rel.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Official BIS Link */}
              <div className="pt-1">
                <a
                  href={matchedRec.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 transition"
                >
                  <span>View in BIS Official Catalogue</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs space-y-2">
              <BookOpen className="w-8 h-8 mx-auto opacity-30" />
              <p>No standard directly mapped for this requirement.</p>
              <p className="text-[10px] text-slate-500">May represent an unstandardized specification or custom parameter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
