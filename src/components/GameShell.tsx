"use client";

import { useRouter } from "next/navigation";
import { X, Star, Trophy, ArrowRight } from "lucide-react";

interface GameShellProps {
  title: string;
  isGameOver: boolean;
  score: number;
  maxScore: number;
  earnedCoins: number;
  children: React.ReactNode;
  onClaimReward: () => void;
}

export default function GameShell({ 
  title, 
  isGameOver, 
  score, 
  maxScore, 
  earnedCoins, 
  children, 
  onClaimReward 
}: GameShellProps) {
  const router = useRouter();

  // Efek getar kalau layar mendukung (Haptic Feedback Mobile)
  const triggerHaptic = () => {
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  return (
    <div className="h-[100dvh] bg-slate-900 flex flex-col relative overflow-hidden font-sans">
      
      {/* 1. Header Bar Game */}
      <div className="flex-none bg-slate-800/80 backdrop-blur-md p-4 flex items-center justify-between z-10 border-b border-slate-700">
        <button 
          onClick={() => { triggerHaptic(); router.push("/child/games"); }}
          className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center transition-colors active:scale-90"
        >
          <X className="w-6 h-6 text-slate-300" />
        </button>
        <h2 className="text-white font-black tracking-wide">{title}</h2>
        <div className="bg-slate-950/50 px-4 py-1.5 rounded-full border border-slate-700 flex items-center gap-1.5">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="font-bold text-slate-200 text-sm">{score}/{maxScore}</span>
        </div>
      </div>

      {/* 2. Area Bermain (Diisi oleh konten game spesifik) */}
      <div className="flex-1 relative">
        {children}
      </div>

      {/* 3. Pop-Up Menang (Game Over Overlay) */}
      {isGameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 duration-500 delay-150">
            
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 bg-amber-200 rounded-full animate-ping opacity-50"></div>
              <Trophy className="w-12 h-12 text-amber-500 relative z-10" />
            </div>

            <h2 className="text-3xl font-black text-slate-800 mb-2">Luar Biasa!</h2>
            <p className="text-slate-500 font-bold mb-6">Kamu berhasil menyelesaikan tantangan ini dengan hati yang mantap.</p>

            <div className="bg-amber-50 border-2 border-amber-100 w-full rounded-2xl p-4 flex items-center justify-between mb-8">
              <span className="font-bold text-amber-700">Hadiah Koin:</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-amber-600">+{earnedCoins}</span>
                <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center font-bold text-white text-xs">C</div>
              </div>
            </div>

            <button 
              onClick={() => { triggerHaptic(); onClaimReward(); }}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 rounded-[1.5rem] p-4 font-black text-lg flex items-center justify-center gap-2 transition-all"
            >
              Ambil Koin <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}