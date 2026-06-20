"use client";

import { useEffect } from "react";
import { usePWAStore } from "@/store/usePWAStore";

export default function PWAListener() {
  const { setDeferredPrompt, clearPrompt } = usePWAStore();

  useEffect(() => {
    // 1. Fungsi Pencegatan!
    const handleBeforeInstallPrompt = (e: any) => {
      // MENCEGAH Chrome memunculkan notif putih jelek bawaannya!
      e.preventDefault();
      
      // SIMPAN sinyalnya ke dalam "Laci" (Zustand) yang kita bikin tadi
      setDeferredPrompt(e);
      
      console.log("Sinyal Download berhasil ditangkap dan dibajak!");
    };

    // 2. Fungsi Pembersihan (Kalau Ortu udah selesai install)
    const handleAppInstalled = () => {
      clearPrompt();
      console.log("KIDO KIDS berhasil di-install di HP!");
    };

    // Pasang kuping (listener) ke browser
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Copot kuping kalau komponen mati (cleanup)
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [setDeferredPrompt, clearPrompt]);

  // Komponen ini gak nampilin UI apa-apa (Siluman)
  return null;
}