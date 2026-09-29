import React, { useState, useEffect } from 'react'
import { FileText, Download, Copy, Check, ExternalLink, Printer, ShieldCheck, Share2, Sparkles } from 'lucide-react'

export default function ExportReport({ analysisId }) {
  const [clauseText, setClauseText] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!analysisId) return
    setLoading(true)
    fetch(`http://127.0.0.1:8000/api/analyses/${analysisId}/export/clause`)
      .then((res) => res.json())
      .then((data) => {
        setClauseText(data.tender_clause || '')
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))
  }, [analysisId])

  const handleCopy = () => {
    navigator.clipboard.writeText(clauseText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!analysisId) {
    return (
      <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
        <FileText className="w-12 h-12 text-blue-500/40 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">No Active Analysis Selected</h3>
        <p className="text-sm text-slate-400 mt-1">Please select an analysis session to export tender specifications and reports.</p>
      </div>
    )
  }

  const pdfUrl = `http://127.0.0.1:8000/api/analyses/${analysisId}/report/pdf`
  const htmlUrl = `http://127.0.0.1:8000/api/analyses/${analysisId}/report`

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded border border-blue-500/20 font-bold">
              Layer 10 • Standards-Backed Technical Procurement Report Export
            </span>
            <span className="text-xs font-mono text-slate-400">ID: {analysisId}</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Standards-Backed Tender Specification Export
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Export standards-backed technical procurement reports containing source requirements, recommendations, version findings, and review decisions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/20"
          >
            <Download className="w-4 h-4" />
            Generate / Download Standards Report
          </a>
          <a
            href={htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition border border-slate-700"
          >
            <ExternalLink className="w-4 h-4" />
            Open HTML View
          </a>
        </div>
      </div>

      {/* Copyable Tender Clause Generator Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Draft Tender Specification Clause (Ready for GeM / CPPP)</h3>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg text-xs font-bold border border-blue-500/30 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied to Clipboard!' : 'Copy Tender Clause'}
          </button>
        </div>

        <textarea
          readOnly
          value={clauseText}
          rows={10}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none leading-relaxed resize-none"
        ></textarea>
      </div>

      {/* Embedded Live HTML Report Frame */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Standards-Backed Procurement Report Preview
          </h3>
          <span className="text-xs font-mono text-slate-400">STANDMAP Decision-Support Document</span>
        </div>
        <iframe
          src={htmlUrl}
          title="STANDMAP Report"
          className="w-full h-[650px] border-none bg-white"
        ></iframe>
      </div>
    </div>
  )
}
