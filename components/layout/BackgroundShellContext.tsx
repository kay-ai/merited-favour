// components/layout/BackgroundShellContext.tsx
"use client"

import { createContext, useContext } from "react"

type BackgroundShellContextType = {
  enableMusic: () => void
}

export const BackgroundShellContext =
  createContext<BackgroundShellContextType | null>(null)

export function useBackgroundShell() {
  const ctx = useContext(BackgroundShellContext)

  if (!ctx) {
    throw new Error(
      "useBackgroundShell must be used inside BackgroundShellContext.Provider"
    )
  }

  return ctx
}