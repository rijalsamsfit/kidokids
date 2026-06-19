"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // ✅ OBAT ANTI LEMOT 1: Pakai Link buat navigasi statis
import { ChevronLeft, Gamepad2, Lock, Sparkles, Home, School, Trees, Rocket, Star, Hammer } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { useModalStore } from "@/store/useModalStore";

export default function GameHub() {
  const router = useRouter();
  
  // Tarik data koin dan Kasta VIP (parentPlan) dari memori anak
  const { coins, parentPlan } = useGameStore();
  const { showAlert } = useModalStore();

  // State untuk efek portal dimensi
  const [isEnteringPortal, setIsEnteringPortal] = useState(false);

  // Daftar 5 Dunia Petualangan
  const worlds = [
    { id: 1, title: "Rumah Bahagia", desc: "Misi kebiasaan baik di rumah.", icon: Home, color: "text-pink-500", bg: "bg-pink-100", border: "border-pink-200" },
    { id: 2, title: "Akademi Hebat", desc: "Belajar jadi teman yang asyik di sekolah.", icon: School, color: "text-blue-500", bg: "bg-blue-100", border: "border-blue-200" },
    { id: 3, title: "Hutan Petualang", desc: "Berani dan peduli pada alam sekitar.", icon: Trees, color: "text-emerald-500", bg: "bg-emerald-100", border: "border-emerald-200" },
    { id: 4, title: "Kota Masa Depan", desc: "Menjadi pahlawan teknologi super.", icon: Rocket, color: "text-purple-500", bg: "bg-purple-100", border: "border-purple-200" },
    { id: 5, title: "Galaksi Pahlawan", desc: "Misi epik menyelamatkan tata surya!", icon: Star, color: "text-slate-700", bg: "bg-slate-200", border: "border-slate-300" }
  ];

  // Logika Klik Dunia (Portal / VIP Trap)
  const handleWorldClick = (worldId: number, title: string) => {
    if (worldId === 1) {
      // ✅ EFEK PORTAL DIMENSI: Nyalakan cahaya putih
      setIsEnteringPortal(true);
      
      // Jeda 800ms biar animasinya kerasa, baru pindah halaman
      setTimeout(() => {
        router.push("/child/games/emotion"); // Mengarah ke Peta Level
      }, 800);
      
    } else {
      // ✅ JEBAKAN PESTER POWER VIP
      if (parentPlan === "basic") {
        showAlert(
          "Terkunci Rapat! 🔒", 
          `Wah, Dunia ${title} hanya bisa dimasuki oleh Pahlawan VIP. Minta tolong Ayah/Bunda pakai Kunci VIP-nya ya!`
        );
      } else {
        showAlert(
          "Sedang Dibangun 🚧", 
          `Hore Pahlawan VIP! Paman Tukang sedang membangun wahana super seru di ${title}. Tunggu update selanjutnya ya!`
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 font-sans pb-10 relative">
      
      {/* ✅ ANIMASI PORTAL (Layar Putih Menyilaukan) */}
      <div 
        className={`fixed inset-0 bg-white z-[100] transition-opacity duration-700 ease-in flex flex-col items-center justify-center ${
          isEnteringPortal ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <Sparkles className="w-16 h-16 text-indigo-300 animate-spin mb-4" />
        <p className="text-xl font-black text-indigo-400 tracking-widest animate-pulse">Memasuki Dunia...</p>
      </div>

      {/* Header */}
      <div className="bg-indigo-600 p-6 rounded-b-[2rem] shadow-lg text-white sticky top-0 z-20">
        <div className="flex items-center justify-between mb-2">
          
          {/* ✅ OBAT ANTI LEMOT 2: Pakai Link bukan router.push untuk tombol Back */}
          <Link 
            href="/child"
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
          <Gamepad2 className="w-6 h-6 text-indigo-200" /> Peta Petualangan
        </h1>
        <p className="text-indigo-200 text-sm font-bold mt-1">Pilih dunia yang ingin kamu jelajahi!</p>
      </div>

      {/* Peta Dunia (Daftar Pulau Melayang) */}
      <div className="p-6 space-y-4">
        
        {worlds.map((world) => {
          const isUnlocked = world.id === 1;
          const Icon = world.icon;

          return (
            <div 
              key={world.id}
              onClick={() => handleWorldClick(world.id, world.title)}
              className={`relative bg-white rounded-[1.5rem] p-4 border-b-4 transition-all shadow-sm flex items-center gap-4 text-left cursor-pointer active:scale-95 ${
                isUnlocked ? `${world.border} hover:shadow-md` : "border-slate-200"
              }`}
            >
              {/* Overlay Kunci/Konstruksi untuk Dunia 2-5 */}
              {!isUnlocked && (
                <div className="absolute inset-0 bg-slate-100/60 backdrop-blur-[1px] rounded-[1.5rem] z-10 flex items-center justify-end pr-6">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border-2 border-slate-200">
                    {parentPlan === "basic" ? (
                      <Lock className="w-5 h-5 text-slate-400" />
                    ) : (
                      <Hammer className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                </div>
              )}

              {/* Ikon Dunia */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${isUnlocked ? world.bg : "bg-slate-100"}`}>
                <Icon className={`w-8 h-8 ${isUnlocked ? world.color : "text-slate-300"}`} />
              </div>

              {/* Teks Deskripsi */}
              <div className="flex-1 pr-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Dunia {world.id}</span>
                </div>
                <h3 className={`font-black text-base mb-0.5 leading-tight ${isUnlocked ? "text-slate-800" : "text-slate-500"}`}>
                  {world.title}
                </h3>
                <p className={`text-[11px] font-bold leading-relaxed ${isUnlocked ? "text-slate-500" : "text-slate-400"}`}>
                  {world.desc}
                </p>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}