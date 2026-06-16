import { collection, addDoc, getDocs, doc, deleteDoc, query, where } from "firebase/firestore"; 
import { db, auth } from "./firebase"; 

// Nama koleksi di Firestore database
const rewardsCollection = collection(db, "rewards");

/**
 * 1. Fungsi untuk Orang Tua: Menyimpan Hadiah Baru ke Cloud
 */
export const addRewardToDB = async (title: string, cost: number) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Kamu belum login!");

    const docRef = await addDoc(rewardsCollection, {
      title,
      cost,
      createdAt: new Date().toISOString(),
      userId: user.uid // Diikat ke ID orang tua biar gak campur dengan pengguna lain
    });
    
    return { id: docRef.id, title, cost, userId: user.uid };
  } catch (error) {
    console.error("Gagal menyimpan hadiah ke Cloud: ", error);
    throw error;
  }
};

/**
 * 2. Fungsi Umum: Mengambil Semua Daftar Hadiah Milik Sendiri
 */
export const getRewardsFromDB = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return []; 

    const q = query(rewardsCollection, where("userId", "==", user.uid));
    const snapshot = await getDocs(q);
    
    const rewards = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Urutkan hadiah dari yang paling baru dibuat
    rewards.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return rewards;
  } catch (error) {
    console.error("Gagal mengambil data etalase hadiah: ", error);
    return [];
  }
};

/**
 * 3. Fungsi Opsional: Menghapus Hadiah dari Etalase Toko
 */
export const deleteRewardFromDB = async (rewardId: string) => {
  try {
    const rewardRef = doc(db, "rewards", rewardId);
    await deleteDoc(rewardRef);
    return true;
  } catch (error) {
    console.error("Gagal menghapus hadiah: ", error);
    return false;
  }
};