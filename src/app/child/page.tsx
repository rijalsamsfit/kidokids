"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import LockScreen from "@/components/LockScreen";
import { useScreenTime } from "@/hooks/useScreenTime";
import { useGameStore } from "@/store/useGameStore";
import { submitMissionProofInDB } from "@/lib/missionService";
import { auth, db } from "@/lib/firebase"; 
import { compressImage } from "@/utils/imageCompression";
import { Trophy, Coins, Star, Zap, CheckCircle, Target, Timer, RefreshCw, Camera, Loader2, AlertCircle } from "lucide-react"; 
import { onSnapshot, doc, collection, query, where } from "firebase/firestore";

export default function ChildDashboard() {
  // ✅ Pake cara standard: cukup ambil state-nya aja
  const { xp, level, coins } = useGameStore(); 
  const { isSleepMode, isTimeUp, formattedTime } = useScreenTime(30);

  const [mounted, setMounted] = useState(false);
  const [todayMissions, setTodayMissions] = useState<any[]>([]);
  const [cloudProfile, setCloudProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    let unsubProfile: any;
    let unsubMissions: any;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // ✅ 1. Listener Real-time untuk Profil
        unsubProfile = onSnapshot(doc(db, "children", user.uid), (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setCloudProfile(data);
            // ✅ Fix: Pakai setState biar gak error export
            useGameStore.setState({ xp: data.xp, level: data.level, coins: data.coins });
          }
        });

        // ✅ 2. Listener Real-time untuk Misi
        const q = query(collection(db, "missions"), where("userId", "==", user.uid));
        unsubMissions = onSnapshot(q, (snapshot) => {
          const missions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          missions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setTodayMissions(missions);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubProfile) unsubProfile();
      if (unsubMissions) unsubMissions();
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, missionId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(missionId);
    try {
      const compressedFile = await compressImage(file);
      await submitMissionProofInDB(missionId, compressedFile);
      alert("Bukti foto berhasil dikirim!");
    } catch (error) {
      console.error("Upload eror:", error);
      alert("Gagal mengunggah gambar bukti.");
    } finally {
      setUploadingId(null);
    }
  };

  if (!mounted || (isLoading && !cloudProfile)) {
    return <div className="min-h-screen bg-blue-50 flex items-center justify-center font-bold text-blue-500 animate-pulse">Menyiapkan Petualangan...</div>;
  }

  const currentLevelXP = (level - 1) * (level - 1) * 100;
  const nextLevelXP = level * level * 100;
  const xpProgress = mounted ? xp - currentLevelXP : 0;
  const xpRequired = nextLevelXP - currentLevelXP;
  const progressPercentage = Math.min(100, Math.max(0, (xpRequired > 0 ? (xpProgress / xpRequired) * 100 : 0)));

  return (
    // ... (sisa kodenya sama persis dengan yang kemarin) ...
    <div className="min-h-screen bg-blue-50 pb-24 font-sans relative">
      {isSleepMode && <LockScreen type="sleep" />}
      {!isSleepMode && isTimeUp && <LockScreen type="timeUp" />}

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
          <div className="flex items-center space-x-1 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <Timer className="w-4 h-4 text-slate-400" />
            <span className="font-extrabold text-slate-500 text-sm tracking-widest">{formattedTime}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-amber-100 px-3 py-1.5 rounded-full border border-amber-200 shadow-inner">
            <Coins className="w-5 h-5 text-amber-500" />
            <span className="font-extrabold text-amber-700">{coins}</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center justify-center bg-gradient-to-b from-blue-400 to-blue-600 rounded-[2.5rem] p-8 shadow-xl shadow-blue-200 relative overflow-hidden border-4 border-white">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-5 shadow-2xl border-4 border-blue-100">
            <div className="text-6xl drop-shadow-md">🦸‍♂️</div>
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-3 tracking-wide capitalize">
            {cloudProfile?.name || "Pahlawan"} Hebat!
          </h2>
          <div className="w-full bg-blue-950/20 rounded-full h-5 mb-2 p-1 backdrop-blur-md border border-white/20 shadow-inner relative">
            <div
              className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-blue-50 font-bold tracking-wide">
            {xp} / {nextLevelXP} XP menuju Level {level + 1}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center">
            <Target className="w-6 h-6 mr-2 text-rose-500" /> Misi Pahlawan Hari Ini
          </h3>
          <div className="space-y-3">
            {todayMissions.map((mission) => (
              <div key={mission.id} className="bg-white p-4 rounded-3xl border-2 border-slate-100 flex items-center justify-between">
                <p className="font-bold text-slate-700">{mission.title}</p>
                {mission.status === 'pending_approval' ? (
                  <span className="text-xs font-black bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full">Dicek Ortu</span>
                ) : (
                  <label className="w-10 h-10 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center cursor-pointer">
                    <Camera className="w-5 h-5 text-blue-500" />
                    <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFileChange(e, mission.id)} className="hidden" />
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
}