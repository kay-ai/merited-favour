"use client"
import { useState, useRef, useEffect } from "react"
import { Camera, Download, X, Upload, RotateCcw, Timer, Zap } from "lucide-react"

interface Photo {
  id: string
  imageData: string
  filter: string
  timestamp: number
}

const filters = [
  { id: "none", label: "Normal", css: "none" },
  { id: "bw", label: "B&W", css: "grayscale(1)" },
  { id: "vintage", label: "Vintage", css: "sepia(0.6) contrast(1.1)" },
  { id: "warm", label: "Warm", css: "brightness(1.1) saturate(1.3)" },
  { id: "cool", label: "Cool", css: "brightness(1.05) hue-rotate(180deg)" }
]

export default function PhotoBoothPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [photos, setPhotos] = useState<Photo[]>([])
  const [preview, setPreview] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [filter, setFilter] = useState(filters[0])
  const [facing, setFacing] = useState<"user" | "environment">("user")
  const [showCamera, setShowCamera] = useState(false)
  const [loading, setLoading] = useState(false)

  const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

  useEffect(() => {
    loadPhotos()
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const loadPhotos = async () => {
    try {
      const result = await window.storage.list("photo:", true)
      if (result && result.keys) {
        const photoPromises = result.keys.map(async (key) => {
          const data = await window.storage.get(key, true)
          if (data) {
            return JSON.parse(data.value)
          }
          return null
        })
        const loadedPhotos = (await Promise.all(photoPromises)).filter(Boolean)
        setPhotos(loadedPhotos.sort((a, b) => b.timestamp - a.timestamp))
      }
    } catch (error) {
      console.error("Error loading photos:", error)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        streamRef.current = stream
        setShowCamera(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Unable to access camera. Please check permissions.")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setShowCamera(false)
  }

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.filter = filter.css
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = canvas.toDataURL("image/jpeg", 0.9)
        setPreview(imageData)
        ctx.filter = "none"
      }
    }
  }

  const startCountdown = async () => {
    for (let i = 3; i > 0; i--) {
      setCountdown(i)
      await new Promise(r => setTimeout(r, 1000))
    }
    setCountdown(null)
    capture()
  }

  const burstCapture = async () => {
    const shots: string[] = []

    for (let i = 0; i < 3; i++) {
      capture()
      if (canvasRef.current) {
        shots.push(canvasRef.current.toDataURL("image/jpeg", 0.9))
      }
      await new Promise(r => setTimeout(r, 600))
    }

    buildCollage(shots)
  }

  const buildCollage = (shots: string[]) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const grid = Math.ceil(Math.sqrt(shots.length))
    const size = 600
    const cell = size / grid

    canvas.width = size
    canvas.height = size

    let loaded = 0
    shots.forEach((src, idx) => {
      const img = new Image()
      img.onload = () => {
        const x = (idx % grid) * cell
        const y = Math.floor(idx / grid) * cell
        ctx.drawImage(img, x, y, cell, cell)
        loaded++
        if (loaded === shots.length) {
          setPreview(canvas.toDataURL("image/jpeg", 0.95))
        }
      }
      img.src = src
    })
  }

  const uploadFromGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const imageData = reader.result as string
      setPreview(imageData)
    }
    reader.readAsDataURL(file)
  }

  const savePhoto = async () => {
    if (!preview) return
    
    setLoading(true)
    try {
      const photo: Photo = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        imageData: preview,
        filter: filter.id,
        timestamp: Date.now()
      }
      
      await window.storage.set(`photo:${photo.id}`, JSON.stringify(photo), true)
      await loadPhotos()
      setPreview(null)
      stopCamera()
      alert("Photo saved successfully! 📸")
    } catch (error) {
      console.error("Error saving photo:", error)
      alert("Failed to save photo. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const downloadPhoto = (imageData: string) => {
    const link = document.createElement("a")
    link.href = imageData
    link.download = `wedding-photo-${Date.now()}.jpg`
    link.click()
  }

  const toggleCamera = () => {
    setFacing(f => f === "user" ? "environment" : "user")
    if (showCamera) {
      stopCamera()
      setTimeout(() => startCamera(), 100)
    }
  }

  return (
    <div className="main booth-page">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={uploadFromGallery}
      />

      <div className="page-header">
        <h1>Photo Booth</h1>
        <p>Capture and share your favorite moments</p>
      </div>

      <div className="booth-container">
        {/* Camera Section */}
        <div className="camera-section">
          {countdown !== null && (
            <div className="countdown-overlay">
              <div className="countdown-number">{countdown}</div>
            </div>
          )}

          {!showCamera && !preview && (
            <div className="camera-placeholder">
              <Camera size={64} color="#8b957b" />
              <p>Ready to capture a moment?</p>
              <button className="btn btn-primary" onClick={startCamera}>
                <Camera size={20} />
                Open Camera
              </button>
            </div>
          )}

          {showCamera && !preview && (
            <div className="camera-view">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                style={{ filter: filter.css }}
              />
              
              <div className="camera-overlay">
                <div className="filter-selector">
                  {filters.map(f => (
                    <button
                      key={f.id}
                      className={`filter-btn ${filter.id === f.id ? 'active' : ''}`}
                      onClick={() => setFilter(f)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="camera-controls">
                  <button className="control-btn" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={24} />
                  </button>

                  <button className="control-btn" onClick={startCountdown}>
                    <Timer size={24} />
                  </button>

                  <button className="capture-btn" onClick={capture}>
                    <Camera size={32} />
                  </button>

                  <button className="control-btn" onClick={burstCapture}>
                    <Zap size={24} />
                  </button>

                  {isMobile() && (
                    <button className="control-btn" onClick={toggleCamera}>
                      <RotateCcw size={24} />
                    </button>
                  )}

                  <button className="control-btn close-btn" onClick={stopCamera}>
                    <X size={24} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {preview && (
            <div className="preview-view">
              <img src={preview} alt="Preview" className="preview-image" />
              
              <div className="preview-controls">
                <button 
                  className="btn btn-primary" 
                  onClick={savePhoto}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Photo"}
                </button>
                <button className="btn btn-secondary" onClick={() => setPreview(null)}>
                  Retake
                </button>
                {!showCamera && (
                  <button className="btn btn-secondary" onClick={startCamera}>
                    Take Another
                  </button>
                )}
              </div>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {/* Gallery Section */}
        <div className="gallery-section">
          <div className="gallery-header">
            <h2>Wedding Gallery</h2>
            <p className="photo-count">
              {photos.length} {photos.length === 1 ? 'photo' : 'photos'} shared
            </p>
          </div>

          {photos.length === 0 ? (
            <div className="empty-state">
              <Camera size={64} color="#ccc" />
              <p>No photos yet. Be the first to capture a moment!</p>
            </div>
          ) : (
            <div className="photo-grid">
              {photos.map(photo => (
                <div key={photo.id} className="photo-card">
                  <div className="photo-wrapper">
                    <img 
                      src={photo.imageData} 
                      alt="Wedding moment"
                      style={{ filter: filters.find(f => f.id === photo.filter)?.css || 'none' }}
                    />
                  </div>
                  <div className="photo-actions">
                    <span className="photo-time">
                      {new Date(photo.timestamp).toLocaleString()}
                    </span>
                    <button 
                      className="download-btn"
                      onClick={() => downloadPhoto(photo.imageData)}
                      title="Download photo"
                    >
                      <Download size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}