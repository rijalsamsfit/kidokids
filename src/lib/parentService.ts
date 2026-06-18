// src/lib/parentService.ts
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "./firebase";

// Mendefinisikan tipe data agar kodingan lu aman dari typo (TypeScript)
export interface ParentProfile {
  uid: string;
  email: string | null;
  name: string | null;
  subscriptionPlan: "basic" | "pro" | "lifetime";
  subscriptionExpiry: string | null; // Menyimpan batas waktu (null jika seumur hidup / basic)
  createdAt: string;
}

/**
 * 1. PENJAGA PINTU (Interceptor)
 * Mengecek apakah profil orang tua sudah ada di Firestore.
 * Jika belum (baru pertama kali login Google), otomatis buatkan profil kasta BASIC.
 */
export const checkAndCreateParentProfile = async (): Promise<ParentProfile | null> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Tidak ada user yang login");

    // Ngecek laci "parents" menggunakan UID Google si user
    const parentRef = doc(db, "parents", user.uid);
    const parentSnap = await getDoc(parentRef);

    if (parentSnap.exists()) {
      // Profil sudah ada, langsung kembalikan datanya
      return parentSnap.data() as ParentProfile;
    } else {
      // Profil BELUM ada. Saatnya buatkan kasta "basic"
      const newParentProfile: ParentProfile = {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        subscriptionPlan: "basic",
        subscriptionExpiry: null,
        createdAt: new Date().toISOString(),
      };

      // Simpan ke Firestore
      await setDoc(parentRef, newParentProfile);
      return newParentProfile;
    }
  } catch (error) {
    console.error("Gagal mengecek/membuat profil orang tua:", error);
    return null;
  }
};

/**
 * 2. FUNGSI BACA (Reader)
 * Mengambil data profil orang tua kapan saja dibutuhkan (misal untuk cek status gembok).
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