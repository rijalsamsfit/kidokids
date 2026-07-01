"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import GameShell from "@/components/GameShell";
import { useGameStore } from "@/store/useGameStore";
import { ThumbsUp, XCircle, Loader2, Volume2, CheckCircle2 } from "lucide-react";
import { playSuccessSound, playErrorSound, playCoinSound, pauseBGM, resumeBGM } from "@/lib/soundEngine";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

// ✅ HAPUS SEMUA IMPORT DATA LOKAL DI SINI (Udah gak perlu!)

export default function GameEngineLevel() {
  const router = useRouter();
  const params = useParams();
  const levelId = params.levelId as string;
  const gameId = params.gameId as string;
  const { activeChildId, addCoins } = useGameStore();
  
  const isDetective = gameId === "detective";

  // State Pilihan Ganda & Detektif
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [remainingItems, setRemainingItems] = useState<any[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // State Global Game
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isFirstWin, setIsFirstWin] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [rawProgress, setRawProgress] = useState<Record<string, number>>({});
  const [levelData, setLevelData] = useState<any>(null);

  // ✅ SETUP DATA BARU: Tarik dari API Caching (Solusi 3)
  useEffect(() => {
    const fetchData = async () => {
      if (!activeChildId) return;
      try {
        // 1. Tarik Progress dari Firestore
        const snap = await getDoc(doc(db, "children", activeChildId));
        if (snap.exists()) {
          const data = snap.data();
          const progressData = data.gameProgress || {};
          setRawProgress(progressData);
          
          if (parseInt(levelId) <= (progressData[gameId] || 0)) {
            setIsFirstWin(false); 
          }

          // 2. Tentukan Tier berdasarkan Umur
          const childAge = data.age || 5;
          const tierId = childAge <= 6 ? "tier1" : (childAge <= 9 ? "tier2" : "tier3");

          // 3. TARIK SOAL DARI API (Hybrid Caching)
          const res = await fetch(`/api/quests?gameId=${gameId}&tierId=${tierId}`);
          if (!res.ok) throw new Error("Gagal ambil soal dari cloud");
          const tierData = await res.json();
          
          // Cari soal spesifik untuk level ini
          const specificLevelData = tierData.questions.find((q: any) => q.level === parseInt(levelId));
          
          // Gabungkan meta data game dengan soal level tersebut
          setLevelData({
            title: tierData.title,
            description: tierData.description,
            ...specificLevelData
          });

          if (isDetective && specificLevelData?.items) {
            setRemainingItems(specificLevelData.items);
          }
        }
      } catch (error) {
        console.error("Error mengambil data game:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [activeChildId, gameId, levelId, isDetective]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="font-bold text-slate-600 animate-pulse">Menyiapkan Arena...</p>
      </div>
    );
  }

  // --- LOGIKA SKOR (Disesuaikan dengan data baru) ---
  const maxScore = isDetective ? levelData.items?.length : levelData.options ? 1 : 0; // Penyesuaian struktur
  const isPassed = score >= (levelData.passingScore || 1);
  const earnedCoins = isGameOver ? (isPassed ? (isFirstWin ? 10 : 0) : 2) : 0;
  
  // Audio Engine
  const handlePlayAudio = () => {
    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); 
      const textToRead = isDetective ? levelData.description : levelData.scenario;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.onstart = () => pauseBGM();
      utterance.onend = () => resumeBGM();
      utterance.lang = 'id-ID';
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
      setScore(prev => prev + 1);
    } else {
      playErrorSound();
    }

    setTimeout(() => {
      setIsGameOver(true);
    }, 1500);
  };

  // --- LOGIKA MENJAWAB (DETEKTIF) ---
  const handleDetectiveContainerTap = (containerId: string) => {
    if (!selectedItemId) return; 
    const item = remainingItems.find(i => i.id === selectedItemId);
    if (item?.correctContainerId === containerId) {
      playSuccessSound();
      setScore(prev => prev + 1);
      const newRemaining = remainingItems.filter(i => i.id !== selectedItemId);
      setRemainingItems(newRemaining);
      setSelectedItemId(null);
      if (newRemaining.length === 0) setIsGameOver(true);
    } else {
      playErrorSound();
      setSelectedItemId(null); 
    }
  };

  const handleClaimReward = async () => {
    if (earnedCoins > 0) playCoinSound(); 
    if (activeChildId) {
      const childRef = doc(db, "children", activeChildId);
      const updates: any = {};
      if (earnedCoins > 0) updates.coins = increment(earnedCoins);
      if (isPassed && isFirstWin) {
        updates.gameProgress = { ...rawProgress, [gameId]: Math.max(parseInt(levelId), rawProgress[gameId] || 0) };
      }
      if (Object.keys(updates).length > 0) await updateDoc(childRef, updates);
    }
    router.replace(`/child/games/${gameId}`);
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
        {/* Konten Game (Detektif / Pilihan Ganda) tetap sama, hanya referensi levelData yang sekarang dinamis */}
        {/* [BAGIAN UI DI BAWAH INI SAMA DENGAN KODE LAMA LU, SAYA PERSINGKAT UNTUK FORMAT JAWABAN] */}
        {isDetective ? (
            /* UI Detektif lu masukkan di sini */
            <div className="text-center">UI Detektif Active...</div>
        ) : (
            /* UI Pilihan Ganda lu masukkan di sini */
            <div className="text-center">UI Pilihan Ganda Active...</div>
        )}
      </div>
    </GameShell>
  );
}