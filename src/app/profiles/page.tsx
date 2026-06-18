"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/useGameStore";
import { Lock, User, Plus, Loader2, X, Eye, EyeOff } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function ProfileSelector() {
  const router = useRouter();
  
  // ✅ UPDATE: Tarik fungsi setActiveChild yang bener dari Store lu yang canggih
  const { setActiveChild } = useGameStore(); 

  const [parentName, setParentName] = useState("Ayah / Ibu");
  const [children, setChildren] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [parentUid, setParentUid] = useState<string | null>(null);

  // State untuk Pop-Up PIN
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState("");

  // 1. Cek Auth & Tarik Daftar Anak dari Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setParentUid(user.uid);
        if (user.displayName) setParentName(user.displayName);

        try {
          // Tarik data anak yang punya parentId cocok dengan user UID saat ini
          const q = query(collection(db, "children"), where("parentId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          const kidsList: any[] = [];
          querySnapshot.forEach((doc) => {
            kidsList.push({ id: doc.id, ...doc.data() });
          });
          setChildren(kidsList);
        } catch (error) {
          console.error("Gagal menarik data anak:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Kalau gak ada session login, tendang balik ke halaman depan
        router.replace("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // 2. ✅ UPDATE LOGIKA MASUK KE PROFIL ANAK
  const handleSelectChild = (child: any) => {
    // Inject SEMUA data dari Firebase ke dalam Zustand Store (Persist akan otomatis nyimpen ke LocalStorage)
    setActiveChild(
      child.id,
      child.name,
      child.xp || 0,
      child.level || 1,
      child.coins || 0,
      child.missionsCompleted || 0,
      child.unlockedBadges || []
    );
    
    // Terbang ke Lobi Game Anak
    router.push("/child/games"); 
  };

  // 3. Logika Validasi PIN Orang Tua
  const handleParentAccess = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError("");

    // SEMENTARA: Kita hardcode "1234" untuk testing. 
    if (pinInput === "1234") {
      setShowPinModal(false);
      setPinInput("");
      router.push("/parent"); // Terbang ke Dasbor Orang Tua
    } else {
      setPinError("PIN Salah, Bro! Coba diingat-ingat lagi.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="font-bold text-slate-400 animate-pulse">Menyiapkan Daftar Profil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col items-center justify-center p-6 text-white font-sans">
      
      {/* Judul Utama */}
      <h1 className="text-3xl md:text-4xl font-black text-center mb-12 tracking-wide animate-in fade-in slide-in-from-top duration-700">
        Siapa yang bermain hari ini?
      </h1>

      {/* Grid Profil */}
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 max-w-4xl w-full">
        
        {/* PROFIL 1: ORANG TUA (Selalu Ada) */}
        <div className="flex flex-col items-center gap-3 group">
          <button
            onClick={() => setShowPinModal(true)}
            className="w-28 h-28 md:w-32 md:h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex flex-col items-center justify-center border-4 border-transparent group-hover:border-white transition-all duration-300 transform group-hover:scale-105 shadow-xl relative overflow-hidden"
          >
            <User className="w-14 h-14 text-white" />
            <div className="absolute bottom-2 bg-black/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Parent</span>
            </div>
          </button>
          <span className="text-slate-400 font-bold group-hover:text-white transition-colors text-sm max-w-[120px] truncate text-center">
            {parentName}
          </span>
        </div>

        {/* PROFIL DAFTAR ANAK (Dinamis dari Firebase) */}
        {children.map((child) => (
          <div key={child.id} className="flex flex-col items-center gap-3 group">
            <button
              // ✅ UPDATE: Lempar SATU OBJECT CHILD UTUH, bukan cuma ID-nya
              onClick={() => handleSelectChild(child)}
              className="w-28 h-28 md:w-32 md:h-32 bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl flex items-center justify-center border-4 border-transparent group-hover:border-white transition-all duration-300 transform group-hover:scale-105 shadow-xl font-black text-4xl uppercase text-white shadow-rose-950/20"
            >
              {child.name ? child.name.charAt(0) : "K"}
            </button>
            <span className="text-slate-400 font-bold group-hover:text-white transition-colors text-sm max-w-[120px] truncate text-center">
              {child.name}
            </span>
          </div>
        ))}

        {/* PROFIL TOMBOL TAMBAH ANAK */}
        {children.length === 0 && (
          <div className="flex flex-col items-center gap-3 group">
            <button
              onClick={() => router.push("/parent")}
              className="w-28 h-28 md:w-32 md:h-32 bg-slate-800 rounded-3xl flex flex-col items-center justify-center border-4 border-dashed border-slate-600 group-hover:border-indigo-400 group-hover:bg-slate-800/80 transition-all duration-300 transform group-hover:scale-105"
            >
              <Plus className="w-10 h-10 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </button>
            <span className="text-slate-500 font-bold group-hover:text-indigo-400 transition-colors text-sm">
              Tambah Anak
            </span>
          </div>
        )}

      </div>

      {/* MODAL POP-UP PIN KEAMANAN ORANG TUA */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200 text-center">
            
            <button
              onClick={() => {
                setShowPinModal(false);
                setPinInput("");
                setPinError("");
              }}
              className="absolute top-4 right-4 w-10 h-10 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-700 active:scale-90 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-indigo-500/10 border-2 border-indigo-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
              <Lock className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-black mb-1">Akses Orang Tua</h2>
            <p className="text-slate-400 text-xs font-medium mb-6">
              Masukkan PIN Keamanan untuk masuk ke Dasbor Orang Tua. <br/>
              <span className="text-indigo-400 font-bold text-[10px] tracking-wider uppercase bg-indigo-500/10 px-2 py-0.5 rounded-md mt-1 inline-block">Petunjuk Test: 1234</span>
            </p>

            <form onSubmit={handleParentAccess} className="space-y-4">
              <div className="relative max-w-[200px] mx-auto">
                <input
                  type={showPin ? "text" : "password"}
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="w-full tracking-[1.5em] text-center text-2xl font-black bg-slate-950 border-2 border-slate-800 rounded-2xl py-3 focus:outline-none focus:border-indigo-500 text-white placeholder-slate-700 pl-[1.5em]"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {pinError && (
                <p className="text-rose-400 text-xs font-bold bg-rose-500/10 py-2 px-3 rounded-xl animate-shake">
                  {pinError}
                </p>
              )}

              <button
                type="submit"
                disabled={pinInput.length < 4}
                className="w-full bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black text-lg py-3.5 rounded-2xl active:scale-95 transition-all shadow-lg shadow-indigo-600/20 border-b-4 border-indigo-800 disabled:border-b-0"
              >
                Masuk Dasbor
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}