import React, { useState, useEffect } from 'react'
import { Upload, FileText, Sparkles, CheckCircle2, ArrowRight, BookOpen, Layers, ShieldCheck, FileCheck } from 'lucide-react'

export default function Workspace({ onAnalysisCreated }) {
  const [title, setTitle] = useState('Procurement of 5.0 HP 3-Phase Submersible Water Pump Sets')
  const [organization, setOrganization] = useState('Department of Rural Water Supply & Sanitation')
  const [category, setCategory] = useState('PUMPS_AND_MOTORS')
  const [documentType, setDocumentType] = useState('Tender Technical Specification')
  const [rawText, setRawText] = useState('')
  const [samples, setSamples] = useState([])
  const [selectedSample, setSelectedSample] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [createdId, setCreatedId] = useState(null)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/sample-tenders')
      .then((res) => res.json())
      .then((data) => {
        setSamples(data)
        if (data.length > 0) {
          setSelectedSample(data[0])
          setRawText(data[0].full_text)
        }
      })
      .catch((err) => console.error(err))
  }, [])

  const handleSelectSample = (sample) => {
    setSelectedSample(sample)
    setTitle(sample.title)
    setOrganization(sample.organization)
    setCategory(sample.category)
    setDocumentType(sample.document_type)
    setRawText(sample.full_text)
  }

  const handleCreateAnalysis = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('organization', organization)
      formData.append('category', category)
      formData.append('document_type', documentType)
      formData.append('raw_text', rawText)

      const res = await fetch('http://127.0.0.1:8000/api/analyses', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      setCreatedId(data.analysis_id)
      if (onAnalysisCreated) {
        onAnalysisCreated(data.analysis_id)
      }
    } catch (err) {
      console.error(err)
      alert('Error creating analysis session. Ensure backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      // First create analysis session if not created
      let activeId = createdId
      if (!activeId) {
        const formData = new FormData()
        formData.append('title', file.name.replace(/\.[^/.]+$/, ''))
        formData.append('organization', organization)
        formData.append('category', category)
        formData.append('document_type', 'Uploaded Document')

        const cRes = await fetch('http://127.0.0.1:8000/api/analyses', {
          method: 'POST',
          body: formData
        })
        const cData = await cRes.json()
        activeId = cData.analysis_id
        setCreatedId(activeId)
      }

      const uploadData = new FormData()
      uploadData.append('file', file)

      const res = await fetch(`http://127.0.0.1:8000/api/analyses/${activeId}/document`, {
        method: 'POST',
        body: uploadData
      })
      const data = await res.json()
      if (onAnalysisCreated) {
        onAnalysisCreated(activeId)
      }
    } catch (err) {
      console.error(err)
      alert('File upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                SIH26108 • Standards Recommendation Platform
              </span>
              <span className="text-xs font-mono text-slate-400">Step 1 of 4 • Ingestion & Extraction</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Procurement Specification Workspace
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Upload a tender document (PDF, DOCX, TXT) or paste technical specifications. The engine decomposes clauses into source-grounded requirements and maps applicable Indian Standards (BIS).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateAnalysis}
              disabled={loading || !rawText.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">Processing...</span>
              ) : (
                <>
                  <span>Extract Requirements</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Preset Tender Demos (1-Click Demo Testing) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              1-Click Demo Scenarios (Pre-Loaded Authentic Tenders)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Select to auto-populate test cases</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {samples.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelectSample(s)}
              className={`p-3.5 rounded-xl border text-left transition text-xs flex flex-col justify-between ${
                selectedSample?.id === s.id
                  ? 'bg-blue-950/60 border-blue-500/80 shadow-md shadow-blue-500/10'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                    {s.category}
                  </span>
                  {selectedSample?.id === s.id && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  )}
                </div>
                <h4 className="font-bold text-slate-200 line-clamp-2 mt-1">{s.title}</h4>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-mono truncate">{s.organization}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metadata & Upload Form */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-indigo-400" />
              Tender Metadata
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Specification Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Procuring Authority</label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="PUMPS_AND_MOTORS">Pumps & Motors</option>
                  <option value="ELECTRICAL_CABLES">Electrical Cables</option>
                  <option value="TRANSFORMERS">Transformers</option>
                  <option value="SOLAR_SYSTEMS">Solar PV Systems</option>
                  <option value="CIVIL_CONSTRUCTION">Civil & Cement</option>
                  <option value="FIRE_SAFETY">Fire Safety</option>
                  <option value="PPE_SAFETY">PPE & Protective Wear</option>
                  <option value="PIPES_AND_FITTINGS">Pipes & Plumbing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Document Type</label>
                <input
                  type="text"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* File Upload Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Upload className="w-4 h-4 text-blue-400" />
              Upload Document File
            </h3>
            <label className="border-2 border-dashed border-slate-700 hover:border-blue-500/80 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-slate-950/40 hover:bg-slate-950/80">
              <Upload className="w-8 h-8 text-blue-400 mb-2" />
              <span className="text-xs font-bold text-slate-200">
                {uploading ? 'Parsing Document...' : 'Choose PDF, DOCX or TXT'}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">Preserves page numbers & structural sections</span>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Right Column: Specification Text Editor */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Technical Specification Text (Natural Language & Clauses)
            </h3>
            <span className="text-xs font-mono text-slate-400">{rawText.length} characters</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Paste procurement clauses directly or edit loaded tender specifications. The engine supports natural language, technical tables, and domain parameters.
          </p>

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={16}
            placeholder="Paste tender specifications, equipment parameters, or tender clauses here..."
            className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
          ></textarea>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Deterministic Parsing • Zero Fabricated Requirements</span>
            <button
              onClick={handleCreateAnalysis}
              disabled={loading || !rawText.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/20"
            >
              Analyze & Map Standards <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
