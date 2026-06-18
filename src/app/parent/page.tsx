"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { getMissionsFromDB, reviewMissionInDB } from "@/lib/missionService"; 
import { getChildrenProfiles } from "@/lib/childService";
import { auth, db } from "@/lib/firebase"; 
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore"; 
import { Clock, Star, RefreshCw, ThumbsUp, ThumbsDown, Eye, ZoomIn, X, Users, Settings, Gift, Check, User } from "lucide-react"; 

export default function ParentDashboard() {
  const [pendingMissions, setPendingMissions] = useState<any[]>([]);
  const [pendingRewards, setPendingRewards] = useState<any[]>([]); 
  const [childrenData, setChildrenData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
      const [profiles, missions] = await Promise.all([
        getChildrenProfiles(),
        getMissionsFromDB()
      ]);
      
      const rewardsRef = collection(db, "claimed_rewards");
      const q = query(rewardsRef, where("status", "==", "pending"));
      const querySnapshot = await getDocs(q);
      const rewardsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setChildrenData(profiles);
      setPendingMissions(missions);
      setPendingRewards(rewardsData); 
    } catch (error) {
      console.error("Gagal menarik data dasbor:", error);
    } finally {
      setIsLoading(false);
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

  const handleGiveReward = async (rewardId: string, rewardTitle: string, childName: string) => {
    const confirmAction = window.confirm(`Konfirmasi: Apakah hadiah "${rewardTitle}" sudah diberikan kepada ${childName} di dunia nyata?`);
    if (!confirmAction) return;

    try {
      const rewardRef = doc(db, "claimed_rewards", rewardId);
      await updateDoc(rewardRef, { status: "completed" });
      alert("✅ Mantap! Hadiah berhasil ditandai sudah diberikan.");
      fetchDashboardData(); 
    } catch (error) {
      alert("Gagal memperbarui status hadiah. Coba lagi.");
      console.error(error);
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
              <p className="text-emerald-200 text-xs mt-1">Tambahkan dari menu Pengaturan.</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-8">

        {/* SEKSI: Klaim Hadiah Anak */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-500" /> Klaim Hadiah Anak
            </h2>
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full border border-purple-200">
              {pendingRewards.length} Menunggu
            </span>
          </div>

          <div className="space-y-3">
            {pendingRewards.length === 0 && !isLoading && (
              <p className="text-center text-slate-400 text-sm py-4 bg-white rounded-2xl border border-slate-100">
                Belum ada anak yang menukar koin untuk hadiah.
              </p>
            )}

            {pendingRewards.map((reward) => (
              <div key={reward.id} className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm flex flex-col space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-[15px]">{reward.rewardTitle}</p>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5 capitalize">
                      Diminta oleh: <span className="text-purple-600 font-bold">{reward.childName}</span> • Seharga {reward.cost} Koin
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleGiveReward(reward.id, reward.rewardTitle, reward.childName)}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4" /><span>Tandai Sudah Diberikan</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-slate-200" />
        
        {/* SEKSI: Menunggu Verifikasi (Misi Fisik) */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">Menunggu Verifikasi Misi</h2>
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
              <p className="text-center text-slate-400 text-sm py-4 bg-white rounded-2xl border border-slate-100">
                Semua misi sudah diverifikasi atau belum ada misi baru.
              </p>
            )}
            
            {pendingMissions.map((mission) => {
              // ✅ UPDATE: Cari data anak yang punya misi ini
              const assignedChild = childrenData.find(child => child.id === mission.childId);
              const childName = assignedChild ? assignedChild.name : "Anak";

              return (
                <div key={mission.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-[15px] leading-tight">{mission.title}</p>
                        
                        {/* ✅ UPDATE: Badge Nama Anak */}
                        <div className="mt-1 mb-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-extrabold tracking-wide border border-blue-100 capitalize">
                            <User className="w-3 h-3" /> {childName}
                          </span>
                        </div>

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
              );
            })}
          </div>
        </div>

      </div>

      <Navigation />

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