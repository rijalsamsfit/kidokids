import { collection, addDoc, getDocs, doc, updateDoc, query, where, increment, getDoc } from "firebase/firestore"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; 
import { db, auth, storage } from "./firebase"; 

const missionsCollection = collection(db, "missions");
// ✅ Koleksi baru khusus untuk nyimpen template misi buatan ortu
const favoriteMissionsCollection = collection(db, "favorite_missions");

/**
 * 1. Fungsi untuk Orang Tua: Mengirim Misi Baru ke Cloud & Simpan Favorit
 */
export const addMissionToDB = async (title: string, xpReward: number, time: string, isFavorite: boolean = false) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Kamu belum login!");

    // A. Simpan misi sebagai tugas harian anak
    const docRef = await addDoc(missionsCollection, {
      title,
      xpReward,
      time,
      status: "pending",
      createdAt: new Date().toISOString(),
      userId: user.uid 
    });
    
    // B. ✅ LOGIKA BARU: Kalau ibu nge-centang "Simpan sebagai Template"
    if (isFavorite) {
      await addDoc(favoriteMissionsCollection, {
        title,
        xpReward,
        time,
        userId: user.uid, // Diikat ke ID ortu/anak biar gak kecampur sama user lain
        createdAt: new Date().toISOString()
      });
    }

    return { id: docRef.id, title, xpReward, time, status: "pending", userId: user.uid };
  } catch (error) {
    console.error("Gagal mengirim misi ke Cloud: ", error);
    throw error;
  }
};

/**
 * 🌟 FUNGSI BARU: Mengambil Daftar Misi Favorit/Template Custom
 */
export const getFavoriteMissionsFromDB = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return [];

    const q = query(favoriteMissionsCollection, where("userId", "==", user.uid));
    const snapshot = await getDocs(q);
    
    const favorites = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Urutkan dari yang terbaru disimpan
    favorites.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return favorites;
  } catch (error) {
    console.error("Gagal mengambil data misi favorit: ", error);
    return [];
  }
};

/**
 * 2. Fungsi Umum: Mengambil Hanya Misi Milik Sendiri
 */
export const getMissionsFromDB = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return []; 

    const q = query(missionsCollection, where("userId", "==", user.uid));
    const snapshot = await getDocs(q);
    
    const missions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    missions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return missions;
  } catch (error) {
    console.error("Gagal mengambil data misi: ", error);
    return [];
  }
};

/**
 * 3. Fungsi untuk Anak: Menandai Misi Telah Selesai (Langsung Tanpa Foto)
 */
export const completeMissionInDB = async (missionId: string) => {
  try {
    const missionRef = doc(db, "missions", missionId);
    
    await updateDoc(missionRef, {
      status: "completed",
      completedAt: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error("Gagal update status misi: ", error);
    return false;
  }
};

/**
 * 4. Fungsi untuk Anak: Mengirim Bukti Foto & Mengubah Status jadi Pending Approval
 */
export const submitMissionProofInDB = async (missionId: string, imageFile: File) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Kamu belum login!");

    const storageRef = ref(storage, `proofs/${user.uid}/${missionId}.jpg`);
    await uploadBytes(storageRef, imageFile);
    
    const downloadUrl = await getDownloadURL(storageRef);

    const missionRef = doc(db, "missions", missionId);
    await updateDoc(missionRef, {
      status: "pending_approval",
      proofImgUrl: downloadUrl,
      updatedAt: new Date().toISOString()
    });

    return downloadUrl;
  } catch (error) {
    console.error("Gagal mengunggah bukti foto misi:", error);
    throw error;
  }
};

/**
 * 5. Fungsi untuk Orang Tua: Memberikan Ulasan Misi
 */
export const reviewMissionInDB = async (missionId: string, status: "approved" | "rejected", xpReward: number) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Kamu belum login!");

    const missionRef = doc(db, "missions", missionId);
    const missionSnap = await getDoc(missionRef); 
    
    if (!missionSnap.exists()) throw new Error("Misi tidak ditemukan");
    
    const missionData = missionSnap.data();
    const childUserId = missionData.userId; 

    await updateDoc(missionRef, {
      status: status,
      reviewedAt: new Date().toISOString()
    });

    if (status === "approved") {
      const childRef = doc(db, "children", childUserId); 
      const coinReward = Math.ceil(xpReward / 10);
      
      await updateDoc(childRef, {
        xp: increment(xpReward),
        coins: increment(coinReward)
      });
    }

    return true;
  } catch (error) {
    console.error("Gagal memproses penilaian misi oleh orang tua:", error);
    throw error;
  }
};