export default function ToastsPage() {
  return (
    <div className="main toasts-page">
      <div className="page-header">
        <h1>A Toast from the Couple</h1>
        <p>Words of gratitude and celebration</p>
      </div>

      <div className="toast-container">
        <div className="toast-card-main">
          <div className="toast-icon-large">🥂</div>

          <div className="toast-content">
            <h2 className="toast-title">To Our Loved Ones</h2>
            <div className="toast-message">
              <p>
                As we stand on the threshold of this beautiful journey together, we want to take a moment
                to express our deepest gratitude to each and every one of you.
              </p>
              <p>
                To our parents, thank you for your endless love, guidance, and for showing us what true
                commitment looks like. You&apos;ve been our foundation and our inspiration.
              </p>
              <p>
                To our family and friends who have gathered here today, your presence means the world to us.
                Thank you for the laughter, the support, and for being part of our story.
              </p>
              <p>
                Today, we celebrate not just our love for each other, but also the love that surrounds us.
                Here&apos;s to family, to friendship, to love, and to the beautiful adventure that lies ahead.
              </p>
              <p className="toast-closing">
                With all our love and gratitude,
                <br />
                <strong>Merit & Favour</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="decorative-quote">
          <p>&quot;Love is not just about finding the right person, but creating the right relationship.
          It&apos;s not about how much love you have in the beginning, but how much love you build until the end.&quot;</p>
        </div>
      </div>
    </div>
  )
}