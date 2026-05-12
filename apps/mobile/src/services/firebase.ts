import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'
import { firebaseConfig } from '@autogest/shared'

let app: FirebaseApp
let auth: Auth
let db: Firestore
let storage: FirebaseStorage

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

auth = getAuth(app)
db = getFirestore(app)
storage = getStorage(app)

export { app, auth, db, storage }
