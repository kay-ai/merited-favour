"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, Download, X, Image as ImageIcon, RotateCcw } from "lucide-react"
import { ref, uploadString, getDownloadURL } from "firebase/storage"
import { addDoc, collection, serverTimestamp, getDocs, query, orderBy } from "firebase/firestore"
import { storage, db } from "@/firebase/firebase"
import { Timestamp } from "firebase/firestore"

interface Photo {
  id: string
  url: string
  frame: string
  createdAt: Timestamp
  createdAtClient: number
}

export default function PhotoBoothPage() {
  const [selectedFrame, setSelectedFrame] = useState("classic")
  const [showCamera, setShowCamera] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isMobile = () =>
    typeof window !== "undefined" &&
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

  useEffect(() => {
    loadPhotosFromFirebase()
    return stopCamera
  }, [])

  /* -------------------- FIREBASE LOAD -------------------- */

  const loadPhotosFromFirebase = async () => {
    try {
      const q = query(collection(db, "wedding"), orderBy("createdAtClient", "desc"))
      const snap = await getDocs(q)

      const items: Photo[] = snap.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
      }))

      setPhotos(items)
    } catch (err) {
      console.error("Gallery load error:", err)
    }
  }

  /* -------------------- CAMERA HANDLING -------------------- */

  const startCamera = async () => {
    try {
      stopCamera()

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        streamRef.current = stream
        setShowCamera(true)
      }
    } catch (err) {
      console.error("Camera error:", err)
      alert("Camera access failed. Please allow permissions and use HTTPS.")
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
    setShowCamera(false)
  }

  const switchCamera = async () => {
    setFacingMode(prev => (prev === "user" ? "environment" : "user"))
    if (!isMobile()) await startCamera()
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)

    setCapturedPhoto(canvas.toDataURL("image/jpeg", 0.9))
  }

  /* -------------------- MOBILE CAMERA -------------------- */

  const handleNativeCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => setCapturedPhoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  const openCamera = () => {
    if (isMobile()) {
      fileInputRef.current?.click()
    } else {
      startCamera()
    }
  }

  /* -------------------- FIREBASE SAVE -------------------- */

  const savePhoto = async () => {
    if (!capturedPhoto || loading) return
    setLoading(true)

    try {
      const filename = `wedding/${Date.now()}.jpg`
      const storageRef = ref(storage, filename)

      await uploadString(storageRef, capturedPhoto, "data_url")

      const url = await getDownloadURL(storageRef)

      await addDoc(collection(db, "wedding"), {
        url,
        frame: selectedFrame,
        createdAt: serverTimestamp(),
        createdAtClient: Date.now(),
      })

      setCapturedPhoto(null)
      stopCamera()
      await loadPhotosFromFirebase()

    } catch (err) {
      console.error("Firebase save error:", err)
      alert("Upload failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const openImage = (src: string) => {
    setSelectedImage(src)
    console.log("src: ", src)
  }

  const closeModal = () => {
    setSelectedImage(null)
  }

  const downloadImage = (src: string) => {
    // Add download disposition to Firebase URL to force download
    const downloadUrl = src.includes('?') 
      ? `${src}&response-content-disposition=attachment`
      : `${src}?response-content-disposition=attachment`
    
    const link = document.createElement("a")
    link.href = downloadUrl
    link.download = `wedding-photo-${Date.now()}.jpg`
    link.click()
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="main">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleNativeCapture}
      />

      <div className="page-header">
        <h1>Photo Booth</h1>
        <p>Capture beautiful moments — live wedding gallery</p>
      </div>

      <div className="booth-container">
        {!showCamera && !capturedPhoto && (
          <div className="camera-btn-row">
            <button className="btn btn-primary" onClick={openCamera}>
              <Camera size={20} /> Open Camera
            </button>
          </div>
        )}
        {capturedPhoto && (
          <div className="camera-section">
            <div className="camera-container">
              <div className="video-container">
                <img src={capturedPhoto} className="photo-preview" alt="preview" />
              </div>

              <div className="button-group">
                <button className="btn btn-primary" disabled={loading} onClick={savePhoto}>
                  {loading ? "Saving..." : "Save Photo"}
                </button>
                <button className="btn btn-secondary" onClick={() => setCapturedPhoto(null)}>
                  Retake
                </button>
                <button className="btn btn-danger" onClick={stopCamera}>
                  <X size={20} /> Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="gallery-section">
          <div className="gallery-header">
            {/* <h2>Wedding Gallery</h2> */}
            <p>{photos.length} photos</p>
          </div>

          {photos.length === 0 ? (
            <div className="empty-state">
              <ImageIcon size={64} />
              <p>No photos yet.</p>
            </div>
          ) : (
            <div className="photo-grid">
              {photos.map((photo, i) => (
                  <div
                    key={i}
                    className="gallery-item bounce-animation"
                    style={{ animationDelay: `${i * 0.1}s` }}
                    onClick={() => openImage(photo.url)}
                  >
                    <img src={photo.url} alt="Wedding memory" />
                    <div className="photo-overlay">
                      <span>Click to view</span>
                    </div>
                  </div>
                
              ))}
            </div>
          )}

          {/* Image Preview Modal */}
          {selectedImage && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={closeModal}>
                  <X size={24} />
                </button>
                <button 
                  className="modal-download" 
                  onClick={() => downloadImage(selectedImage)}
                  title="Download photo"
                >
                  <Download size={20} />
                </button>
                <img src={selectedImage} alt="Preview" className="modal-image" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}