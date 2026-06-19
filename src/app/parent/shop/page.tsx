"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { addRewardToDB, getRewardsFromDB, deleteRewardFromDB } from "@/lib/rewardService";
import { auth } from "@/lib/firebase";
import { Plus, Gift, Store, Coins, Sparkles, Trash2, X, Loader2, ShoppingBag } from "lucide-react";

// ✅ 1. IMPORT PABRIK POP-UP KIDO
import { useModalStore } from "@/store/useModalStore";

export default function ParentShopPage() {
  // ✅ 2. AMBIL FUNGSI CUSTOM ALERT & CONFIRM
  const { showAlert, showConfirm } = useModalStore();

  const [isRewardFormOpen, setIsRewardFormOpen] = useState(false);
  const [rewardTitle, setRewardTitle] = useState("");
  const [rewardCost, setRewardCost] = useState<number | "">(30);
  const [rewards, setRewards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const rewardTemplates = [
    { title: "Main HP 1 Jam", cost: 50 },
    { title: "Beli Es Krim", cost: 30 },
    { title: "Pilih Menu Makan Malam", cost: 60 },
    { title: "Main ke Taman", cost: 40 }
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchRewardsData();
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchRewardsData = async () => {
    setIsLoading(true);
    try {
      const fetchedRewards = await getRewardsFromDB();
      setRewards(fetchedRewards);
    } catch (error) {
      console.error("Gagal menarik data toko:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReward = async () => {
    // ✅ 3. VALIDASI PAKE CUSTOM ALERT
    if (!rewardTitle) return showAlert("Data Belum Lengkap", "Nama hadiah tidak boleh kosong ya!");
    if (rewardCost === "" || rewardCost <= 0) return showAlert("Harga Tidak Valid", "Harga koin harus lebih dari 0 dong!");
    
    try {
      await addRewardToDB(rewardTitle, Number(rewardCost));
      // ✅ 4. NOTIFIKASI SUKSES PAKE CUSTOM ALERT
      showAlert("Masuk Etalase! 🎉", `Hadiah "${rewardTitle}" berhasil dipajang di toko anak.`);
      setIsRewardFormOpen(false);
      setRewardTitle("");
      setRewardCost(30);
      fetchRewardsData(); 
    } catch (error) {
      showAlert("Gagal Menyimpan", "Sistem gagal menyimpan hadiah. Pastikan koneksi internetmu lancar.");
    }
  };

  const handleDeleteReward = (id: string) => {
    // ✅ 5. KONFIRMASI HAPUS PAKE CUSTOM CONFIRM
    showConfirm(
      "Hapus Hadiah? 🗑️",
      "Yakin mau menarik hadiah ini dari etalase toko?",
      async () => {
        try {
          await deleteRewardFromDB(id);
          fetchRewardsData(); 
        } catch (error) {
          showAlert("Gagal Menghapus", "Terjadi kesalahan saat menghapus hadiah. Coba lagi nanti.");
        }
      },
      "Ya, Hapus",
      "Batal"
    );
  };

  if (isLoading && rewards.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-amber-600 gap-3">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p>Menyiapkan Etalase Toko...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 relative font-sans">
      
      {/* HEADER KELOLA TOKO */}
      <div className="bg-amber-500 p-6 rounded-b-[2rem] shadow-md text-white relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-20">
          <Store className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex items-center space-x-3 mb-2">
          <div className="p-2.5 bg-amber-400/50 rounded-xl backdrop-blur-sm border border-amber-300/50">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Kelola Toko</h1>
            <p className="text-amber-100 text-sm font-medium">Atur hadiah yang bisa dibeli anak</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* TOMBOL BUAT HADIAH RAKSASA */}
        <button 
          onClick={() => setIsRewardFormOpen(true)}
          className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white p-5 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 transition-all active:scale-95"
        >
          <Plus className="w-6 h-6" />
          <span>Tambah Hadiah Baru</span>
        </button>

        {/* DAFTAR ETALASE */}
        <div>
          <h2 className="text-base font-black text-slate-800 flex items-center space-x-2 mb-4 ml-1">
            <Gift className="w-5 h-5 text-purple-500" />
            <span>Isi Etalase Saat Ini</span>
          </h2>

          <div className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden ${rewards.length === 0 ? 'items-center justify-center text-center' : ''}`}>
            {rewards.length === 0 ? (
              <>
                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100 relative z-10">
                  <Store className="w-8 h-8 text-purple-500" />
                </div>
                <div className="relative z-10 mt-3">
                  <p className="font-bold text-slate-700 text-[15px]">Toko Masih Kosong</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                    Klik tombol di atas untuk menambahkan hadiah ke dalam etalase.
                  </p>
                </div>
              </>
            ) : (
              <div className="w-full space-y-3 z-10 relative">
                {rewards.map(reward => (
                  <div key={reward.id} className="flex items-center justify-between bg-purple-50/50 p-4 rounded-2xl border border-purple-100 hover:border-purple-200 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-xl">
                        <Gift className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">{reward.title}</p>
                        <p className="text-sm font-extrabold text-amber-500 flex items-center gap-1 mt-0.5">
                          <Coins className="w-4 h-4" /> {reward.cost} Koin
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteReward(reward.id)} 
                      className="p-2 text-rose-400 hover:bg-rose-100 rounded-xl transition-colors active:scale-95"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      <Navigation />

      {/* MODAL FORM TAMBAH HADIAH */}
      {isRewardFormOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white w-full sm:w-[400px] max-h-[90vh] overflow-y-auto rounded-t-[2rem] sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                <Gift className="w-6 h-6 text-purple-500" /> Jual Hadiah Baru
              </h3>
              <button onClick={() => setIsRewardFormOpen(false)} className="p-2 bg-slate-100 text-slate-400 rounded-full hover:bg-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Pilih Cepat (Sekali Klik)
              </label>
              <div className="flex flex-wrap gap-2">
                {rewardTemplates.map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setRewardTitle(template.title);
                      setRewardCost(template.cost);
                    }}
                    className="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 px-3 py-2 rounded-xl text-[13px] font-bold flex items-center transition-colors active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> {template.title} ({template.cost})
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-px bg-slate-200 flex-1"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ATAU KETIK CUSTOM</span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-bold text-slate-600 ml-1">Nama Hadiah</label>
                <input 
                  type="text" 
                  value={rewardTitle}
                  onChange={(e) => setRewardTitle(e.target.value)}
                  placeholder="Cth: Bebas Main iPad 1 Jam" 
                  className="w-full mt-1.5 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-purple-400 focus:bg-white outline-none transition-all font-medium text-slate-700" 
                />
              </div>
              
              <div>
                <label className="text-sm font-bold text-slate-600 ml-1">Harga (Koin KIDO)</label>
                <div className="flex items-center space-x-3 mt-1.5">
                  <div className="p-4 bg-amber-100 rounded-2xl border-2 border-amber-200">
                    <Coins className="w-6 h-6 text-amber-500" />
                  </div>
                  <input 
                    type="number" 
                    value={rewardCost}
                    onChange={(e) => setRewardCost(e.target.value === "" ? "" : Number(e.target.value))}
                    min="1"
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-400 focus:bg-white outline-none transition-all font-black text-slate-700 text-lg" 
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleAddReward} 
              className="w-full mt-8 py-4 font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-2xl shadow-lg shadow-purple-200 transition-all active:scale-95"
            >
              Simpan ke Etalase Toko
            </button>
          </div>
        </div>
      )}
    </div>
  );
}