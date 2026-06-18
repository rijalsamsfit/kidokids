"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import GameShell from "@/components/GameShell";
import { useGameStore } from "@/store/useGameStore";
import { ThumbsUp, XCircle, Loader2, Volume2, CheckCircle2 } from "lucide-react";
import { playSuccessSound, playErrorSound, playCoinSound, pauseBGM, resumeBGM } from "@/lib/soundEngine";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { EMOTION_LEVELS } from "@/data/emotionLevels";
import { MAGIC_WORDS_LEVELS } from "@/data/magicWordsLevels";
// --- UPDATE 1: Import Data Detektif ---
import { DETECTIVE_LEVELS } from "@/data/detectiveLevels";

const ALL_GAME_DATA: Record<string, any> = {
  "emotion": EMOTION_LEVELS,
  "magic-words": MAGIC_WORDS_LEVELS,
  "detective": DETECTIVE_LEVELS, // Daftarkan game detektif
};

export default function GameEngineLevel() {
  const router = useRouter();
  const params = useParams();
  const levelId = params.levelId as string;
  const gameId = params.gameId as string;
  const { activeChildId, addCoins } = useGameStore();
  
  const levelData = ALL_GAME_DATA[gameId]?.[levelId];
  const isDetective = gameId === "detective"; // Deteksi mode game

  // State Pilihan Ganda (Emotion & Magic Words)
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // State Detektif (Tap & Drop)
  const [remainingItems, setRemainingItems] = useState<any[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // State Global Game
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isFirstWin, setIsFirstWin] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [rawProgress, setRawProgress] = useState<Record<string, number>>({});

  // Setup Data Awal
  useEffect(() => {
    if (isDetective && levelData?.items) {
      setRemainingItems(levelData.items);
    }
  }, [isDetective, levelData]);

  useEffect(() => {
    const checkProgress = async () => {
      if (!activeChildId) return;
      try {
        const snap = await getDoc(doc(db, "children", activeChildId));
        if (snap.exists()) {
          const progressData = snap.data().gameProgress || {};
          setRawProgress(progressData);

          const currentLevelProgress = progressData[gameId] || 0;
          if (parseInt(levelId) <= currentLevelProgress) {
            setIsFirstWin(false); 
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

  if (!levelData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-black text-slate-900 mb-4">Level Belum Tersedia!</h1>
        <p className="text-slate-600 font-bold mb-8">Pahlawan, level ini sedang dibangun oleh tim Kido. Kembali lagi nanti ya!</p>
        <button onClick={() => router.replace(`/child/games/${gameId}`)} className="bg-indigo-500 text-white px-6 py-3 rounded-full font-black">
          Kembali ke Peta
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="font-bold text-slate-600 animate-pulse">Menyiapkan Arena...</p>
      </div>
    );
  }

  // --- LOGIKA SKOR & KOIN ---
  const maxScore = isDetective ? levelData.items.length : levelData.questions.length;
  const isPassed = score >= levelData.passingScore;
  const earnedCoins = isGameOver ? (isPassed ? (isFirstWin ? score * 10 : 0) : 2) : 0;
  
  // Ambil pertanyaan saat ini (Khusus Pilihan Ganda)
  const currentQuestion = !isDetective ? levelData.questions[currentStep] : null;

  const triggerHaptic = (type: "light" | "heavy") => {
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(type === "light" ? 30 : [50, 50, 50]);
    }
  };

  const handlePlayAudio = () => {
    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); 
      // Detektif baca Deskripsi, Pilihan Ganda baca Situasi
      const textToRead = isDetective ? levelData.description : currentQuestion.situation;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      
      utterance.onstart = () => pauseBGM();
      utterance.onend = () => resumeBGM();

      utterance.lang = 'id-ID';
      utterance.rate = 0.9; 
      window.speechSynthesis.speak(utterance);
    }
  };

  // --- LOGIKA MENJAWAB (PILIHAN GANDA) ---
  const handleMultipleChoiceAnswer = (isCorrect: boolean, optionId: string) => {
    if (showFeedback) return; 
    setSelectedAnswer(optionId);
    setShowFeedback(true);

    if (isCorrect) {
      playSuccessSound();
      triggerHaptic("light");
      setScore(prev => prev + 1);
    } else {
      playErrorSound();
      triggerHaptic("heavy");
    }

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

  // --- LOGIKA MENJAWAB (DETEKTIF / TAP & DROP) ---
  const handleDetectiveContainerTap = (containerId: string) => {
    if (!selectedItemId) return; // Harus pilih barang dulu

    const item = remainingItems.find(i => i.id === selectedItemId);
    if (!item) return;

    if (item.correctContainerId === containerId) {
      // JAWABAN BENAR
      playSuccessSound();
      triggerHaptic("light");
      setScore(prev => prev + 1);
      
      const newRemaining = remainingItems.filter(i => i.id !== selectedItemId);
      setRemainingItems(newRemaining);
      setSelectedItemId(null);

      // Kalau barang habis, Game Over
      if (newRemaining.length === 0) {
        setTimeout(() => setIsGameOver(true), 500);
      }
    } else {
      // JAWABAN SALAH
      playErrorSound();
      triggerHaptic("heavy");
      setSelectedItemId(null); // Lepas pilihan biar anak milih lagi
    }
  };

  const handleClaimReward = async () => {
    if (earnedCoins > 0) playCoinSound(); 

    if (activeChildId) {
      try {
        const childRef = doc(db, "children", activeChildId);
        const updates: any = {};
        
        if (earnedCoins > 0) {
          updates.coins = increment(earnedCoins);
          addCoins(earnedCoins); 
        }

        if (isPassed && isFirstWin) {
          updates.gameProgress = {
            ...rawProgress,
            [gameId]: Math.max(parseInt(levelId), rawProgress[gameId] || 0)
          };
        }

        if (Object.keys(updates).length > 0) {
          await updateDoc(childRef, updates);
        }
      } catch (error) {
        console.error("Gagal simpan ke Firebase:", error);
      }
    }
    
    setTimeout(() => {
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
      <div className="flex flex-col h-full p-4 bg-slate-50 relative overflow-hidden">
        
        {/* Progress Bar Sederhana (Untuk Semua Game) */}
        <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4 shadow-inner border border-slate-300 flex-none">
          <div 
            className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-full transition-all duration-500 relative"
            style={{ width: `${(score / maxScore) * 100}%` }}
          >
            <div className="absolute right-1 top-0 bottom-0 w-2 bg-white/30 rounded-full"></div>
          </div>
        </div>

        {!isGameOver && (
          <div className="flex-1 flex flex-col items-center w-full pb-2">
            
            {/* =========================================
                UI KHUSUS: DETEKTIF KAMAR (TAP & DROP)
                ========================================= */}
            {isDetective && (
              <div className="w-full h-full flex flex-col justify-between">
                
                {/* Bagian Atas: Instruksi & Wadah (Containers) */}
                <div className="flex flex-col items-center">
                  <div className="bg-white px-6 py-3 rounded-[1.5rem] shadow-sm border-2 border-slate-100 w-full text-center mb-6">
                    <p className="text-slate-700 font-extrabold text-sm leading-snug">
                      {levelData.description}
                    </p>
                  </div>

                  {/* Grid Wadah Container */}
                  <div className="flex justify-center gap-4 w-full">
                    {levelData.containers.map((container: any) => (
                      <button
                        key={container.id}
                        onClick={() => handleDetectiveContainerTap(container.id)}
                        // Kalau ada barang terpilih, wadah nyala minta diklik
                        className={`w-32 h-36 rounded-[2rem] border-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 shadow-md active:scale-95 ${container.color} ${selectedItemId ? 'ring-4 ring-indigo-400 ring-offset-2 animate-pulse' : ''}`}
                      >
                        <span className="text-5xl drop-shadow-md">{container.icon}</span>
                        <span className="font-black text-xs text-center px-2">{container.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bagian Bawah: Barang-barang Berantakan (Items) */}
                <div className="bg-white/50 backdrop-blur-sm border-t-4 border-white p-4 -mx-4 rounded-t-[2.5rem] mt-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="font-black text-slate-700 text-sm">Barang Berantakan:</h3>
                    <button onClick={handlePlayAudio} className="p-2 bg-indigo-100 text-indigo-600 rounded-full active:scale-90">
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-4 overflow-y-auto pb-4">
                    {remainingItems.map((item: any) => {
                      const isSelected = selectedItemId === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            // Toggle pilih barang
                            if (isSelected) setSelectedItemId(null);
                            else setSelectedItemId(item.id);
                          }}
                          className={`w-20 h-20 bg-white rounded-2xl shadow-sm border-b-4 flex items-center justify-center text-4xl transition-all duration-200 ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-200 scale-110 -translate-y-2' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                          {item.icon}
                        </button>
                      );
                    })}
                    
                    {/* Pesan kalau sudah bersih */}
                    {remainingItems.length === 0 && (
                      <div className="w-full text-center py-6 animate-in zoom-in">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                        <p className="font-black text-emerald-600">Semua Bersih!</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}


            {/* =========================================
                UI KHUSUS: PILIHAN GANDA (EMOTION & MAGIC)
                ========================================= */}
            {!isDetective && currentQuestion && (
              <div className="w-full max-w-md mx-auto flex flex-col h-full">
                {/* Visual Soal */}
                <div className="w-28 h-28 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-4 relative animate-in zoom-in duration-500 border-4 border-white transform transition-transform hover:scale-105 flex-none mx-auto">
                  <img src={currentQuestion.image} alt="Ilustrasi" className="w-20 h-20 object-contain drop-shadow-lg" />
                  {showFeedback && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-[1.75rem] bg-white/60 backdrop-blur-sm animate-in fade-in zoom-in">
                      {selectedAnswer && currentQuestion.options.find((o: any) => o.id === selectedAnswer)?.isCorrect ? (
                        <div className="bg-emerald-100 p-2.5 rounded-full animate-bounce shadow-lg"><ThumbsUp className="w-8 h-8 text-emerald-500 fill-emerald-500" /></div>
                      ) : (
                        <div className="bg-rose-100 p-2.5 rounded-full animate-pulse shadow-lg"><XCircle className="w-8 h-8 text-rose-500 fill-rose-500" /></div>
                      )}
                    </div>
                  )}
                </div>

                {/* Teks Situasi */}
                <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border-2 border-slate-100 w-full text-center mb-4 relative flex-none">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">Pertanyaan {currentStep + 1}</div>
                  <p className="text-slate-700 font-extrabold text-base leading-snug mt-1">{currentQuestion.situation}</p>
                </div>

                {/* Tombol Audio */}
                <button onClick={handlePlayAudio} className="w-full flex items-center justify-center gap-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 active:scale-95 px-4 py-3 rounded-2xl font-black mb-4 transition-all border-b-4 border-indigo-200 shadow-sm flex-none">
                  <Volume2 className="w-5 h-5" /> Dengarkan Cerita
                </button>

                {/* Opsi Jawaban */}
                <div className="w-full space-y-2 flex-1 flex flex-col justify-end">
                  {currentQuestion.options.map((option: any) => {
                    const isSelected = selectedAnswer === option.id;
                    let btnStyle = "bg-white border-b-4 border-slate-200 text-slate-700 hover:border-slate-300";
                    if (showFeedback) {
                      if (option.isCorrect) btnStyle = "bg-emerald-50 border-b-4 border-emerald-500 text-emerald-800 scale-[1.02] shadow-md z-10 relative"; 
                      else if (isSelected) btnStyle = "bg-rose-50 border-b-4 border-rose-400 text-rose-800 opacity-70"; 
                      else btnStyle = "bg-slate-50 border-b-4 border-slate-200 text-slate-400 opacity-40 grayscale"; 
                    }
                    return (
                      <button key={option.id} disabled={showFeedback} onClick={() => handleMultipleChoiceAnswer(option.isCorrect, option.id)} className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all duration-300 active:translate-y-1 active:border-b-0 ${btnStyle}`}>
                        <span className="text-2xl bg-slate-100/50 w-12 h-12 flex items-center justify-center rounded-xl shadow-inner border border-white">{option.icon}</span>
                        <span className="font-black text-base text-left">{option.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
          </div>
        )}

      </div>
    </GameShell>
  );
}