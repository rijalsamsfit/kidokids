"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import ProgressChart from "@/components/ProgressChart"; 
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { 
  Brain, Sparkles, Loader2, User, ChevronRight, AlertCircle, Bot, 
  Lock, Calendar, Trophy, Coins, BarChart3, Crown, UserPlus
} from "lucide-react";
import ReactMarkdown from "react-markdown";

// ✅ Import Ransel Zustand Ortu
import { useParentStore } from "@/store/useParentStore";

export default function ParentAnalytics() {
  const router = useRouter();
  
  // ✅ Tarik kasta Ortu dan fungsi fetch dari Zustand
  const { parentPlan, fetchParentData, isPlanLoading } = useParentStore();

  const [childrenData, setChildrenData] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingText, setLoadingText] = useState("Membaca Jurnal..."); // ✅ AI Loading Effect
  
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [lastAnalysisDate, setLastAnalysisDate] = useState<string | null>(null);
  const [stats, setStats] = useState({ completedMissions: 0, totalXP: 0 });
  const [chartData, setChartData] = useState<any[]>([]); 

  // 1. Cek Auth & Tarik Data Anak + Zustand
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        fetchParentData();

        try {
          const q = query(collection(db, "children"), where("parentId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          const childrenList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setChildrenData(childrenList);
          
          if (childrenList.length > 0) {
            setSelectedChild(childrenList[0]);
          }
        } catch (error) {
          console.error("Gagal menarik data anak:", error);
        }
      } else {
        router.push("/login");
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, [router, fetchParentData]);

  // 2. Tarik Riwayat Analisis Terakhir, Statistik, & Data Grafik
  useEffect(() => {
    if (!selectedChild) return;

    const fetchChildData = async () => {
      setIsLoadingData(true);
      setErrorMsg(null);
      setAnalysisResult(null);
      setLastAnalysisDate(null);

      try {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return {
            dateStr: d.toISOString().split('T')[0],
            day: d.toLocaleDateString('id-ID', { weekday: 'short' }),
            missions: 0
          };
        });

        const missionsQuery = query(collection(db, "missions"), where("childId", "==", selectedChild.id));
        const missionsSnap = await getDocs(missionsQuery);
        let completed = 0;
        
        missionsSnap.forEach((doc) => {
          const data = doc.data();
          if (data.status === 'completed' || data.status === 'approved') {
            completed++;
            const timestamp = data.completedAt || data.createdAt; 
            if (timestamp) {
              const missionDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
              const dateString = missionDate.toISOString().split('T')[0];
              const dayIndex = last7Days.findIndex(d => d.dateStr === dateString);
              if (dayIndex !== -1) {
                last7Days[dayIndex].missions++;
              }
            }
          }
        });
        
        setStats({ completedMissions: completed, totalXP: selectedChild.xp || 0 });
        setChartData(last7Days); 

        const analysisQuery = query(
          collection(db, "parent_analyses"), 
          where("childId", "==", selectedChild.id),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const analysisSnap = await getDocs(analysisQuery);

        if (!analysisSnap.empty) {
          const data = analysisSnap.docs[0].data();
          setAnalysisResult(data.analysis);
          const dateStr = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt;
          setLastAnalysisDate(dateStr);
        }
      } catch (error) {
        console.error("Gagal menarik data analisis:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchChildData();
  }, [selectedChild]);

  // Engine Kalkulasi Hak Akses (Basic = Lock, VIP = Cek Cooldown)
  const checkAccess = () => {
    if (parentPlan === "basic") {
      return { isLocked: true, type: "premium_required", daysLeft: 0 };
    }
    if (!lastAnalysisDate) return { isLocked: false, type: "none", daysLeft: 0 };

    const now = new Date();
    const lastDate = new Date(lastAnalysisDate);
    const diffTime = now.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const cooldownPeriod = 7;
    const isLocked = diffDays < cooldownPeriod;
    const daysLeft = cooldownPeriod - diffDays;

    return { isLocked, type: isLocked ? "cooldown" : "none", daysLeft: daysLeft > 0 ? daysLeft : 0 };
  };

  const access = checkAccess();

  // ✅ 3. Efek Animasi Teks AI
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      const texts = ["Mengumpulkan data...", "Menganalisa kebiasaan...", "Menulis laporan..."];
      let i = 0;
      interval = setInterval(() => {
        i = (i + 1) % texts.length;
        setLoadingText(texts[i]);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // 4. Eksekusi Gemini
  const handleAnalyze = async () => {
    if (access.type === "premium_required") {
      router.push("/parent/billing");
      return;
    }
    if (!selectedChild || access.isLocked) return;
    
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const missionsQuery = query(collection(db, "missions"), where("childId", "==", selectedChild.id));
      const missionsSnap = await getDocs(missionsQuery);
      
      const completedMissions: string[] = [];
      const rejectedMissions: string[] = [];

      missionsSnap.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'completed' || data.status === 'approved') {
          completedMissions.push(data.title);
        } else if (data.status === 'rejected') {
          rejectedMissions.push(data.title);
        }
      });

      const rewardsQuery = query(collection(db, "claimed_rewards"), where("childId", "==", selectedChild.id));
      const rewardsSnap = await getDocs(rewardsQuery);
      const recentRewards: string[] = rewardsSnap.docs.map(doc => doc.data().rewardTitle);

      const payload = {
        childId: selectedChild.id, 
        childName: selectedChild.name,
        level: selectedChild.level || 1,
        xp: selectedChild.xp || 0,
        completedMissions: completedMissions.slice(0, 10),
        rejectedMissions: rejectedMissions.slice(0, 5),
        recentRewards: recentRewards.slice(0, 5)
      };

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan pada server AI');
      }

      setAnalysisResult(data.analysis);
      setLastAnalysisDate(new Date().toISOString());

    } catch (error: any) {
      console.error("Gagal menganalisis:", error);
      setErrorMsg(error.message || "Gagal terhubung ke Asisten AI. Coba lagi nanti.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoadingAuth || isPlanLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 relative font-sans">
      
      {/* HEADER ANALITIK */}
      <div className="bg-purple-600 p-6 rounded-b-[2rem] shadow-md text-white relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-20">
          <Brain className="w-32 h-32" />
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-1 tracking-tight flex items-center gap-2">
            Analisis AI <Sparkles className="w-6 h-6 text-yellow-300 fill-yellow-300 animate-pulse" />
          </h1>
          <p className="text-purple-100 text-sm font-bold">Asisten parenting cerdas bertenaga Gemini</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* 🛑 EMPTY STATE 1: BELUM ADA ANAK SAMA SEKALI */}
        {childrenData.length === 0 ? (
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center mt-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-5 border-2 border-indigo-100">
              <UserPlus className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="font-black text-slate-800 text-xl mb-2">Pangkalan Masih Sepi!</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed px-2">
              Yuk, rekrut pahlawan kecilmu terlebih dahulu di menu Pengaturan untuk memulai petualangan karakter dan membuka Analisis AI.
            </p>
            <button 
              onClick={() => router.push('/parent/settings')} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
            >
              Tambah Pahlawan Sekarang
            </button>
          </div>
        ) : (
          <>
            {/* PILIH ANAK */}
            <div>
              <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-3">Pilih Profil Anak</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {childrenData.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChild(child)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 whitespace-nowrap transition-all active:scale-95 ${
                      selectedChild?.id === child.id 
                        ? "bg-purple-50 border-purple-500 text-purple-700 shadow-sm" 
                        : "bg-white border-slate-200 text-slate-600 hover:border-purple-200"
                    }`}
                  >
                    <div className={`p-1.5 rounded-full ${selectedChild?.id === child.id ? "bg-purple-200" : "bg-slate-100"}`}>
                      <User className="w-5 h-5" />
                    </div>
                    <span className="font-extrabold capitalize">{child.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {isLoadingData ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                <p className="text-slate-500 font-bold text-sm">Menarik data dari database...</p>
              </div>
            ) : (
              selectedChild && (
                <>
                  {/* UI KOTAK RINGKASAN */}
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in duration-300">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                      <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
                        <Trophy className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider">Misi Selesai</p>
                        <p className="text-2xl font-black text-slate-800">{stats.completedMissions}</p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                      <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                        <Coins className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider">Total Koin</p>
                        <p className="text-2xl font-black text-slate-800">{stats.totalXP}</p>
                      </div>
                    </div>
                  </div>

                  {/* GRAFIK AKTIVITAS 7 HARI TERAKHIR */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in duration-300 mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="w-5 h-5 text-purple-500" />
                      <h3 className="font-black text-slate-800">Aktivitas 7 Hari Terakhir</h3>
                    </div>
                    
                    <div className="h-48 w-full">
                      {chartData.some(d => d.missions > 0) ? (
                        <ProgressChart data={chartData} />
                      ) : (
                        <div className="h-full bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center">
                          <p className="text-slate-400 font-bold text-sm">Belum ada misi selesai minggu ini</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 🤖 KOTAK KONSULTASI AI */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm text-center relative overflow-hidden animate-in slide-in-from-bottom-4 duration-500 mt-6">
                    
                    {/* 🔒 PAYWALL OVERLAY KASTA BASIC */}
                    {access.type === "premium_required" && (
                      <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-4 shadow-lg border-2 border-amber-200">
                          <Lock className="w-8 h-8" />
                        </div>
                        <h3 className="font-black text-slate-800 text-xl mb-2">Laporan VIP Terkunci</h3>
                        <p className="text-slate-600 font-bold text-sm mb-6">Upgrade ke KIDO Premium untuk membuka analisis karakter berbasis AI mingguan.</p>
                        
                        <button
                          onClick={() => router.push("/parent/billing")}
                          className="w-full max-w-xs bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-300 transition-all active:scale-95"
                        >
                          <Crown className="w-5 h-5" /> Buka Kunci VIP
                        </button>
                      </div>
                    )}

                    <div className={access.type === "premium_required" ? "opacity-30 pointer-events-none blur-sm transition-all" : ""}>
                      
                      {stats.completedMissions === 0 && !analysisResult ? (
                        /* KONTEN A: EMPTY STATE (0 MISI) */
                        <div className="py-2">
                          <div className="w-20 h-20 bg-slate-50 border-2 border-slate-100 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce shadow-sm">
                            <Bot className="w-10 h-10 text-slate-400" />
                          </div>
                          <h3 className="font-black text-slate-800 text-xl mb-2">Bip-bop! Data Belum Cukup</h3>
                          <p className="text-slate-500 text-sm mb-8 leading-relaxed px-2">
                            Robot AI belum punya bahan untuk berpikir. AI membutuhkan setidaknya beberapa misi yang diselesaikan oleh <strong>{selectedChild.name}</strong>.
                          </p>
                          <button
                            onClick={() => router.push("/parent")}
                            className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-black py-4 rounded-2xl flex items-center justify-center border-2 border-slate-200 transition-all active:scale-95"
                          >
                            Buat Misi Pertama
                          </button>
                        </div>
                      ) : (
                        /* KONTEN B: READY STATE */
                        <div className="py-2">
                          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bot className={`w-8 h-8 text-purple-600 ${isAnalyzing ? "animate-pulse" : ""}`} />
                          </div>
                          <h3 className="font-black text-slate-800 text-xl mb-2">Konsultasi Aktivitas {selectedChild.name}</h3>
                          <p className="text-slate-500 text-sm mb-6 px-4">
                            AI akan membaca rekam jejak misi {selectedChild.name} untuk memberikan saran parenting yang tepat sasaran.
                          </p>

                          {/* BANNER EDUKASI COOLDOWN */}
                          {access.type === "cooldown" && (
                            <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start space-x-3 text-left">
                              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-amber-900">Kuota Evaluasi Mingguan</span>
                                <span className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                                  AI butuh waktu merekam perkembangan anak. Evaluasi berikutnya terbuka dalam <strong className="text-amber-950 font-extrabold">{access.daysLeft} hari lagi</strong>.
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* TOMBOL ANALISIS */}
                          <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || access.isLocked}
                            className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all ${
                              access.isLocked 
                                ? "bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed" 
                                : isAnalyzing
                                  ? "bg-purple-400 text-white cursor-not-allowed"
                                  : "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 active:scale-95"
                            }`}
                          >
                            {isAnalyzing ? (
                              <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                {loadingText}
                              </>
                            ) : access.type === "cooldown" ? (
                              <>
                                <Lock className="w-5 h-5" />
                                Terkunci ({access.daysLeft} Hari)
                              </>
                            ) : (
                              <>
                                Mulai Analisis <ChevronRight className="w-6 h-6" />
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PESAN EROR */}
                  {errorMsg && (
                    <div className="bg-rose-50 border-2 border-rose-200 p-4 rounded-2xl flex items-start gap-3 mt-6">
                      <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                      <p className="text-rose-700 font-bold text-sm">{errorMsg}</p>
                    </div>
                  )}

                  {/* KARTU HASIL ANALISIS */}
                  {analysisResult && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 mt-6">
                      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-1 rounded-3xl shadow-lg">
                        <div className="bg-white p-6 rounded-[22px] h-full">
                          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="p-2 bg-purple-100 rounded-xl">
                              <Sparkles className="w-6 h-6 text-purple-600 fill-purple-600 animate-pulse" />
                            </div>
                            <div>
                              <h3 className="font-black text-slate-800 text-lg">Catatan Asisten</h3>
                              <div className="flex items-center gap-1 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                <Calendar className="w-3 h-3" />
                                {lastAnalysisDate ? new Date(lastAnalysisDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Hari Ini'}
                              </div>
                            </div>
                          </div>

                          {/* AREA RENDER MARKDOWN */}
                          <div className="prose prose-slate max-w-none prose-p:font-semibold prose-p:text-slate-600 prose-headings:font-black prose-headings:text-slate-900 prose-strong:text-purple-700 prose-strong:font-black prose-li:font-semibold prose-li:text-slate-700 prose-p:leading-relaxed marker:text-purple-500">
                            <ReactMarkdown>{analysisResult}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )
            )}
          </>
        )}
      </div>

      <Navigation />
    </div>
  );
}