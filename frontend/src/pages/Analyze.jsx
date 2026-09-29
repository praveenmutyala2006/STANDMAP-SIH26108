import React, { useState, useEffect } from 'react'
import { FileText, Upload, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Layers, FileCode } from 'lucide-react'

const DEMO_PRESETS = [
  {
    id: 'DEMO-TENDER-01',
    title: '5.0 HP Agricultural Monoset Pumping Station',
    organization: 'State Water & Sanitation Mission',
    category: 'PUMPS_AND_MOTORS',
    doc_type: 'Technical Specification',
    summary: 'Monoset pump for clear cold water directly coupled to TEFC motor (IS 9079:2018 + IS 12615:2018).'
  },
  {
    id: 'DEMO-TENDER-02',
    title: '1.1 kV Underground Power Distribution Cable (Ambiguous)',
    organization: 'Discom Power Distribution Co.',
    category: 'ELECTRICAL_CABLES',
    doc_type: 'Technical Specification',
    summary: '1.1 kV cable with unspecified insulation (PVC IS 694 vs XLPE IS 7098 Part 1) -> Routes to Human Review.'
  },
  {
    id: 'DEMO-TENDER-03',
    title: '250 kVA Oil Immersed Distribution Transformers (Legacy Reference)',
    organization: 'Urban Infrastructure Authority',
    category: 'TRANSFORMERS',
    doc_type: 'Procurement Specification',
    summary: 'Tender citing legacy IS 1180:1989 -> Version Checker raises superseded edition alert to IS 1180 (Part 1):2014.'
  },
  {
    id: 'DEMO-TENDER-04',
    title: 'Solar PV Water Pumping System + IoT Controller Gap',
    organization: 'Renewable Energy Dev Agency',
    category: 'SOLAR_SYSTEMS',
    doc_type: 'Technical Tender',
    summary: 'Solar PV modules (IS 14286) + Inverter (IS 16221-2) with unstandardized cloud IoT controller gap.'
  }
]

export default function Analyze({ onAnalysisCreated }) {
  const [title, setTitle] = useState('Procurement of 5.0 HP Monoset Agricultural Water Pumps')
  const [organization, setOrganization] = useState('State Water & Sanitation Mission')
  const [category, setCategory] = useState('PUMPS_AND_MOTORS')
  const [documentType, setDocumentType] = useState('Technical Specification')
  const [rawText, setRawText] = useState('')
  const [file, setFile] = useState(null)
  const [createdId, setCreatedId] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [pipelineStep, setPipelineStep] = useState(0)

  // Load first demo by default
  useEffect(() => {
    handleSelectPreset(DEMO_PRESETS[0])
  }, [])

  const handleSelectPreset = async (preset) => {
    setTitle(preset.title)
    setOrganization(preset.organization)
    setCategory(preset.category)
    setDocumentType(preset.doc_type)
    setCreatedId(null)
    setFile(null)

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/sample-tenders`)
      if (res.ok) {
        const list = await res.json()
        const found = list.find((t) => t.id === preset.id)
        if (found) {
          setRawText(found.full_text)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleInitSession = async (e) => {
    if (e) e.preventDefault()
    setIsCreating(true)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('organization', organization)
      formData.append('category', category)
      formData.append('document_type', documentType)
      formData.append('raw_text', rawText)
      if (file) formData.append('file', file)

      const res = await fetch('http://127.0.0.1:8000/api/analyses', {
        method: 'POST',
        body: formData
      })
      if (res.ok) {
        const json = await res.json()
        setCreatedId(json.id)
      }
    } catch (err) {
      console.error(err)
      alert('Failed to initialize analysis session.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleRunPipeline = async () => {
    if (!createdId) return
    setIsProcessing(true)
    setPipelineStep(1)

    try {
      // Step animation sequence
      setTimeout(() => setPipelineStep(2), 500)
      setTimeout(() => setPipelineStep(3), 1000)
      setTimeout(() => setPipelineStep(4), 1500)

      const res = await fetch(`http://127.0.0.1:8000/api/analyses/${createdId}/process`, {
        method: 'POST'
      })
      if (res.ok) {
        setPipelineStep(5)
        setTimeout(() => {
          onAnalysisCreated(createdId)
        }, 600)
      } else {
        alert('Pipeline processing failed.')
      }
    } catch (err) {
      console.error(err)
      alert('Error running processing pipeline.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded border border-blue-500/20 font-bold">
              Step 1 • Ingestion & Session Setup
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            New Procurement Specification Ingestion
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Initialize an analysis session by uploading a tender document (PDF, DOCX, TXT), pasting technical clauses, or selecting a curated demo tender.
          </p>
        </div>
      </div>

      {/* Main 2-Col Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Step 1 Session Setup */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-base font-bold text-white flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-xs font-bold font-mono">1</span>
              Tender Metadata & Session Setup
            </span>
            {createdId && (
              <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready
              </span>
            )}
          </h3>

          {/* Quick Demo Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block flex items-center justify-between">
              <span>Curated Demo Tenders:</span>
              <span className="text-[10px] text-blue-400 font-mono">1-Click Load</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {DEMO_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="text-left p-2.5 bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-blue-500/50 rounded-xl transition group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200 group-hover:text-blue-400">
                    <span className="font-mono text-blue-400 font-bold">{p.id}</span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{p.category}</span>
                  </div>
                  <p className="text-xs font-semibold text-white mt-0.5 line-clamp-1">{p.title}</p>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{p.summary}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleInitSession} className="space-y-3.5 pt-2 border-t border-slate-800/80">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Tender Title / Reference</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={createdId}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-60 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Procuring Organization</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  disabled={createdId}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Category Domain</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={createdId}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-60"
                >
                  <option value="PUMPS_AND_MOTORS">Pumps & Electric Motors</option>
                  <option value="ELECTRICAL_CABLES">Power & Control Cables</option>
                  <option value="TRANSFORMERS">Distribution Transformers</option>
                  <option value="SOLAR_SYSTEMS">Solar PV Systems & Inverters</option>
                  <option value="PIPES_AND_CIVIL">Pipes & Civil Engineering</option>
                  <option value="SAFETY_EQUIPMENT">Industrial Safety Equipment</option>
                </select>
              </div>
            </div>

            {!createdId ? (
              <button
                type="submit"
                disabled={isCreating}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl text-xs transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                {isCreating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Initialize Procurement Session
              </button>
            ) : (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-400 font-semibold">
                <span className="flex items-center gap-2 font-mono">
                  <CheckCircle2 className="w-4 h-4" /> Session ID: {createdId}
                </span>
                <button
                  type="button"
                  onClick={() => setCreatedId(null)}
                  className="text-[10px] text-slate-400 hover:text-white underline font-mono"
                >
                  Edit
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Step 2 Technical Specification Ingestion */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-base font-bold text-white flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-xs font-bold font-mono">2</span>
              Technical Specification Ingestion & Pipeline Runner
            </span>
            <span className="text-xs font-mono text-slate-400">PDF / DOCX / TXT / Raw Text</span>
          </h3>

          <div className="space-y-4">
            {/* File Upload Drop Area */}
            <div className="border border-dashed border-slate-800 hover:border-blue-500/50 rounded-xl p-4 bg-slate-950/40 text-center transition">
              <input
                type="file"
                id="doc-upload"
                accept=".pdf,.docx,.txt"
                onChange={(e) => {
                  if (e.target.files?.[0]) setFile(e.target.files[0])
                }}
                className="hidden"
              />
              <label htmlFor="doc-upload" className="cursor-pointer flex flex-col items-center justify-center gap-1.5">
                <Upload className="w-7 h-7 text-blue-400" />
                <span className="text-xs font-semibold text-slate-200">
                  {file ? file.name : 'Upload Technical Specification Document (PDF, DOCX, TXT)'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Multi-page tender documents will be parsed with source page & section preservation
                </span>
              </label>
            </div>

            {/* Specification Text Area */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center justify-between">
                <span>Technical Specifications & Requirements Text:</span>
                <span className="text-[10px] text-slate-500 font-mono">{rawText.length} characters</span>
              </label>
              <textarea
                rows={11}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste tender specification clauses, BoQ lines, or product parameters here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
              ></textarea>
            </div>

            {/* Pipeline Execution Area */}
            <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                {isProcessing ? (
                  <span className="text-blue-400 animate-pulse font-bold">
                    Running Layer {pipelineStep}/5: {pipelineStep === 1 ? 'Parsing Document' : pipelineStep === 2 ? 'Extracting Requirements' : pipelineStep === 3 ? 'Retrieval & Applicability' : pipelineStep === 4 ? 'Version & QCO Verification' : 'Finalizing Graph'}...
                  </span>
                ) : (
                  <span>Ready for Deterministic Standards Mapping</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!createdId) {
                    handleInitSession().then(() => {
                      // Handled in pipeline
                    })
                  }
                  handleRunPipeline()
                }}
                disabled={isProcessing || !rawText}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Executing STANDMAP Pipeline...
                  </>
                ) : (
                  <>
                    Proceed to Requirements & Standards Engine
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
