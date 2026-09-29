import React, { useState, useEffect } from 'react'
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, HelpCircle, FileText, ArrowRight, AlertOctagon, CheckSquare, Layers } from 'lucide-react'

export default function CoverageMatrix({ analysisId, onNavigateReview, onNavigateExport }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchCoverageData = async () => {
    if (!analysisId) return
    setLoading(true)
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/analyses/${analysisId}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoverageData()
  }, [analysisId])

  if (!analysisId) {
    return (
      <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
        <ShieldCheck className="w-12 h-12 text-emerald-500/40 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">No Active Analysis Selected</h3>
        <p className="text-sm text-slate-400 mt-1">Please select an analysis session to inspect the specification coverage matrix.</p>
      </div>
    )
  }

  const requirements = data?.requirements || []
  const recommendations = data?.recommendations || []
  const versionChecks = data?.version_checks || []
  const certChecks = data?.certification_checks || []
  const coverage = data?.coverage || {}
  const gaps = coverage?.gaps_summary || []

  const recsByReq = {}
  recommendations.forEach((r) => {
    if (!recsByReq[r.requirement_id]) {
      recsByReq[r.requirement_id] = r
    }
  })

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded border border-emerald-500/20 font-bold">
              Layer 7 & 8 • Specification Coverage Matrix & Gap Analyzer
            </span>
            <span className="text-xs font-mono text-slate-400">ID: {analysisId}</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Procurement Specification Coverage Audit
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit breakdown showing which tender requirements are fully governed by Indian Standards, where version updates are required, and where unstandardized gaps exist.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateReview}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-amber-600/20"
          >
            Officer Review Queue ({gaps.length})
          </button>
          <button
            onClick={onNavigateExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-blue-600/20"
          >
            Export Standards Report <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Coverage KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Requirements</span>
            <div className="text-2xl font-black text-white mt-0.5">{requirements.length}</div>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Clause Coverage (Tender Scope)</span>
            <div className="text-xl font-black text-emerald-400 mt-0.5">
              {coverage.covered_count || 0}/{requirements.length} Mapped ({coverage.coverage_percentage || 0}%)
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Specification Gaps</span>
            <div className="text-2xl font-black text-amber-400 mt-0.5">{gaps.length}</div>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Version Alerts</span>
            <div className="text-2xl font-black text-rose-400 mt-0.5">
              {versionChecks.filter((v) => v.status === 'OUTDATED').length}
            </div>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Version & Amendment Warnings Box (if any) */}
      {versionChecks.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            Statutory Version & Gazette Amendment Findings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {versionChecks.map((v, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border text-xs ${
                  v.status === 'OUTDATED'
                    ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                    : 'bg-blue-950/40 border-blue-500/60 text-blue-200'
                }`}
              >
                <div className="flex items-center justify-between font-mono font-bold mb-1">
                  <span>{v.referenced_string}</span>
                  <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-black/40">
                    {v.status}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed mt-1 opacity-90">{v.warning_message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Requirement Coverage Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            Requirement-by-Requirement Standards Traceability Table
          </h3>
          <span className="text-xs font-mono text-slate-400">Traceable to Source Document</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                <th className="py-3.5 px-4">Req ID</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Procurement Requirement</th>
                <th className="py-3.5 px-4">Source Provenance</th>
                <th className="py-3.5 px-4">Mapped Indian Standard</th>
                <th className="py-3.5 px-4">Coverage Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {requirements.map((req) => {
                const rec = recsByReq[req.id]
                let badge = (
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded font-bold text-[10px]">
                    COVERED
                  </span>
                )
                if (req.coverage_status === 'PARTIAL') {
                  badge = (
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded font-bold text-[10px]">
                      PARTIAL
                    </span>
                  )
                } else if (req.coverage_status === 'REVIEW') {
                  badge = (
                    <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded font-bold text-[10px]">
                      REVIEW
                    </span>
                  )
                } else if (req.coverage_status === 'NO_MATCH') {
                  badge = (
                    <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded font-bold text-[10px]">
                      NO MATCH
                    </span>
                  )
                }

                return (
                  <tr key={req.id} className="hover:bg-slate-950/40 transition">
                    <td className="py-3 px-4 font-mono text-slate-400 font-bold">{req.id}</td>
                    <td className="py-3 px-4 font-mono text-blue-400 font-bold">{req.category}</td>
                    <td className="py-3 px-4 text-slate-200 font-medium max-w-md">{req.text}</td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      Page {req.source_page}<br />
                      <span className="text-slate-500">{req.source_section}</span>
                    </td>
                    <td className="py-3 px-4">
                      {rec ? (
                        <div>
                          <span className="font-mono font-bold text-indigo-400">{rec.is_number}</span>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">{rec.standard_title}</p>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">No standard mapped</span>
                      )}
                    </td>
                    <td className="py-3 px-4">{badge}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
