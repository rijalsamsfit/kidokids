"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import MissionForm from "@/components/MissionForm";
// ✅ Import fungsi baru reviewMissionInDB
import { addMissionToDB, getMissionsFromDB, reviewMissionInDB } from "@/lib/missionService"; 
import { getChildProfile } from "@/lib/childService";
import { auth } from "@/lib/firebase";
// ✅ Tambahan ikon ThumbsUp, ThumbsDown, dan Eye
import { Plus, CheckCircle2, Clock, Star, RefreshCw, ThumbsUp, ThumbsDown, Eye } from "lucide-react";

export default function ParentDashboard() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pendingMissions, setPendingMissions] = useState<any[]>([]);
  const [childData, setChildData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Menunggu Firebase Auth selesai mengecek sesi login sebelum menarik data
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
      // Menarik data profil anak dan daftar misi secara bersamaan dari Cloud
      const [profile, missions] = await Promise.all([
        getChildProfile(),
        getMissionsFromDB()
      ]);
      
      setChildData(profile);
      setPendingMissions(missions);
    } catch (error) {
      console.error("Gagal menarik data dasbor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMission = async (newMission: any) => {
    try {
      await addMissionToDB(newMission.title, newMission.xp, newMission.time);
      fetchDashboardData(); // Refresh data setelah simpan sukses
      setIsFormOpen(false); 
    } catch (error) {
      alert("Gagal menyimpan misi, pastikan koneksi internetmu lancar!");
    }
  };

  // ✅ FUNGSI BARU: Penilaian Misi (Approve / Reject)
  const handleReview = async (missionId: string, status: "approved" | "rejected", xpReward: number) => {
    const confirmAction = window.confirm(`Apakah kamu yakin ingin ${status === "approved" ? "MENYETUJUI" : "MENOLAK"} misi ini?`);
    if (!confirmAction) return;

    try {
      await reviewMissionInDB(missionId, status, xpReward);
      alert(status === "approved" ? "🎉 Misi disetujui! XP & Koin telah dikirim ke akun anak." : "Misi ditolak. Anak diminta mengirim ulang foto.");
      fetchDashboardData(); // Refresh list dasbor untuk menghilangkan tombol verifikasi
    } catch (error) {
      alert("Gagal memproses tindakan. Coba lagi.");
    }
  };

  // Layar loading sementara saat data profil sedang ditarik dari Firebase
  if (isLoading && !childData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-emerald-600 animate-pulse">
        Menyiapkan Dasbor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 relative">
      
      {/* Bagian Header Melengkung */}
      <div className="bg-emerald-600 p-6 rounded-b-[2rem] shadow-md text-white">
        <h1 className="text-2xl font-extrabold mb-1 tracking-tight">Dasbor Orang Tua</h1>
        <p className="text-emerald-100 text-sm font-medium">Pantau kehebatan si kecil hari ini</p>
        
        {/* Kartu Profil Anak */}
        <div className="mt-6 bg-emerald-500/50 p-4 rounded-2xl flex items-center justify-between border border-emerald-400/50 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-emerald-600 font-black text-2xl shadow-inner uppercase">
              {/* Ambil huruf pertama dari nama anak */}
              {childData?.name ? childData.name.charAt(0) : "?"}
            </div>
            <div>
              <p className="font-bold text-lg leading-tight capitalize">{childData?.name || "Memuat..."}</p>
              <p className="text-xs text-emerald-100 font-semibold mt-1">Level {childData?.level || 1} • {childData?.xp || 0} XP</p>
            </div>
          </div>
          <div className="p-3 bg-emerald-400 rounded-xl shadow-sm">
            <Star className="w-7 h-7 text-yellow-300 fill-yellow-300" />
          </div>
        </div>
      </div>

      {/* Area Konten Utama */}
      <div className="p-6 space-y-8">
        
        {/* Seksi Misi Menunggu Verifikasi */}
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
            
            {/* ✅ DESAIN MISI BARU DENGAN FITUR CEK FOTO ANAK */}
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
                  
                  {/* Lencana Status Dinamis */}
                  {mission.status === 'approved' && (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-wider">Disetujui</span>
                  )}
                  {mission.status === 'rejected' && (
                    <span className="px-2.5 py-1 bg-rose-100 text-rose-700 rounded-lg text-[10px] font-black uppercase tracking-wider">Ditolak</span>
                  )}
                  {mission.status === 'pending_approval' && (
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-wider animate-pulse">Butuh Cek</span>
                  )}
                  {mission.status === 'pending' && (
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-wider">Belum Dikerjakan</span>
                  )}
                </div>

                {/* JIKA ANAK SUDAH UPLOAD FOTO, TAMPILKAN PREVIEW DAN TOMBOL EKSEKUSI */}
                {mission.status === "pending_approval" && mission.proofImgUrl && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3">
                    <p className="text-xs font-bold text-slate-500 flex items-center space-x-1">
                      <Eye className="w-3.5 h-3.5" /> <span>Bukti foto dari Anak:</span>
                    </p>
                    <img 
                      src={mission.proofImgUrl} 
                      alt="Bukti Misi Anak" 
                      className="w-full h-36 object-cover rounded-xl shadow-inner border border-slate-200"
                    />
                    <div className="flex space-x-2 pt-1">
                      <button
                        onClick={() => handleReview(mission.id, "approved", mission.xpReward || mission.xp)}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Setujui (Kirim XP)</span>
                      </button>
                      <button
                        onClick={() => handleReview(mission.id, "rejected", mission.xpReward || mission.xp)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 border border-rose-200 active:scale-95 transition-all"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>Tolak</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tombol Tambah Misi Baru */}
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
        <MissionForm 
          onClose={() => setIsFormOpen(false)} 
          onSubmit={handleAddMission} 
        />
      )}
    </div>
  );
}