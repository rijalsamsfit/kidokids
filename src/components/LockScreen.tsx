"use client";

import { MoonStar, Hourglass, ShieldAlert } from "lucide-react";

interface LockScreenProps {
  type: "sleep" | "timeUp";
}

export default function LockScreen({ type }: LockScreenProps) {
  // Mengecek apakah tipe kuncian karena jam tidur atau karena batas waktu main habis
  const isSleep = type === "sleep";

  return (
    // z-[100] memastikan layar ini berada di lapisan paling atas, menutupi navigasi dan header
    <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      
      {/* Kartu Pesan Terkunci */}
      <div className="bg-slate-800 p-8 rounded-[3rem] border border-slate-700 shadow-2xl shadow-blue-900/20 max-w-sm w-full flex flex-col items-center relative overflow-hidden">
        
        {/* Dekorasi Bintang Latar */}
        <div className="absolute top-6 left-6 animate-pulse text-slate-600">
          <MoonStar className="w-6 h-6" />
        </div>
        <div className="absolute bottom-12 right-6 animate-pulse delay-300 text-slate-600">
          <MoonStar className="w-5 h-5" />
        </div>

        {/* Ikon Utama (Bulan untuk tidur, Jam Pasir untuk waktu habis) */}
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-xl ${isSleep ? 'bg-indigo-500/20 text-indigo-400' : 'bg-rose-500/20 text-rose-400'}`}>
          {isSleep ? (
            <MoonStar className="w-12 h-12 animate-bounce" />
          ) : (
            <Hourglass className="w-12 h-12 animate-pulse" />
          )}
        </div>

        {/* Teks Pesan Edukatif */}
        <h2 className="text-2xl font-extrabold text-white mb-3 tracking-wide">
          {isSleep ? "Waktunya Tidur!" : "Waktu Habis!"}
        </h2>
        <p className="text-slate-300 text-sm font-medium leading-relaxed mb-8 px-2">
          {isSleep
            ? "Pahlawan super juga butuh istirahat yang cukup biar besok kuat lagi. Yuk, pejamkan mata!"
            : "Misi kamu hari ini udah keren banget! Sekarang saatnya istirahat dari layar ya."}
        </p>

        {/* Badge Sistem / Keamanan Orang Tua */}
        <div className="flex items-center space-x-2 bg-slate-900/80 px-4 py-2.5 rounded-full border border-slate-700 shadow-inner">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-400">Dikunci oleh Sistem KIDO</span>
        </div>
        
      </div>
    </div>
  );
}