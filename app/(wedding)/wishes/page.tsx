"use client"
import { useState, useEffect } from "react"
import { addDoc, collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/firebase/firebase"
import { Timestamp } from "firebase/firestore"
import { toast } from "react-toastify"
import Marquee from "react-fast-marquee"

interface Wish {
  id: string
  name: string
  message: string
  createdAt: Timestamp
  createdAtClient: number
}

export default function WishesPage() {
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [wishes, setWishes] = useState<Wish[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchWishes()
  }, [])

  const fetchWishes = async () => {
    try {
      const q = query(collection(db, "wishes"), orderBy("createdAtClient", "desc"))
      const snap = await getDocs(q)
      
      const loadedWishes: Wish[] = snap.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
      }))
      
      setWishes(loadedWishes)
    } catch (error) {
      console.error("Error loading wishes:", error)
    }
  }

  const submitWish = async () => {
    if (!name.trim() || !message.trim()) {
      toast.error("Please fill in both your name and message")
      return
    }

    setLoading(true)
    try {
      await addDoc(collection(db, "wishes"), {
        name: name.trim(),
        message: message.trim(),
        createdAt: Timestamp.now(),
        createdAtClient: Date.now()
      })
      
      setName("")
      setMessage("")
      await fetchWishes()
      toast.success("Thank you for your wishes!")
    } catch (error) {
      console.error("Error submitting wish:", error)
      toast.error("Failed to submit wish. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  const WishCard = ({ wish }: { wish: Wish }) => (
    <div className="wish-card">
      <div className="wish-header">
        <p className="wish-name">{wish.name}</p>
        <span className="wish-time">{formatDate(wish.createdAtClient)}</span>
      </div>
      <p className="wish-message">{wish.message}</p>
    </div>
  )

  return (
    <div className="main">
      <div className="page-header">
        <h1>Leave a Wish</h1>
        <p>Share your blessings and well wishes for the couple</p>
      </div>

      <div className="form-container wishes-form">
        <div className="input-group">
          <label className="input-label">Your Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Your Message</label>
          <textarea
            placeholder="Share your wishes, blessings, or memories with Merit & Favour..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <button
          className="submit-btn"
          onClick={submitWish}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send us a Wish"}
        </button>
      </div>

      <div className="wishes-container">
        <div className="wishes-header">
          <p className="wishes-count">
            {wishes.length} {wishes.length === 1 ? 'wish' : 'wishes'} shared
          </p>
          {wishes.length > 5 && (
            <p className="scroll-hint">Auto-scrolling • Hover to pause</p>
          )}
        </div>

       {wishes.length === 0 ? (
  <div className="empty-state">
    <p>No wishes yet. Be the first to share your blessings!</p>
  </div>
          ) : wishes.length <= 5 ? (
            <div className="wishes-list">
              {wishes.map((wish) => (
                <WishCard key={wish.id} wish={wish} />
              ))}
            </div>
          ) : (
            <div className="wishes-scroll-container">
              <div className="wishes-scroll-content">
                {wishes.map((wish) => (
                  <WishCard key={wish.id} wish={wish} />
                ))}
                {/* Duplicate for seamless loop */}
                {wishes.map((wish) => (
                  <WishCard key={`${wish.id}-duplicate`} wish={wish} />
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  )
}