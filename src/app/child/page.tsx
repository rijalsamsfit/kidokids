"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import LockScreen from "@/components/LockScreen";
import { useScreenTime } from "@/hooks/useScreenTime";
import { useGameStore } from "@/store/useGameStore";
import { submitMissionProofInDB } from "@/lib/missionService";
import { db } from "@/lib/firebase"; 
import { compressImage } from "@/utils/imageCompression";
// ✅ TAMBAHAN: Import ikon LogOut
import { Trophy, Coins, Star, Zap, CheckCircle, Target, Timer, Camera, Loader2, AlertCircle, LogOut } from "lucide-react"; 
import { onSnapshot, doc, collection, query, where } from "firebase/firestore";

export default function ChildDashboard() {
  const router = useRouter();
  
  // ✅ TAMBAHAN: Tarik fungsi clearActiveChild dari Zustand
  const { activeChildId, activeChildName, xp, level, coins, hasHydrated, unlockedBadges, clearActiveChild } = useGameStore(); 
  
  const { isSleepMode, isTimeUp, formattedTime, grantBonusTime } = useScreenTime(30);

  const [mounted, setMounted] = useState(false);
  const [todayMissions, setTodayMissions] = useState<any[]>([]);
  const [cloudProfile, setCloudProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [showBadgeAlert, setShowBadgeAlert] = useState(false);

  const prevMissionsRef = useRef<any[]>([]);
  const prevBadgesRef = useRef<string[] | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // GUARD 1: Tunggu sampai Zustand selesai hidratasi
    if (!hasHydrated) return;

    // GUARD 2: Kalau udah hidratasi tapi gak ada ID, tendang ke login
    if (!activeChildId) {
      router.push("/child/login");
      return;
    }

    // GUARD 3: Kalau sampai di sini, berarti udah aman. Baru jalankan Firebase!
    let unsubProfile: any;
    let unsubMissions: any;

    unsubProfile = onSnapshot(doc(db, "children", activeChildId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCloudProfile(data);

        const currentBadges = data.unlockedBadges || [];

        if (prevBadgesRef.current !== null) {
          if (currentBadges.length > prevBadgesRef.current.length) {
            setShowBadgeAlert(true); 
          }
        }
        prevBadgesRef.current = currentBadges;

        useGameStore.setState({ 
          xp: data.xp, 
          level: data.level, 
          coins: data.coins,
          missionsCompleted: data.missionsCompleted || 0,
          unlockedBadges: currentBadges
        });
      }
    });

    const q = query(collection(db, "missions"), where("childId", "==", activeChildId));
    unsubMissions = onSnapshot(q, (snapshot) => {
      const missions: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (prevMissionsRef.current.length > 0) {
        missions.forEach(mission => {
          const prevMission = prevMissionsRef.current.find(m => m.id === mission.id);
          
          if (prevMission && prevMission.status !== 'approved' && mission.status === 'approved') {
            grantBonusTime(10);
            alert(`Hore! Bukti misimu "${mission.title}" disetujui! Waktu mainmu ditambah 10 Menit! 🎉`);
          }
        });
      }
      
      prevMissionsRef.current = missions;

      missions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTodayMissions(missions);
      setIsLoading(false);
    });

    return () => {
      if (unsubProfile) unsubProfile();
      if (unsubMissions) unsubMissions();
    };
  }, [activeChildId, router, grantBonusTime, hasHydrated]); 

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

  // ✅ TAMBAHAN: Fungsi untuk Ganti Akun/Logout
  const handleLogout = () => {
    if (window.confirm("Apakah kamu ingin keluar dan ganti Pahlawan?")) {
      clearActiveChild(); // Hapus sesi dari Zustand
      router.push("/child/login"); // Lempar balik ke layar PIN
    }
  };

  if (!mounted || !hasHydrated || (isLoading && !cloudProfile)) {
    return (
      <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="font-bold text-blue-500 animate-pulse">Menyiapkan Petualangan...</p>
      </div>
    );
  }

  const currentLevelXP = (level - 1) * (level - 1) * 100;
  const nextLevelXP = level * level * 100;
  const xpProgress = mounted ? xp - currentLevelXP : 0;
  const xpRequired = nextLevelXP - currentLevelXP;
  const progressPercentage = Math.min(100, Math.max(0, (xpRequired > 0 ? (xpProgress / xpRequired) * 100 : 0)));

  return (
    <div className="min-h-screen bg-blue-50 pb-24 font-sans relative">
      
      {isSleepMode && <LockScreen type="sleep" />}
      {!isSleepMode && isTimeUp && <LockScreen type="timeUp" />}

      {/* Header Status Bar */}
      <div className="bg-white p-4 rounded-b-3xl shadow-sm flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-xl">
            <Trophy className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Level Kamu</p>
            <p className="text-xl font-extrabold text-blue-700 leading-none">Level {level}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 hidden sm:flex">
            <Timer className="w-4 h-4 text-slate-400" />
            <span className="font-extrabold text-slate-500 text-sm tracking-widest">{formattedTime}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-amber-100 px-3 py-1.5 rounded-full border border-amber-200 shadow-inner">
            <Coins className="w-5 h-5 text-amber-500" />
            <span className="font-extrabold text-amber-700">{coins}</span>
          </div>
          
          {/* ✅ TAMBAHAN: Tombol Ganti Pahlawan */}
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center w-10 h-10 bg-rose-50 text-rose-500 rounded-full border border-rose-100 hover:bg-rose-500 hover:text-white transition-colors shadow-sm ml-1 active:scale-90"
            title="Ganti Pahlawan"
          >
            <LogOut className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Visualisasi Avatar / Pahlawan */}
        <div className="flex flex-col items-center justify-center bg-gradient-to-b from-blue-400 to-blue-600 rounded-[2.5rem] p-8 shadow-xl shadow-blue-200 relative overflow-hidden border-4 border-white">
          <div className="absolute top-4 left-4 animate-pulse"><Star className="w-6 h-6 text-white/50" /></div>
          <div className="absolute bottom-10 right-6 animate-pulse delay-150"><Star className="w-8 h-8 text-white/40" /></div>

          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-5 shadow-2xl border-4 border-blue-100 relative transform transition-transform hover:scale-105">
            <div className="text-6xl drop-shadow-md">🦸‍♂️</div>
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-white font-bold p-2.5 rounded-full border-4 border-white shadow-lg animate-bounce">
              <Zap className="w-5 h-5 fill-white" />
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-white mb-3 tracking-wide drop-shadow-sm capitalize">
            {activeChildName || "Pahlawan"} Hebat!
          </h2>

          <div className="w-full bg-blue-950/20 rounded-full h-5 mb-2 p-1 backdrop-blur-md border border-white/20 shadow-inner relative">
            <div
              className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 h-full rounded-full transition-all duration-1000 ease-out relative shadow-sm"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute right-1 top-1 bottom-1 w-2 bg-white/50 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-xs text-blue-50 font-bold tracking-wide">
            {xp} / {nextLevelXP} XP menuju Level {level + 1}
          </p>
        </div>

        {/* Daftar Misi Hari Ini */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center">
              <Target className="w-6 h-6 mr-2 text-rose-500" />
              Misi Pahlawan Hari Ini
            </h3>
          </div>
          
          <div className="space-y-3">
            {todayMissions.length === 0 && !isLoading && (
              <p className="text-center text-slate-400 text-sm py-4 bg-white rounded-3xl border-2 border-slate-100">Belum ada misi hari ini. Hore istirahat!</p>
            )}

            {todayMissions.map((mission) => {
              const isApproved = mission.status === 'approved';
              const isCompleted = mission.status === 'completed'; 
              const isDone = isApproved || isCompleted;
              const isPendingApproval = mission.status === 'pending_approval';
              const isRejected = mission.status === 'rejected';

              return (
                <div key={mission.id} className={`bg-white p-4 rounded-3xl border-2 shadow-sm flex items-center justify-between transition-all duration-300 ${isDone ? 'border-emerald-200 opacity-70' : isRejected ? 'border-rose-200' : 'border-slate-100'}`}>
                  
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors ${
                      isDone ? 'bg-emerald-50 border-emerald-100' : 
                      isRejected ? 'bg-rose-50 border-rose-100' : 
                      'bg-blue-50 border-blue-100'
                    }`}>
                      {isRejected ? (
                        <AlertCircle className="w-7 h-7 text-rose-500" />
                      ) : (
                        <Zap className={`w-7 h-7 ${isDone ? 'text-emerald-400' : 'text-blue-500'}`} />
                      )}
                    </div>
                    <div>
                      <p className={`font-bold text-[15px] leading-tight transition-colors ${isDone ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                        {mission.title}
                      </p>
                      
                      {isRejected ? (
                        <p className="text-xs font-bold mt-1 text-rose-500">Misi ditolak, foto ulang!</p>
                      ) : (
                        <p className={`text-sm font-extrabold mt-1 ${isDone ? 'text-emerald-500' : 'text-amber-500'}`}>
                          +{mission.xpReward || mission.xp} XP
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {isPendingApproval ? (
                      <span className="text-xs font-black bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full animate-pulse">
                        Dicek Ortu
                      </span>
                    ) : isDone ? (
                      <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-emerald-500">
                        <CheckCircle className="w-7 h-7" />
                      </div>
                    ) : (
                      <label className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all shadow-sm cursor-pointer active:scale-90 relative ${
                        isRejected 
                        ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500' 
                        : 'bg-blue-50 border-blue-200 text-blue-500 hover:bg-blue-500 hover:text-white hover:border-blue-500'
                      }`}>
                        {uploadingId === mission.id ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <Camera className="w-6 h-6" />
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
        </div>

      </div>

      <Navigation />

      {/* POP-UP SELEBRASI BADGE BARU */}
      {showBadgeAlert && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-gradient-to-b from-yellow-300 to-amber-500 p-1 rounded-3xl animate-bounce shadow-[0_0_40px_rgba(250,204,21,0.6)]">
            <div className="bg-white p-8 rounded-3xl flex flex-col items-center text-center max-w-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-100/50 to-transparent"></div>
              
              <div className="text-7xl mb-4 relative z-10 drop-shadow-xl">🏆</div>
              <h2 className="text-2xl font-black text-slate-800 mb-2 relative z-10">PENCAPAIAN BARU!</h2>
              <p className="text-slate-600 font-bold mb-6 relative z-10">Luar biasa! Kamu baru saja membuka Badge baru di Lemari Trofimu!</p>
              
              <button
                onClick={() => {
                  setShowBadgeAlert(false);
                  router.push("/child/badges"); 
                }}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-3.5 rounded-xl active:scale-95 transition-transform shadow-lg relative z-10"
              >
                Cek Lemari Trofi!
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}