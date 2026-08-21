"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { scaleIn } from "@/lib/motion"
import { Loader2, Mic, MicOff, FileAudio, Trash2, Upload, X, CheckCircle, AlertCircle, ChevronRight, Settings, Plus, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { MOCK_PATIENTS, randomMockResult } from "@/mocks/data"
import { NewPatientModal } from "@clinician/components/NewPatientModal"
import { CameraCoughDetection, type CameraCoughSummary } from "@clinician/components/CameraCoughDetection"

export function Screening() {
  const navigate = useNavigate()
  const [step, setStep] = useState<"patient" | "record" | "result">("patient")
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(null)
  const patients = MOCK_PATIENTS.map(p => ({ id: p.id, full_name: p.full_name, date_of_birth: p.date_of_birth, gender: p.gender }))

  // Recording state
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingStartTimeRef = useRef<number>(0)
  const audioDurationRef = useRef<number>(0)
  // Track object URLs for cleanup
  const objectUrlRef = useRef<string | null>(null)

  // Upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // Result state
  const [result, setResult] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  // Camera / facial aura-detection state (Step 2 -> Step 3)
  const [cameraSummary, setCameraSummary] = useState<CameraCoughSummary | null>(null)
  const cameraDataRef = useRef<CameraCoughSummary | null>(null)

  const handleCameraSummaryChange = (summary: CameraCoughSummary | null) => {
    setCameraSummary(summary)
    // Keep the last non-null snapshot so stopping the camera doesn't lose it.
    if (summary) cameraDataRef.current = summary
  }

  // --- Patient Selection ---
  const handlePatientSelect = (patient: { id: string; name: string }) => {
    setSelectedPatient(patient)
    setStep("record")
  }

  const [newPatientModalOpen, setNewPatientModalOpen] = useState(false)
  const [savedFormData, setSavedFormData] = useState<any>(null)

  const handleNewPatientCreated = (patient: { id: string; full_name: string }, formData?: any) => {
    setSelectedPatient({ id: patient.id, name: patient.full_name })
    if (formData) setSavedFormData(formData)
    setStep("record")
    setNewPatientModalOpen(false)
  }

  // --- Audio Recording ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunksRef.current = []
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm"
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType })

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      mediaRecorderRef.current.onstop = async () => {
        const rawBlob = new Blob(audioChunksRef.current, { type: mimeType })
        audioDurationRef.current = (Date.now() - recordingStartTimeRef.current) / 1000
        stream.getTracks().forEach(t => t.stop())

        try {
          if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current)
          }
          const arrayBuffer = await rawBlob.arrayBuffer()
          const audioCtx = new AudioContext()
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
          await audioCtx.close()

          const wavBlob = await encodeWav(audioBuffer)
          const url = URL.createObjectURL(wavBlob)
          objectUrlRef.current = url
          setAudioBlob(wavBlob)
          setAudioUrl(url)
        } catch (convError) {
          console.error("WAV conversion error, falling back to raw blob:", convError)
          const url = URL.createObjectURL(rawBlob)
          objectUrlRef.current = url
          setAudioBlob(rawBlob)
          setAudioUrl(url)
        }
      }

      recordingStartTimeRef.current = Date.now()
      mediaRecorderRef.current.start()
      setRecording(true)
    } catch (error) {
      console.error("Recording error:", error)
      toast.error("Could not access microphone. Please check permissions.")
    }
  }

  async function encodeWav(audioBuffer: AudioBuffer): Promise<Blob> {
    const numChannels = audioBuffer.numberOfChannels
    const sampleRate = audioBuffer.sampleRate
    const bitsPerSample = 16
    const bytesPerSample = bitsPerSample / 8
    const bufferLength = 44 + audioBuffer.length * bytesPerSample * numChannels
    const arrayBuffer = new ArrayBuffer(bufferLength)
    const view = new DataView(arrayBuffer)

    const writeStr = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
    }

    // RIFF header
    writeStr(0, 'RIFF')
    view.setUint32(4, bufferLength - 8, true)
    writeStr(8, 'WAVE')
    // fmt chunk
    writeStr(12, 'fmt ')
    view.setUint32(16, 16, true)  // chunk size
    view.setUint16(20, 1, true)   // audio format (PCM)
    view.setUint16(22, numChannels, true)  // channels
    view.setUint32(24, sampleRate, true)   // sample rate
    view.setUint32(28, sampleRate * numChannels * bytesPerSample, true)  // byte rate
    view.setUint16(32, numChannels * bytesPerSample, true)  // block align
    view.setUint16(34, bitsPerSample, true)  // bits per sample
    // data chunk
    writeStr(36, 'data')
    view.setUint32(40, audioBuffer.length * bytesPerSample * numChannels, true)  // data size

    // Interleave channels if stereo, or just use channel 0 if mono
    const samples = audioBuffer.length
    const dataOffset = 44
    let offset = dataOffset

    if (numChannels === 1) {
      // Mono: just use channel 0 data
      const channel0 = audioBuffer.getChannelData(0)
      for (let i = 0; i < samples; i++) {
        const s = Math.max(-1, Math.min(1, channel0[i]))
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
        offset += 2
      }
    } else {
      // Stereo: interleave L and R
      const channel0 = audioBuffer.getChannelData(0)
      const channel1 = audioBuffer.getChannelData(1)
      for (let i = 0; i < samples; i++) {
        const s0 = Math.max(-1, Math.min(1, channel0[i]))
        const s1 = Math.max(-1, Math.min(1, channel1[i]))
        view.setInt16(offset, s0 < 0 ? s0 * 0x8000 : s0 * 0x7FFF, true)
        offset += 2
        view.setInt16(offset, s1 < 0 ? s1 * 0x8000 : s1 * 0x7FFF, true)
        offset += 2
      }
    }

    return new Blob([arrayBuffer], { type: "audio/wav" })
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    setRecording(false)
  }

  const clearRecording = () => {
    // Clean up object URLs to prevent memory leaks
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setAudioBlob(null)
    setAudioUrl(null)
    setUploadedFile(null)
    audioChunksRef.current = []
  }

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [])

  // --- File Upload ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type and extension
    const validTypes = ["audio/wav", "audio/wave"]
    const validExtensions = [".wav", ".mp3", ".flac", ".ogg", ".m4a"]
    const hasValidType = validTypes.includes(file.type)
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))

    if (!hasValidType && !hasValidExt) {
      toast.error("Unsupported file type. Please upload a WAV, MP3, FLAC, OGG, or M4A file.")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1000) {
      toast.error("File too large. Maximum size is 5MB.")
      return
    }

    // Clean up previous URL
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
    }

    const url = URL.createObjectURL(file)
    objectUrlRef.current = url
    setUploadedFile(file)
    setAudioBlob(file)
    setAudioUrl(url)

    const audio = new Audio()
    audio.src = url
    audio.onloadedmetadata = () => {
      audioDurationRef.current = audio.duration
      // Don't revoke - we're using the URL for playback
    }
  }

  // --- Submit for Analysis ---
  const submitForAnalysis = async () => {
    if (!audioBlob || !selectedPatient) return

    setSubmitting(true)

    try {
      // Simulate analysis latency so the UI flow reads naturally
      await new Promise(resolve => setTimeout(resolve, 1200))

      const mock = randomMockResult()

      setResult({
        tb_result: { label: mock.tb_result, confidence: mock.tb_confidence, probabilities: mock.tb_probabilities },
        respiratory_result: mock.respiratory_result
          ? { label: mock.respiratory_result, confidence: mock.respiratory_confidence, probabilities: mock.respiratory_probabilities }
          : null,
        cascade: mock.cascade_path,
        model_version: mock.model_version,
        screening_id: "scr-demo-" + Math.random().toString(36).slice(2, 8),
        patient_name: selectedPatient.name,
        timestamp: new Date().toISOString(),
        cameraData: cameraDataRef.current,
      })

      setStep("result")
      toast.success("Analysis complete (demo result)")
    } finally {
      setSubmitting(false)
    }
  }

  const getTbBadge = (label: string) => (
    <Badge variant={label === "TB" ? "destructive" : "success"}>
      {label === "TB" && <AlertCircle className="mr-1 h-3 w-3" />}
      {label === "Non-TB" && <CheckCircle className="mr-1 h-3 w-3" />}
      {label}
    </Badge>
  )

  const getRespBadge = (label: string | null) => {
    if (!label) return <Badge variant="secondary">N/A</Badge>
    const variants: Record<string, "default" | "success" | "warning" | "destructive"> = {
      Healthy: "success",
      Pneumonia: "destructive",
      COPD: "warning",
    }
    return <Badge variant={variants[label] || "default"}>{label}</Badge>
  }

  const handleNewScreening = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setSelectedPatient(null)
    setAudioBlob(null)
    setAudioUrl(null)
    setUploadedFile(null)
    setResult(null)
    setCameraSummary(null)
    cameraDataRef.current = null
    setStep("patient")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {["patient", "record", "result"].map((s, i) => {
          const stepIndex = ["patient", "record", "result"].indexOf(step)
          const isComplete = stepIndex > i
          return (
          <div key={s} className="flex flex-col items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                step === s ? "bg-aura-accent text-white" :
                isComplete ? "bg-aura-accent-dark text-white" :
                "bg-aura-surface-alt text-aura-muted"
              )}
            >
              {step === s ? (
                <span
                  className="flex h-5 w-5 items-center justify-center"
                  role="status"
                  aria-live="polite"
                  aria-label={`Step ${i + 1}: ${s} in progress`}
                >
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
                </span>
              ) : isComplete ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                i + 1
              )}
            </div>
            <span className={cn("mt-1 text-sm font-medium", step === s ? "text-aura-accent" : "text-aura-muted")}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
          </div>
          )
        })}
      </div>

      {/* Step 1: Patient Selection */}
      <AnimatePresence mode="wait">
        {step === "patient" && (
          <motion.div key="patient" variants={scaleIn} initial="hidden" animate="visible" exit="exit">
            <Card>
              <CardHeader>
                <CardTitle>Select Patient</CardTitle>
            <CardDescription>Choose an existing patient or create a new screening</CardDescription>
          </CardHeader>
          <CardContent>
            {patients.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-aura-muted mb-4">No patients found. Create a screening for a new patient.</p>
                <Button onClick={() => setNewPatientModalOpen(true)} size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  New Patient Screening
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {patients.map(patient => (
                  <Button
                    key={patient.id}
                    variant="outline"
                    className="w-full justify-start gap-4"
                    onClick={() => handlePatientSelect({ id: patient.id, name: patient.full_name })}
                  >
                    <div className="flex-1 text-left">
                      <div className="font-medium">{patient.full_name}</div>
                      <div className="text-sm text-aura-muted">
                        DOB: {new Date(patient.date_of_birth).toLocaleDateString()} - {patient.gender}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ))}
                <Button variant="outline" onClick={() => setNewPatientModalOpen(true)} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  New Patient
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )}
  </AnimatePresence>

      <NewPatientModal
        open={newPatientModalOpen}
        onOpenChange={(open) => {
          setNewPatientModalOpen(open)
          if (!open && savedFormData) setSavedFormData(null)
        }}
        onPatientCreated={handleNewPatientCreated}
        initialData={savedFormData}
      />

      {/* Step 2: Audio Recording */}
      <AnimatePresence mode="wait">
        {step === "record" && (
          <motion.div key="record" variants={scaleIn} initial="hidden" animate="visible" exit="exit">
            <Card>
              <CardHeader>
                <CardTitle>Record or Upload Cough Audio</CardTitle>
            <CardDescription>Patient: {selectedPatient?.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recording Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Microphone Recording</h3>
              {!audioBlob && !recording && (
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="w-full gap-3"
                >
                  <Mic className="h-5 w-5" />
                  Start Recording
                </Button>
              )}
              {recording && (
                <Button
                  onClick={stopRecording}
                  size="lg"
                  variant="destructive"
                  className="w-full gap-3"
                >
                  <MicOff className="h-5 w-5" />
                  Stop Recording
                </Button>
              )}
              {audioBlob && (
                <div className="flex flex-col items-center gap-4 p-4 bg-aura-surface-alt rounded-lg sm:flex-row">
                  <div className="flex-1">
                    <audio controls src={audioUrl!} className="w-full" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={clearRecording} size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Retry
                    </Button>
                  </div>
                </div>
              )}

              <div className="h-px bg-border" />

              {/* Facial Cough Detection (Camera) */}
              <CameraCoughDetection onSummaryChange={handleCameraSummaryChange} />
              {cameraSummary && (
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={cn(
                    "rounded-full px-2.5 py-1 font-medium",
                    cameraSummary.faceTracked
                      ? "bg-aura-accent-soft text-aura-accent-dark"
                      : "bg-aura-surface-alt text-aura-muted"
                  )}>
                    Face: {cameraSummary.faceTracked ? "tracked" : "not found"}
                  </span>
                  <span className="rounded-full bg-aura-surface-alt px-2.5 py-1 font-medium text-aura-muted">
                    Mouth distance:{" "}
                    {cameraSummary.mouthDistance != null
                      ? cameraSummary.mouthDistance.toFixed(3)
                      : "—"}
                  </span>
                  <span className={cn(
                    "rounded-full px-2.5 py-1 font-medium",
                    cameraSummary.coughDetected
                      ? "bg-aura-warning-soft text-aura-warning-strong"
                      : "bg-aura-surface-alt text-aura-muted"
                  )}>
                    Fused coughs: {cameraSummary.coughCount}
                  </span>
                </div>
              )}

              <div className="h-px bg-border" />

              {/* Upload Section */}
              <h3 className="text-lg font-medium">Upload Audio File</h3>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  dragActive ? "border-aura-accent bg-aura-accent/5" : uploadedFile ? "border-aura-accent bg-aura-accent/5" : "border-aura-border-soft"
                )}
                onDragOver={e => { e.preventDefault(); setDragActive(true) }}
                onDragLeave={e => { e.preventDefault(); setDragActive(false) }}
                onDrop={e => {
                  e.preventDefault()
                  setDragActive(false)
                  const file = e.dataTransfer.files[0]
                  const validExt = [".wav", ".mp3", ".flac", ".ogg", ".m4a"]
                  const isAudio = file && (file.type.startsWith("audio/") || validExt.some(ext => file.name.toLowerCase().endsWith(ext)))
                  if (isAudio) {
                    const event = { target: { files: e.dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>
                    handleFileUpload(event)
                  } else {
                    toast.error("Unsupported file type. Please upload a WAV, MP3, FLAC, OGG, or M4A file.")
                  }
                }}
              >
                <input
                  type="file"
                  accept=".wav,.mp3,.flac,.ogg,.m4a,audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="audio-upload"
                />
                {uploadedFile ? (
                  <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <FileAudio className="h-10 w-10 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-aura-muted">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearRecording}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="h-10 w-10 text-aura-muted" />
                    <p>Drag & drop a .wav file here, or click to browse</p>
                    <Button variant="outline" onClick={() => document.getElementById("audio-upload")?.click()}>
                      Browse Files
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            {audioBlob && (
              <Button
                onClick={submitForAnalysis}
                disabled={submitting}
                size="lg"
                className="w-full gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" role="status" aria-live="polite" />
                    Analyzing cough audio…
                  </>
                ) : (
                  <>
                    <Settings className="h-5 w-5" />
                    Run Analysis
                  </>
                )}
              </Button>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" onClick={() => {
              if (savedFormData) {
                setNewPatientModalOpen(true)
              }
              setStep("patient")
            }}>
              Back to patient selection
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    )}
  </AnimatePresence>

      {/* Step 3: Results */}
      <AnimatePresence mode="wait">
        {step === "result" && result && (
          <motion.div key="result" variants={scaleIn} initial="hidden" animate="visible" exit="exit">
            <Card>
              <CardHeader>
                <CardTitle>Screening Result</CardTitle>
            <CardDescription>
              Patient: {result.patient_name} - {new Date(result.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* TB Gatekeeper Result */}
            <div className="p-4 bg-aura-surface-alt rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Tier 1: TB Gatekeeper</h3>
                {getTbBadge(result.tb_result.label)}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-aura-muted">Confidence</p>
                  <p className="font-mono text-lg">{(result.tb_result.confidence * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-aura-muted">Cascade</p>
                  <p className="font-mono text-lg">{result.cascade}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-aura-muted mb-2">Probability Distribution</p>
                <div className="space-y-2">
                  {Object.entries(result.tb_result.probabilities || {}).map(([cls, prob]: [string, unknown]) => {
                    const p = prob as number
                    return (
                      <div key={cls} className="flex items-center justify-between text-sm">
                        <span className={cn("font-medium", cls === "TB" ? "text-destructive" : "text-aura-accent-dark")}>{cls}</span>
                        <div className="flex items-center gap-2 w-full max-w-xs">
                          <Progress value={(p * 100)} className="h-2 flex-1" />
                          <span className="font-mono w-16 text-right">{(p * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    )
                  })
                }
                </div>
              </div>
            </div>

            {/* Respiratory Result */}
            {result.respiratory_result && (
              <div className="p-4 bg-aura-surface-alt rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Tier 2: Respiratory Classifier</h3>
                  {getRespBadge(result.respiratory_result.label)}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-aura-muted">Confidence</p>
                    <p className="font-mono text-lg">{(result.respiratory_result.confidence * 100).toFixed(1)}%</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-aura-muted mb-2">Probability Distribution</p>
                  <div className="space-y-2">
                    {Object.entries((result.respiratory_result.probabilities as Record<string, number>) || {}).map(([cls, prob]) => (
                      <div key={cls} className="flex items-center justify-between text-sm">
                        <span className={cn("font-medium", cls === "Pneumonia" ? "text-destructive" : cls === "COPD" ? "text-aura-warning" : "text-aura-accent-dark")}>{cls}</span>
                        <div className="flex items-center gap-2 w-full max-w-xs">
                          <Progress value={(prob * 100)} className="h-2 flex-1" />
                          <span className="font-mono w-16 text-right">{(prob * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

{/* Facial Cough Detection */}
            {result.cameraData && (
              <div className="p-4 bg-aura-surface-alt rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Facial Cough Detection</h3>
                  {result.cameraData.coughDetected ? (
                    <Badge variant="warning">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Cough Detected
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      No Cough Detected
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                  <div>
                    <p className="text-aura-muted">Fused Coughs</p>
                    <p className="font-mono text-lg">{result.cameraData.coughCount}</p>
                  </div>
                  <div>
                    <p className="text-aura-muted">Mouth Openings</p>
                    <p className="font-mono text-lg">{result.cameraData.mouthOpenings}</p>
                  </div>
                  <div>
                    <p className="text-aura-muted">Max Mouth Distance</p>
                    <p className="font-mono text-lg">
                      {result.cameraData.maxMouthDistance != null
                        ? result.cameraData.maxMouthDistance.toFixed(3)
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-aura-muted">Audio Confidence</p>
                    <p className="font-mono text-lg">
                      {result.cameraData.audioConfidence != null
                        ? `${(result.cameraData.audioConfidence * 100).toFixed(0)}%`
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-aura-muted">Face Tracked</p>
                    <p className="font-mono text-lg">{result.cameraData.faceTracked ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-aura-muted">Temporal Sync</p>
                    <p className="font-mono text-lg">
                      {result.cameraData.temporalSyncMs != null
                        ? `${result.cameraData.temporalSyncMs}ms`
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}

{/* Clinical Recommendation */}
            {result.tb_result.label === "TB" ? (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <h4 className="font-semibold text-destructive flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  High Priority: TB Detected
                </h4>
                <p className="mt-2 text-sm">Immediate referral for confirmatory TB testing recommended. Follow local TB protocols.</p>
              </div>
            ) : result.respiratory_result?.label === "Pneumonia" ? (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <h4 className="font-semibold text-destructive flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  High Priority: Pneumonia Suspected
                </h4>
                <p className="mt-2 text-sm">Urgent clinical evaluation recommended. Consider chest imaging and antibiotics per guidelines.</p>
              </div>
            ) : result.respiratory_result?.label === "COPD" ? (
              <div className="p-4 bg-aura-warning-soft/60 border border-aura-warning-border rounded-lg">
                <h4 className="font-semibold text-aura-warning-strong flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Moderate Priority: COPD Suspected
                </h4>
                <p className="mt-2 text-sm">Clinical evaluation recommended. Consider spirometry and pulmonology referral.</p>
              </div>
            ) : (
              <div className="p-4 bg-aura-accent-soft border border-aura-border-soft rounded-lg">
                <h4 className="font-semibold text-aura-accent-dark flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Low Priority: Healthy / No Acute Findings
                </h4>
                <p className="mt-2 text-sm">No urgent action required. Routine follow-up as clinically indicated.</p>
              </div>
            )}

            <div className="text-xs text-aura-muted">
              Model version: {result.model_version} &bull; Screening ID: {result.screening_id}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleNewScreening}>
              New Screening
            </Button>
            <Button onClick={() => navigate("/dashboard")}>
              View Dashboard
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    )}
  </AnimatePresence>
    </div>
  )
}
