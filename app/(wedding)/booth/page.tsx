"use client"
import { useState, useRef, useEffect } from "react"
import { Camera, Download, X, Image as ImageIcon } from "lucide-react"

interface Photo {
  id: string
  imageData: string
  frame: string
  timestamp: number
}

export default function PhotoBoothPage() {
  const [selectedFrame, setSelectedFrame] = useState("classic")
  const [showCamera, setShowCamera] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const frames = [
    { id: "classic", name: "Classic", emoji: "🌿" },
    { id: "romantic", name: "Romantic", emoji: "💕" },
    { id: "elegant", name: "Elegant", emoji: "✨" },
    { id: "fun", name: "Fun", emoji: "🎉" },
  ]

  useEffect(() => {
    loadPhotos()
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
        video: { facingMode: "user", width: 1280, height: 720 } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
      setShowCamera(true)
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
    setShowCamera(false)
    setCapturedPhoto(null)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL("image/jpeg", 0.8)
        setCapturedPhoto(imageData)
      }
    }
  }

  const savePhoto = async () => {
    if (!capturedPhoto) return
    
    setLoading(true)
    try {
      const photo: Photo = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        imageData: capturedPhoto,
        frame: selectedFrame,
        timestamp: Date.now()
      }
      
      await window.storage.set(`photo:${photo.id}`, JSON.stringify(photo), true)
      await loadPhotos()
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

  return (
    <div className="main">
    <div className="page-header">
        <h1>Photo Booth</h1>
        <p>Capture and share your favorite moments</p>
    </div>

    <div className="content-container">
        <div className="camera-section">
        <div className="frame-selector">
            {frames.map(frame => (
            <button
                key={frame.id}
                className={`frame-option ${selectedFrame === frame.id ? 'active' : ''}`}
                onClick={() => setSelectedFrame(frame.id)}
            >
                <span>{frame.emoji}</span>
                <span>{frame.name}</span>
            </button>
            ))}
        </div>

        <div className="camera-container">
            {!showCamera && !capturedPhoto && (
            <button className="btn btn-primary" onClick={startCamera}>
                <Camera size={20} />
                Open Camera
            </button>
            )}

            {showCamera && !capturedPhoto && (
            <>
                <div className="video-container">
                <video ref={videoRef} autoPlay playsInline />
                <div className={`frame-overlay ${selectedFrame}`}>
                    <div className="frame-text">Merit & Favour</div>
                    <div className="frame-text">Feb 14, 2026</div>
                </div>
                </div>
                <div className="button-group">
                <button className="btn btn-primary" onClick={capturePhoto}>
                    <Camera size={20} />
                    Capture Photo
                </button>
                <button className="btn btn-danger" onClick={stopCamera}>
                    <X size={20} />
                    Cancel
                </button>
                </div>
            </>
            )}

            {capturedPhoto && (
            <>
                <div className="video-container">
                <img src={capturedPhoto} alt="Captured" className="photo-preview" />
                <div className={`frame-overlay ${selectedFrame}`}>
                    <div className="frame-text">Merit & Favour</div>
                    <div className="frame-text">Feb 14, 2026</div>
                </div>
                </div>
                <div className="button-group">
                <button 
                    className="btn btn-primary" 
                    onClick={savePhoto}
                    disabled={loading}
                >
                    {loading ? "Saving..." : "Save Photo"}
                </button>
                <button className="btn btn-secondary" onClick={() => setCapturedPhoto(null)}>
                    Retake
                </button>
                <button className="btn btn-danger" onClick={stopCamera}>
                    <X size={20} />
                    Cancel
                </button>
                </div>
            </>
            )}

            <canvas ref={canvasRef} />
        </div>
        </div>

        <div className="gallery-section">
        <div className="gallery-header">
            <h2>Wedding Gallery</h2>
            <p style={{ color: '#8b957b', fontSize: '14px' }}>
            {photos.length} {photos.length === 1 ? 'photo' : 'photos'} shared
            </p>
        </div>

        {photos.length === 0 ? (
            <div className="empty-state">
            <ImageIcon size={64} color="#ccc" />
            <p>No photos yet. Be the first to capture a moment!</p>
            </div>
        ) : (
            <div className="photo-grid">
            {photos.map(photo => (
                <div key={photo.id} className="photo-card">
                <div style={{ position: 'relative' }}>
                    <img src={photo.imageData} alt="Wedding moment" />
                    <div className={`frame-overlay ${photo.frame}`}>
                    <div className="frame-text" style={{ fontSize: '14px' }}>Merit & Favour</div>
                    <div className="frame-text" style={{ fontSize: '14px' }}>Feb 14, 2026</div>
                    </div>
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