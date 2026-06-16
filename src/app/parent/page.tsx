"use client";

import { useState, useEffect } from "react";
// ✅ Import Link untuk routing
import Link from "next/link";
import Navigation from "@/components/Navigation";
import MissionForm from "@/components/MissionForm";
import { addMissionToDB, getMissionsFromDB, reviewMissionInDB } from "@/lib/missionService"; 
import { getChildrenProfiles } from "@/lib/childService";
import { addRewardToDB, getRewardsFromDB, deleteRewardFromDB } from "@/lib/rewardService";
import { auth } from "@/lib/firebase";
// ✅ Tambahkan icon Settings di import lucide-react
import { Plus, CheckCircle2, Clock, Star, RefreshCw, ThumbsUp, ThumbsDown, Eye, ZoomIn, X, Gift, Store, Coins, Sparkles, Trash2, Users, Settings } from "lucide-react";

export default function ParentDashboard() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pendingMissions, setPendingMissions] = useState<any[]>([]);
  const [childrenData, setChildrenData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // STATE: Untuk Toko Kido
  const [isRewardFormOpen, setIsRewardFormOpen] = useState(false);
  const [rewardTitle, setRewardTitle] = useState("");
  const [rewardCost, setRewardCost] = useState<number | "">(30);
  const [rewards, setRewards] = useState<any[]>([]);

  const rewardTemplates = [
    { title: "Main HP 1 Jam", cost: 50 },
    { title: "Beli Es Krim", cost: 30 },
    { title: "Pilih Menu Makan Malam", cost: 60 },
    { title: "Main ke Taman", cost: 40 }
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchDashboardData();
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [profiles, missions, fetchedRewards] = await Promise.all([
        getChildrenProfiles(),
        getMissionsFromDB(),
        getRewardsFromDB()
      ]);
      
      setChildrenData(profiles);
      setPendingMissions(missions);
      setRewards(fetchedRewards); 
    } catch (error) {
      console.error("Gagal menarik data dasbor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMission = async (newMission: any) => {
    try {
      await addMissionToDB(newMission.title, newMission.xp, newMission.time, newMission.isFavorite);
      fetchDashboardData(); 
      setIsFormOpen(false); 
    } catch (error) {
      alert("Gagal menyimpan misi, pastikan koneksi internetmu lancar!");
    }
  };

  const handleReview = async (missionId: string, status: "approved" | "rejected", xpReward: number) => {
    const confirmAction = window.confirm(`Apakah kamu yakin ingin ${status === "approved" ? "MENYETUJUI" : "MENOLAK"} misi ini?`);
    if (!confirmAction) return;

    try {
      await reviewMissionInDB(missionId, status, xpReward);
      alert(status === "approved" ? "🎉 Misi disetujui! XP & Koin telah dikirim ke akun anak." : "Misi ditolak. Anak diminta mengirim ulang foto.");
      fetchDashboardData(); 
    } catch (error) {
      alert("Gagal memproses tindakan. Coba lagi.");
    }
  };

  const handleAddReward = async () => {
    if (!rewardTitle) return alert("Nama hadiah harus diisi!");
    if (rewardCost === "" || rewardCost <= 0) return alert("Harga koin harus lebih dari 0!");
    
    try {
      await addRewardToDB(rewardTitle, Number(rewardCost));
      alert(`🎉 Hadiah "${rewardTitle}" berhasil ditambahkan ke Etalase!`);
      setIsRewardFormOpen(false);
      setRewardTitle("");
      setRewardCost(30);
      fetchDashboardData(); 
    } catch (error) {
      alert("Gagal menyimpan hadiah. Pastikan koneksi aman.");
    }
  };

  const handleDeleteReward = async (id: string) => {
    const confirmDelete = window.confirm("Yakin mau hapus hadiah ini dari toko?");
    if (!confirmDelete) return;

    try {
      await deleteRewardFromDB(id);
      fetchDashboardData(); 
    } catch (error) {
      alert("Gagal menghapus hadiah.");
    }
  };

  if (isLoading && childrenData.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-emerald-600 animate-pulse">
        Menyiapkan Dasbor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 relative">
      
      <div className="bg-emerald-600 p-6 rounded-b-[2rem] shadow-md text-white">
        {/* ✅ Ikon Roda Gigi ditaruh secara elegan di pojok kanan atas Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-extrabold mb-1 tracking-tight">Dasbor Orang Tua</h1>
            <p className="text-emerald-100 text-sm font-medium">Pantau kehebatan anak-anak hari ini</p>
          </div>
          <Link 
            href="/parent/settings" 
            className="p-2.5 bg-emerald-500/50 hover:bg-emerald-500 rounded-full transition-all backdrop-blur-sm active:scale-95 shadow-sm border border-emerald-400/30"
          >
            <Settings className="w-5 h-5 text-white" />
          </Link>
        </div>
        
        <div className="mt-6 flex flex-col gap-3">
          {childrenData.map((child) => (
            <div key={child.id} className="bg-emerald-500/50 p-4 rounded-2xl flex items-center justify-between border border-emerald-400/50 backdrop-blur-sm">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-emerald-600 font-black text-2xl shadow-inner uppercase">
                  {child.name ? child.name.charAt(0) : "?"}
                </div>
                <div>
                  <p className="font-bold text-lg leading-tight capitalize">{child.name}</p>
                  <p className="text-xs text-emerald-100 font-semibold mt-1">Level {child.level || 1} • {child.xp || 0} XP • <span className="text-yellow-300 font-bold">{child.coins || 0} Koin</span></p>
                </div>
              </div>
              <div className="p-3 bg-emerald-400 rounded-xl shadow-sm">
                <Star className="w-7 h-7 text-yellow-300 fill-yellow-300" />
              </div>
            </div>
          ))}

          {childrenData.length === 0 && !isLoading && (
            <div className="bg-emerald-500/50 p-4 rounded-2xl flex flex-col items-center justify-center border border-emerald-400/50 border-dashed text-center">
              <Users className="w-8 h-8 text-emerald-200 mb-2" />
              <p className="text-emerald-50 text-sm font-bold">Belum ada profil anak.</p>
              <p className="text-emerald-200 text-xs mt-1">Nanti kita tambahkan fitur buat anak di sini.</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-8">
        
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">Menunggu Verifikasi</h2>
            <div className="flex items-center space-x-3">
              <button onClick={fetchDashboardData} className="text-slate-400 hover:text-emerald-600 transition-colors">
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
                {pendingMissions.length} Misi
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            {pendingMissions.length === 0 && !isLoading && (
              <p className="text-center text-slate-400 text-sm py-4">Belum ada misi. Yuk buat misi baru!</p>
            )}
            
            {pendingMissions.map((mission) => (
              <div key={mission.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-[15px]">{mission.title}</p>
                      <p className="text-xs text-slate-400 font-semibold">{mission.time} • <span className="text-emerald-600">+{mission.xpReward || mission.xp} XP</span></p>
                    </div>
                  </div>
                  
                  {mission.status === 'approved' && <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-wider">Disetujui</span>}
                  {mission.status === 'rejected' && <span className="px-2.5 py-1 bg-rose-100 text-rose-700 rounded-lg text-[10px] font-black uppercase tracking-wider">Ditolak</span>}
                  {mission.status === 'pending_approval' && <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-wider animate-pulse">Butuh Cek</span>}
                  {mission.status === 'pending' && <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-wider">Belum Dikerjakan</span>}
                </div>

                {mission.status === "pending_approval" && mission.proofImgUrl && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3 mt-2">
                    <p className="text-xs font-bold text-slate-500 flex items-center space-x-1">
                      <Eye className="w-3.5 h-3.5" /> <span>Klik foto untuk memperbesar:</span>
                    </p>
                    
                    <div className="relative group cursor-pointer overflow-hidden rounded-xl border border-slate-200" onClick={() => setSelectedImage(mission.proofImgUrl)}>
                      <img src={mission.proofImgUrl} alt="Bukti Misi Anak" className="w-full h-36 object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="text-white w-8 h-8 drop-shadow-md" />
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-1">
                      <button onClick={() => handleReview(mission.id, "approved", mission.xpReward || mission.xp)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 transition-all">
                        <ThumbsUp className="w-3.5 h-3.5" /><span>Setujui (Kirim XP)</span>
                      </button>
                      <button onClick={() => handleReview(mission.id, "rejected", mission.xpReward || mission.xp)} className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 border border-rose-200 active:scale-95 transition-all">
                        <ThumbsDown className="w-3.5 h-3.5" /><span>Tolak</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <Gift className="w-5 h-5 text-purple-500" />
              <span>Etalase Hadiah</span>
            </h2>
            {rewards.length > 0 && (
              <button onClick={() => setIsRewardFormOpen(true)} className="text-purple-600 hover:bg-purple-100 bg-purple-50 p-1.5 rounded-lg transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden ${rewards.length === 0 ? 'items-center justify-center text-center' : ''}`}>
            {rewards.length === 0 ? (
              <>
                <div className="absolute -right-6 -top-6 text-purple-50 opacity-50"><Store className="w-32 h-32" /></div>
                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100 relative z-10">
                  <Store className="w-8 h-8 text-purple-500" />
                </div>
                <div className="relative z-10 mt-3">
                  <p className="font-bold text-slate-700 text-[15px]">Toko Masih Kosong</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                    Tambahkan hadiah seperti "Main PS 1 Jam" agar anak makin semangat kumpulin koin!
                  </p>
                </div>
                <button 
                  onClick={() => setIsRewardFormOpen(true)} 
                  className="mt-4 bg-purple-100 hover:bg-purple-200 text-purple-700 px-5 py-2.5 rounded-xl text-sm font-extrabold flex items-center space-x-2 transition-colors relative z-10 shadow-sm"
                >
                  <Plus className="w-4 h-4 border-2 border-purple-700 rounded-full p-0.5" /> 
                  <span>Buat Daftar Hadiah</span>
                </button>
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
                      className="p-2 text-rose-400 hover:bg-rose-100 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={() => setIsFormOpen(true)}
          className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white p-4 rounded-2xl font-bold shadow-xl transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Buat Misi Baru</span>
        </button>
      </div>

      <Navigation />

      {isFormOpen && (
        <MissionForm onClose={() => setIsFormOpen(false)} onSubmit={handleAddMission} />
      )}

      {isRewardFormOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white w-full sm:w-[400px] max-h-[90vh] overflow-y-auto rounded-t-[2rem] sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                <Gift className="w-6 h-6 text-purple-500" /> Jual Hadiah Baru
              </h3>
              <button onClick={() => setIsRewardFormOpen(false)} className="p-2 bg-slate-100 text-slate-400 rounded-full hover:bg-slate-200">
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

      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <button onClick={() => setSelectedImage(null)} className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md">
            <X className="w-6 h-6" />
          </button>
          <img src={selectedImage || ""} alt="Zoom Bukti Misi" className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300" />
        </div>
      )}
    </div>
  );
}