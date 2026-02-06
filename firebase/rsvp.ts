import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "./firebase"

export async function submitRSVP({
  name,
  attending,
  guests
}: {
  name: string
  attending: boolean
  guests: number
}) {
  return await addDoc(collection(db, "rsvps"), {
    name,
    attending,
    guests,
    createdAt: serverTimestamp()
  })
}
