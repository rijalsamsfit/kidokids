"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import ProgressChart from "@/components/ProgressChart"; // <-- UPDATE: Import Grafik
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { 
  Brain, Sparkles, Loader2, User, ChevronRight, AlertCircle, Bot, 
  Lock, Calendar, Trophy, Coins, BarChart3 
} from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ParentAnalytics() {
  const router = useRouter();
  
  const [childrenData, setChildrenData] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // FASE 2, 3 & 4: State
  const [lastAnalysisDate, setLastAnalysisDate] = useState<string | null>(null);
  const [stats, setStats] = useState({ completedMissions: 0, totalXP: 0 });
  const [chartData, setChartData] = useState<any[]>([]); // <-- UPDATE: State untuk Data Grafik

  // 1. Cek Auth & Tarik Data Anak
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
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
  }, [router]);

  // 2. FASE 3 & 4: Tarik Riwayat Analisis Terakhir, Statistik, & Data Grafik saat Anak dipilih
  useEffect(() => {
    if (!selectedChild) return;

    const fetchChildData = async () => {
      setIsLoadingData(true);
      setErrorMsg(null);
      setAnalysisResult(null);
      setLastAnalysisDate(null);

      try {
        // <-- UPDATE: Generate template 7 hari terakhir untuk grafik
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return {
            dateStr: d.toISOString().split('T')[0],
            day: d.toLocaleDateString('id-ID', { weekday: 'short' }),
            missions: 0
          };
        });

        // Hitung total misi selesai untuk Kotak Ringkasan & Data Grafik
        const missionsQuery = query(collection(db, "missions"), where("childId", "==", selectedChild.id));
        const missionsSnap = await getDocs(missionsQuery);
        let completed = 0;
        
        missionsSnap.forEach((doc) => {
          const data = doc.data();
          if (data.status === 'completed' || data.status === 'approved') {
            completed++;
            
            // <-- UPDATE: Ekstrak tanggal misi untuk dimasukkan ke grafik
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
        setChartData(last7Days); // <-- UPDATE: Simpan data yang udah dikalkulasi ke state grafik

        // Tarik data analisis terakhir dari Firestore
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
          // Konversi timestamp Firestore ke string ISO
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

  // FASE 2: Engine Kalkulasi Cooldown 7 Hari
  const checkCooldown = () => {
    if (!lastAnalysisDate) return { isLocked: false, daysLeft: 0 };

    const now = new Date();
    const lastDate = new Date(lastAnalysisDate);
    const diffTime = now.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const cooldownPeriod = 7;
    const isLocked = diffDays < cooldownPeriod;
    const daysLeft = cooldownPeriod - diffDays;

    return { isLocked, daysLeft: daysLeft > 0 ? daysLeft : 0 };
  };

  const { isLocked, daysLeft } = checkCooldown();

  // 3. Eksekusi Gemini
  const handleAnalyze = async () => {
    if (!selectedChild || isLocked) return;
    
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      // Tarik ulang data mentah untuk dikirim ke API
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

  if (isLoadingAuth) {
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
            Analisis AI <Sparkles className="w-6 h-6 text-yellow-300 fill-yellow-300" />
          </h1>
          <p className="text-purple-100 text-sm font-bold">Asisten parenting cerdas bertenaga Gemini</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* PILIH ANAK */}
        {childrenData.length > 0 && (
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
        )}

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
                    <p className="text-slate-500 text-xs font-bold uppercase">Misi Selesai</p>
                    <p className="text-2xl font-black text-slate-800">{stats.completedMissions}</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                    <Coins className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs font-bold uppercase">Total Koin</p>
                    <p className="text-2xl font-black text-slate-800">{stats.totalXP}</p>
                  </div>
                </div>
              </div>

              {/* FASE 4: GRAFIK AKTIVITAS 7 HARI TERAKHIR */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  <h3 className="font-black text-slate-800">Aktivitas 7 Hari Terakhir</h3>
                </div>
                
                <div className="h-48 w-full">
                  {chartData.length > 0 ? (
                    <ProgressChart data={chartData} />
                  ) : (
                    <div className="h-full bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-center">
                      <p className="text-slate-400 font-bold text-sm">Belum ada data misi minggu ini</p>
                    </div>
                  )}
                </div>
              </div>

              {/* AREA KONSULTASI AI */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-black text-slate-800 text-xl mb-2">Konsultasi Aktivitas {selectedChild.name}</h3>
                <p className="text-slate-500 text-sm mb-6 px-4">
                  AI akan membaca rekam jejak misi {selectedChild.name} untuk memberikan saran parenting yang tepat sasaran.
                </p>

                {/* BANNER EDUKASI COOLDOWN */}
                {isLocked && (
                  <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start space-x-3 text-left">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-amber-900">Kuotasi Evaluasi Mingguan</span>
                      <span className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                        AI butuh waktu merekam perkembangan konsistensi anak. Evaluasi berikutnya terbuka dalam <strong className="text-amber-950 font-extrabold">{daysLeft} hari lagi</strong>.
                      </span>
                    </div>
                  </div>
                )}
                
                {/* TOMBOL ANALISIS */}
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || isLocked}
                  className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all ${
                    isLocked 
                      ? "bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed" 
                      : isAnalyzing
                        ? "bg-purple-400 text-white cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 active:scale-95"
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Membaca Jurnal...
                    </>
                  ) : isLocked ? (
                    <>
                      <Lock className="w-5 h-5" />
                      Terkunci ({daysLeft} Hari)
                    </>
                  ) : (
                    <>
                      Mulai Analisis <ChevronRight className="w-6 h-6" />
                    </>
                  )}
                </button>
              </div>
            </>
          )
        )}

        {/* PESAN EROR */}
        {errorMsg && (
          <div className="bg-rose-50 border-2 border-rose-200 p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-rose-700 font-bold text-sm">{errorMsg}</p>
          </div>
        )}

        {/* KARTU HASIL ANALISIS */}
        {analysisResult && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-1 rounded-3xl shadow-lg">
              <div className="bg-white p-6 rounded-[22px] h-full">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Sparkles className="w-6 h-6 text-purple-600 fill-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg">Catatan Asisten</h3>
                    <div className="flex items-center gap-1 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <Calendar className="w-3 h-3" />
                      {lastAnalysisDate ? new Date(lastAnalysisDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Hari Ini'}
                    </div>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none prose-p:font-semibold prose-p:text-slate-800 prose-headings:font-black prose-headings:text-slate-900 prose-strong:text-purple-700 prose-strong:font-black prose-li:font-semibold prose-li:text-slate-800 prose-p:leading-relaxed">
                  <ReactMarkdown>{analysisResult}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      <Navigation />
    </div>
  );
}