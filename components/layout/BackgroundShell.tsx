// components/layout/BackgroundShell.tsx
"use client"

import { ReactNode, useState, useEffect } from "react"
import MusicToggle from "@/components/MusicToggle"
import { FloatingFlower } from "@/components/FloatingFlower"
import {
  BackgroundShellContext,
} from "./BackgroundShellContext"
import { ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css'
import { Moon, Sun } from "lucide-react"

export default function BackgroundShell({
  children,
}: {
  children: ReactNode
}) {
  const [musicEnabled, setMusicEnabled] = useState(false)
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    // Check for saved dark mode preference, default to dark mode
    const savedMode = localStorage.getItem('darkMode')
    if (savedMode === 'false') {
      setDarkMode(false)
      document.documentElement.classList.remove('dark-mode')
    } else {
      setDarkMode(true)
      document.documentElement.classList.add('dark-mode')
      localStorage.setItem('darkMode', 'true')
    }
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    if (!darkMode) {
      document.documentElement.classList.add('dark-mode')
      localStorage.setItem('darkMode', 'true')
    } else {
      document.documentElement.classList.remove('dark-mode')
      localStorage.setItem('darkMode', 'false')
    }
  }

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

        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={darkMode ? "dark" : "light"}
        />

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="dark-mode-toggle"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Music */}
        <MusicToggle enabled={musicEnabled} />
      </div>
    </BackgroundShellContext.Provider>
  )
}