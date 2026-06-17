"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GameShell from "@/components/GameShell";
import { useGameStore } from "@/store/useGameStore";
import { Heart, ThumbsUp, XCircle } from "lucide-react";

// --- DATABASE SKENARIO GAME ---
const SCENARIOS = [
  {
    id: 1,
    emoji: "😭",
    situation: "Temanmu menjatuhkan es krimnya dan menangis.",
    options: [
      { id: "A", text: "Menertawakannya", icon: "🤣", isCorrect: false },
      { id: "B", text: "Berbagi es krimmu", icon: "🍦", isCorrect: true },
      { id: "C", text: "Meninggalkannya", icon: "🚶", isCorrect: false },
    ]
  },
  {
    id: 2,
    emoji: "🥺",
    situation: "Adik kesulitan mengambil mainan kesukaannya di atas meja.",
    options: [
      { id: "A", text: "Membantu mengambilkan", icon: "🦸‍♂️", isCorrect: true },
      { id: "B", text: "Pura-pura tidak lihat", icon: "🙈", isCorrect: false },
      { id: "C", text: "Mengejek adik pendek", icon: "😝", isCorrect: false },
    ]
  },
  {
    id: 3,
    emoji: "😫",
    situation: "Ibu terlihat sangat lelah setelah membersihkan rumah seharian.",
    options: [
      { id: "A", text: "Minta main HP", icon: "📱", isCorrect: false },
      { id: "B", text: "Pergi main ke luar", icon: "🏃", isCorrect: false },
      { id: "C", text: "Memeluk & bilang terima kasih", icon: "🫂", isCorrect: true },
    ]
  }
];

const REWARD_COINS = 25; // Hadiah koin kalau berhasil tamat

export default function EmotionGame() {
  const router = useRouter();
  const { addCoins } = useGameStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentScenario = SCENARIOS[currentStep];

  // Efek Getar (Haptic)
  const triggerHaptic = (type: "light" | "heavy") => {
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(type === "light" ? 30 : [50, 50, 50]);
    }
  };

  const handleAnswer = (isCorrect: boolean, optionId: string) => {
    if (showFeedback) return; // Mencegah double click
    
    setSelectedAnswer(optionId);
    setShowFeedback(true);

    if (isCorrect) {
      triggerHaptic("light");
      setScore(prev => prev + 1);
    } else {
      triggerHaptic("heavy");
    }

    // Tunggu 1.5 detik buat nampilin reaksi, baru lanjut soal berikutnya
    setTimeout(() => {
      if (currentStep < SCENARIOS.length - 1) {
        setCurrentStep(prev => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        setIsGameOver(true);
      }
    }, 1500);
  };

  const handleClaimReward = () => {
    // 1. Tambah koin ke database lokal (Zustand)
    addCoins(REWARD_COINS);
    // 2. Balik ke daftar game
    router.push("/child/games");
  };

  return (
    <GameShell
      title="Tebak Perasaan"
      score={score}
      maxScore={SCENARIOS.length}
      isGameOver={isGameOver}
      earnedCoins={REWARD_COINS}
      onClaimReward={handleClaimReward}
    >
      <div className="flex flex-col h-full p-6 bg-indigo-50">
        
        {/* Progress Bar Sederhana */}
        <div className="w-full bg-indigo-200 rounded-full h-2 mb-8">
          <div 
            className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep) / SCENARIOS.length) * 100}%` }}
          ></div>
        </div>

        {!isGameOver && currentScenario && (
          <div className="flex-1 flex flex-col items-center max-w-md mx-auto w-full">
            
            {/* Visual Soal (Emoji Raksasa) */}
            <div className="w-32 h-32 bg-white rounded-[2rem] shadow-lg flex items-center justify-center text-7xl mb-6 relative animate-in zoom-in duration-500">
              {currentScenario.emoji}
              
              {/* Overlay Feedback kalau udah jawab */}
              {showFeedback && (
                <div className="absolute inset-0 flex items-center justify-center rounded-[2rem] bg-white/80 backdrop-blur-sm animate-in fade-in zoom-in">
                  {selectedAnswer && currentScenario.options.find(o => o.id === selectedAnswer)?.isCorrect ? (
                    <ThumbsUp className="w-16 h-16 text-emerald-500 fill-emerald-500 animate-bounce" />
                  ) : (
                    <XCircle className="w-16 h-16 text-rose-500 fill-rose-500 animate-pulse" />
                  )}
                </div>
              )}
            </div>

            {/* Teks Situasi */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 w-full text-center mb-8">
              <p className="text-slate-700 font-bold text-lg leading-relaxed">
                {currentScenario.situation}
              </p>
            </div>

            {/* Tombol Pilihan Jawaban */}
            <div className="w-full space-y-3">
              {currentScenario.options.map((option) => {
                const isSelected = selectedAnswer === option.id;
                let btnStyle = "bg-white border-slate-200 text-slate-700 hover:border-indigo-300";
                
                if (showFeedback) {
                  if (option.isCorrect) btnStyle = "bg-emerald-100 border-emerald-500 text-emerald-800 scale-105"; // Jawaban benar menyala
                  else if (isSelected) btnStyle = "bg-rose-100 border-rose-500 text-rose-800 opacity-50"; // Jawaban salah yg dipilih
                  else btnStyle = "bg-white border-slate-200 text-slate-400 opacity-50"; // Sisanya redup
                }

                return (
                  <button
                    key={option.id}
                    disabled={showFeedback}
                    onClick={() => handleAnswer(option.isCorrect, option.id)}
                    className={`w-full p-4 rounded-2xl border-b-4 flex items-center gap-4 transition-all duration-300 active:translate-y-1 active:border-b-0 ${btnStyle}`}
                  >
                    <span className="text-3xl bg-slate-50 w-12 h-12 flex items-center justify-center rounded-xl shadow-inner">
                      {option.icon}
                    </span>
                    <span className="font-bold text-left">{option.text}</span>
                  </button>
                );
              })}
            </div>

          </div>
        )}
      </div>
    </GameShell>
  );
}