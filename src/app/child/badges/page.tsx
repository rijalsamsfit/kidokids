"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import { useGameStore } from "@/store/useGameStore";
// ✅ TAMBAHAN: Import Loader2 untuk efek loading
import { Trophy, Star, Shield, Flame, Lock, Medal, Award, Sparkles, Loader2 } from "lucide-react";

// MASTER DATA BADGE (ID harus sama dengan yang di missionService.ts)
const MASTER_BADGES = [
  { 
    id: "badge_pemula", 
    title: "Langkah Pertama", 
    desc: "Selesaikan 1 misi pertamamu sebagai Pahlawan.", 
    icon: Star, 
    color: "text-blue-500", 
    bg: "bg-blue-100",
    border: "border-blue-400"
  },
  { 
    id: "badge_rajin", 
    title: "Api Semangat", 
    desc: "Selesaikan total 5 misi kebaikan.", 
    icon: Flame, 
    color: "text-orange-500", 
    bg: "bg-orange-100",
    border: "border-orange-400"
  },
  { 
    id: "badge_sapu_emas", 
    title: "Sapu Emas", 
    desc: "Luar biasa! Selesaikan total 10 misi.", 
    icon: Trophy, 
    color: "text-amber-500", 
    bg: "bg-amber-100",
    border: "border-amber-400"
  },
  { 
    id: "badge_pahlawan_super", 
    title: "Pahlawan Super", 
    desc: "Legenda Sejati! Selesaikan total 30 misi.", 
    icon: Shield, 
    color: "text-purple-500", 
    bg: "bg-purple-100",
    border: "border-purple-400"
  }
];

export default function ChildBadges() {
  const router = useRouter();
  
  // ✅ PERBAIKAN: Tarik hasHydrated dari laci Zustand
  const { activeChildId, activeChildName, unlockedBadges, hasHydrated } = useGameStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // ✅ GUARD 1: Tunggu Hydration selesai
    if (!hasHydrated) return;

    // ✅ GUARD 2: KEAMANAN: Kalau belum masukin PIN, tendang ke luar
    if (!activeChildId) {
      router.push("/child/login");
    }
  }, [activeChildId, router, hasHydrated]); // ✅ Tambahkan hasHydrated

  // ✅ PERBAIKAN LOADING: Tahan UI sampai aman dengan loader yang seragam
  if (!mounted || !hasHydrated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="font-bold text-indigo-500 animate-pulse">Membuka Lemari Trofi...</p>
      </div>
    );
  }

  // Menghitung berapa badge yang sudah didapat
  const safeUnlockedBadges = unlockedBadges || [];
  const totalUnlocked = safeUnlockedBadges.length;
  const totalBadges = MASTER_BADGES.length;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 relative font-sans">
      
      {/* HEADER LEMARI TROFI */}
      <div className="bg-indigo-600 p-6 rounded-b-[2rem] shadow-md text-white relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute -right-4 -top-4 opacity-20">
          <Medal className="w-32 h-32" />
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-black mb-1 tracking-tight flex items-center gap-2">
                Lemari Trofi <Sparkles className="w-6 h-6 text-yellow-300 fill-yellow-300" />
              </h1>
              <p className="text-indigo-100 text-sm font-bold">Koleksi pencapaian {activeChildName || "Pahlawan"}!</p>
            </div>
          </div>
          
          {/* Progress Bar Badge */}
          <div className="mt-6 bg-white/20 p-4 rounded-2xl border border-white/30 backdrop-blur-md shadow-inner">
            <div className="flex justify-between items-end mb-2">
              <span className="text-indigo-100 text-xs font-black uppercase tracking-wider">Koleksi Terkumpul</span>
              <span className="font-extrabold text-xl text-white">{totalUnlocked} / {totalBadges}</span>
            </div>
            <div className="w-full bg-indigo-950/30 rounded-full h-3">
              <div 
                className="bg-yellow-400 h-3 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                style={{ width: `${(totalUnlocked / totalBadges) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* RAK TROFI */}
      <div className="p-6">
        <h2 className="text-base font-black text-slate-800 flex items-center space-x-2 mb-4">
          <Award className="w-5 h-5 text-indigo-500" />
          <span>Daftar Penghargaan</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MASTER_BADGES.map((badge) => {
            const isUnlocked = safeUnlockedBadges.includes(badge.id);
            const Icon = badge.icon;

            return (
              <div 
                key={badge.id} 
                className={`relative overflow-hidden rounded-3xl p-5 border-2 transition-all duration-300 ${
                  isUnlocked 
                    ? `bg-white shadow-md ${badge.border} transform hover:scale-105` 
                    : "bg-slate-100 border-slate-200 shadow-none grayscale-[80%] opacity-80"
                }`}
              >
                {/* Efek Cahaya kalau udah unlock */}
                {isUnlocked && (
                  <div className="absolute -right-10 -top-10 w-24 h-24 bg-white/40 blur-2xl rounded-full"></div>
                )}

                <div className="flex items-start gap-4 relative z-10">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 shrink-0 ${
                    isUnlocked ? `${badge.bg} ${badge.border} ${badge.color}` : "bg-slate-200 border-slate-300 text-slate-400"
                  }`}>
                    {isUnlocked ? (
                      <Icon className="w-8 h-8" />
                    ) : (
                      <Lock className="w-7 h-7" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`font-black text-lg leading-tight mb-1 ${isUnlocked ? "text-slate-800" : "text-slate-500"}`}>
                      {badge.title}
                    </h3>
                    <p className={`text-xs font-bold ${isUnlocked ? "text-slate-500" : "text-slate-400"}`}>
                      {badge.desc}
                    </p>
                    
                    {!isUnlocked && (
                      <div className="mt-2 inline-block bg-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md">
                        Terkunci
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Navigation />
    </div>
  );
}