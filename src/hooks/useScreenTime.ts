"use client";

import { useState, useEffect } from "react";

export function useScreenTime(limitInMinutes: number = 30) {
  const [isSleepMode, setIsSleepMode] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  // Konversi menit ke detik untuk hitung mundur
  const [timeLeft, setTimeLeft] = useState(limitInMinutes * 60);

  useEffect(() => {
    // 1. Logika Pengecekan Jam Tidur (Sleep Mode)
    const checkSleepTime = () => {
      const currentHour = new Date().getHours();
      // Mengunci aplikasi jika waktu menunjukkan jam 21:00 malam hingga 04:59 pagi
      if (currentHour >= 21 || currentHour < 5) {
        setIsSleepMode(true);
      } else {
        setIsSleepMode(false);
      }
    };

    // Jalankan pengecekan pertama kali saat aplikasi dibuka
    checkSleepTime();
    
    // Cek ulang jam setiap 1 menit sekali (berjaga-jaga kalau anak main pas jam 20:59)
    const sleepInterval = setInterval(checkSleepTime, 60000);

    // 2. Logika Penghitung Waktu Main (Screen Time Limit)
    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          setIsTimeUp(true);
          return 0; // Berhenti di 0
        }
        return prevTime - 1;
      });
    }, 1000); // Berkurang 1 setiap 1 detik

    // Bersihkan interval ketika komponen/aplikasi ditutup agar tidak membebani memori HP
    return () => {
      clearInterval(sleepInterval);
      clearInterval(timerInterval);
    };
  }, [limitInMinutes]);

  // Format sisa waktu ke bentuk MM:SS (misal: 29:59) agar mudah ditampilkan di UI nanti
  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return { isSleepMode, isTimeUp, formattedTime: formatTime() };
}