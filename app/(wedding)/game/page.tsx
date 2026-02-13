"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, X, Trophy, Clock, CheckCircle, Lock, Unlock } from "lucide-react"
import { ref, uploadString, getDownloadURL } from "firebase/storage"
import { 
  addDoc, 
  collection, 
  serverTimestamp, 
  getDocs, 
  query, 
  orderBy,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore"
import { storage, db } from "@/firebase/firebase"
import { Timestamp } from "firebase/firestore"

// GAME CONFIG - Customize here
const TOTAL_ENTRIES = 7
const GAME_PASSWORD = "wedding2026" // Change this to your desired password

interface GameEntry {
  id: string
  guestName: string
  photoUrl: string
  entryNumber: number
  timestamp: Timestamp
  submittedAt: number
}

interface GuestProgress {
  guestName: string
  entries: GameEntry[]
  completedCount: number
  totalTime: number | null
  startTime: number
  endTime: number | null
}

export default function GamePage() {
  // Game state
  const [gameUnlocked, setGameUnlocked] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [checkingPassword, setCheckingPassword] = useState(true)
  const [showLockModal, setShowLockModal] = useState(false)
  const [lockPasswordInput, setLockPasswordInput] = useState("")
  
  // Player state
  const [gameStarted, setGameStarted] = useState(false)
  const [guestName, setGuestName] = useState("")
  const [currentEntry, setCurrentEntry] = useState(1)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [resumeData, setResumeData] = useState<{
    completed: number
    startTime: number
  } | null>(null)

  
  // Camera state
  const [showCamera, setShowCamera] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
  
  // Leaderboard state
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [leaderboard, setLeaderboard] = useState<GuestProgress[]>([])
  const [selectedGuest, setSelectedGuest] = useState<GuestProgress | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isMobile = () =>
    typeof window !== "undefined" &&
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

  useEffect(() => {
    checkGameStatus()
    loadLeaderboard()
    
    // Load saved name from localStorage
    const savedName = localStorage.getItem("gameGuestName")
    if (savedName) {
      setGuestName(savedName)
    }
    
    return stopCamera
  }, [])

  /* -------------------- PASSWORD & GAME STATUS -------------------- */

  const checkGameStatus = async () => {
    try {
      const statusRef = doc(db, "gameStatus", "main")
      const statusDoc = await getDoc(statusRef)
      
      if (statusDoc.exists()) {
        setGameUnlocked(statusDoc.data().unlocked || false)
      } else {
        // Initialize game status
        await setDoc(statusRef, { unlocked: false })
        setGameUnlocked(false)
      }
    } catch (err) {
      console.error("Error checking game status:", err)
    } finally {
      setCheckingPassword(false)
    }
  }

  const unlockGame = async () => {
    if (passwordInput === GAME_PASSWORD) {
      try {
        const statusRef = doc(db, "gameStatus", "main")
        await setDoc(statusRef, { unlocked: true })
        setGameUnlocked(true)
        setPasswordInput("")
      } catch (err) {
        console.error("Error unlocking game:", err)
        alert("Failed to unlock game. Please try again.")
      }
    } else {
      alert("Incorrect password!")
      setPasswordInput("")
    }
  }

  const lockGame = async () => {
    if (lockPasswordInput === GAME_PASSWORD) {
      try {
        const statusRef = doc(db, "gameStatus", "main")
        await setDoc(statusRef, { unlocked: false })
        setGameUnlocked(false)
        setShowLockModal(false)
        setLockPasswordInput("")
        alert("Game has been locked successfully!")
      } catch (err) {
        console.error("Error locking game:", err)
        alert("Failed to lock game. Please try again.")
      }
    } else {
      alert("Incorrect password!")
      setLockPasswordInput("")
    }
  }

  /* -------------------- LEADERBOARD -------------------- */

  const loadLeaderboard = async () => {
    try {
      const q = query(collection(db, "gameEntries"), orderBy("submittedAt", "asc"))
      const snap = await getDocs(q)

      const entries: GameEntry[] = snap.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
      }))

      // Group by guest and calculate progress
      const guestMap = new Map<string, GuestProgress>()

      entries.forEach(entry => {
        if (!guestMap.has(entry.guestName)) {
          guestMap.set(entry.guestName, {
            guestName: entry.guestName,
            entries: [],
            completedCount: 0,
            totalTime: null,
            startTime: entry.submittedAt,
            endTime: null,
          })
        }

        const progress = guestMap.get(entry.guestName)!
        progress.entries.push(entry)
        progress.completedCount = progress.entries.length

        // Update times
        if (entry.submittedAt < progress.startTime) {
          progress.startTime = entry.submittedAt
        }

        if (progress.completedCount === TOTAL_ENTRIES) {
          const lastEntry = progress.entries[progress.entries.length - 1]
          progress.endTime = lastEntry.submittedAt
          progress.totalTime = progress.endTime - progress.startTime
        }
      })

      // Sort: completed first (by time), then by entries count
      const sorted = Array.from(guestMap.values()).sort((a, b) => {
        if (a.completedCount === TOTAL_ENTRIES && b.completedCount === TOTAL_ENTRIES) {
          return (a.totalTime || 0) - (b.totalTime || 0)
        }
        return b.completedCount - a.completedCount
      })

      setLeaderboard(sorted)
    } catch (err) {
      console.error("Leaderboard load error:", err)
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
      alert("Camera access failed. Please allow permissions.")
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
    setShowCamera(false)
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
    stopCamera()
  }

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

  /* -------------------- GAME FLOW -------------------- */

  const startGame = async () => {
    if (!guestName.trim()) {
      alert("Please enter your name!")
      return
    }

    // Save name to localStorage
    localStorage.setItem("gameGuestName", guestName.trim())

    // Check if guest has existing entries
    try {
      const q = query(
        collection(db, "gameEntries"),
        orderBy("submittedAt", "asc")
      )
      const snap = await getDocs(q)
      const existingEntries = snap.docs
        .map(doc => ({ id: doc.id, ...(doc.data() as any) }))
        .filter((entry: any) => entry.guestName.toLowerCase() === guestName.toLowerCase())

      if (existingEntries.length > 0) {
        // Guest has existing entries, resume from last entry
        const lastEntry = existingEntries[existingEntries.length - 1]
        if (lastEntry.entryNumber >= TOTAL_ENTRIES) {
          alert(`${guestName}, you've already completed all entries! Check the leaderboard.`)
          setShowLeaderboard(true)
          await loadLeaderboard()
          return
        }
        
        setResumeData({
            completed: existingEntries.length,
            startTime: existingEntries[0].submittedAt,
        })
        setShowResumeModal(true)
        return
      } else {
        // New player
        setStartTime(Date.now())
      }

      setGameStarted(true)
    } catch (err) {
      console.error("Error checking existing entries:", err)
      // Continue anyway
      setGameStarted(true)
      setStartTime(Date.now())
    }
  }

    const confirmResume = () => {
        if (!resumeData) return

        setCurrentEntry(resumeData.completed + 1)
        setStartTime(resumeData.startTime)
        setGameStarted(true)
        setShowResumeModal(false)
        setResumeData(null)
    }

    const cancelResume = () => {
        setShowResumeModal(false)
        setResumeData(null)
    }


  const submitEntry = async () => {
    if (!capturedPhoto || loading) return
    setLoading(true)

    try {
      const filename = `wedding/${Date.now()}.jpg`
      const storageRef = ref(storage, filename)

      await uploadString(storageRef, capturedPhoto, "data_url")
      const url = await getDownloadURL(storageRef)

      // Add to gameEntries collection
      await addDoc(collection(db, "gameEntries"), {
        guestName,
        photoUrl: url,
        entryNumber: currentEntry,
        timestamp: serverTimestamp(),
        submittedAt: Date.now(),
      })

      // Also add to wedding collection so it appears in booth page
      await addDoc(collection(db, "wedding"), {
        url,
        createdAt: serverTimestamp(),
        createdAtClient: Date.now(),
        source: "game",
        guestName,
        entryNumber: currentEntry,
      })

      setCapturedPhoto(null)

      if (currentEntry < TOTAL_ENTRIES) {
        setCurrentEntry(currentEntry + 1)
      } else {
        // Game completed!
        alert(`Congratulations ${guestName}! You've completed all ${TOTAL_ENTRIES} entries!`)
        localStorage.removeItem("gameGuestName") // Clear saved name on completion
        await loadLeaderboard()
        setShowLeaderboard(true)
        resetGame()
      }
    } catch (err) {
      console.error("Submit error:", err)
      alert("Upload failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const resetGame = () => {
    setGameStarted(false)
    setGuestName("")
    setCurrentEntry(1)
    setStartTime(null)
    setCapturedPhoto(null)
    stopCamera()
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  /* -------------------- RENDER -------------------- */

  if (checkingPassword) {
    return (
      <div className="main">
        <div className="page-header">
          <h1>Loading...</h1>
        </div>
      </div>
    )
  }

  if (!gameUnlocked) {
    return (
      <div className="main">
        <div className="page-header">
          <h1>Photo Challenge</h1>
          <p>Game is currently locked</p>
        </div>

        <div className="booth-container">
          <div className="camera-section" style={{ maxWidth: "400px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <Lock size={64} style={{ margin: "0 auto 20px", opacity: 0.5 }} />
              <h2 style={{ marginBottom: "20px" }}>Enter Password to Unlock</h2>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && unlockGame()}
                placeholder="Enter password"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "16px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  marginBottom: "20px",
                }}
              />
                <div className="camera-btn-row">
                    <button className="btn btn-primary " onClick={unlockGame}>
                        <Unlock size={20} /> Unlock Game
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
        <h1>Photo Challenge</h1>
        <p>Complete {TOTAL_ENTRIES} photo challenges as fast as you can!</p>
      </div>

      <div className="booth-container">
        {/* View Leaderboard and Lock Game Buttons */}
        {!gameStarted && !showLeaderboard && (
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            gap: "12px", 
            marginBottom: "20px",
            flexWrap: "wrap"
          }}>
            <button className="btn btn-secondary" onClick={() => {
              loadLeaderboard()
              setShowLeaderboard(true)
            }}>
              <Trophy size={20} /> View Leaderboard
            </button>
            <button className="btn btn-danger" onClick={() => setShowLockModal(true)}>
              <Lock size={20} /> Lock Game
            </button>
          </div>
        )}

        {/* Leaderboard View */}
        {showLeaderboard && !gameStarted && (
          <div className="camera-section">
            <div style={{ marginBottom: "20px", textAlign: "center" }}>
              <button className="btn btn-secondary" onClick={() => setShowLeaderboard(false)}>
                ← Back to Game
              </button>
            </div>

            <h2 className="section-title">
              <Trophy size={24} style={{ display: "inline", marginRight: "8px" }} />
              Leaderboard
            </h2>

            {leaderboard.length === 0 ? (
              <div className="empty-state">
                <p>No entries yet. Be the first to play!</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {leaderboard.map((guest, index) => (
                  <div
                    key={guest.guestName}
                    className="leaderboard-item"
                    onClick={() => setSelectedGuest(guest)}
                    style={{
                      padding: "20px",
                      background: index === 0 && guest.completedCount === TOTAL_ENTRIES ? "#fff9e6" : "white",
                      border: index === 0 && guest.completedCount === TOTAL_ENTRIES ? "2px solid #c4a574" : "1px solid #e0e0e0",
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "transform 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {index === 0 && guest.completedCount === TOTAL_ENTRIES && (
                            <Trophy size={20} color="#c4a574" />
                          )}
                          <strong style={{ fontSize: "18px" }}>{guest.guestName}</strong>
                        </div>
                        <div style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
                          {guest.completedCount} / {TOTAL_ENTRIES} entries
                          {guest.completedCount === TOTAL_ENTRIES && (
                            <CheckCircle size={16} style={{ marginLeft: "8px", color: "#4caf50", display: "inline" }} />
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        {guest.totalTime !== null && (
                          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#5a6952" }}>
                            <Clock size={20} style={{ display: "inline", marginRight: "4px" }} />
                            {formatTime(guest.totalTime)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Guest Entries Modal */}
        {selectedGuest && (
          <div className="modal-overlay" onClick={() => setSelectedGuest(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px", maxHeight: "90vh", overflow: "auto" }}>
              <button className="modal-close" onClick={() => setSelectedGuest(null)}>
                <X size={24} />
              </button>
              <div style={{ padding: "20px" }}>
                <h2 style={{ marginBottom: "20px" }}>{selectedGuest.guestName}&apos;s Entries</h2>
                <div className="photo-grid">
                  {selectedGuest.entries.map((entry) => (
                    <div key={entry.id} className="gallery-item">
                      <img src={entry.photoUrl} alt={`Entry ${entry.entryNumber}`} />
                      <div className="photo-overlay">
                        <span>Entry {entry.entryNumber}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Name Entry */}
        {!gameStarted && !showLeaderboard && (
          <div className="camera-section" style={{ maxWidth: "400px", margin: "0 auto" }}>
            <h2 className="section-title">Enter Your Name</h2>
            <div style={{ padding: "20px" }}>
              {localStorage.getItem("gameGuestName") && (
                <p style={{ 
                  textAlign: "center", 
                  color: "#666", 
                  marginBottom: "12px",
                  fontSize: "14px" 
                }}>
                  Welcome back! Continue as <strong>{guestName}</strong>?
                </p>
              )}
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && startGame()}
                placeholder="Your name"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "16px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  marginBottom: "20px",
                }}
              />
              <button className="btn btn-primary" onClick={startGame} style={{ width: "100%" }}>
                Start Challenge
              </button>
              {localStorage.getItem("gameGuestName") && (
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    localStorage.removeItem("gameGuestName")
                    setGuestName("")
                  }} 
                  style={{ width: "100%", marginTop: "12px" }}
                >
                  Play as Different Person
                </button>
              )}
            </div>
          </div>
        )}

        {/* Game in Progress */}
        {gameStarted && !showLeaderboard && (
          <div className="camera-section">
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <h2 className="section-title">
                Entry {currentEntry} of {TOTAL_ENTRIES}
              </h2>
              <div style={{ 
                display: "flex", 
                gap: "8px", 
                justifyContent: "center", 
                marginTop: "12px" 
              }}>
                {Array.from({ length: TOTAL_ENTRIES }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      background: i < currentEntry ? "#4caf50" : "#e0e0e0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "12px",
                    }}
                  >
                    {i < currentEntry ? "✓" : i + 1}
                  </div>
                ))}
              </div>
            </div>

            {!showCamera && !capturedPhoto && (
              <div className="camera-placeholder">
                <Camera size={64} />
                <p>Ready to capture entry {currentEntry}?</p>
                <div className="camera-btn-row">
                    <button className="btn btn-primary" onClick={openCamera}>
                    <Camera size={20} /> Open Camera
                    </button>
                </div>
              </div>
            )}

            {showCamera && !capturedPhoto && (
              <>
                <div className="video-container">
                  <video ref={videoRef} autoPlay playsInline muted />
                </div>
                <div className="button-group">
                  <button className="btn btn-primary" onClick={capturePhoto}>
                    <Camera size={20} /> Capture
                  </button>
                  <button className="btn btn-danger" onClick={stopCamera}>
                    <X size={20} /> Cancel
                  </button>
                </div>
              </>
            )}

            {capturedPhoto && (
              <>
                <div className="video-container">
                  <img src={capturedPhoto} className="photo-preview" alt="preview" />
                </div>
                <div className="button-group">
                  <button className="btn btn-primary" disabled={loading} onClick={submitEntry}>
                    {loading ? "Submitting..." : `Submit Entry ${currentEntry}`}
                  </button>
                  <button className="btn btn-secondary" onClick={() => setCapturedPhoto(null)}>
                    Retake
                  </button>
                </div>
              </>
            )}

            <canvas ref={canvasRef} style={{ display: "none" }} />

            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <button className="btn btn-danger" onClick={resetGame}>
                Cancel Game
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lock Game Modal */}
      {showLockModal && (
        <div className="modal-overlay" onClick={() => {
          setShowLockModal(false)
          setLockPasswordInput("")
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "400px", padding: "40px" }}>
            <button className="modal-close" onClick={() => {
              setShowLockModal(false)
              setLockPasswordInput("")
            }}>
              <X size={24} />
            </button>
            <div style={{ textAlign: "center" }}>
              <Lock size={64} style={{ margin: "0 auto 20px", opacity: 0.5 }} />
              <h2 style={{ marginBottom: "20px" }}>Lock Game</h2>
              <p style={{ marginBottom: "20px", color: "#666" }}>
                Enter password to lock the game for all players
              </p>
              <input
                type="password"
                value={lockPasswordInput}
                onChange={(e) => setLockPasswordInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && lockGame()}
                placeholder="Enter password"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "16px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  marginBottom: "20px",
                }}
                autoFocus
              />
              <button className="btn btn-danger" onClick={lockGame} style={{ width: "100%" }}>
                <Lock size={20} /> Lock Game
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Resume Game Modal */}
        {showResumeModal && resumeData && (
        <div className="modal-overlay" onClick={cancelResume}>
            <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "420px", padding: "40px" }}
            >
            <button className="modal-close" onClick={cancelResume}>
                <X size={24} />
            </button>

            <div style={{ textAlign: "center" }}>
                <Clock size={64} style={{ margin: "0 auto 20px", opacity: 0.6 }} />
                
                <h2 style={{ marginBottom: "12px" }}>
                Welcome back {guestName} 👋
                </h2>

                <p style={{ marginBottom: "24px", color: "#666", lineHeight: 1.5 }}>
                You already completed <strong>{resumeData.completed}</strong> of{" "}
                <strong>{TOTAL_ENTRIES}</strong> entries.
                <br />
                Continue from entry{" "}
                <strong>{resumeData.completed + 1}</strong>?
                </p>

                <div style={{ display: "flex", gap: "12px" }}>
                <button
                    className="btn btn-secondary"
                    onClick={cancelResume}
                    style={{ flex: 1 }}
                >
                    Start Over
                </button>

                <button
                    className="btn btn-primary"
                    onClick={confirmResume}
                    style={{ flex: 1 }}
                >
                    Continue
                </button>
                </div>
            </div>
            </div>
        </div>
        )}

    </div>
  )
}