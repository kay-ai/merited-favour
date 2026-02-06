import "@/styles/globals.css"

import { ReactNode } from "react"
import BackgroundShell from "@/components/layout/BackgroundShell"

export const metadata = {
  title: "Wedding Invitation",
  description: "You're invited"
}

export default function WeddingLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <BackgroundShell>{children}</BackgroundShell>
      </body>
    </html>
  )
}
