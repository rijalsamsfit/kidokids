import { collection, addDoc, getDocs, doc, updateDoc, query, where, increment } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // ✅ Tambahan untuk kelola berkas gambar
import { db, auth, storage } from "./firebase"; // ✅ Pastikan 'storage' sudah di-export di firebase.ts lu

const missionsCollection = collection(db, "missions");

/**
 * 1. Fungsi untuk Orang Tua: Mengirim Misi Baru ke Cloud
 */
export const addMissionToDB = async (title: string, xpReward: number, time: string) => {
  try {
    // Ambil ID unik pengguna yang sedang login
    const user = auth.currentUser;
    if (!user) throw new Error("Kamu belum login!");

    const docRef = await addDoc(missionsCollection, {
      title,
      xpReward,
      time,
      status: "pending",
      createdAt: new Date().toISOString(),
      // KUNCI RAHASIA: Misi ini sekarang diikat ke ID pengguna yang membuatnya
      userId: user.uid 
    });
    
    return { id: docRef.id, title, xpReward, time, status: "pending", userId: user.uid };
  } catch (error) {
    console.error("Gagal mengirim misi ke Cloud: ", error);
    throw error;
  }
};

/**
 * 2. Fungsi Umum: Mengambil Hanya Misi Milik Sendiri
 */
export const getMissionsFromDB = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return []; // Kalau belum login, jangan tampilkan apa-apa

    // FILTER: Minta ke Firebase hanya misi yang memiliki userId kita
    const q = query(missionsCollection, where("userId", "==", user.uid));
    const snapshot = await getDocs(q);
    
    const missions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Urutkan manual di sini supaya yang terbaru di atas 
    // (Menghindari error index rumit dari Firestore)
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
 * 🔥 4. BARU! Fungsi untuk Anak: Mengirim Bukti Foto & Mengubah Status jadi Pending Approval
 * Berkas gambar akan disimpan rapi di Firebase Storage folder 'proofs/ID_USER/ID_MISI.jpg'
 */
export const submitMissionProofInDB = async (missionId: string, imageFile: File) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Kamu belum login!");

    // A. Unggah berkas mentah/kompresi ke Firebase Storage
    const storageRef = ref(storage, `proofs/${user.uid}/${missionId}.jpg`);
    await uploadBytes(storageRef, imageFile);
    
    // B. Minta URL publik gambar dari Cloud Storage
    const downloadUrl = await getDownloadURL(storageRef);

    // C. Tempel URL foto dan ganti status misi di Firestore menjadi 'pending_approval'
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
 * 🔥 5. BARU! Fungsi untuk Orang Tua: Memberikan Ulasan Misi (Setuju / Tolak)
 * Jika disetujui, saldo XP dan Koin anak di cloud otomatis bertambah secara realtime!
 */
export const reviewMissionInDB = async (missionId: string, status: "approved" | "rejected", xpReward: number) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Kamu belum login!");

    const missionRef = doc(db, "missions", missionId);
    
    // A. Update status final peninjauan misi di Firestore
    await updateDoc(missionRef, {
      status: status,
      reviewedAt: new Date().toISOString()
    });

    // B. Jika disetujui orang tua, cairkan bonus XP dan Koin ke akun anak
    if (status === "approved") {
      const childRef = doc(db, "children", user.uid);
      const coinReward = Math.ceil(xpReward / 10); // Formulasi hadiah: 10 XP bernilai 1 Koin KIDO
      
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