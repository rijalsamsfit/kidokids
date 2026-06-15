import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Memanggil data dari file .env.local (Praktik Terbaik Next.js)
// Fallback string dipakai agar kalau .env.local belum terbaca, app tidak crash
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBaUnPWLLr_dLbmn9XdkXdMZIt6WwOtfFU",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "kidokidsid.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "kidokidsid",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "kidokidsid.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "779985902516",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:779985902516:web:26fee14f601dc3edc770e1",
  measurementId: "G-8F1MFRE5SB"
};

// Mengatasi isu SSR (Server-Side Rendering) di Next.js
// Firebase hanya diinisialisasi sekali, jika belum ada aplikasinya
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inisialisasi layanan Firebase
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Mengekspor semua layanan agar bisa dipakai di komponen lain
export { app, auth, db, storage };