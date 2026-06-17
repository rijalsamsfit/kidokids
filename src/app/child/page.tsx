"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import LockScreen from "@/components/LockScreen";
import { useScreenTime } from "@/hooks/useScreenTime";
import { useGameStore } from "@/store/useGameStore";
import { db } from "@/lib/firebase"; 
import { Trophy, Coins, Star, Zap, Timer, Loader2, LogOut, Gamepad2, Sparkles } from "lucide-react"; 
import { onSnapshot, doc, collection, query, where } from "firebase/firestore";

export default function ChildDashboard() {
  const router = useRouter();
  
  const { activeChildId, activeChildName, xp, level, coins, hasHydrated, clearActiveChild } = useGameStore(); 
  const { isSleepMode, isTimeUp, formattedTime, grantBonusTime } = useScreenTime(30);

  const [mounted, setMounted] = useState(false);
  const [cloudProfile, setCloudProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
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

    // Tetap pantau misi HANYA untuk ngasih Pop-Up Bonus Waktu kalau di-approve ortu
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
      setIsLoading(false);
    });

    return () => {
      if (unsubProfile) unsubProfile();
      if (unsubMissions) unsubMissions();
    };
  }, [activeChildId, router, grantBonusTime, hasHydrated]); 

  // Fungsi untuk Ganti Akun/Logout
  const handleLogout = () => {
    if (window.confirm("Apakah kamu ingin keluar dan ganti Pahlawan?")) {
      clearActiveChild(); 
      router.push("/child/login"); 
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

      {/* ✅ PERBAIKAN HEADER: Memaksa Screen Time Muncul di HP */}
      <div className="bg-white p-4 rounded-b-3xl shadow-sm sticky top-0 z-10">
        <div className="flex flex-col gap-3">
          {/* Baris Atas: Level & Tombol Logout */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-xl">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Level Kamu</p>
                <p className="text-xl font-extrabold text-blue-700 leading-none">Level {level}</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center w-10 h-10 bg-rose-50 text-rose-500 rounded-full border border-rose-100 hover:bg-rose-500 hover:text-white transition-colors shadow-sm active:scale-90"
              title="Ganti Pahlawan"
            >
              <LogOut className="w-5 h-5 ml-1" />
            </button>
          </div>

          {/* Baris Bawah: Waktu & Koin (Pasti muncul di HP) */}
          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm flex-1 mr-2 justify-center">
              <Timer className="w-4 h-4 text-slate-400" />
              <span className="font-extrabold text-slate-600 text-sm tracking-widest">{formattedTime}</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-amber-100 px-4 py-1.5 rounded-full border border-amber-200 shadow-inner">
              <Coins className="w-5 h-5 text-amber-500" />
              <span className="font-extrabold text-amber-700">{coins}</span>
            </div>
          </div>
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

        {/* UI BARU: ARENA BERMAIN (Menggantikan Daftar Misi) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-[2rem] border-2 border-indigo-100 shadow-sm">
          <div className="absolute -top-4 -right-4 text-purple-200 opacity-50">
            <Sparkles className="w-24 h-24" />
          </div>

          <div className="flex flex-col items-center text-center relative z-10">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mb-4 border border-indigo-50">
              <Gamepad2 className="w-8 h-8 text-indigo-500 animate-pulse" />
            </div>
            
            <h3 className="text-xl font-extrabold text-indigo-950 mb-2">Arena Bermain</h3>
            <p className="text-sm font-bold text-indigo-600/80 leading-relaxed mb-4">
              Ratusan mini-game seru sedang disiapkan. Kumpulkan Koin yang banyak dari tugas misi sekarang biar nanti bisa main sepuasnya!
            </p>

            <div className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-200">
              <span>Segera Hadir</span>
              <Sparkles className="w-4 h-4" />
            </div>
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