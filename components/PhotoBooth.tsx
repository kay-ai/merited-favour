"use client"

import { useEffect, useRef, useState } from "react"
import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore"
import { ref, uploadString, getDownloadURL } from "firebase/storage"
// import { db, storage } from "@/lib/firebase"
import Image from "next/image"
import { db, storage } from "@/firebase/firebase"

export default function PhotoBooth() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
    })
    if (videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }

  const takePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")!
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight

    ctx.drawImage(videoRef.current, 0, 0)

    const dataUrl = canvas.toDataURL("image/jpeg")

    setLoading(true)

    const imgRef = ref(
      storage,
      `photo-booth/${Date.now()}.jpg`
    )

    await uploadString(imgRef, dataUrl, "data_url")
    const url = await getDownloadURL(imgRef)

    await addDoc(collection(db, "photoBooth"), {
      url,
      createdAt: serverTimestamp(),
    })

    setLoading(false)
    fetchPhotos()
  }

  const fetchPhotos = async () => {
    const snap = await getDocs(collection(db, "photoBooth"))
    setPhotos(snap.docs.map(d => d.data()))
  }

  useEffect(() => {
    fetchPhotos()
  }, [])

  return (
    <section>
      <h2 className="text-center text-3xl font-light mb-10">
        Photo Booth
      </h2>

      <div className="max-w-xl mx-auto space-y-6">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full rounded-xl bg-black"
        />

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex gap-4">
          <button
            onClick={startCamera}
            className="flex-1 rounded-full border py-3"
          >
            Open Camera
          </button>

          <button
            onClick={takePhoto}
            disabled={loading}
            className="flex-1 rounded-full bg-black text-white py-3"
          >
            {loading ? "Saving…" : "Take Photo"}
          </button>
        </div>
      </div>

      {/* GUEST PHOTOS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto mt-16">
        {photos.map((p, i) => (
          <div
            key={i}
            className="relative aspect-square rounded-xl overflow-hidden"
          >
            <Image
              src={p.url}
              alt="Guest memory"
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  )
}