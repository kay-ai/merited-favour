// components/layout/BackgroundShell.tsx
"use client"

import { ReactNode, useState } from "react"
import MusicToggle from "@/components/MusicToggle"
import { FloatingFlower } from "@/components/FloatingFlower"
import {
  BackgroundShellContext,
} from "./BackgroundShellContext"

export default function BackgroundShell({
  children,
}: {
  children: ReactNode
}) {
  const [musicEnabled, setMusicEnabled] = useState(false)

  return (
    <BackgroundShellContext.Provider
      value={{
        enableMusic: () => setMusicEnabled(true),
      }}
    >
      <div className="wedding-wrapper">
        {/* Background */}
        <div className="bg-text love">Love</div>
        <div className="bg-text forever">Forever</div>

        <div className="corner-decoration top-left" />
        <div className="corner-decoration bottom-right" />

        {/* Flowers */}
        <FloatingFlower delay={0} duration={18} x={10} />
        <FloatingFlower delay={3} duration={22} x={30} />
        <FloatingFlower delay={6} duration={20} x={70} />
        <FloatingFlower delay={9} duration={24} x={85} />
        <FloatingFlower delay={12} duration={19} x={50} />

        {/* Content */}
        {children}

        {/* Music */}
        <MusicToggle enabled={musicEnabled} />
      </div>
    </BackgroundShellContext.Provider>
  )
}