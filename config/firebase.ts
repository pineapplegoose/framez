import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA55ELSgaS8FQ34U9hB5qPR9fLkSrCUGag",
  authDomain: "framez-c4e9a.firebaseapp.com",
  projectId: "framez-c4e9a",
  storageBucket: "framez-c4e9a.firebasestorage.app",
  messagingSenderId: "273558657051",
  appId: "1:273558657051:web:bab1e92eae62f95d36c0be",
  measurementId: "G-VDM34Q3LN9",
}

const app = initializeApp(firebaseConfig)

// Initialize Auth (persistence is handled automatically in React Native)
export const auth = getAuth(app)

export const db = getFirestore(app)
export const storage = getStorage(app)

export default app
