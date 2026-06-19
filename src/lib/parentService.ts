// src/lib/parentService.ts
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "./firebase";

// Mendefinisikan tipe data agar kodingan lu aman dari typo (TypeScript)
export interface ParentProfile {
  uid: string;
  email: string | null;
  name: string | null;
  pin?: string; // ✅ UPDATE: Tambahan PIN Rahasia Ortu
  subscriptionPlan: "basic" | "pro" | "annual" | "lifetime"; // ✅ UPDATE: Tambahan paket 'annual'
  subscriptionExpiry: string | null; // Menyimpan batas waktu (null jika seumur hidup / basic)
  createdAt: string;
}

/**
 * 1. FUNGSI CEK (Gatekeeper)
 * Hanya mengecek apakah profil ortu sudah dibuat secara manual.
 * Murni mengembalikan nilai True/False.
 */
export const checkParentProfile = async (): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) return false;

    const parentRef = doc(db, "parents", user.uid);
    const parentSnap = await getDoc(parentRef);

    return parentSnap.exists();
  } catch (error) {
    console.error("Gagal mengecek profil:", error);
    return false;
  }
};

/**
 * 2. FUNGSI BUAT MANUAL (Registration)
 * Dipanggil HANYA dari halaman /register saat Ortu selesai mengisi form PIN & Nama.
 */
export const createParentProfileManual = async (name: string, pin: string): Promise<ParentProfile> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Tidak ada user yang login");

    const newParentProfile: ParentProfile = {
      uid: user.uid,
      email: user.email,
      name: name,
      pin: pin, // Menyimpan PIN ke database
      subscriptionPlan: "basic", // Default awal pendaftaran
      subscriptionExpiry: null,
      createdAt: new Date().toISOString(),
    };

    const parentRef = doc(db, "parents", user.uid);
    await setDoc(parentRef, newParentProfile);
    
    return newParentProfile;
  } catch (error) {
    console.error("Gagal membuat profil manual:", error);
    throw error;
  }
};

/**
 * 3. FUNGSI BACA (Reader)
 * Mengambil data profil orang tua kapan saja dibutuhkan (misal untuk narik data langganan).
 */
export const getParentProfile = async (): Promise<ParentProfile | null> => {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    const parentRef = doc(db, "parents", user.uid);
    const parentSnap = await getDoc(parentRef);

    if (parentSnap.exists()) {
      return parentSnap.data() as ParentProfile;
    }
    return null;
  } catch (error) {
    console.error("Gagal mengambil profil orang tua:", error);
    return null;
  }
};

/**
 * 🚨 FUNGSI LEGACY (ANTI-CRASH)
 * Menggantikan fungsi lama agar file useParentStore.ts yang masih pakai 
 * nama 'checkAndCreateParentProfile' tidak error. 
 * Sekarang fungsinya HANYA membaca, BUKAN membuat otomatis.
 */
export const checkAndCreateParentProfile = getParentProfile;