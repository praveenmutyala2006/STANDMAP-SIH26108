import React, { useState, useEffect } from 'react'
import { ClipboardCheck, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, UserCheck, Check, X, RefreshCw, ArrowRight } from 'lucide-react'

export default function Review({ analysisId, onNavigateReport }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [officerId, setOfficerId] = useState('PROCUREMENT-OFFICER-01')
  const [selectedRec, setSelectedRec] = useState(null)
  const [decision, setDecision] = useState('ACCEPT')
  const [overrideIs, setOverrideIs] = useState('')
  const [notes, setNotes] = useState('Selected by reviewing officer after technical review.')
  const [submitting, setSubmitting] = useState(false)

  const fetchAnalysis = async () => {
    if (!analysisId) return
    setLoading(true)
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/analyses/${analysisId}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
        const pending = (json.recommendations || []).filter(
          (r) => r.applicability_status === 'REVIEW_REQUIRED' || r.applicability_status === 'POSSIBLY_APPLICABLE' || r.review_status === 'FLAG_FOR_REVIEW'
        )
        if (pending.length > 0) {
          setSelectedRec(pending[0])
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

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!selectedRec) return
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('requirement_id', selectedRec.requirement_id)
      formData.append('standard_id', selectedRec.standard_id)
      formData.append('officer_id', officerId)
      formData.append('decision', decision)
      if (overrideIs) formData.append('override_is', overrideIs)
      formData.append('notes', notes)

      const res = await fetch(`http://127.0.0.1:8000/api/analyses/${analysisId}/review`, {
        method: 'POST',
        body: formData
      })
      if (res.ok) {
        setNotes('Selected by reviewing officer after technical review.')
        setOverrideIs('')
        await fetchAnalysis()
      }
    } catch (err) {
      console.error(err)
      alert('Review submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!analysisId) {
    return (
      <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
        <ClipboardCheck className="w-12 h-12 text-amber-500/40 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">No Active Analysis Selected</h3>
        <p className="text-sm text-slate-400 mt-1">Please select an analysis session from the Analyze tab to inspect the officer review queue.</p>
      </div>
    )
  }

  const recommendations = data?.recommendations || []
  const reviews = data?.review_decisions || []
  const pendingReviews = recommendations.filter(
    (r) => r.applicability_status === 'REVIEW_REQUIRED' || r.applicability_status === 'POSSIBLY_APPLICABLE' || r.review_status === 'FLAG_FOR_REVIEW'
  )

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded border border-amber-500/20 font-bold">
              Step 3 • Officer Review & Decision Audit
            </span>
            <span className="text-xs font-mono text-slate-400">ID: {analysisId}</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Procurement Officer Review & Override Queue
            <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-mono">
              {pendingReviews.length} Cases Requiring Human Evaluation
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Resolve ambiguous candidate standards, evaluate specification gaps, and confirm technical tender requirements.
          </p>
        </div>

        <button
          onClick={onNavigateReport}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/20"
        >
          View Standards Report <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main 2-Pane Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (col-span-7): Pending Review Items & Decision Log */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-mono uppercase text-slate-400 font-bold pb-2 border-b border-slate-800 flex items-center justify-between">
            <span>Ambiguous Matches & Gaps Requiring Review</span>
            <span>{pendingReviews.length} Pending</span>
          </h3>

          {pendingReviews.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
              <h4 className="text-sm font-bold text-white">All Review Cases Resolved</h4>
              <p className="text-xs text-slate-400">No ambiguous standards or unconfirmed matches remaining in this tender session.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {pendingReviews.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRec(rec)}
                  className={`p-4 rounded-xl border transition cursor-pointer text-xs flex flex-col justify-between ${
                    selectedRec?.id === rec.id
                      ? 'bg-slate-950 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        {rec.is_number}
                      </span>
                      <h4 className="font-bold text-white mt-1.5">{rec.standard_title}</h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                      {rec.applicability_status}
                    </span>
                  </div>

                  <div className="mt-2.5 p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px]">
                    <span className="text-[10px] text-slate-500 uppercase font-mono">Tender Requirement:</span>
                    <p className="text-slate-200 mt-0.5 font-medium">"{rec.requirement_text}"</p>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2">
                    <strong className="text-amber-300">Reason Flagged:</strong> {rec.applicability_reason}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Past Review Log */}
          {reviews.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
              <h3 className="text-xs font-mono uppercase text-slate-400 font-bold">Audited Review Decisions Log</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {reviews.map((rev, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-emerald-400 font-mono">[{rev.decision}]</span>
                      <span className="text-slate-300 font-semibold ml-2">{rev.standard_id}</span>
                      <span className="text-slate-400 ml-2 font-mono text-[11px]">by {rev.officer_id}</span>
                      {rev.notes && <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{rev.notes}</p>}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{rev.timestamp?.slice(0, 16)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (col-span-5): Officer Sign-Off Panel */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <UserCheck className="w-4 h-4 text-amber-400" />
            Officer Sign-Off Panel
          </h3>

          {selectedRec ? (
            <form onSubmit={handleSubmitReview} className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Evaluating Standard</span>
                <p className="font-mono font-bold text-amber-400 mt-0.5">{selectedRec.is_number}</p>
                <p className="text-[11px] text-slate-300 mt-0.5">{selectedRec.standard_title}</p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Officer Decision</label>
                <select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="ACCEPT">ACCEPT (Confirm Standard Applicability)</option>
                  <option value="OVERRIDE">OVERRIDE (Specify Custom Standard)</option>
                  <option value="REJECT">REJECT (Exclude Standard from Tender)</option>
                  <option value="FLAG_FOR_TECHNICAL_COMMITTEE">FLAG FOR TECHNICAL COMMITTEE</option>
                </select>
              </div>

              {decision === 'OVERRIDE' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Override IS Number</label>
                  <input
                    type="text"
                    placeholder="e.g. IS 9079:2018"
                    value={overrideIs}
                    onChange={(e) => setOverrideIs(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Technical Audit Notes</label>
                <textarea
                  rows={3}
                  placeholder="Enter justification for tender audit log..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 resize-none font-mono"
                ></textarea>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Officer Identifier</label>
                <input
                  type="text"
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-amber-500/20 mt-2 flex items-center justify-center gap-2"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Confirm Audit Decision
              </button>
            </form>
          ) : (
            <p className="text-xs text-slate-500 text-center py-8">Select an item from the queue to review.</p>
          )}
        </div>
      </div>
    </div>
  )
}
