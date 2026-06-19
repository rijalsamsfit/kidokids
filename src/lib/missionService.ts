import { collection, addDoc, getDocs, doc, updateDoc, query, where, getDoc } from "firebase/firestore"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; 
import { db, auth, storage } from "./firebase"; 

const missionsCollection = collection(db, "missions");
const favoriteMissionsCollection = collection(db, "favorite_missions");

/**
 * 1. Fungsi untuk Orang Tua: Mengirim Misi Baru ke Cloud & Simpan Favorit
 */
export const addMissionToDB = async (title: string, xpReward: number, time: string, isFavorite: boolean = false, childId: string) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Kamu belum login!");
    if (!childId) throw new Error("ID Anak tidak valid!");

    const docRef = await addDoc(missionsCollection, {
      title,
      xpReward,
      time,
      status: "pending",
      createdAt: new Date().toISOString(),
      userId: user.uid, 
      childId: childId  
    });
    
    if (isFavorite) {
      await addDoc(favoriteMissionsCollection, {
        title,
        xpReward,
        time,
        userId: user.uid, 
        createdAt: new Date().toISOString()
      });
    }

    return { id: docRef.id, title, xpReward, time, status: "pending", userId: user.uid, childId };
  } catch (error) {
    console.error("Gagal mengirim misi ke Cloud: ", error);
    throw error;
  }
};

/**
 * 🌟 Mengambil Daftar Misi Favorit/Template Custom
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
    
    favorites.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return favorites;
  } catch (error) {
    console.error("Gagal mengambil data misi favorit: ", error);
    return [];
  }
};

/**
 * 2. ✅ DIUPDATE: Mengambil Misi Milik Sendiri (Bisa difilter per Anak)
 */
export const getMissionsFromDB = async (childId?: string) => {
  try {
    const user = auth.currentUser;
    if (!user) return []; 

    // Jika childId dikirim, tarik misi spesifik untuk anak itu saja
    // Jika tidak, tarik semua misi untuk ortu tersebut (berguna untuk halaman Manage All Missions)
    let q;
    if (childId) {
      q = query(missionsCollection, where("userId", "==", user.uid), where("childId", "==", childId));
    } else {
      q = query(missionsCollection, where("userId", "==", user.uid));
    }

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
    const storageRef = ref(storage, `proofs/${missionId}-${Date.now()}.jpg`);
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
 * 5. ✅ DIUPDATE: Memberikan Ulasan Misi dan Menyalaikan Mesin Level Anak
 */
export const reviewMissionInDB = async (missionId: string, status: "approved" | "rejected", xpReward: number) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Kamu belum login!");

    const missionRef = doc(db, "missions", missionId);
    const missionSnap = await getDoc(missionRef); 
    
    if (!missionSnap.exists()) throw new Error("Misi tidak ditemukan");
    
    const missionData = missionSnap.data();
    const childUserId = missionData.childId || missionData.userId; 

    // Update status misinya dulu
    await updateDoc(missionRef, {
      status: status,
      reviewedAt: new Date().toISOString()
    });

    // ⚡ LOGIKA MESIN XP, KOIN, DAN LEVEL AKTIF JIKA DISETUJUI
    if (status === "approved") {
      const childRef = doc(db, "children", childUserId); 
      const childSnap = await getDoc(childRef); 

      if (childSnap.exists()) {
        const childData = childSnap.data();
        
        // Ekstrak data saat ini
        let currentXp = childData.xp || 0;
        let currentLevel = childData.level || 1;
        let currentCoins = childData.coins || 0;
        let currentMissionsCompleted = childData.missionsCompleted || 0;
        let currentBadges: string[] = childData.unlockedBadges || [];

        // Kalkulasi tambahan hadiah
        const coinReward = Math.ceil(xpReward / 10);
        let newXp = currentXp + xpReward;
        let newCoins = currentCoins + coinReward;
        let newMissionsCompleted = currentMissionsCompleted + 1;
        let newBadges = [...currentBadges];
        let newLevel = currentLevel;

        // 🚀 MESIN NAIK LEVEL: Cek apakah newXp melampaui batas level berikutnya (Level * Level * 100)
        while (newXp >= newLevel * newLevel * 100) {
          newLevel++;
        }

        // 🏆 MESIN BADGE: Logika otomatis membuka trofi
        if (newMissionsCompleted >= 1 && !newBadges.includes("badge_pemula")) newBadges.push("badge_pemula");
        if (newMissionsCompleted >= 5 && !newBadges.includes("badge_rajin")) newBadges.push("badge_rajin");
        if (newMissionsCompleted >= 10 && !newBadges.includes("badge_sapu_emas")) newBadges.push("badge_sapu_emas");
        if (newMissionsCompleted >= 30 && !newBadges.includes("badge_pahlawan_super")) newBadges.push("badge_pahlawan_super");

        // Simpan hasil hitungan mesin kembali ke Firestore
        await updateDoc(childRef, {
          xp: newXp,
          level: newLevel,
          coins: newCoins,
          missionsCompleted: newMissionsCompleted,
          unlockedBadges: newBadges 
        });
      }
    }

    return true;
  } catch (error) {
    console.error("Gagal memproses penilaian misi oleh orang tua:", error);
    throw error;
  }
};