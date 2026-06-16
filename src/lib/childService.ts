import { collection, addDoc, getDocs, doc, getDoc, updateDoc, query, where } from "firebase/firestore";
import { db, auth } from "./firebase";

/**
 * 1. Membuat Profil Anak Baru 
 * ✅ Update: Menambahkan field default untuk Jam Tidur & Limit Layar
 */
export const createChildProfile = async (name: string, pin: string) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Harus login sebagai orang tua");

    const childData = {
      name,
      pin, 
      level: 1,
      xp: 0,
      coins: 0,
      sleepTime: "21:00",      // Default Jam Tidur
      screenTimeLimit: 60,     // Default Limit Main (menit)
      parentId: user.uid, 
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
 * 3. Mengambil Satu Profil Anak Spesifik
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
    console.error("Gagal mengambil profil anak:", error);
    return null;
  }
};

/**
 * 4. Update XP dan Level (Sistem Game)
 */
export const updateChildProgressInDB = async (childId: string, newXp: number, newLevel: number) => {
  try {
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

/**
 * 5. BARU: Update PIN Anak
 * Wajib mengecek apakah user yang login adalah parent sebelum bisa ubah PIN
 */
export const updateChildPin = async (childId: string, newPin: string) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Harus login sebagai orang tua");

    const childRef = doc(db, "children", childId);
    await updateDoc(childRef, { pin: newPin });
    return true;
  } catch (error) {
    console.error("Gagal update PIN:", error);
    return false;
  }
};

/**
 * 6. BARU: Update Pengaturan (Jam Tidur & Limit)
 */
export const updateChildSettings = async (childId: string, settings: { sleepTime?: string, screenTimeLimit?: number }) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Harus login sebagai orang tua");

    const childRef = doc(db, "children", childId);
    await updateDoc(childRef, settings);
    return true;
  } catch (error) {
    console.error("Gagal update pengaturan anak:", error);
    return false;
  }
};