import React, { useState, useEffect } from 'react'
import { FileText, Play, CheckCircle2, ArrowRight, Layers, Tag, MapPin, Eye, RefreshCw, AlertTriangle } from 'lucide-react'

export default function RequirementMap({ analysisId, onNavigateStandards }) {
  const [data, setData] = useState(null)
  const [requirements, setRequirements] = useState([])
  const [selectedReq, setSelectedReq] = useState(null)
  const [loading, setLoading] = useState(false)
  const [recommending, setRecommending] = useState(false)

  const fetchAnalysis = async () => {
    if (!analysisId) return
    setLoading(true)
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/analyses/${analysisId}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
        setRequirements(json.requirements || [])
        if (json.requirements && json.requirements.length > 0) {
          setSelectedReq(json.requirements[0])
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalysis()
  }, [analysisId])

  const handleRunRecommendations = async () => {
    if (!analysisId) return
    setRecommending(true)
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/analyses/${analysisId}/recommend`, {
        method: 'POST'
      })
      if (res.ok) {
        if (onNavigateStandards) {
          onNavigateStandards()
        }
      }
    } catch (err) {
      console.error(err)
      alert('Standards recommendation execution failed.')
    } finally {
      setRecommending(false)
    }
  }

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'PRODUCT':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      case 'PERFORMANCE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      case 'ELECTRICAL':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
      case 'SAFETY':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      case 'TESTING':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30'
      case 'MATERIAL':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
      case 'CERTIFICATION':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30'
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
    }
  }

  if (!analysisId) {
    return (
      <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
        <FileText className="w-12 h-12 text-blue-500/40 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">No Active Analysis Selected</h3>
        <p className="text-sm text-slate-400 mt-1">Please create an analysis session in the Workspace to view the requirement map.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded border border-blue-500/20 font-bold">
              Layer 2 • Source-Grounded Requirement Decomposition
            </span>
            <span className="text-xs font-mono text-slate-400">ID: {analysisId}</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {data?.analysis?.title || 'Requirement Map'}
            <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-mono">
              {requirements.length} Requirements Parsed
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunRecommendations}
            disabled={recommending || requirements.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            {recommending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Run Hybrid Standards Mapping Engine
          </button>
        </div>
      </div>

      {/* Main Requirement Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Requirements List */}
        <div className="lg:col-span-2 space-y-3">
          {requirements.map((req, idx) => (
            <div
              key={req.id}
              onClick={() => setSelectedReq(req)}
              className={`p-4 rounded-xl border transition cursor-pointer text-xs flex flex-col justify-between ${
                selectedReq?.id === req.id
                  ? 'bg-slate-900 border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/40'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-slate-400 font-bold">#{idx + 1}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryColor(req.category)}`}>
                    {req.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Confidence: {Math.round(req.confidence * 100)}%</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  <MapPin className="w-3 h-3 text-blue-400" />
                  <span>Page {req.source_page}</span>
                </div>
              </div>

              <p className="text-sm font-medium text-slate-200 mt-2 leading-relaxed">{req.text}</p>

              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate text-slate-400 font-mono">{req.source_section}</span>
                <span className="text-blue-400 font-semibold hover:underline flex items-center gap-1">
                  Inspect Source <Eye className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right 1 Col: Source Provenance Inspection Panel */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sticky top-24 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Eye className="w-4 h-4 text-blue-400" />
              Source Provenance Trace
            </h3>

            {selectedReq ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Requirement ID</span>
                  <p className="font-mono font-bold text-blue-400">{selectedReq.id}</p>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Classified Category</span>
                  <p className="font-bold text-white mt-0.5">{selectedReq.category}</p>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Extracted Text</span>
                  <p className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 font-mono mt-1 leading-relaxed">
                    "{selectedReq.text}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-mono">Source Document</span>
                    <p className="font-bold text-slate-200 truncate mt-0.5">{selectedReq.source_document}</p>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-mono">Page / Section</span>
                    <p className="font-bold text-slate-200 mt-0.5">Page {selectedReq.source_page}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Exact Context Excerpt</span>
                  <p className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 font-mono mt-1 text-[11px] italic">
                    {selectedReq.source_excerpt}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-8">Select a requirement to inspect its exact provenance.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
