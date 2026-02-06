// app/(wedding)/layout.tsx
"use client"

import { ReactNode } from "react"
import BackgroundShell from "@/components/layout/BackgroundShell"

export default function WeddingLayout({
  children,
}: {
  children: ReactNode
}) {
  return <BackgroundShell>{children}</BackgroundShell>
}
