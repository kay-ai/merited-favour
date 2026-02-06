"use client"
import { useState, useEffect } from "react"
import { X, Download } from "lucide-react"

interface Photo {
  id: string
  imageData: string
  frame: string
  timestamp: number
}

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [boothPhotos, setBoothPhotos] = useState<Photo[]>([])

  const curatedPhotos = [
    "/photos/photo-1.jpg",
    "/photos/photo-2.jpg",
    "/photos/photo-3.jpg",
    "/photos/photo-4.jpg",
    "/photos/photo-5.jpg",
    "/photos/photo-6.jpg",
    "/photos/photo-7.jpg",
    "/photos/photo-8.jpg",
    "/photos/photo-9.jpg",
    "/photos/photo-10.jpg",
    "/photos/photo-11.jpg",
    "/photos/photo-12.jpg",
    "/photos/photo-13.jpg",
    "/photos/photo-14.jpg",
    "/photos/photo-15.jpg",
    "/photos/photo-16.jpg",
    "/photos/photo-17.jpg",
    "/photos/photo-18.jpg",
    "/photos/photo-19.jpg",
    "/photos/photo-20.jpg",
    "/photos/photo-21.jpg",
    "/photos/photo-22.jpg",
    "/photos/photo-23.jpg",
    "/photos/photo-24.jpg",
    "/photos/photo-25.jpg",
  ]

  useEffect(() => {
    const loadBoothPhotos = async () => {
      try {
        const result = await window.storage.list("photo:", true)
        if (result && result.keys) {
          const photoPromises = result.keys.map(async (key) => {
            const data = await window.storage.get(key, true)
            if (data) {
              return JSON.parse(data.value)
            }
            return null
          })
          const loadedPhotos = (await Promise.all(photoPromises)).filter(Boolean)
          setBoothPhotos(loadedPhotos.sort((a, b) => b.timestamp - a.timestamp))
        }
      } catch (error) {
        console.error("Error loading booth photos:", error)
      }
    }

    loadBoothPhotos()
  }, [])

  const openImage = (src: string) => {
    setSelectedImage(src)
  }

  const closeModal = () => {
    setSelectedImage(null)
  }

  const downloadImage = (src: string) => {
    const link = document.createElement("a")
    link.href = src
    link.download = `wedding-photo-${Date.now()}.jpg`
    link.click()
  }

  return (
    <div className="main">
      {/* Curated Photos Section */}
      <section className="gallery-section">
        <div className="page-header">
          <h1>Our Photos</h1>
          <p>Capturing the beautiful moments of our journey</p>
        </div>

        <div className="photo-grid">
          {curatedPhotos.map((src, i) => (
            <div
              key={i}
              className="gallery-item bounce-animation"
              style={{ animationDelay: `${i * 0.1}s` }}
              onClick={() => openImage(src)}
            >
              <img src={src} alt="Wedding memory" />
              <div className="photo-overlay">
                <span>Click to view</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Photo Booth Gallery */}
      {boothPhotos.length > 0 && (
        <section className="gallery-section booth-section">
          <div className="section-header">
            <h2>Guest Photo Booth</h2>
            <p className="photo-count">
              {boothPhotos.length} {boothPhotos.length === 1 ? 'photo' : 'photos'} from our guests
            </p>
          </div>

          <div className="photo-grid booth-grid">
            {boothPhotos.map((photo, i) => (
              <div
                key={photo.id}
                className="gallery-item booth-item bounce-animation"
                style={{ animationDelay: `${i * 0.1}s` }}
                onClick={() => openImage(photo.imageData)}
              >
                <div className="booth-photo-wrapper">
                  <img src={photo.imageData} alt="Guest photo booth" />
                  <div className={`frame-overlay ${photo.frame}`}>
                    <div className="frame-text">Merit & Favour</div>
                    <div className="frame-text">Feb 14, 2026</div>
                  </div>
                </div>
                <div className="photo-overlay">
                  <span>Click to view</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <X size={24} />
            </button>
            <button 
              className="modal-download" 
              onClick={() => downloadImage(selectedImage)}
              title="Download photo"
            >
              <Download size={20} />
            </button>
            <img src={selectedImage} alt="Preview" className="modal-image" />
          </div>
        </div>
      )}
    </div>
  )
}