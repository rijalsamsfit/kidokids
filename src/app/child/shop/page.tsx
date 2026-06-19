"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import { useGameStore } from "@/store/useGameStore";
import { getRewardsFromDB } from "@/lib/rewardService";
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment, getDoc, addDoc, collection } from "firebase/firestore";
import { Store, Coins, Gift, Sparkles, Lock, Loader2 } from "lucide-react";

// ✅ 1. IMPORT PABRIK POP-UP KIDO
import { useModalStore } from "@/store/useModalStore";

export default function ChildShop() {
  const router = useRouter();
  
  // Tarik data dan status hidratasi dari brankas Zustand
  const { activeChildId, activeChildName, coins, addCoins, hasHydrated } = useGameStore();

  // ✅ 2. AMBIL FUNGSI CUSTOM ALERT
  const { showAlert, showConfirm } = useModalStore();

  const [rewards, setRewards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // GUARD 1: Tunggu sampai Zustand selesai membaca data sesi anak dari memori HP
    if (!hasHydrated) return;

    // GUARD 2: Kalau sudah siap tapi gak ada ID Anak, tendang ke luar (Layar PIN)
    if (!activeChildId) {
      router.push("/child/login");
      return;
    }

    // Kalau semua aman, baru gelar lapak tokonya
    fetchShopData();
  }, [activeChildId, router, hasHydrated]); 

  const fetchShopData = async () => {
    setIsLoading(true);
    try {
      // Narik data etalase hadiah
      const fetchedRewards = await getRewardsFromDB();
      setRewards(fetchedRewards);
      
      // Sinkronkan ulang koin dari database untuk memastikan akurasi
      const childRef = doc(db, "children", activeChildId!);
      const childSnap = await getDoc(childRef);
      if (childSnap.exists()) {
        useGameStore.setState({ coins: childSnap.data().coins });
      }
    } catch (error) {
      console.error("Gagal menarik data toko:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyReward = async (reward: any) => {
    if (!activeChildId) return;

    // Keamanan ganda: Cek apakah koin cukup
    if (coins < reward.cost) {
      // ✅ 3. ALERT KALAU KOIN KURANG
      showAlert(
        "Koin Kurang! 🪙", 
        "Yah, koin kamu belum cukup! Yuk kerjain misi lagi buat tambah koin."
      );
      return;
    }

    // ✅ 4. CUSTOM CONFIRM ANAK MAU BELI
    showConfirm(
      "Mau Tukar Koin?",
      `Kamu mau menukar ${reward.cost} Koin dengan hadiah "${reward.title}"?`,
      async () => {
        setIsProcessing(true);
        try {
          // 1. Potong koin anak di Firebase (pakai angka minus)
          const childRef = doc(db, "children", activeChildId);
          await updateDoc(childRef, {
            coins: increment(-reward.cost)
          });

          // 2. Rekam riwayat klaim hadiah untuk dilaporkan ke Orang Tua
          await addDoc(collection(db, "claimed_rewards"), {
            childId: activeChildId,
            childName: activeChildName || "Pahlawan",
            rewardId: reward.id,
            rewardTitle: reward.title,
            cost: reward.cost,
            status: "pending", // "pending" berarti hadiah belum diserahkan oleh Ortu
            claimedAt: new Date().toISOString()
          });

          // 3. Update koin di Zustand (otomatis layar langsung update tanpa refresh)
          addCoins(-reward.cost);

          // ✅ 5. CUSTOM ALERT PAS BERHASIL BELI
          showAlert(
            "Hadiah Diamankan! 🎉", 
            `Hore! Kamu berhasil menukarkan hadiah: ${reward.title}. Langsung kasih tau Ayah/Ibu ya buat minta hadiahnya!`
          );

        } catch (error) {
          showAlert("Ups! Ada Masalah", "Gagal menukar koin. Pastikan internet kamu lancar ya!");
          console.error("Gagal klaim hadiah:", error);
        } finally {
          setIsProcessing(false);
        }
      },
      "Ya, Beli",
      "Batal"
    );
  };

  // LAYAR LOADING UTAMA: Menahan UI jika Zustand belum selesai berpikir atau data lagi ditarik
  if (!mounted || !hasHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center font-bold text-amber-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="animate-pulse">Membuka Pintu Toko Kido...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 relative font-sans">
      
      {/* HEADER TOKO */}
      <div className="bg-amber-500 p-6 rounded-b-[2rem] shadow-md text-white relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute -right-4 -top-4 opacity-20">
          <Store className="w-32 h-32" />
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-black mb-1 tracking-tight flex items-center gap-2">
                Toko Kido <Sparkles className="w-6 h-6 text-yellow-200 fill-yellow-200 animate-pulse" />
              </h1>
              <p className="text-amber-100 text-sm font-bold">Tukarkan koinmu dengan hadiah seru!</p>
            </div>
          </div>
          
          {/* Dompet Koin Anak */}
          <div className="mt-6 bg-white/20 p-4 rounded-2xl flex items-center justify-between border border-white/30 backdrop-blur-md shadow-inner">
            <div className="flex flex-col">
              <span className="text-amber-100 text-[11px] font-black uppercase tracking-wider mb-0.5">Dompet Koin</span>
              <span className="font-extrabold text-xl leading-tight capitalize">{activeChildName || "Pahlawan"}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 transform transition-transform hover:scale-105 cursor-default">
              <Coins className="w-6 h-6 text-amber-500" />
              <span className="font-black text-2xl text-amber-600">{coins}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DAFTAR BARANG DAGANGAN */}
      <div className="p-6">
        <h2 className="text-base font-black text-slate-800 flex items-center space-x-2 mb-4">
          <Gift className="w-5 h-5 text-purple-500" />
          <span>Pilih Hadiahmu</span>
        </h2>

        {rewards.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Store className="w-10 h-10 text-slate-300" />
            </div>
            <p className="font-bold text-slate-600 text-lg">Toko Sedang Tutup</p>
            <p className="text-sm text-slate-400 mt-2">Ayah/Ibu belum menaruh hadiah di etalase. Coba cek lagi nanti ya!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rewards.map((reward) => {
              // Cek apakah koin anak cukup untuk beli item ini
              const isAffordable = coins >= reward.cost;

              return (
                <div 
                  key={reward.id} 
                  className={`bg-white rounded-3xl p-5 border-2 shadow-sm relative overflow-hidden transition-all ${
                    isAffordable ? "border-purple-100 hover:border-purple-300" : "border-slate-100 opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${isAffordable ? "bg-purple-100 text-purple-600" : "bg-slate-100 text-slate-400"}`}>
                      <Gift className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                      <Coins className={`w-4 h-4 ${isAffordable ? "text-amber-500" : "text-slate-400"}`} />
                      <span className={`font-black text-sm ${isAffordable ? "text-amber-600" : "text-slate-500"}`}>
                        {reward.cost}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-slate-800 text-[17px] leading-tight mb-4">{reward.title}</h3>
                  
                  <button 
                    onClick={() => handleBuyReward(reward)}
                    disabled={!isAffordable || isProcessing}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      isAffordable 
                        ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 active:scale-95" 
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isAffordable ? (
                      <>Tukar Koin</>
                    ) : (
                      <><Lock className="w-4 h-4" /> Koin Kurang</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
}