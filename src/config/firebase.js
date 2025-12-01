import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { checkFirebaseConfig } from '../utils/firebaseDebug'

// Firebase 설정
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
}

// 개발 환경에서 설정 확인
if (import.meta.env.DEV) {
  checkFirebaseConfig()
}

// Firebase 초기화
let app
try {
  app = initializeApp(firebaseConfig)
} catch (error) {
  console.error('Firebase 초기화 실패:', error)
  throw error
}

// Auth 초기화
export const auth = getAuth(app)

// Firestore 초기화 (데이터베이스)
export const db = getFirestore(app)

// Storage 초기화 (파일 저장)
export const storage = getStorage(app)

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider()

export default app

