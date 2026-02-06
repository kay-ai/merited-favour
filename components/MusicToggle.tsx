"use client"

import { useEffect, useRef, useState } from "react"

export default function MusicToggle({
  enabled,
}: {
  enabled: boolean
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/audio/photograph.mp3")
      audioRef.current.loop = true
      audioRef.current.volume = 0.10
    }
  }, [])

  useEffect(() => {
    if (enabled && audioRef.current && !playing) {
      audioRef.current.play().then(() => {
        setPlaying(true)
      }).catch(() => {
      })
    }
  }, [enabled])

  const toggleMusic = () => {
    if (!audioRef.current) return

    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  if (!enabled) return null

  return (
    <button
      onClick={toggleMusic}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        padding: "10px 16px",
        borderRadius: 24,
        border: "1px solid #e5e5e5",
        background: "#fff",
        cursor: "pointer",
        zIndex: 20,
        fontSize: 14,
      }}
    >
      {playing ? "Pause Music" : "Play Music"}
    </button>
  )
}