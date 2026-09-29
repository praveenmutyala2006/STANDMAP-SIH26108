import React, { useState, useEffect } from 'react'
import { Network, Layers, ShieldCheck, BookOpen, Filter, Info, Eye, ExternalLink } from 'lucide-react'

export default function StandardsGraph({ analysisId }) {
  const [graphData, setGraphData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedNode, setSelectedNode] = useState(null)
  const [filterType, setFilterType] = useState('ALL')

  const fetchGraph = async () => {
    if (!analysisId) return
    setLoading(true)
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/analyses/${analysisId}/graph`)
      if (res.ok) {
        const json = await res.json()
        setGraphData(json)
        if (json.nodes && json.nodes.length > 0) {
          const primaryNode = json.nodes.find((n) => n.node_type === 'PRIMARY_STANDARD') || json.nodes[0]
          setSelectedNode(primaryNode)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGraph()
  }, [analysisId])

  if (!analysisId) {
    return (
      <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
        <Network className="w-12 h-12 text-indigo-500/40 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">No Active Analysis Selected</h3>
        <p className="text-sm text-slate-400 mt-1">Please select an analysis session to explore the standards relationship graph.</p>
      </div>
    )
  }

  const nodes = graphData?.nodes || []
  const links = graphData?.links || []

  // Filter nodes
  const filteredNodes = nodes.filter((n) => {
    if (filterType === 'ALL') return true
    if (filterType === 'REQUIREMENT') return n.node_type === 'REQUIREMENT'
    if (filterType === 'PRIMARY_STANDARD') return n.node_type === 'PRIMARY_STANDARD'
    if (filterType === 'TEST_METHOD') return n.rel_type === 'TEST_METHOD'
    if (filterType === 'SAFETY_STANDARD') return n.rel_type === 'SAFETY_STANDARD'
    return true
  })

  // Connected links for selected node
  const connectedLinks = selectedNode
    ? links.filter((l) => l.source === selectedNode.id || l.target === selectedNode.id)
    : []

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded border border-indigo-500/20 font-bold">
              Layer 6 • Standards Relationship Graph Architecture
            </span>
            <span className="text-xs font-mono text-slate-400">ID: {analysisId}</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Standards Relationship Map & Normative Tree
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Curated relationship coverage for supported demo domains. Answers: <em>"What allied standards, testing procedures, and safety codes must be considered alongside this primary standard?"</em>
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              filterType === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({nodes.length})
          </button>
          <button
            onClick={() => setFilterType('PRIMARY_STANDARD')}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              filterType === 'PRIMARY_STANDARD' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Primary
          </button>
          <button
            onClick={() => setFilterType('TEST_METHOD')}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              filterType === 'TEST_METHOD' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Test Methods
          </button>
          <button
            onClick={() => setFilterType('SAFETY_STANDARD')}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              filterType === 'SAFETY_STANDARD' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Safety
          </button>
        </div>
      </div>

      {/* Main Visual Graph Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Graph Grid */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[500px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span> Primary Standard
                </span>
                <span className="flex items-center gap-1.5 text-purple-400 font-bold">
                  <span className="w-3 h-3 rounded-full bg-purple-500"></span> Test Method
                </span>
                <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span> Safety Standard
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Related Product
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">{links.length} Connected Edges</span>
            </div>

            {/* Nodes Layout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[420px] overflow-y-auto pr-2">
              {filteredNodes.map((n) => {
                const isSelected = selectedNode?.id === n.id
                let badgeCol = 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                if (n.rel_type === 'TEST_METHOD') badgeCol = 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                if (n.rel_type === 'SAFETY_STANDARD') badgeCol = 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                if (n.rel_type === 'TERMINOLOGY_INSTALLATION') badgeCol = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                if (n.rel_type === 'RELATED_PRODUCT') badgeCol = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                if (n.node_type === 'REQUIREMENT') badgeCol = 'bg-slate-500/10 text-slate-400 border-slate-500/30'

                return (
                  <div
                    key={n.id}
                    onClick={() => setSelectedNode(n)}
                    className={`p-4 rounded-xl border transition cursor-pointer text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-950 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${badgeCol}`}>
                          {n.rel_type || n.node_type}
                        </span>
                        <span className="font-mono text-xs font-bold text-white">{n.label}</span>
                      </div>
                      <h4 className="text-slate-200 font-semibold line-clamp-2 mt-1">{n.title}</h4>
                    </div>

                    {n.description && (
                      <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                        {n.description}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Deterministic NetworkX Directed Tree • Public BIS Reference Schema</span>
            <span>Click node to reveal cross-references</span>
          </div>
        </div>

        {/* Right 1 Col: Node Connection Details */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sticky top-24 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Info className="w-4 h-4 text-indigo-400" />
              Node Connection Inspector
            </h3>

            {selectedNode ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Selected Graph Entity</span>
                  <h4 className="font-mono text-base font-bold text-indigo-400">{selectedNode.label}</h4>
                  <p className="font-medium text-slate-200 mt-1">{selectedNode.title}</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Entity Type & Purpose</span>
                  <p className="text-slate-300 font-semibold mt-0.5">{selectedNode.rel_type || selectedNode.node_type}</p>
                  {selectedNode.description && (
                    <p className="text-[11px] text-slate-400 mt-1">{selectedNode.description}</p>
                  )}
                </div>

                {/* Connected Relationships */}
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center justify-between">
                    <span>Connected Standard Nodes:</span>
                    <span className="text-indigo-400 font-bold">{connectedLinks.length} Links</span>
                  </span>
                  <div className="space-y-2 mt-2 max-h-56 overflow-y-auto pr-1">
                    {connectedLinks.map((link, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px]">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>{link.source}</span>
                          <span className="text-indigo-400 font-bold">⟶ [{link.edge_type}] ⟶</span>
                          <span>{link.target}</span>
                        </div>
                        {link.description && (
                          <p className="text-[10px] text-slate-400 mt-1">{link.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-8">Select a node from the graph to inspect connections.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
