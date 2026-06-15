import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "./firebase"; // Tarik koneksi Firebase

/**
 * 1. Mengambil data profil anak dari Cloud
 * Jika belum ada, otomatis buatkan profil baru agar tidak error.
 */
export const getChildProfile = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    // Kita gunakan ID pengguna (orang tua) sebagai kunci dokumen anaknya
    // Asumsi MVP V1: 1 Orang Tua = 1 Anak dulu biar simpel
    const childRef = doc(db, "children", user.uid);
    const childSnap = await getDoc(childRef);

    if (childSnap.exists()) {
      // Kalau data anak sudah ada, kembalikan datanya
      return childSnap.data();
    } else {
      // Kalau pengguna baru mendaftar dan belum punya data anak, buatkan default
      const defaultChild = {
        name: "Aisyah", // Nama default
        level: 1,
        xp: 0,
        coins: 0,
        parentId: user.uid,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(childRef, defaultChild);
      return defaultChild;
    }
  } catch (error) {
    console.error("Gagal mengambil profil anak:", error);
    return null;
  }
};

/**
 * 2. Mengupdate XP dan Level anak ke Cloud
 * Fungsi ini akan dipanggil oleh Area Anak saat misi selesai
 */
export const updateChildProgressInDB = async (newXp: number, newLevel: number) => {
  try {
    const user = auth.currentUser;
    if (!user) return false;

    const childRef = doc(db, "children", user.uid);
    await updateDoc(childRef, {
      xp: newXp,
      level: newLevel,
      lastActive: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error("Gagal update progress anak:", error);
    return false;
  }
};