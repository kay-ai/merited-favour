export function FloatingFlower({ delay = 0, duration = 20, x = 0 }: { delay?: number; duration?: number; x?: number }) {
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