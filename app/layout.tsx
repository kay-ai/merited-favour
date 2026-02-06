import "@/styles/globals.css"

export const metadata = {
  title: "Wedding Invitation",
  description: "You're invited"
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
