import React, { useState, useEffect } from 'react'
import { LayoutDashboard, FileText, CheckCircle2, AlertTriangle, AlertOctagon, BookOpen, Clock, ArrowRight, Trash2 } from 'lucide-react'

export default function Dashboard({ onSelectAnalysis }) {
  const [stats, setStats] = useState(null)
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, listRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/dashboard/stats'),
        fetch('http://127.0.0.1:8000/api/analyses')
      ])
      if (statsRes.ok) setStats(await statsRes.json())
      if (listRes.ok) setAnalyses(await listRes.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm(`Delete analysis ${id}?`)) return
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/analyses/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        await fetchData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded border border-blue-500/20 font-bold">
              STANDMAP Overview • Public Procurement Analytics
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Standards Recommendation & Intelligence Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time analytics across public tender specifications, statutory Indian Standards mappings, version alerts, and officer reviews.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-slate-400">Total Analyses</span>
          <div className="text-2xl font-black text-white mt-1">{stats?.total_analyses || 0}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-slate-400">Reqs Extracted</span>
          <div className="text-2xl font-black text-blue-400 mt-1">{stats?.total_requirements || 0}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-slate-400">Standards Indexed</span>
          <div className="text-2xl font-black text-indigo-400 mt-1">{stats?.total_standards_indexed || 0}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-slate-400">Applicable Matches</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{stats?.applicable_matches || 0}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-slate-400">Pending Reviews</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{stats?.pending_reviews || 0}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-slate-400">Version Alerts</span>
          <div className="text-2xl font-black text-rose-400 mt-1">{stats?.outdated_alerts || 0}</div>
        </div>
      </div>

      {/* Domain Breakdown & Top Standards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Mapped Standards */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            Most Frequently Mapped Indian Standards
          </h3>
          <div className="space-y-2.5">
            {stats?.top_standards?.map((s, idx) => (
              <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-blue-400">{s.is_number}</span>
                  <p className="text-slate-300 font-medium truncate max-w-sm mt-0.5">{s.title}</p>
                </div>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
                  {s.count} Matches
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-blue-400" />
            Procurement Category Distribution
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {stats?.category_counts?.map((c, idx) => (
              <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <span className="text-[10px] text-slate-500 font-mono uppercase">{c.category}</span>
                <div className="text-lg font-bold text-white mt-0.5">{c.count} Tenders</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Analyses Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Tender Analyses History
          </h3>
          <span className="text-xs font-mono text-slate-400">{analyses.length} Total Sessions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                <th className="py-3.5 px-4">Analysis ID</th>
                <th className="py-3.5 px-4">Tender Title</th>
                <th className="py-3.5 px-4">Organization</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {analyses.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => onSelectAnalysis(a.id)}
                  className="hover:bg-slate-950/40 transition cursor-pointer"
                >
                  <td className="py-3 px-4 font-mono font-bold text-blue-400">{a.id}</td>
                  <td className="py-3 px-4 text-slate-200 font-medium max-w-xs truncate">{a.title}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono truncate">{a.organization}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-indigo-400">{a.category}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{a.created_at?.slice(0, 10)}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => handleDelete(a.id, e)}
                      className="p-1.5 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
