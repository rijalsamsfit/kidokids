"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import { useGameStore } from "@/store/useGameStore";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { submitMissionProofInDB } from "@/lib/missionService";
import { compressImage } from "@/utils/imageCompression";
import { Target, CheckCircle, Clock, Camera, Loader2, Zap, AlertCircle, Sparkles, BookOpen } from "lucide-react";

export default function ChildMissions() {
  const router = useRouter();
  
  // ✅ 1. Tarik Guard dari Zustand
  const { activeChildId, activeChildName, hasHydrated } = useGameStore();

  const [mounted, setMounted] = useState(false);
  const [missions, setMissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  
  // State untuk Tab Aktif (Default ke 'tersedia')
  const [activeTab, setActiveTab] = useState<'tersedia' | 'menunggu' | 'selesai'>('tersedia');

  useEffect(() => {
    setMounted(true);
    
    // ✅ 2. GUARD: Tunggu Hydration
    if (!hasHydrated) return;

    // ✅ 3. GUARD: Cek ID Anak
    if (!activeChildId) {
      router.push("/child/login");
      return;
    }

    // ✅ 4. Listener Real-time Firebase
    const q = query(collection(db, "missions"), where("childId", "==", activeChildId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMissions: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Urutkan berdasarkan waktu dibuat (terbaru di atas)
      fetchedMissions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setMissions(fetchedMissions);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [activeChildId, router, hasHydrated]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, missionId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(missionId);
    try {
      const compressedFile = await compressImage(file);
      await submitMissionProofInDB(missionId, compressedFile);
      alert("Bukti foto berhasil dikirim! Tunggu Ayah/Bunda memeriksa ya! 🌟");
    } catch (error) {
      console.error("Upload eror:", error);
      alert("Gagal mengunggah gambar bukti. Pastikan koneksi internet lancar dan coba lagi.");
    } finally {
      setUploadingId(null);
    }
  };

  // ✅ 5. Filter Misi Berdasarkan Tab
  const filteredMissions = missions.filter((mission) => {
    if (activeTab === 'tersedia') {
      return mission.status === 'pending' || mission.status === 'rejected';
    } else if (activeTab === 'menunggu') {
      return mission.status === 'pending_approval';
    } else {
      return mission.status === 'approved' || mission.status === 'completed';
    }
  });

  // Tampilan Loading Aman
  if (!mounted || !hasHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
        <p className="font-bold text-rose-500 animate-pulse">Membuka Buku Jurnal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 relative font-sans">
      
      {/* HEADER BUKU MISI */}
      <div className="bg-rose-500 p-6 rounded-b-[2rem] shadow-md text-white relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-20">
          <BookOpen className="w-32 h-32" />
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-1 tracking-tight flex items-center gap-2">
            Jurnal Misi <Sparkles className="w-6 h-6 text-rose-200 fill-rose-200" />
          </h1>
          <p className="text-rose-100 text-sm font-bold">Catatan petualangan pahlawan {activeChildName}!</p>
        </div>

        {/* TAB NAVIGASI */}
        <div className="mt-6 flex bg-white/20 p-1.5 rounded-2xl border border-white/30 backdrop-blur-md relative z-10">
          <button 
            onClick={() => setActiveTab('tersedia')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'tersedia' ? "bg-white text-rose-600 shadow-sm" : "text-rose-100 hover:bg-white/10"
            }`}
          >
            Siap Beraksi
          </button>
          <button 
            onClick={() => setActiveTab('menunggu')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'menunggu' ? "bg-white text-amber-600 shadow-sm" : "text-rose-100 hover:bg-white/10"
            }`}
          >
            Dicek Ortu
          </button>
          <button 
            onClick={() => setActiveTab('selesai')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'selesai' ? "bg-white text-emerald-600 shadow-sm" : "text-rose-100 hover:bg-white/10"
            }`}
          >
            Selesai
          </button>
        </div>
      </div>

      {/* DAFTAR MISI */}
      <div className="p-6">
        <h2 className="text-base font-black text-slate-800 flex items-center space-x-2 mb-4">
          <Target className="w-5 h-5 text-rose-500" />
          <span>
            {activeTab === 'tersedia' ? "Misi yang Bisa Kamu Kerjakan" : 
             activeTab === 'menunggu' ? "Sedang Menunggu Persetujuan" : 
             "Misi yang Berhasil Diselesaikan"}
          </span>
        </h2>

        {filteredMissions.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center flex flex-col items-center mt-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Target className="w-10 h-10 text-slate-300" />
            </div>
            <p className="font-bold text-slate-600 text-lg">Kosong Nih!</p>
            <p className="text-sm text-slate-400 mt-2">
              {activeTab === 'tersedia' ? "Hore! Kamu sudah mengerjakan semua misi hari ini." : 
               activeTab === 'menunggu' ? "Belum ada misi yang sedang diperiksa oleh Ayah/Ibu." : 
               "Kamu belum menyelesaikan misi apapun. Yuk kerjakan sekarang!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMissions.map((mission) => {
              const isApproved = mission.status === 'approved';
              const isCompleted = mission.status === 'completed'; 
              const isDone = isApproved || isCompleted;
              const isPendingApproval = mission.status === 'pending_approval';
              const isRejected = mission.status === 'rejected';

              return (
                <div key={mission.id} className={`bg-white p-5 rounded-3xl border-2 shadow-sm flex items-center justify-between transition-all duration-300 ${
                  isDone ? 'border-emerald-200 opacity-80' : 
                  isRejected ? 'border-rose-200' : 
                  'border-slate-100 hover:border-rose-200 hover:shadow-md'
                }`}>
                  
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 transition-colors ${
                      isDone ? 'bg-emerald-50 border-emerald-100' : 
                      isRejected ? 'bg-rose-50 border-rose-100' : 
                      'bg-rose-50 border-rose-100'
                    }`}>
                      {isRejected ? (
                        <AlertCircle className="w-7 h-7 text-rose-500" />
                      ) : isDone ? (
                        <CheckCircle className="w-7 h-7 text-emerald-500" />
                      ) : (
                        <Zap className="w-7 h-7 text-rose-500" />
                      )}
                    </div>
                    <div>
                      <p className={`font-bold text-base leading-tight transition-colors mb-1 ${isDone ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                        {mission.title}
                      </p>
                      
                      {isRejected ? (
                        <p className="text-xs font-bold text-rose-500 bg-rose-50 inline-block px-2 py-1 rounded-md">Misi ditolak, yuk foto ulang!</p>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-extrabold ${isDone ? 'text-emerald-500' : 'text-amber-500'}`}>
                            +{mission.xpReward || mission.xp} XP
                          </span>
                          {/* Opsional: Jika misi ngasih koin langsung, tampilkan di sini */}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center pl-2">
                    {isPendingApproval ? (
                      <div className="flex flex-col items-center">
                        <Clock className="w-6 h-6 text-amber-500 mb-1 animate-pulse" />
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider text-center">Dicek<br/>Ortu</span>
                      </div>
                    ) : isDone ? (
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border-2 border-emerald-200">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                    ) : (
                      <label className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all shadow-sm cursor-pointer active:scale-90 relative ${
                        isRejected 
                        ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500' 
                        : 'bg-blue-50 border-blue-200 text-blue-500 hover:bg-blue-600 hover:text-white hover:border-blue-600'
                      }`}>
                        {uploadingId === mission.id ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <Camera className="w-5 h-5" />
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          capture="environment" 
                          onChange={(e) => handleFileChange(e, mission.id)}
                          disabled={uploadingId !== null}
                          className="hidden" 
                        />
                      </label>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
}