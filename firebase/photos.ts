import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { storage, db } from "./firebase"

export async function uploadGuestPhoto(file: File, name: string) {
  const photoRef = ref(
    storage,
    `photos/${Date.now()}-${file.name}`
  )

  await uploadBytes(photoRef, file)
  const url = await getDownloadURL(photoRef)

  return await addDoc(collection(db, "photos"), {
    name,
    url,
    createdAt: serverTimestamp()
  })
}
