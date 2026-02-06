import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "./firebase"

export async function submitWish(message: string, name: string) {
  return await addDoc(collection(db, "wishes"), {
    name,
    message,
    createdAt: serverTimestamp()
  })
}
