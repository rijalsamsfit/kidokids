"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import MissionForm from "@/components/MissionForm";
import { addMissionToDB, getMissionsFromDB } from "@/lib/missionService";
import { auth } from "@/lib/firebase";
import { Plus, ClipboardList, Target, Clock, CheckCircle2, AlertCircle, Loader2, Zap } from "lucide-react";

export default function ParentMissionsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [allMissions, setAllMissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchMissions();
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchMissions = async () => {
    setIsLoading(true);
    try {
      const missions = await getMissionsFromDB();
      setAllMissions(missions);
    } catch (error) {
      console.error("Gagal menarik data misi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMission = async (newMission: any) => {
    try {
      // ✅ Menambahkan newMission.childId ke fungsi addMissionToDB
      await addMissionToDB(newMission.title, newMission.xp, newMission.time, newMission.isFavorite, newMission.childId);
      fetchMissions(); // Refresh daftar misi
      setIsFormOpen(false); // Tutup form
      alert("Misi berhasil dibuat dan dikirim ke anak!");
    } catch (error) {
      alert("Gagal menyimpan misi, pastikan koneksi internetmu lancar!");
    }
  };

  if (isLoading && allMissions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-blue-600 gap-3">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p>Memuat Daftar Misi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans relative">
      
      {/* HEADER KELOLA MISI */}
      <div className="bg-blue-600 p-6 rounded-b-[2rem] shadow-md text-white">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 bg-blue-500/50 rounded-xl backdrop-blur-sm border border-blue-400/30">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Kelola Misi</h1>
            <p className="text-blue-100 text-sm font-medium">Buat dan atur tugas harian pahlawan</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* TOMBOL BUAT MISI RAKSASA */}
        <button 
          onClick={() => setIsFormOpen(true)}
          className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white p-5 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 transition-all active:scale-95"
        >
          <Plus className="w-6 h-6" />
          <span>Buat Misi Baru</span>
        </button>

        {/* DAFTAR SEMUA MISI */}
        <div>
          <h2 className="text-base font-black text-slate-800 flex items-center space-x-2 mb-4 ml-1">
            <Target className="w-5 h-5 text-blue-500" />
            <span>Semua Misi Aktif</span>
          </h2>
          
          <div className="space-y-3">
            {allMissions.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                  <ClipboardList className="w-8 h-8 text-blue-300" />
                </div>
                <p className="font-bold text-slate-600">Belum ada misi</p>
                <p className="text-sm text-slate-400 mt-1">Klik tombol di atas untuk membuat misi pertama.</p>
              </div>
            ) : (
              allMissions.map((mission) => {
                const isPending = mission.status === 'pending';
                const isPendingApproval = mission.status === 'pending_approval';
                const isApproved = mission.status === 'approved';
                const isRejected = mission.status === 'rejected';

                return (
                  <div key={mission.id} className={`bg-white p-4 rounded-2xl border shadow-sm flex items-center justify-between ${
                    isApproved ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-100'
                  }`}>
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl ${
                        isApproved ? 'bg-emerald-100 text-emerald-600' :
                        isRejected ? 'bg-rose-100 text-rose-600' :
                        isPendingApproval ? 'bg-amber-100 text-amber-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {isApproved ? <CheckCircle2 className="w-5 h-5" /> :
                         isRejected ? <AlertCircle className="w-5 h-5" /> :
                         isPendingApproval ? <Clock className="w-5 h-5" /> :
                         <Zap className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className={`font-bold text-[15px] leading-tight ${isApproved ? 'text-slate-500' : 'text-slate-800'}`}>
                          {mission.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-slate-400">{mission.time}</span>
                          <span className="text-[10px] text-slate-300">•</span>
                          <span className="text-xs font-black text-amber-500">+{mission.xpReward || mission.xp} XP</span>
                        </div>
                      </div>
                    </div>

                    {/* Badge Status */}
                    <div>
                      {isPending && <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">Belum Dikerjakan</span>}
                      {isPendingApproval && <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider animate-pulse">Menunggu Cek</span>}
                      {isApproved && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">Selesai</span>}
                      {isRejected && <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">Ditolak</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      <Navigation />

      {/* MODAL FORM MISI */}
      {isFormOpen && (
        <MissionForm onClose={() => setIsFormOpen(false)} onSubmit={handleAddMission} />
      )}
    </div>
  );
}