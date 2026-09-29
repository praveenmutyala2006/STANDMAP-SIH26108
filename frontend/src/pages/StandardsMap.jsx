import React, { useState, useEffect } from 'react'
import { BookOpen, CheckCircle2, XCircle, AlertTriangle, ArrowRight, ShieldCheck, ExternalLink, Network, Check, X, HelpCircle, Layers } from 'lucide-react'

export default function StandardsMap({ analysisId, onNavigateGraph, onNavigateCoverage }) {
  const [data, setData] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedRec, setSelectedRec] = useState(null)

  const fetchRecommendations = async () => {
    if (!analysisId) return
    setLoading(true)
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/analyses/${analysisId}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
        setRecommendations(json.recommendations || [])
        if (json.recommendations && json.recommendations.length > 0) {
          setSelectedRec(json.recommendations[0])
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [analysisId])

  const handleReviewAction = async (rec, decision) => {
    try {
      const formData = new FormData()
      formData.append('requirement_id', rec.requirement_id)
      formData.append('standard_id', rec.standard_id)
      formData.append('decision', decision)
      formData.append('notes', `Quick action from Standards Map: ${decision}`)

      const res = await fetch(`http://127.0.0.1:8000/api/analyses/${analysisId}/review`, {
        method: 'POST',
        body: formData
      })
      if (res.ok) {
        await fetchRecommendations()
      }
    } catch (err) {
      console.error(err)
      alert('Review action failed.')
    }
  }

  const getApplicabilityBadge = (status) => {
    switch (status) {
      case 'APPLICABLE':
        return <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 font-bold text-xs rounded-lg border border-emerald-500/30 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> APPLICABLE</span>
      case 'POSSIBLY_APPLICABLE':
        return <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 font-bold text-xs rounded-lg border border-amber-500/30 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> POSSIBLY APPLICABLE</span>
      case 'REVIEW_REQUIRED':
        return <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 font-bold text-xs rounded-lg border border-indigo-500/30 flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5" /> REVIEW REQUIRED</span>
      default:
        return <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 font-bold text-xs rounded-lg border border-rose-500/30 flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> NOT APPLICABLE</span>
    }
  }

  if (!analysisId) {
    return (
      <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
        <BookOpen className="w-12 h-12 text-blue-500/40 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">No Active Analysis Selected</h3>
        <p className="text-sm text-slate-400 mt-1">Please select or run an analysis from Workspace to view mapped standards.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded border border-indigo-500/20 font-bold">
              Layer 4 & 5 • Hybrid Retrieval & Deterministic Applicability Engine
            </span>
            <span className="text-xs font-mono text-slate-400">ID: {analysisId}</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Recommended Indian Standards
            <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-mono">
              {recommendations.length} Candidate Matches
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateGraph}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/20"
          >
            <Network className="w-4 h-4" />
            Explore Standards Graph
          </button>
          <button
            onClick={onNavigateCoverage}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition border border-slate-700"
          >
            Check Specification Coverage <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recommendations List */}
        <div className="lg:col-span-2 space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              onClick={() => setSelectedRec(rec)}
              className={`p-5 rounded-2xl border transition cursor-pointer text-xs flex flex-col justify-between ${
                selectedRec?.id === rec.id
                  ? 'bg-slate-900 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md border border-blue-500/30">
                      {rec.is_number}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{rec.domain}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug">{rec.standard_title}</h3>
                </div>
                <div>{getApplicabilityBadge(rec.applicability_status)}</div>
              </div>

              {/* WHAT & PROVENANCE */}
              <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px]">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                  <span className="text-blue-400 font-bold uppercase">Target Requirement:</span>
                  <span>{rec.domain}</span>
                </div>
                <p className="text-slate-200 font-medium">"{rec.requirement_text}"</p>
              </div>

              {/* WHY & APPLICABILITY */}
              <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/60">
                  <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase">WHY CONSIDERED:</span>
                  <p className="text-slate-300 mt-0.5">{rec.match_reason}</p>
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/60">
                  <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase">APPLICABILITY PROOF:</span>
                  <p className="text-slate-300 mt-0.5">{rec.applicability_reason}</p>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Provenance: <strong className="text-slate-200">BIS Catalogue</strong>
                  </span>
                  {rec.review_status !== 'PENDING' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Decision: {rec.review_status}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReviewAction(rec, 'ACCEPT')
                    }}
                    className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg text-[11px] font-bold border border-emerald-500/40 transition flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Accept
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReviewAction(rec, 'FLAG_FOR_REVIEW')
                    }}
                    className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 rounded-lg text-[11px] font-bold border border-amber-500/40 transition flex items-center gap-1"
                  >
                    <HelpCircle className="w-3 h-3" /> Review
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReviewAction(rec, 'REJECT')
                    }}
                    className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 rounded-lg text-[11px] font-bold border border-rose-500/40 transition flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right 1 Col: Standard Detail & Normative Relationships Panel */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sticky top-24 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Layers className="w-4 h-4 text-indigo-400" />
              Standard Metadata & Relationships
            </h3>

            {selectedRec ? (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Authoritative Indian Standard</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      Source-verified metadata
                    </span>
                  </div>
                  <h4 className="font-mono text-base font-bold text-blue-400 mt-1">{selectedRec.is_number}</h4>
                  <p className="font-medium text-slate-200 mt-1">{selectedRec.standard_title}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-mono">Edition / Revision</span>
                    <p className="font-bold text-slate-200 mt-0.5">{selectedRec.edition || 'Current Edition'}</p>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-mono">Legal Status</span>
                    <p className={`font-bold mt-0.5 ${selectedRec.certification_status === 'MANDATORY_QCO' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {selectedRec.certification_status === 'MANDATORY_QCO' ? 'Mandatory (under QCO)' : 'Voluntary Standard'}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] space-y-1.5">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">BIS Certification Scheme:</span>
                    <span className="text-indigo-300 font-semibold">{selectedRec.certification_scheme?.includes('Scheme-I') ? 'Scheme-I (Conformity Assessment / ISI Mark)' : (selectedRec.certification_scheme?.includes('Scheme-II') ? 'Scheme-II (Compulsory Registration - CRS)' : 'Scheme-I / Product Certification')}</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-900">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Statutory Order / Provenance:</span>
                    <span className="text-slate-300">{selectedRec.certification_scheme || 'Voluntary standard under BIS Act / National Building Code reference.'}</span>
                  </div>
                </div>

                {/* Allied & Normative Standards */}
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center justify-between">
                    <span>Connected Normative Standards:</span>
                    <span className="text-indigo-400">{selectedRec.relationships?.length || 0} Connected</span>
                  </span>
                  <div className="space-y-2 mt-2 max-h-56 overflow-y-auto pr-1">
                    {selectedRec.relationships?.map((rel, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="font-bold font-mono text-indigo-400">{rel.target_is}</span>
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/20">
                            {rel.relationship_type}
                          </span>
                        </div>
                        <p className="font-medium text-slate-200 mt-1">{rel.target_title}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{rel.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <a
                    href={selectedRec.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 transition"
                  >
                    <span>View in BIS Official Catalogue</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-8">Select a recommendation card to inspect details.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
