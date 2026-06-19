"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/useGameStore";
import { useModalStore } from "@/store/useModalStore"; // ✅ IMPORT PABRIK POP-UP
import { Lock, User, Plus, Loader2, X, Eye, EyeOff } from "lucide-react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function ProfileSelector() {
  const router = useRouter();
  const { setActiveChild } = useGameStore(); 
  const { showAlert } = useModalStore(); // ✅ GUNAKAN CUSTOM ALERT

  const [parentName, setParentName] = useState("Orang Tua");
  const [realPin, setRealPin] = useState<string | null>(null); // ✅ SIMPAN PIN ASLI DARI DATABASE
  const [children, setChildren] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk Pop-Up PIN
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState("");

  // 1. Cek Auth & Tarik Daftar Anak + Data Ortu dari Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // ✅ A. TARIK DATA ORANG TUA (Biar Nama & PIN sesuai yang didaftarkan)
          const parentSnap = await getDoc(doc(db, "parents", user.uid));
          if (parentSnap.exists()) {
            const pData = parentSnap.data();
            setParentName(pData.name || "Orang Tua");
            setRealPin(pData.pin || null);
          }

          // ✅ B. TARIK DATA ANAK
          const q = query(collection(db, "children"), where("parentId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          const kidsList: any[] = [];
          querySnapshot.forEach((document) => {
            kidsList.push({ id: document.id, ...document.data() });
          });
          setChildren(kidsList);

        } catch (error) {
          console.error("Gagal menarik data:", error);
          showAlert("Gangguan Jaringan", "Gagal memuat profil. Silakan muat ulang halaman.");
        } finally {
          setIsLoading(false);
        }
      } else {
        router.replace("/");
      }
    });

    return () => unsubscribe();
  }, [router, showAlert]);

  // 2. Logika Masuk ke Profil Anak
  const handleSelectChild = (child: any) => {
    setActiveChild(
      child.id,
      child.name,
      child.xp || 0,
      child.level || 1,
      child.coins || 0,
      child.missionsCompleted || 0,
      child.unlockedBadges || []
    );
    router.push("/child"); 
  };

  // 3. ✅ UPDATE: LOGIKA VALIDASI PIN ORANG TUA ASLI DARI DATABASE
  const handleParentAccess = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError("");

    if (!realPin) {
      showAlert("Error Sistem", "PIN keamanan belum diatur. Silakan atur ulang di halaman login.");
      return;
    }

    if (pinInput === realPin) {
      setShowPinModal(false);
      setPinInput("");
      router.push("/parent"); 
    } else {
      setPinError("PIN Salah! Coba diingat-ingat lagi.");
      setPinInput(""); // Kosongin input biar ngetik ulang
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="font-bold text-slate-500 animate-pulse">Menyiapkan Gerbang Profil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans selection:bg-indigo-200">
      
      {/* Judul Utama */}
      <h1 className="text-3xl md:text-4xl font-black text-slate-800 text-center mb-12 tracking-tight animate-in fade-in slide-in-from-top-6 duration-700">
        Siapa yang bermain hari ini?
      </h1>

      {/* Grid Profil */}
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 max-w-4xl w-full">
        
        {/* PROFIL 1: ORANG TUA (Selalu Ada) */}
        <div className="flex flex-col items-center gap-3 group">
          <button
            onClick={() => setShowPinModal(true)}
            className="w-28 h-28 md:w-32 md:h-32 bg-white rounded-[2rem] flex flex-col items-center justify-center border-4 border-indigo-50 group-hover:border-indigo-500 transition-all duration-300 transform group-hover:scale-105 shadow-xl shadow-indigo-900/5 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <User className="w-12 h-12 text-indigo-600 mb-2 relative z-10" />
            <div className="bg-indigo-100 px-3 py-1 rounded-full flex items-center gap-1 relative z-10">
              <Lock className="w-3 h-3 text-indigo-600" />
              <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Ortu</span>
            </div>
          </button>
          <span className="text-slate-600 font-bold group-hover:text-indigo-600 transition-colors text-sm max-w-[120px] truncate text-center">
            {parentName}
          </span>
        </div>

        {/* PROFIL DAFTAR ANAK (Dinamis dari Firebase) */}
        {children.map((child) => (
          <div key={child.id} className="flex flex-col items-center gap-3 group">
            <button
              onClick={() => handleSelectChild(child)}
              className="relative w-28 h-28 md:w-32 md:h-32 bg-white rounded-[2rem] flex items-center justify-center border-4 border-amber-50 group-hover:border-amber-400 transition-all duration-300 transform group-hover:scale-105 shadow-xl shadow-amber-900/5 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity z-0"></div>
              
              {/* ✅ MENDUKUNG FOTO ASLI VIP */}
              {child.photoUrl ? (
                <img src={child.photoUrl} alt={child.name} className="w-full h-full object-cover relative z-10" />
              ) : (
                <span className="font-black text-5xl uppercase text-amber-500 relative z-10">
                  {child.name ? child.name.charAt(0) : "K"}
                </span>
              )}
            </button>
            <span className="text-slate-600 font-bold group-hover:text-amber-600 transition-colors text-sm max-w-[120px] truncate text-center">
              {child.name}
            </span>
          </div>
        ))}

        {/* PROFIL TOMBOL TAMBAH ANAK */}
        {children.length === 0 && (
          <div className="flex flex-col items-center gap-3 group">
            <button
              onClick={() => router.push("/parent")}
              className="w-28 h-28 md:w-32 md:h-32 bg-slate-50 rounded-[2rem] flex flex-col items-center justify-center border-4 border-dashed border-slate-200 group-hover:border-slate-400 group-hover:bg-slate-100 transition-all duration-300 transform group-hover:scale-105"
            >
              <Plus className="w-10 h-10 text-slate-400 group-hover:text-slate-500 transition-colors" />
            </button>
            <span className="text-slate-400 font-bold group-hover:text-slate-500 transition-colors text-sm">
              Tambah Anak
            </span>
          </div>
        )}

      </div>

      {/* MODAL POP-UP PIN KEAMANAN ORANG TUA (PREMIUM STYLE) */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-100 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200 text-center">
            
            <button
              onClick={() => {
                setShowPinModal(false);
                setPinInput("");
                setPinError("");
              }}
              className="absolute top-4 right-4 w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 active:scale-90 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-indigo-50 border-2 border-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-500 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-black text-slate-800 mb-1">Akses Pangkalan</h2>
            <p className="text-slate-500 text-sm font-medium mb-6">
              Masukkan PIN Rahasia untuk masuk ke Dasbor Orang Tua.
            </p>

            <form onSubmit={handleParentAccess} className="space-y-4">
              <div className="relative max-w-[200px] mx-auto">
                <input
                  type={showPin ? "text" : "password"}
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="w-full tracking-[1.5em] text-center text-2xl font-black bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 focus:outline-none focus:border-indigo-500 text-slate-800 placeholder-slate-300 pl-[1.5em] transition-colors"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Notif Error PIN Langsung di Bawah Input (Gak usah Alert Pop-up biar gak ribet) */}
              {pinError && (
                <p className="text-rose-500 text-xs font-bold bg-rose-50 border border-rose-100 py-2 px-3 rounded-xl animate-shake">
                  {pinError}
                </p>
              )}

              <button
                type="submit"
                disabled={pinInput.length < 4}
                className="w-full bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-lg py-4 rounded-2xl active:scale-95 transition-all shadow-xl shadow-indigo-600/20 disabled:shadow-none"
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