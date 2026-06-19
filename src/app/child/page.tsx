"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import LockScreen from "@/components/LockScreen";
import { useScreenTime } from "@/hooks/useScreenTime";
import { useGameStore } from "@/store/useGameStore";
import { db } from "@/lib/firebase"; 
import { Trophy, Coins, Star, Zap, Timer, Loader2, LogOut, Gamepad2, Sparkles, Flame, Play, Edit3, X, Crown, Camera } from "lucide-react"; 
import { onSnapshot, doc, collection, query, where, updateDoc } from "firebase/firestore";

// IMPORT PABRIK POP-UP KIDO
import { useModalStore } from "@/store/useModalStore";

export default function ChildDashboard() {
  const router = useRouter();
  
  const { activeChildId, activeChildName, xp, level, coins, hasHydrated, clearActiveChild, parentPlan } = useGameStore(); 
  const { isSleepMode, isTimeUp, formattedTime, grantBonusTime } = useScreenTime(30);

  // AMBIL FUNGSI CUSTOM ALERT & CONFIRM
  const { showAlert, showConfirm } = useModalStore();

  const [mounted, setMounted] = useState(false);
  const [cloudProfile, setCloudProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBadgeAlert, setShowBadgeAlert] = useState(false);
  
  // ✅ 1. STATE UNTUK MODAL EDIT ANAK & FORM NAMA
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const prevMissionsRef = useRef<any[]>([]);
  const prevBadgesRef = useRef<string[] | null>(null);

  useEffect(() => {
    setMounted(true);
    
    if (!hasHydrated) return;

    if (!activeChildId) {
      router.replace("/profiles");
      return;
    }

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
          activeChildName: data.name, // Otomatis update nama di Zustand kalau diubah
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
            showAlert(
              "Misi Disetujui! 🌟", 
              `Hore! Bukti misimu "${mission.title}" disetujui! Waktu mainmu ditambah 10 Menit! 🎉`
            );
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
  }, [activeChildId, router, grantBonusTime, hasHydrated, showAlert]); 

  const handleLogout = () => {
    showConfirm(
      "Ganti Pahlawan? 🦸‍♂️",
      "Apakah kamu ingin keluar dan ganti Pahlawan?",
      () => {
        clearActiveChild(); 
        router.replace("/profiles"); 
      },
      "Ya, Keluar",
      "Batal"
    );
  };

  // ✅ 2. FUNGSI UNTUK MEMBUKA MODAL EDIT
  const handleOpenEditModal = () => {
    setEditName(activeChildName || "");
    setIsEditModalOpen(true);
  };

  // ✅ 3. FUNGSI UNTUK MENYIMPAN NAMA BARU
  const handleSaveName = async () => {
    if (!editName.trim() || !activeChildId) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "children", activeChildId), {
        name: editName.trim()
      });
      showAlert("Mantap! 🌟", "Nama panggilan barumu berhasil disimpan!");
      setIsEditModalOpen(false);
    } catch (error) {
      showAlert("Gagal", "Duh, gagal menyimpan nama. Coba lagi nanti ya.");
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ 4. STRATEGI PESTER POWER VIP
  const handlePhotoClick = () => {
    // Kalau kasta Ortu yang dititipkan adalah 'basic'
    if (parentPlan === "basic") {
      showAlert(
        "Khusus VIP! 👑", 
        "Wah, fitur Ganti Foto Wajah hanya untuk Pahlawan VIP. Kasih tahu Ayah/Bunda buat buka kuncinya ya!"
      );
    } else {
      // Jika VIP, anak diarahkan untuk minta tolong Ortu lewat Dasbor mereka
      // Karena agak ribet ngatur upload file lewat HP anak langsung,
      // kita alihkan "Beban Kerja" ini ke Ortu.
      showAlert(
        "Ganti Foto Wajah 📸", 
        "Pahlawan VIP! Minta tolong Ayah/Bunda untuk memilihkan dan mengganti fotomu dari aplikasi mereka ya!"
      );
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
    <div className="h-[100dvh] bg-blue-50 font-sans relative flex flex-col overflow-hidden pb-24">
      
      {/* TOP HUD: Fixed at the top */}
      <div className="flex-none bg-white p-4 rounded-b-3xl shadow-sm z-10 relative">
        <div className="flex flex-col gap-3">
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

      {/* CENTER STAGE */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-6">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="flex flex-col items-center justify-center bg-gradient-to-b from-blue-400 to-blue-600 rounded-[2.5rem] p-8 shadow-xl shadow-blue-200 relative overflow-hidden border-4 border-white w-full max-w-sm">
          <div className="absolute top-4 left-4 animate-pulse"><Star className="w-6 h-6 text-white/50" /></div>
          <div className="absolute bottom-10 right-6 animate-pulse delay-150"><Star className="w-8 h-8 text-white/40" /></div>

          {/* ✅ 5. AVATAR YANG BISA DI-KLIK UNTUK MEMBUKA MODAL EDIT */}
          <div 
            onClick={handleOpenEditModal}
            className="relative mb-5 transform transition-transform hover:scale-105 active:scale-95 cursor-pointer group"
          >
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-blue-100 overflow-hidden relative">
              {cloudProfile?.photoUrl ? (
                <img src={cloudProfile.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="text-6xl drop-shadow-md">🦸‍♂️</div>
              )}
              {/* Overlay Tipis pas Hover biar sadar bisa diklik */}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit3 className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-white font-bold p-2.5 rounded-full border-4 border-white shadow-lg animate-bounce">
              <Zap className="w-5 h-5 fill-white" />
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-white mb-3 tracking-wide drop-shadow-sm capitalize text-center cursor-pointer hover:text-blue-100 transition-colors" onClick={handleOpenEditModal}>
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
      </div>

      {/* BOTTOM PORTAL */}
      <div className="flex-none px-6 z-10 w-full max-w-md mx-auto">
        <div className="mb-4 text-center">
          <p className="text-[13px] font-bold text-blue-600/80 flex items-center justify-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500" />
            Selesaikan misi harian untuk main sepuasnya!
          </p>
        </div>

        <button 
          onClick={() => router.push("/child/games")}
          className="w-full bg-indigo-500 hover:bg-indigo-400 text-white border-b-4 border-indigo-700 active:border-b-0 active:translate-y-1 rounded-[1.5rem] p-4 flex items-center justify-between transition-all shadow-lg shadow-indigo-200"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Gamepad2 className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-black tracking-wide leading-none mb-1">ARENA BERMAIN</h3>
              <p className="text-[11px] font-bold text-indigo-100 uppercase tracking-wider">Masuk ke Dunia Kido</p>
            </div>
          </div>
          <div className="w-10 h-10 bg-indigo-400 rounded-full flex items-center justify-center shadow-inner">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </button>
      </div>

      <Navigation />

      {/* ========================================= */}
      {/* 🔮 MODAL EDIT PROFIL KHUSUS ANAK 🔮 */}
      {/* ========================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xl text-slate-800">Edit Pahlawan</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            
            <div className="space-y-6">
              {/* TOMBOL GANTI FOTO (UMPAN PESTER POWER) */}
              <button 
                onClick={handlePhotoClick}
                className="w-full bg-blue-50 border-2 border-blue-100 hover:border-blue-300 p-4 rounded-2xl flex items-center justify-between transition-colors active:scale-95 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-600">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-blue-800 text-sm">Ganti Foto Wajah</p>
                    <p className="text-[10px] font-bold text-blue-500">Minta tolong Ayah/Bunda</p>
                  </div>
                </div>
                {parentPlan === "basic" && (
                   <Crown className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                )}
              </button>

              {/* INPUT GANTI NAMA */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nama Panggilan Barumu</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-xl text-slate-800 text-center outline-none focus:border-blue-500 focus:bg-white transition-all capitalize" 
                  placeholder="Ketik namamu..."
                  maxLength={12}
                />
              </div>

              {/* TOMBOL SIMPAN */}
              <button 
                onClick={handleSaveName} 
                disabled={isSaving || !editName.trim()} 
                className="w-full py-4 mt-2 bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl font-black flex justify-center items-center hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 active:scale-95"
              >
                {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : "Simpan Namaku!"}
              </button>
            </div>
          </div>
        </div>
      )}

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