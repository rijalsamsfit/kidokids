"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import GameShell from "@/components/GameShell";
import { useGameStore } from "@/store/useGameStore";
import { ThumbsUp, XCircle, Loader2 } from "lucide-react";
import { playSuccessSound, playErrorSound, playCoinSound } from "@/lib/soundEngine";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { EMOTION_LEVELS } from "@/data/emotionLevels"; // <-- KITA IMPORT DATANYA DARI SINI SEKARANG

export default function EmotionLevel() {
  const router = useRouter();
  const params = useParams();
  const levelId = params.levelId as string;
  const gameId = params.gameId as string;
  const { activeChildId, addCoins } = useGameStore();
  
  // Ambil data level dari file terpisah yang baru kita bikin
  const levelData = EMOTION_LEVELS[levelId];

  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // State Anti-Nuyul & Loading Firebase
  const [isFirstWin, setIsFirstWin] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Cek ke Firebase apakah anak udah pernah namatin level ini
  useEffect(() => {
    const checkProgress = async () => {
      if (!activeChildId) return;
      try {
        const snap = await getDoc(doc(db, "children", activeChildId));
        if (snap.exists()) {
          const progress = snap.data().gameProgress?.[gameId] || 0;
          if (parseInt(levelId) <= progress) {
            setIsFirstWin(false); // Ternyata udah pernah tamat!
          }
        }
      } catch (error) {
        console.error("Gagal cek progress:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkProgress();
  }, [activeChildId, gameId, levelId]);

  // Jika level belum dibuat di database lokal kita
  if (!levelData) {
    return (
      <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-black text-indigo-900 mb-4">Level Belum Tersedia!</h1>
        <p className="text-indigo-600 font-bold mb-8">Pahlawan, level ini sedang dibangun oleh tim Kido. Kembali lagi nanti ya!</p>
        <button onClick={() => router.replace(`/child/games/${gameId}`)} className="bg-indigo-500 text-white px-6 py-3 rounded-full font-black">
          Kembali ke Peta
        </button>
      </div>
    );
  }

  // Loading Screen selagi nunggu data Firebase
  if (isLoading) {
    return (
      <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="font-bold text-indigo-600 animate-pulse">Menyiapkan Arena...</p>
      </div>
    );
  }

  const currentQuestion = levelData.questions[currentStep];
  const maxScore = levelData.questions.length;
  
  // LOGIKA KOIN: Lulus & Baru Pertama = Skor*10. Udah Pernah Lulus = 0 Koin. Gagal = 2 Koin Partisipasi.
  const isPassed = score >= levelData.passingScore;
  const earnedCoins = isGameOver ? (isPassed ? (isFirstWin ? score * 10 : 0) : 2) : 0;

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

  const handleClaimReward = async () => {
    if (earnedCoins > 0) {
      playCoinSound(); // Bunyi Koin gemerincing
    }

    if (activeChildId) {
      try {
        const childRef = doc(db, "children", activeChildId);
        const updates: any = {};
        
        if (earnedCoins > 0) {
          updates.coins = increment(earnedCoins);
          addCoins(earnedCoins); // Update state lokal biar UI langsung bereaksi
        }

        // Kalau menang dan ini first win, buka gembok level berikutnya di database
        if (isPassed && isFirstWin) {
          updates[`gameProgress.${gameId}`] = parseInt(levelId);
        }

        if (Object.keys(updates).length > 0) {
          await updateDoc(childRef, updates);
        }
      } catch (error) {
        console.error("Gagal simpan ke Firebase:", error);
      }
    }
    
    // Tunggu bunyi koin selesai sebentar baru pindah halaman
    setTimeout(() => {
      // FIX: Gunakan replace agar layar bersih dan tidak numpuk
      router.replace(`/child/games/${gameId}`);
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