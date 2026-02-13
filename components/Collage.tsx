"use client"

import { useRef } from "react"
import Card from "./Card";

export default function WeddingCollage() {
  const collageRef = useRef<HTMLDivElement>(null)

  const cards = [
    { src: "/images/card-location.png", link: "/location", position: { top: "26%", left: "13%", rotate: "-3deg" }, delay: 0 },
    { src: "/images/card-booth.png", link: "/booth", position: { top: "43%", left: "8%", rotate: "2deg" }, delay: 200 },
    { src: "/images/card-wishes.png", link: "/wishes", position: { top: "77%", left: "15%", rotate: "-4deg" }, delay: 400 },
    { src: "/images/card-details.png", link: "/details", position: { top: "44%", left: "42%", transform: "translateX(-50%)", rotate: "1deg" }, delay: 100 },
    { src: "/images/card-donations.png", link: "/donations", position: { top: "22%", right: "11%", rotate: "3deg" }, delay: 300 },
    { src: "/images/card-gallery.png", link: "/gallery", position: { top: "35%", right: "3%", rotate: "-2deg" }, delay: 500 },
    { src: "/images/card-toast.png", link: "/toasts", position: { top: "71%", right: "12%", rotate: "2deg" }, delay: 600 },
    { src: "/images/card-toast.png", link: "/game", position: { top: "91%", right: "12%", rotate: "2deg" }, delay: 700 },
  ]

  return (
    <>
      <div className="envelope-container">
        <img
          src="/envelope-opened.png"
          alt="Wedding envelope"
          className="envelope-open"
        />
      </div>

      <div className="collage" ref={collageRef}>
        {cards.map((card, index) => (
          <Card
            key={index}
            src={card.src}
            link={card.link}
            style={{
              ...card.position,
              '--hover-rotate': card.position.rotate,
            }}
            delay={card.delay}
          />
        ))}
      </div>
    </>
  )
}