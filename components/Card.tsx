"use client"
import { useEffect, useRef, useState } from "react"

export default function Card({ src, style, link, delay = 0 }: { src: string; style: any; link: string; delay?: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)
    return () => clearTimeout(timer)
  }, [delay])

  const handleClick = () => {
    // window.open(link, '_blank')
    window.open(link)
  }

  return (
    <div
      ref={cardRef}
      className={`card ${isVisible ? 'visible' : ''}`}
      style={{
        ...style,
        transform: `rotate(${style.rotate}) ${isVisible ? 'translateY(0)' : 'translateY(48px)'}`,
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      onClick={handleClick}
    >
      <img src={src} alt="Wedding invitation card" />
    </div>
  )
}