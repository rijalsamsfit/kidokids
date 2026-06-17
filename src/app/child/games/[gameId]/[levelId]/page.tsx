"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import GameShell from "@/components/GameShell";
import { useGameStore } from "@/store/useGameStore";
import { ThumbsUp, XCircle } from "lucide-react";
import { playSuccessSound, playErrorSound, playCoinSound } from "@/lib/soundEngine";

// --- DATABASE LEVEL (Bisa dipindah ke Firebase nanti) ---
const LEVEL_DATA: Record<string, any> = {
  "1": {
    title: "Kenali Wajah (Level 1)",
    passingScore: 2, // Harus benar minimal 2 buat lulus
    questions: [
      {
        id: 1,
        // Menggunakan 3D Fluent Emoji dari Microsoft
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Loudly%20crying%20face/3D/loudly_crying_face_3d.png",
        situation: "Es krim temanmu jatuh ke tanah. Bagaimana perasaannya?",
        options: [
          { id: "A", text: "Sedih", icon: "😭", isCorrect: true },
          { id: "B", text: "Senang", icon: "😆", isCorrect: false },
          { id: "C", text: "Takut", icon: "😨", isCorrect: false },
        ]
      },
      {
        id: 2,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pleading%20face/3D/pleading_face_3d.png",
        situation: "Adik tidak bisa mengambil mainan di atas meja.",
        options: [
          { id: "A", text: "Marah", icon: "😡", isCorrect: false },
          { id: "B", text: "Minta Tolong", icon: "🥺", isCorrect: true },
          { id: "C", text: "Tertawa", icon: "😂", isCorrect: false },
        ]
      },
      {
        id: 3,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Tired%20face/3D/tired_face_3d.png",
        situation: "Ibu baru saja selesai membersihkan seluruh rumah.",
        options: [
          { id: "A", text: "Bersemangat", icon: "🤩", isCorrect: false },
          { id: "B", text: "Lelah", icon: "😫", isCorrect: true },
          { id: "C", text: "Kaget", icon: "😲", isCorrect: false },
        ]
      }
    ]
  }
};

export default function EmotionLevel() {
  const router = useRouter();
  const params = useParams();
  const levelId = params.levelId as string;
  const { addCoins } = useGameStore();
  
  const levelData = LEVEL_DATA[levelId];

  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Jika level belum dibuat di database lokal kita
  if (!levelData) {
    return (
      <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-black text-indigo-900 mb-4">Level Belum Tersedia!</h1>
        <p className="text-indigo-600 font-bold mb-8">Pahlawan, level ini sedang dibangun oleh tim Kido. Kembali lagi nanti ya!</p>
        <button onClick={() => router.push("/child/games/emotion")} className="bg-indigo-500 text-white px-6 py-3 rounded-full font-black">
          Kembali ke Peta
        </button>
      </div>
    );
  }

  const currentQuestion = levelData.questions[currentStep];
  const maxScore = levelData.questions.length;
  
  // Logika Hadiah: Lulus (Skor * 10), Gagal (Dapat 2 Koin partisipasi)
  const isPassed = score >= levelData.passingScore;
  const earnedCoins = isGameOver ? (isPassed ? score * 10 : 2) : 0;

  const triggerHaptic = (type: "light" | "heavy") => {
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(type === "light" ? 30 : [50, 50, 50]);
    }
  };

  const handleAnswer = (isCorrect: boolean, optionId: string) => {
    if (showFeedback) return; 
    
    setSelectedAnswer(optionId);
    setShowFeedback(true);

    if (isCorrect) {
      playSuccessSound(); // Bunyi Ta-Daa!
      triggerHaptic("light");
      setScore(prev => prev + 1);
    } else {
      playErrorSound(); // Bunyi Tetot!
      triggerHaptic("heavy");
    }

    // Jeda sebelum pindah soal
    setTimeout(() => {
      if (currentStep < maxScore - 1) {
        setCurrentStep(prev => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        setIsGameOver(true);
      }
    }, 1500);
  };

  const handleClaimReward = () => {
    playCoinSound(); // Bunyi Koin gemerincing
    addCoins(earnedCoins);
    
    // Tunggu bunyi koin selesai sebentar baru pindah halaman
    setTimeout(() => {
      router.push("/child/games/emotion");
    }, 400);
  };

  return (
    <GameShell
      title={levelData.title}
      score={score}
      maxScore={maxScore}
      isGameOver={isGameOver}
      earnedCoins={earnedCoins}
      onClaimReward={handleClaimReward}
    >
      <div className="flex flex-col h-full p-6 bg-indigo-50 relative overflow-y-auto pb-24">
        
        {/* Progress Bar Sederhana */}
        <div className="w-full bg-indigo-200 rounded-full h-3 mb-8 shadow-inner border border-indigo-100">
          <div 
            className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-full transition-all duration-500 relative"
            style={{ width: `${((currentStep) / maxScore) * 100}%` }}
          >
            <div className="absolute right-1 top-0 bottom-0 w-2 bg-white/30 rounded-full"></div>
          </div>
        </div>

        {!isGameOver && currentQuestion && (
          <div className="flex-1 flex flex-col items-center max-w-md mx-auto w-full">
            
            {/* Visual Soal (Gambar 3D Microsoft) */}
            <div className="w-40 h-40 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center mb-6 relative animate-in zoom-in duration-500 border-4 border-white transform transition-transform hover:scale-105">
              <img 
                src={currentQuestion.image} 
                alt="Ekspresi" 
                className="w-32 h-32 object-contain drop-shadow-lg"
              />
              
              {/* Overlay Feedback kalau udah jawab */}
              {showFeedback && (
                <div className="absolute inset-0 flex items-center justify-center rounded-[2.2rem] bg-white/60 backdrop-blur-sm animate-in fade-in zoom-in">
                  {selectedAnswer && currentQuestion.options.find((o: any) => o.id === selectedAnswer)?.isCorrect ? (
                    <div className="bg-emerald-100 p-3 rounded-full animate-bounce shadow-lg">
                      <ThumbsUp className="w-12 h-12 text-emerald-500 fill-emerald-500" />
                    </div>
                  ) : (
                    <div className="bg-rose-100 p-3 rounded-full animate-pulse shadow-lg">
                      <XCircle className="w-12 h-12 text-rose-500 fill-rose-500" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Teks Situasi */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-indigo-100 w-full text-center mb-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                Pertanyaan {currentStep + 1}
              </div>
              <p className="text-slate-700 font-extrabold text-lg leading-relaxed mt-2">
                {currentQuestion.situation}
              </p>
            </div>

            {/* Tombol Pilihan Jawaban */}
            <div className="w-full space-y-3">
              {currentQuestion.options.map((option: any) => {
                const isSelected = selectedAnswer === option.id;
                let btnStyle = "bg-white border-b-4 border-indigo-100 text-slate-700 hover:border-indigo-300";
                
                if (showFeedback) {
                  if (option.isCorrect) btnStyle = "bg-emerald-50 border-b-4 border-emerald-500 text-emerald-800 scale-[1.02] shadow-md z-10 relative"; 
                  else if (isSelected) btnStyle = "bg-rose-50 border-b-4 border-rose-400 text-rose-800 opacity-70"; 
                  else btnStyle = "bg-slate-50 border-b-4 border-slate-200 text-slate-400 opacity-40 grayscale"; 
                }

                return (
                  <button
                    key={option.id}
                    disabled={showFeedback}
                    onClick={() => handleAnswer(option.isCorrect, option.id)}
                    className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 active:translate-y-1 active:border-b-0 ${btnStyle}`}
                  >
                    <span className="text-3xl bg-slate-100/50 w-14 h-14 flex items-center justify-center rounded-xl shadow-inner border border-white">
                      {option.icon}
                    </span>
                    <span className="font-black text-lg text-left">{option.text}</span>
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