"use client"
import { useEffect, useState } from "react"

function FloatingFlower({ delay = 0, duration = 20, x = 0 }: { delay?: number; duration?: number; x?: number }) {
  return (
    <div
      className="floating-flower"
      style={{
        left: `${x}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      🌸
    </div>
  )
}

interface Wish {
  id: string
  name: string
  message: string
  timestamp: number
}

export default function WishesPage() {
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [wishes, setWishes] = useState<Wish[]>([])
  const [loading, setLoading] = useState(false)

  const fetchWishes = async () => {
    try {
      const result = await window.storage.list("wish:", true)
      if (result && result.keys) {
        const wishPromises = result.keys.map(async (key) => {
          const data = await window.storage.get(key, true)
          if (data) {
            return JSON.parse(data.value)
          }
          return null
        })
        const loadedWishes = (await Promise.all(wishPromises)).filter(Boolean)
        setWishes(loadedWishes.sort((a, b) => b.timestamp - a.timestamp))
      }
    } catch (error) {
      console.error("Error loading wishes:", error)
    }
  }

  useEffect(() => {
    fetchWishes()
  }, [])

  const submitWish = async () => {
    if (!name.trim() || !message.trim()) {
      alert("Please fill in both your name and message")
      return
    }

    setLoading(true)
    try {
      const wish: Wish = {
        id: `wish_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        message: message.trim(),
        timestamp: Date.now()
      }

      await window.storage.set(`wish:${wish.id}`, JSON.stringify(wish), true)
      
      setName("")
      setMessage("")
      await fetchWishes()
      alert("Thank you for your wishes! 💕")
    } catch (error) {
      console.error("Error submitting wish:", error)
      alert("Failed to submit wish. Please try again.")
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

  return (
      <div className="main">
        <div className="page-header">
          <h1>Leave a Wish</h1>
          <p>Share your blessings and well wishes for the couple</p>
        </div>

        <div className="form-container">
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
              placeholder="Share your wishes, blessings, or memories with Us..."
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
            <h2>Wishes & Blessings</h2>
            <p className="wishes-count">
              {wishes.length} {wishes.length === 1 ? 'wish' : 'wishes'} shared
            </p>
          </div>

          {wishes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💌</div>
              <p>No wishes yet. Be the first to share your blessings!</p>
            </div>
          ) : (
            <div className="wishes-list">
              {wishes.map((wish) => (
                <div key={wish.id} className="wish-card">
                  <div className="wish-header">
                    <p className="wish-name">{wish.name}</p>
                    <span className="wish-time">{formatDate(wish.timestamp)}</span>
                  </div>
                  <p className="wish-message">{wish.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  )
}