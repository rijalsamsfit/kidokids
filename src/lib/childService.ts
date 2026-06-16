import { collection, addDoc, getDocs, doc, getDoc, updateDoc, query, where } from "firebase/firestore";
import { db, auth } from "./firebase";

/**
 * 1. Membuat Profil Anak Baru (Dipanggil oleh Orang Tua di Dasbor)
 * Sistem akan meng-generate ID unik untuk setiap anak.
 */
export const createChildProfile = async (name: string, pin: string) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Harus login sebagai orang tua");

    const childData = {
      name,
      pin, // PIN 4 digit rahasia untuk anak masuk
      level: 1,
      xp: 0,
      coins: 0,
      parentId: user.uid, // Diikat ke akun Google orang tuanya
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, "children"), childData);
    return { id: docRef.id, ...childData };
  } catch (error) {
    console.error("Gagal membuat profil anak:", error);
    throw error;
  }
};

/**
 * 2. Mengambil Semua Profil Anak Milik Satu Orang Tua
 * Dipakai di layar Pilih Anak dan Dasbor Orang Tua
 */
export const getChildrenProfiles = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return [];

    const q = query(collection(db, "children"), where("parentId", "==", user.uid));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Gagal mengambil daftar anak:", error);
    return [];
  }
};

/**
 * 3. Mengambil Satu Profil Anak Spesifik berdasarkan ID
 */
export const getChildProfileById = async (childId: string) => {
  try {
    const childRef = doc(db, "children", childId);
    const childSnap = await getDoc(childRef);

    if (childSnap.exists()) {
      return { id: childSnap.id, ...childSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Gagal mengambil profil anak spesifik:", error);
    return null;
  }
};

/**
 * 4. Mengupdate XP dan Level Anak
 * PARAMETER BARU: Wajib mengirim childId karena anak tidak punya auth.uid sendiri
 */
export const updateChildProgressInDB = async (childId: string, newXp: number, newLevel: number) => {
  try {
    // Kita tidak lagi mengecek auth.currentUser di sini karena anak main tanpa login Google
    if (!childId) throw new Error("ID Anak tidak valid");

    const childRef = doc(db, "children", childId);
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