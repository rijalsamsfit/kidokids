"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Heart, Target, Clock, ArrowRight, Star, Loader2, Sparkles, UserPlus, Gamepad2, LineChart, CheckCircle2, XCircle, Crown } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function LandingPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 🛡️ LOGIKA PENJAGA GERBANG (THE PRO FLOW)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Cek apakah Ortu sudah pernah mengisi form registrasi manual (setup PIN & Biodata)
          const parentSnap = await getDoc(doc(db, "parents", user.uid));
          
          if (parentSnap.exists()) {
            // Sudah setup lengkap -> Lempar ke Layar Pilih Profil
            router.replace("/profiles");
          } else {
            // Baru login Google doang tapi belum setup -> Paksa ke Halaman Registrasi Manual
            router.replace("/register");
          }
        } catch (error) {
          console.error("Gagal mengecek status pendaftaran:", error);
          setIsCheckingAuth(false);
        }
      } else {
        // JIKA BELUM LOGIN, TAMPILKAN HALAMAN PENAWARAN
        setIsCheckingAuth(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Layar tunggu sejenak saat mengecek status login
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="font-bold text-indigo-200 animate-pulse">Menyiapkan Gerbang Sihir...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden selection:bg-indigo-200 selection:text-indigo-900">
      
      {/* NAVBAR */}
      <nav className="absolute top-0 w-full px-6 py-6 flex justify-between items-center z-50 max-w-7xl mx-auto left-0 right-0">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-lg transform group-hover:rotate-6 group-hover:scale-105 transition-all duration-300">
            <Image 
              src="/icon-512x512.png" 
              alt="Logo KIDOKIDS" 
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-2xl font-black tracking-tighter leading-none">
              <span className="text-indigo-600">KIDO</span>
              <span className="text-amber-500">KIDS</span>
            </span>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">
              Parenting App
            </span>
          </div>
        </div>

        <Link 
          href="/login" 
          className="px-6 py-2.5 bg-white text-indigo-600 font-bold rounded-full shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 hover:bg-indigo-50 transition-all active:scale-95"
        >
          Masuk
        </Link>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-300/40 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-amber-300/30 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider mb-8 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>Rahasia Parenting Era Digital</span>
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] max-w-4xl mb-6">
          Ubah Kebiasaan Baik Jadi <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Petualangan Seru!</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed font-medium">
          Berhenti marah-marah menyuruh anak merapikan mainan. KIDO menyulap tugas rumah menjadi misi pahlawan yang menyenangkan, aman, dan mendidik.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 w-full">
          <Link 
            href="/login" 
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/30 transition-all active:scale-95 group"
          >
            <span>Mulai Uji Coba Gratis</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* CARA KERJA (TUTORIAL SINGKAT) */}
      <section className="py-24 px-6 bg-white border-y border-slate-100 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Bagaimana KIDO Bekerja?</h2>
            <p className="text-slate-500 text-lg font-medium">Tiga langkah mudah membangun karakter anak tanpa drama.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Garis Penghubung (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-slate-100 -z-10"></div>

            <div className="flex flex-col items-center text-center relative bg-white">
              <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-indigo-100 relative">
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-600 text-white font-black rounded-full flex items-center justify-center shadow-md">1</div>
                <UserPlus className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3">Siapkan Pangkalan</h3>
              <p className="text-slate-500 font-medium leading-relaxed">Orang tua mendaftar, membuat PIN rahasia, dan menyiapkan profil pahlawan untuk anak.</p>
            </div>

            <div className="flex flex-col items-center text-center relative bg-white">
              <div className="w-24 h-24 bg-amber-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-amber-100 relative">
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-500 text-white font-black rounded-full flex items-center justify-center shadow-md">2</div>
                <Gamepad2 className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3">Anak Berpetualang</h3>
              <p className="text-slate-500 font-medium leading-relaxed">Anak masuk ke arena bermain, menyelesaikan misi edukatif dan tugas rumah untuk meraih XP.</p>
            </div>

            <div className="flex flex-col items-center text-center relative bg-white">
              <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-emerald-100 relative">
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-500 text-white font-black rounded-full flex items-center justify-center shadow-md">3</div>
                <LineChart className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3">Pantau & Apresiasi</h3>
              <p className="text-slate-500 font-medium leading-relaxed">Orang tua menyetujui misi, melihat laporan karakter berbasis AI, dan memberikan hadiah nyata!</p>
            </div>
          </div>
        </div>
      </section>

      {/* NILAI JUAL (MOAT) */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
              Lebih dari sekadar game. <br/><span className="text-indigo-600">Alat Parenting Ampuh.</span>
            </h2>
            
            <div className="flex gap-4">
              <div className="mt-1 bg-rose-100 p-3 rounded-2xl h-fit"><Heart className="w-6 h-6 text-rose-600" /></div>
              <div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">Fokus Karakter & Empati</h4>
                <p className="text-slate-600 font-medium">Bukan game tembak-tembakan. Misi di KIDO melatih anak mengucapkan tolong, maaf, dan merapikan mainan di dunia nyata.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1 bg-amber-100 p-3 rounded-2xl h-fit"><Clock className="w-6 h-6 text-amber-600" /></div>
              <div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">Anti Kecanduan Layar</h4>
                <p className="text-slate-600 font-medium">Dilengkapi sistem Screen-Time dan Jam Tidur otomatis. Aplikasi akan terkunci dengan pesan sopan saat waktunya istirahat.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1 bg-emerald-100 p-3 rounded-2xl h-fit"><ShieldCheck className="w-6 h-6 text-emerald-600" /></div>
              <div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">Lingkungan Digital Aman</h4>
                <p className="text-slate-600 font-medium">100% Bebas iklan, bebas konten kekerasan, dan tanpa jebakan pembelian dalam aplikasi (No Pay-to-Win) untuk anak.</p>
              </div>
            </div>
          </div>

          {/* Visual Placeholder (Bisa diganti mockup nanti) */}
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-[3rem] p-8 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500 hidden md:block">
            <div className="bg-slate-900 w-full h-[500px] rounded-[2rem] border-8 border-slate-800 overflow-hidden relative shadow-inner">
               <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <Gamepad2 className="w-20 h-20 text-slate-700 mb-4" />
                  <p className="text-slate-600 font-bold uppercase tracking-widest">KIDO Arena</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING (PILIHAN PAKET) */}
      <section className="py-24 px-6 bg-slate-900 text-white relative overflow-hidden" id="pricing">
        <div className="absolute top-0 left-[20%] w-[60%] h-full bg-indigo-600/10 blur-[120px] pointer-events-none"></div>
        
        <div className="text-center max-w-2xl mx-auto mb-16 relative z-10">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Investasi Terbaik untuk Masa Depan</h2>
          <p className="text-slate-400 text-lg font-medium">Pilih lisensi Pangkalan Pahlawan yang sesuai dengan kebutuhan keluarga kecilmu.</p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 relative z-10">
          
          {/* PAKET BASIC */}
          <div className="bg-slate-800/50 backdrop-blur-md rounded-[2.5rem] p-8 border border-slate-700 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-200 mb-2">KIDO Basic</h3>
              <p className="text-slate-400 font-medium mb-6">Cocok untuk mulai membiasakan anak.</p>
              <div className="mb-8">
                <span className="text-5xl font-black text-white">Gratis</span>
                <span className="text-slate-400 font-medium"> / selamanya</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3"><CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" /><span className="font-medium text-slate-300">1 Profil Anak</span></li>
                <li className="flex items-start gap-3"><CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" /><span className="font-medium text-slate-300">Akses 1 Dunia (Rumah Bahagia)</span></li>
                <li className="flex items-start gap-3"><CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" /><span className="font-medium text-slate-300">Avatar Nama Inisial (Huruf)</span></li>
                <li className="flex items-start gap-3 opacity-50"><XCircle className="w-6 h-6 text-slate-500 shrink-0" /><span className="font-medium text-slate-500 line-through">Laporan Evaluasi AI Mingguan</span></li>
                <li className="flex items-start gap-3 opacity-50"><XCircle className="w-6 h-6 text-slate-500 shrink-0" /><span className="font-medium text-slate-500 line-through">Upload Bukti Foto Misi</span></li>
              </ul>
            </div>
            <Link href="/login" className="w-full py-4 rounded-2xl font-bold text-center border-2 border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors">
              Pilih Basic
            </Link>
          </div>

          {/* PAKET VIP */}
          <div className="bg-gradient-to-b from-indigo-600 to-purple-800 rounded-[2.5rem] p-8 border border-indigo-400 shadow-2xl shadow-indigo-900/50 flex flex-col justify-between relative transform md:-translate-y-4">
            <div className="absolute top-0 right-8 bg-amber-400 text-amber-950 text-xs font-black px-4 py-2 rounded-b-xl uppercase tracking-wider shadow-md">
              Paling Populer
            </div>
            <div>
              <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-2">KIDO VIP <Crown className="w-6 h-6 text-amber-400 fill-amber-400" /></h3>
              <p className="text-indigo-200 font-medium mb-6">Membuka seluruh potensi penuh KIDO.</p>
              <div className="mb-8">
                <span className="text-5xl font-black text-white">Rp 29k</span>
                <span className="text-indigo-200 font-medium"> / bulan</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3"><CheckCircle2 className="w-6 h-6 text-amber-400 shrink-0" /><span className="font-bold text-white">Profil Anak Tanpa Batas</span></li>
                <li className="flex items-start gap-3"><CheckCircle2 className="w-6 h-6 text-amber-400 shrink-0" /><span className="font-bold text-white">Buka Semua 5 Dunia Edukasi</span></li>
                <li className="flex items-start gap-3"><CheckCircle2 className="w-6 h-6 text-amber-400 shrink-0" /><span className="font-bold text-white">Upload Foto Asli Wajah Anak</span></li>
                <li className="flex items-start gap-3"><CheckCircle2 className="w-6 h-6 text-amber-400 shrink-0" /><span className="font-bold text-white">Laporan Parenting Asisten AI</span></li>
                <li className="flex items-start gap-3"><CheckCircle2 className="w-6 h-6 text-amber-400 shrink-0" /><span className="font-bold text-white">Misi Fisik dengan Bukti Foto</span></li>
              </ul>
            </div>
            <Link href="/login" className="w-full py-4 rounded-2xl font-black text-lg text-center bg-white text-indigo-700 hover:bg-slate-100 shadow-xl transition-transform active:scale-95">
              Coba VIP Sekarang
            </Link>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-50 py-12 text-center border-t border-slate-200">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Image src="/icon-192x192.png" alt="Logo" width={32} height={32} className="rounded-lg" />
          <span className="font-black text-slate-800 text-lg">KIDO<span className="text-amber-500">KIDS</span></span>
        </div>
        <p className="text-slate-500 font-medium text-sm max-w-md mx-auto px-6">
          Membangun jembatan antara dunia digital yang aman dengan kebiasaan baik di dunia nyata.
        </p>
        <p className="text-slate-400 text-xs mt-8">© {new Date().getFullYear()} KIDOKIDS. All rights reserved.</p>
      </footer>

    </div>
  );
}