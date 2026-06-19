"use client";

import Link from "next/link";
import { ChevronLeft, Heart, Sparkles, Search, Gamepad2, Home } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";

export default function World1Lobby() {
  const { coins } = useGameStore();

  return (
    <div className="min-h-screen bg-pink-50 font-sans pb-10">
      
      {/* Header Dunia 1 */}
      <div className="bg-pink-500 p-6 rounded-b-[2rem] shadow-lg text-white sticky top-0 z-20">
        <div className="flex items-center justify-between mb-2">
          <Link 
            href="/child/games"
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm active:scale-90"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </Link>
          <div className="bg-amber-400 px-4 py-1.5 rounded-full border-2 border-amber-300 shadow-inner flex items-center gap-2">
            <span className="font-black text-amber-900">{coins}</span>
            <div className="w-5 h-5 bg-yellow-200 rounded-full flex items-center justify-center font-bold text-amber-600 text-xs">C</div>
          </div>
        </div>
        <h1 className="text-2xl font-black flex items-center gap-2 mt-4">
          <Home className="w-6 h-6 text-pink-200" /> Rumah Bahagia
        </h1>
        <p className="text-pink-100 text-sm font-bold mt-1">Pilih misi kebiasaan baik pertamamu!</p>
      </div>

      {/* Daftar Mini-Games di Dunia 1 */}
      <div className="p-6 space-y-4">
        
        {/* GAME 1: Tebak Perasaan */}
        <Link 
          href="/child/games/emotion"
          className="w-full bg-white rounded-3xl p-4 border-b-4 border-pink-200 hover:border-pink-300 active:border-b-0 active:translate-y-1 transition-all shadow-sm flex items-center gap-4 text-left group block"
        >
          <div className="w-20 h-20 bg-pink-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Heart className="w-10 h-10 text-pink-500 fill-pink-500 animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-lg mb-1">Tebak Perasaan</h3>
            <p className="text-xs font-bold text-slate-500 leading-relaxed">Latih empatimu dengan membantu teman-teman yang sedang sedih atau marah.</p>
          </div>
        </Link>

        {/* GAME 2: Kata Ajaib */}
        <Link 
          href="/child/games/magic-words"
          className="w-full bg-white rounded-3xl p-4 border-b-4 border-amber-200 hover:border-amber-300 active:border-b-0 active:translate-y-1 transition-all shadow-sm flex items-center gap-4 text-left group block"
        >
          <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Sparkles className="w-10 h-10 text-amber-500 fill-amber-500 animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-lg mb-1">Kata Ajaib</h3>
            <p className="text-xs font-bold text-slate-500 leading-relaxed">Belajar mengucapkan Maaf, Tolong, dan Terima Kasih di saat yang tepat!</p>
          </div>
        </Link>

        {/* GAME 3: Detektif Kamar */}
        <Link 
          href="/child/games/detective"
          className="w-full bg-white rounded-3xl p-4 border-b-4 border-emerald-200 hover:border-emerald-300 active:border-b-0 active:translate-y-1 transition-all shadow-sm flex items-center gap-4 text-left group block"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Search className="w-10 h-10 text-emerald-500 animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-lg mb-1">Detektif Kamar</h3>
            <p className="text-xs font-bold text-slate-500 leading-relaxed">Ayo bantu kembalikan barang-barang yang berantakan ke tempat asalnya.</p>
          </div>
        </Link>

      </div>
    </div>
  );
}