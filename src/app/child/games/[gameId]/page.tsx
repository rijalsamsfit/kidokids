"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Lock, Star } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// --- DATABASE SEMENTARA (Akan dipindah ke Firestore nanti) ---
const GAME_DB: any = {
  emotion: {
    title: "Tebak Perasaan",
    description: "Latih empatimu dengan memahami perasaan orang lain.",
    theme: "from-pink-400 to-rose-500",
    totalLevels: 20,
    freeLevels: 5
  },
  healthy: {
    title: "Ninja Sehat",
    description: "Pilih makanan yang bikin tubuhmu kuat!",
    theme: "from-blue-400 to-emerald-500",
    totalLevels: 20,
    freeLevels: 5
  }
};

export default function LevelMap() {
  const router = useRouter();
  const params = useParams();
  const gameId = params.gameId as string;
  const gameInfo = GAME_DB[gameId];

  const { activeChildId } = useGameStore();
  const [currentProgressLevel, setCurrentProgressLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Tarik data progress anak dari Firebase
  useEffect(() => {
    const fetchProgress = async () => {
      if (!activeChildId) return;
      try {
        const snap = await getDoc(doc(db, "children", activeChildId));
        if (snap.exists()) {
          const data = snap.data();
          // Kalau udah lulus level 1, berarti progress = 1, dia bisa main level 2 (1+1)
          const progress = data.gameProgress?.[gameId] || 0;
          setCurrentProgressLevel(progress + 1); 
        }
      } catch (error) {
        console.error("Gagal menarik data progress:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProgress();
  }, [activeChildId, gameId]);

  // Simulasi Status User (Nanti ditarik dari Auth/Firestore ortu)
  const isPremium = false; 

  if (!gameInfo) {
    return <div className="p-10 text-center font-bold">Game tidak ditemukan!</div>;
  }

  // Generate Array Level 1-20
  const levels = Array.from({ length: gameInfo.totalLevels }, (_, i) => i + 1);

  return (
    <div className={`min-h-screen bg-gradient-to-b ${gameInfo.theme} font-sans pb-10`}>
      
      {/* Header Level Map */}
      <div className="p-6 sticky top-0 z-20 bg-black/10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.replace("/child/games")} // FIX: Pakai replace agar history rapi
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors active:scale-90"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white leading-tight">{gameInfo.title}</h1>
            <p className="text-white/80 text-xs font-bold">{gameInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Grid Level (Saga Map) */}
      <div className="p-6 pt-10">
        {isLoading ? (
          <div className="text-center text-white font-bold animate-pulse">Memuat Peta...</div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {levels.map((levelNum) => {
              const isLockedByPremium = !isPremium && levelNum > gameInfo.freeLevels;
              const isLockedByProgress = levelNum > currentProgressLevel && !isLockedByPremium;
              const isPlayable = levelNum <= currentProgressLevel && !isLockedByPremium;
              const isCompleted = levelNum < currentProgressLevel;

              // Styling Dinamis berdasarkan Status Level
              let btnStyle = "bg-white text-slate-300 border-b-4 border-slate-200"; // Default (Kunci Progress)
              if (isLockedByPremium) btnStyle = "bg-slate-800 text-slate-500 border-b-4 border-slate-900"; // Kunci Premium
              if (isPlayable) btnStyle = "bg-white text-rose-500 border-b-4 border-rose-200 hover:border-rose-300 active:border-b-0 active:translate-y-1 shadow-lg"; // Bisa Dimainkan

              return (
                <div key={levelNum} className="flex flex-col items-center gap-2">
                  <button
                    disabled={isLockedByPremium || isLockedByProgress}
                    onClick={() => router.push(`/child/games/${gameId}/${levelNum}`)}
                    className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all ${btnStyle} relative overflow-hidden group`}
                  >
                    {isPlayable && (
                      <>
                        <div className="text-3xl font-black">{levelNum}</div>
                        <div className="absolute inset-0 bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </>
                    )}

                    {isLockedByProgress && !isLockedByPremium && (
                      <div className="text-2xl font-black text-slate-300">{levelNum}</div>
                    )}

                    {isLockedByPremium && (
                      <div className="flex flex-col items-center">
                        <Lock className="w-6 h-6 text-amber-500 mb-1" />
                        <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest">VIP</div>
                      </div>
                    )}
                  </button>
                  
                  {/* Visual Bintang (Kalau udah lulus) */}
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-3 h-3 ${isCompleted ? "text-amber-400 fill-amber-400" : "text-white/20"}`} 
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