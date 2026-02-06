"use client"

import { useEffect, useState } from "react"
import EnvelopeIntro from "@/components/EnvelopeIntro"
import Collage from "@/components/Collage"
import { signInAnonymously } from "firebase/auth"
import { auth } from "@/firebase/firebase"
import { useBackgroundShell } from "@/components/layout/BackgroundShellContext"

export default function Home() {
  const [opened, setOpened] = useState(false)
  const { enableMusic } = useBackgroundShell()

  useEffect(() => {
    signInAnonymously(auth).catch(console.error)
  }, [])

  const handleEnvelopeClick = () => {
    enableMusic()
    setOpened(true)
  }

  return (
    <>
      {!opened && <EnvelopeIntro onOpen={handleEnvelopeClick} />}
      {opened && <Collage />}
    </>
  )
}
