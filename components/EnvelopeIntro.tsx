"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"

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

export default function EnvelopeIntro({
  onOpen
}: {
  onOpen: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.from(ref.current, {
      opacity: 0,
      scale: 0.92,
      duration: 0.9,
      ease: "power3.out"
    })
  }, [])

  return (
    <div className="z-3 envelope-closed" ref={ref} onClick={onOpen}>
      <div className="invite-text">
        You are invited
      </div>
      <img
        src="/envelope-closed.png"
        alt=""
        className="envelope-closed-img"
      />
      <div className="open-hint">
        Click for details
      </div>
      <div className="open-hint-2">
        Merit & Favour <br />
         14 . 02 . 26
      </div>
    </div>
  )
}
