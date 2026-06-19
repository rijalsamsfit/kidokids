"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link"; // ✅ OBAT ANTI LEMOT: Navigasi instan
import { ChevronLeft, Lock, Star } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// ✅ IMPORT PABRIK POP-UP KIDO
import { useModalStore } from "@/store/useModalStore";

// --- DAFTARKAN GAME DI SINI ---
const GAME_DB: any = {
  "emotion": {
    title: "Tebak Perasaan",
    description: "Latih empatimu dengan memahami perasaan orang lain.",
    theme: "from-pink-400 to-rose-500",
    totalLevels: 20,
    freeLevels: 5
  },
  "magic-words": {
    title: "Kata Ajaib",
    description: "Belajar mengucapkan Maaf, Tolong, dan Terima Kasih di saat yang tepat!",
    theme: "from-amber-400 to-orange-500",
    totalLevels: 20,
    freeLevels: 5
  },
  "detective": {
    title: "Detektif Kamar",
    description: "Ayo bantu kembalikan barang-barang yang berantakan ke tempat asalnya.",
    theme: "from-teal-400 to-emerald-500",
    totalLevels: 20, 
    freeLevels: 5
  },
  "healthy": {
    title: "Ninja Sehat",
    description: "Pilih makanan yang bikin tubuhmu kuat!",
    theme: "from-blue-400 to-emerald-500",
    totalLevels: 20,
    freeLevels: 5
  }
};

export default function LevelMap() {
  const params = useParams();
  const gameId = params.gameId as string;
  const gameInfo = GAME_DB[gameId];

  const { activeChildId } = useGameStore();
  const { showAlert } = useModalStore(); // ✅ CUSTOM POP-UP
  
  const [currentProgressLevel, setCurrentProgressLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  // Tarik data progress anak dan kasta Ortu dari Firebase
  useEffect(() => {
    const fetchProgressAndPlan = async () => {
      if (!activeChildId) return;
      try {
        // 1. Tarik Laci Anak
        const childSnap = await getDoc(doc(db, "children", activeChildId));
        if (childSnap.exists()) {
          const childData = childSnap.data();
          const progress = childData.gameProgress?.[gameId] || 0;
          setCurrentProgressLevel(progress + 1); 

          // 2. Intip Laci Ortu pakai parentId dari data anak
          const parentId = childData.parentId;
          if (parentId) {
            const parentSnap = await getDoc(doc(db, "parents", parentId));
            if (parentSnap.exists()) {
              const parentData = parentSnap.data();
              // Kalau langganannya bukan basic, gembok terbuka!
              if (parentData.subscriptionPlan && parentData.subscriptionPlan !== "basic") {
                setIsPremium(true);
              }
            }
          }
        }
      } catch (error) {
        console.error("Gagal menarik data progress & kasta:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProgressAndPlan();
  }, [activeChildId, gameId]);

  if (!gameInfo) {
    return <div className="p-10 text-center font-bold">Game tidak ditemukan!</div>;
  }

  const levels = Array.from({ length: gameInfo.totalLevels }, (_, i) => i + 1);

  // ✅ LOGIKA PENEMPATAN ZIG-ZAG (S-CURVE)
  const getZigZagClass = (levelNum: number) => {
    const mod = levelNum % 4;
    if (mod === 1) return "self-start ml-6";         // Kiri
    if (mod === 2) return "self-center mr-12";       // Tengah agak Kiri
    if (mod === 3) return "self-end mr-6";           // Kanan
    if (mod === 0) return "self-center ml-12";       // Tengah agak Kanan
    return "";
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${gameInfo.theme} font-sans pb-20 relative`}>
      
      {/* Header Level Map */}
      <div className="p-6 sticky top-0 z-30 bg-black/10 backdrop-blur-md border-b border-white/10 shadow-sm">
        <div className="flex items-center gap-4">
          {/* ✅ OBAT ANTI LEMOT: Pakai Link */}
          <Link 
            href="/child/games"
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors active:scale-90"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white leading-tight">{gameInfo.title}</h1>
            <p className="text-white/80 text-xs font-bold">{gameInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Area Peta Zig-Zag */}
      <div className="p-6 pt-12 relative max-w-sm mx-auto">
        {isLoading ? (
          <div className="text-center text-white font-bold animate-pulse">Membentangkan Peta...</div>
        ) : (
          /* ✅ flex-col-reverse BIKIN LEVEL 1 ADA DI PALING BAWAH LAYAR */
          <div className="flex flex-col-reverse relative gap-6 pb-12">
            
            {/* Garis Putus-Putus Dekoratif di Belakang */}
            <div className="absolute top-10 bottom-10 left-1/2 w-0 border-l-4 border-dashed border-white/20 -translate-x-1/2 z-0 pointer-events-none"></div>

            {levels.map((levelNum) => {
              const isLockedByPremium = !isPremium && levelNum > gameInfo.freeLevels;
              const isCompleted = levelNum < currentProgressLevel;
              const isPlayable = levelNum === currentProgressLevel && !isLockedByPremium;
              const isLockedByProgress = levelNum > currentProgressLevel && !isLockedByPremium;

              // Styling Bulatan Proporsional Berdasarkan Status
              let btnStyle = "bg-white/50 text-white/50 border-b-4 border-white/20"; // Terkunci Progress (Belum sampe)
              if (isLockedByPremium) btnStyle = "bg-slate-800 text-slate-500 border-b-4 border-slate-900 shadow-md"; // Gembok VIP
              if (isPlayable) btnStyle = "bg-white text-rose-500 border-b-4 border-rose-300 shadow-xl animate-bounce"; // Siap Main
              if (isCompleted) btnStyle = "bg-emerald-400 text-white border-b-4 border-emerald-600 shadow-md"; // Lulus

              return (
                <div key={levelNum} className={`flex flex-col items-center gap-2 z-10 ${getZigZagClass(levelNum)} relative group`}>
                  
                  {isPlayable && (
                    <div className="absolute -top-3 text-[10px] font-black bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full z-20 shadow-sm animate-pulse">MULAI</div>
                  )}

                  <Link
                    href={(!isLockedByProgress && !isLockedByPremium) ? `/child/games/${gameId}/${levelNum}` : "#"}
                    onClick={(e) => {
                      if (isLockedByProgress) {
                        e.preventDefault();
                      } else if (isLockedByPremium) {
                        e.preventDefault();
                        // ✅ PANGGIL POP-UP KIDO BUAT PESTER POWER
                        showAlert(
                          "Level VIP Dikunci! 🔒",
                          "Wah, petualangan ini masih digembok! Minta tolong Ayah atau Ibu pakai Kunci VIP-nya ya!"
                        );
                      }
                    }}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${btnStyle} relative overflow-hidden`}
                  >
                    {(isPlayable || isCompleted) && (
                      <div className="text-2xl font-black z-10">{levelNum}</div>
                    )}

                    {isLockedByProgress && (
                      <div className="text-xl font-black">{levelNum}</div>
                    )}

                    {isLockedByPremium && (
                      <div className="flex flex-col items-center">
                        <Lock className="w-5 h-5 text-amber-500 mb-0.5" />
                        <div className="text-[9px] font-black text-amber-500 uppercase tracking-widest">VIP</div>
                      </div>
                    )}
                  </Link>
                  
                  {/* Visual Bintang (Kalau udah lulus) */}
                  <div className="flex gap-0.5 bg-black/10 px-2 py-1 rounded-full backdrop-blur-sm">
                    {[1, 2, 3].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-3 h-3 ${isCompleted ? "text-yellow-300 fill-yellow-300" : "text-white/20"}`} 
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}