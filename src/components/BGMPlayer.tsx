"use client";

import { useEffect, useRef } from "react";

export default function BGMPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const playAudio = async () => {
      if (audioRef.current) {
        // Atur volume ke 30% biar suara SFX dan suara karakter tetap kedengaran jelas
        audioRef.current.volume = 0.3; 
        try {
          // Coba mainkan otomatis
          await audioRef.current.play();
        } catch (error) {
          // Browser kadang ngeblokir lagu otomatis sebelum user nyentuh layar.
          // Jadi kita biarin aja, nanti pas user ngeklik sesuatu dia bakal nyala.
          console.log("Autoplay ditahan browser, menunggu interaksi user.");
        }
      }
    };

    playAudio();
  }, []);

  return (
    // Audio element disembunyikan (tidak ada UI-nya) tapi di-set looping
    <audio ref={audioRef} src="/sounds/bgm.mp3" loop />
  );
}