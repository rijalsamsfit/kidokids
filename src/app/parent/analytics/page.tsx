"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Brain, Sparkles, Loader2, User, ChevronRight, AlertCircle, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ParentAnalytics() {
  const router = useRouter();
  
  const [childrenData, setChildrenData] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
          
          // Auto-select anak pertama jika ada
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

  // 2. Fungsi Utama: Kumpulkan Data & Panggil API Gemini
  const handleAnalyze = async () => {
    if (!selectedChild) return;
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setErrorMsg(null);

    try {
      // Tarik Riwayat Misi Anak
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

      // Tarik Riwayat Hadiah (Motivasi)
      const rewardsQuery = query(collection(db, "claimed_rewards"), where("childId", "==", selectedChild.id));
      const rewardsSnap = await getDocs(rewardsQuery);
      const recentRewards: string[] = rewardsSnap.docs.map(doc => doc.data().rewardTitle);

      // Siapkan Koper Data untuk dikirim ke Backend
      const payload = {
        childName: selectedChild.name,
        level: selectedChild.level || 1,
        xp: selectedChild.xp || 0,
        completedMissions: completedMissions.slice(0, 10), // Ambil 10 terbaru biar prompt gak kepanjangan
        rejectedMissions: rejectedMissions.slice(0, 5),
        recentRewards: recentRewards.slice(0, 5)
      };

      // Tembak API Route Gemini kita
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
                  onClick={() => {
                    setSelectedChild(child);
                    setAnalysisResult(null); // Reset hasil jika ganti anak
                  }}
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

        {/* TOMBOL ANALISIS */}
        {selectedChild && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-black text-slate-800 text-xl mb-2">Konsultasi Aktivitas {selectedChild.name}</h3>
            <p className="text-slate-500 text-sm mb-6 px-4">
              AI akan membaca rekam jejak misi dan hadiah {selectedChild.name} minggu ini untuk memberikan saran parenting yang tepat sasaran.
            </p>
            
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className={`w-full py-4 rounded-2xl font-black text-white text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
                isAnalyzing 
                  ? "bg-purple-400 cursor-not-allowed" 
                  : "bg-purple-600 hover:bg-purple-700 shadow-purple-200 active:scale-95"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Membaca Jurnal...
                </>
              ) : (
                <>
                  Mulai Analisis <ChevronRight className="w-6 h-6" />
                </>
              )}
            </button>
          </div>
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
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Hasil Analisis Gemini</p>
                  </div>
                </div>

                <div className="prose prose-slate prose-p:font-medium prose-p:text-slate-600 prose-headings:font-black prose-headings:text-slate-800 prose-strong:text-purple-700 prose-strong:font-black prose-li:font-medium prose-li:text-slate-600 max-w-none">
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