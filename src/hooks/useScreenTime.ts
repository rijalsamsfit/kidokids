"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";

export function useScreenTime(limitInMinutes: number = 30) {
  const { activeChildId } = useGameStore();
  
  const [isSleepMode, setIsSleepMode] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [timeLeft, setTimeLeft] = useState(limitInMinutes * 60);

  // Helper untuk mendapatkan key penyimpanan unik per anak & per hari
  const getStorageKey = (childId: string) => {
    const today = new Date().toLocaleDateString("id-ID").replace(/\//g, "-");
    return `kido-screentime-elapsed-${childId}-${today}`;
  };

  // ==========================================================
  // 🔥 BONUS WAKTU ENGINE (Bisa dipanggil langsung dari komponen)
  // ==========================================================
  const grantBonusTime = (bonusMinutes: number = 10) => {
    if (!activeChildId) return;
    
    const key = getStorageKey(activeChildId);
    const currentElapsed = parseInt(localStorage.getItem(key) || "0", 10);
    const bonusSeconds = bonusMinutes * 60;
    
    // Potong waktu terpakai (Gunakan Math.max agar tidak minus)
    const newElapsed = Math.max(0, currentElapsed - bonusSeconds);
    localStorage.setItem(key, newElapsed.toString());

    // Update state secara instan supaya UI langsung bertambah waktunya tanpa nunggu interval detik berikutnya
    const totalLimitSeconds = limitInMinutes * 60;
    const calculatedTimeLeft = totalLimitSeconds - newElapsed;
    
    setTimeLeft(calculatedTimeLeft > 0 ? calculatedTimeLeft : 0);
    setIsTimeUp(calculatedTimeLeft <= 0);
  };

  // ==========================================
  // CORE ENGINE: SCREEN TIME & SLEEP MODE
  // ==========================================
  useEffect(() => {
    if (!activeChildId) return;

    const key = getStorageKey(activeChildId);
    const totalLimitSeconds = limitInMinutes * 60;

    const savedElapsed = localStorage.getItem(key);
    let initialElapsed = 0;

    if (savedElapsed !== null) {
      initialElapsed = parseInt(savedElapsed, 10);
    } else {
      localStorage.setItem(key, "0");
    }

    const initialTimeLeft = totalLimitSeconds - initialElapsed;
    if (initialTimeLeft <= 0) {
      setTimeLeft(0);
      setIsTimeUp(true);
    } else {
      setTimeLeft(initialTimeLeft);
      setIsTimeUp(false);
    }

    const checkSleepTime = () => {
      const currentHour = new Date().getHours();
      if (currentHour >= 21 || currentHour < 5) {
        setIsSleepMode(true);
      } else {
        setIsSleepMode(false);
      }
    };

    checkSleepTime();
    const sleepInterval = setInterval(checkSleepTime, 60000);

    const timerInterval = setInterval(() => {
      let elapsedSeconds = parseInt(localStorage.getItem(key) || "0", 10);
      const currentLimitSeconds = limitInMinutes * 60;

      if (elapsedSeconds >= currentLimitSeconds) {
        setIsTimeUp(true);
        setTimeLeft(0);
        return;
      }

      elapsedSeconds += 1;
      localStorage.setItem(key, elapsedSeconds.toString());

      const calculatedTimeLeft = currentLimitSeconds - elapsedSeconds;
      
      if (calculatedTimeLeft <= 0) {
        setIsTimeUp(true);
        setTimeLeft(0);
      } else {
        setIsTimeUp(false);
        setTimeLeft(calculatedTimeLeft);
      }
    }, 1000);

    return () => {
      clearInterval(sleepInterval);
      clearInterval(timerInterval);
    };
  }, [activeChildId, limitInMinutes]);

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // ✅ Kembalikan fungsi grantBonusTime agar bisa di-destructure di komponen luar
  return { isSleepMode, isTimeUp, formattedTime: formatTime(), grantBonusTime };
}