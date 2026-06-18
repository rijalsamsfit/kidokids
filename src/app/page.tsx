"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Heart, Target, Clock, ArrowRight, Star, Loader2 } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LandingPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // LOGIKA PENJAGA GERBANG
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // JIKA SUDAH LOGIN, LEMPAR OTOMATIS KE LAYAR PROFIL (NETFLIX STYLE)
        router.replace("/profiles");
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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="font-bold text-slate-500 animate-pulse">Memeriksa tiket masuk...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden selection:bg-blue-200">
      
      {/* Navbar Sederhana dengan Branding KIDOKIDS */}
      <nav className="absolute top-0 w-full px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center space-x-3 group cursor-pointer">
          {/* Logo Asli */}
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-md transform group-hover:rotate-6 group-hover:scale-105 transition-all duration-300">
            <Image 
              src="/icon-512x512.png" 
              alt="Logo KIDOKIDS" 
              fill
              className="object-cover"
            />
          </div>
          {/* Teks Branding KIDOKIDS yang Playful */}
          <div className="flex flex-col justify-center">
            <span className="text-2xl font-black tracking-tighter leading-none">
              <span className="text-blue-600">KIDO</span>
              <span className="text-amber-500">KIDS</span>
            </span>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">
              Game Edukasi
            </span>
          </div>
        </div>

        <Link 
          href="/login" 
          className="px-6 py-2.5 bg-white text-blue-600 font-bold rounded-full shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-200 hover:bg-blue-50 transition-all active:scale-95"
        >
          Masuk
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative flex flex-col items-center text-center">
        {/* Dekorasi Background */}
        <div className="absolute top-20 -left-10 w-40 h-40 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-40 -right-10 w-40 h-40 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

        <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-8 shadow-sm">
          <Star className="w-4 h-4 fill-blue-500" />
          <span>Cara baru mendidik anak di era digital</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-3xl mb-6">
          Bangun Kebiasaan Baik Jadi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Petualangan Seru</span>
        </h1>
        
        <p className="text-lg text-slate-500 mb-10 max-w-xl leading-relaxed">
          Ubah rutinitas membosankan seperti merapikan kamar atau belajar menjadi misi pahlawan yang menyenangkan. Tanpa marah-marah, tanpa kecanduan layar.
        </p>

        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <Link 
            href="/login" 
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/20 transition-all active:scale-95"
          >
            <span>Coba Gratis Sekarang</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-xs text-slate-400 font-medium">Bebas komitmen, gratis untuk 1 anak.</p>
        </div>
      </section>

      {/* Nilai Jual / Keunggulan (Moat) */}
      <section className="py-20 px-6 bg-white border-y border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-800 mb-4">Mengapa Memilih KIDOKIDS?</h2>
            <p className="text-slate-500">Didesain khusus untuk mendekatkan anak pada dunia nyata, bukan menatap layar seharian.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Pilar 1 */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Fokus Karakter</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Setiap misi dirancang untuk melatih empati, disiplin, jujur, dan tanggung jawab anak sejak dini.
              </p>
            </div>

            {/* Pilar 2 */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Gamifikasi Sehat</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Terdapat sistem Level, XP, dan Badge untuk memotivasi anak, tanpa ada pay-to-win atau iklan manipulatif.
              </p>
            </div>

            {/* Pilar 3 */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Anti Kecanduan</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Sistem pembatas waktu harian dan 'Sleep Mode' otomatis saat jam tidur. Layar akan terkunci dengan pesan edukatif.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BAGIAN PRICING / PAKET BERLANGGANAN */}
    <section className="py-16 px-6 bg-slate-100/50 border-t border-b border-slate-200">
      <div className="text-center max-w-md mx-auto mb-10">
        <h2 className="text-2xl font-black text-slate-800">Investasi Terbaik untuk Karakter Anak</h2>
        <p className="text-sm text-slate-500 mt-2">Pilih paket yang sesuai dengan kebutuhan keluarga kecilmu.</p>
      </div>

      <div className="space-y-6 max-w-sm mx-auto">
        {/* Paket Gratis */}
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm relative">
          <h3 className="font-bold text-lg text-slate-700">Pahlawan Gratisan</h3>
          <p className="text-2xl font-black text-slate-900 mt-2">Rp 0 <span className="text-xs text-slate-400 font-normal">/ selamanya</span></p>
          <ul className="text-xs text-slate-500 space-y-2 mt-4 border-t pt-4">
            <li className="flex items-center">✅ Pantau 1 Anak</li>
            <li className="flex items-center">✅ Akses 1 Dunia (Rumah Bahagia)</li>
            <li className="flex items-center">✅ 3 Misi Karakter / hari</li>
          </ul>
        </div>

        {/* Paket Premium */}
        <div className="bg-white p-6 rounded-3xl border-2 border-blue-500 shadow-md relative overflow-hidden ring-4 ring-blue-100">
          <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-wider">
            Paling Populer
          </div>
          <h3 className="font-bold text-lg text-blue-900">Super Parent Premium</h3>
          <p className="text-2xl font-black text-slate-900 mt-2">Rp 29.000 <span className="text-xs text-slate-400 font-normal">/ bulan</span></p>
          <ul className="text-xs text-slate-600 space-y-2 mt-4 border-t pt-4">
            <li className="flex items-center text-blue-700 font-semibold">✨ Pantau Banyak Anak (Tanpa Batas)</li>
            <li className="flex items-center">✨ Buka Semua 5 Dunia Edukasi</li>
            <li className="flex items-center">✨ Laporan Analisis Karakter Berbasis AI</li>
            <li className="flex items-center">✨ Bukti Misi dengan Foto & Kompresi Otomatis</li>
          </ul>
        </div>
      </div>
    </section>

      {/* Bagian Ajakan Terakhir (CTA) */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto bg-blue-600 rounded-[3rem] p-12 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Target className="w-48 h-48" />
          </div>
          <h2 className="text-3xl font-extrabold mb-6 relative z-10">Siap mencetak pahlawan kecilmu?</h2>
          <p className="text-blue-100 mb-10 relative z-10">
            Mulai petualangan kebiasaan baik hari ini. Hubungkan dunia imajinasi mereka dengan tugas di dunia nyata.
          </p>
          <Link 
            href="/login" 
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-full font-bold shadow-lg hover:scale-105 transition-transform relative z-10"
          >
            Mulai Petualangan Sekarang
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-200 bg-white">
        <p>© 2026 KIDOKIDS App. Dibangun dengan cinta untuk masa depan anak-anak.</p>
      </footer>

    </div>
  );
}