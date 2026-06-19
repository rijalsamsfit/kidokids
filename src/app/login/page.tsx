"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShieldCheck, Sparkles, LogIn, ArrowRight } from "lucide-react";
import { auth, db } from "@/lib/firebase"; // ✅ UPDATE: Tambah db
import { doc, getDoc } from "firebase/firestore"; // ✅ UPDATE: Import getDoc
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Fungsi Login KHUSUS Orang Tua (Manager) menggunakan Akun Google
  const handleParentLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Membuka popup login Google bawaan Firebase
      const result = await signInWithPopup(auth, provider);
      
      const user = result.user;
      console.log(`Berhasil login Google! Cek status pendaftaran: ${user.email}`);

      // 🛡️ LOGIKA PENJAGA GERBANG (THE PRO FLOW)
      // Cek apakah Ortu sudah pernah mengisi form registrasi manual (setup PIN & Biodata)
      const parentSnap = await getDoc(doc(db, "parents", user.uid));
      
      if (parentSnap.exists()) {
        // Sudah setup lengkap -> Lempar ke Layar Pilih Profil
        router.replace("/profiles");
      } else {
        // Baru login Google doang tapi belum setup -> Paksa ke Halaman Registrasi Manual
        router.replace("/register");
      }

    } catch (error: any) {
      console.error("Gagal login:", error);
      alert(`Oops, gagal login: ${error.message}. Pastikan popup tidak diblokir browser ya!`);
      setIsLoading(false);
    }
  };

  // Fungsi Masuk KHUSUS Anak
  const handleChildEntrance = () => {
    // Logika ala Netflix. Kalau belum ada akun Google yg nyangkut, anak gak bisa masuk.
    if (auth.currentUser) {
      router.push("/profiles");
    } else {
      alert("Pahlawan kecil, minta tolong Ayah atau Ibu untuk Masuk pakai Google dulu ya buat buka pintunya!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
      
      {/* Bagian Header / Logo KIDOKIDS */}
      <div className="flex flex-col items-center mb-10 space-y-5">
        {/* Logo Asli */}
        <div className="relative w-28 h-28 rounded-3xl overflow-hidden shadow-xl shadow-blue-200/60 transform hover:scale-105 transition-transform duration-300">
          <Image 
            src="/icon-512x512.png" 
            alt="Logo KIDOKIDS" 
            fill
            className="object-cover"
          />
        </div>
        
        {/* Teks Branding KIDOKIDS */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl font-black tracking-tighter leading-none">
            <span className="text-blue-600">KIDO</span>
            <span className="text-amber-500">KIDS</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold bg-white inline-block py-1.5 px-4 rounded-full border border-slate-200 shadow-sm">
            Membangun kebiasaan baik jadi seru!
          </p>
        </div>
      </div>

      {/* Kartu Pilihan Masuk */}
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-7 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-slate-800">Masuk sebagai siapa?</h2>
          <p className="text-xs text-slate-400 font-medium">Pilih pintu masukmu hari ini</p>
        </div>

        <div className="space-y-4">
          {/* Tombol Masuk Anak */}
          <button
            onClick={handleChildEntrance}
            disabled={isLoading}
            className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-blue-100 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-all group disabled:opacity-50"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500 rounded-xl group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-blue-900 text-lg">Area Anak</p>
                <p className="text-xs text-blue-600 font-medium">Main & Selesaikan Misi</p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-blue-400 group-hover:text-blue-600 transition-colors" />
          </button>

          {/* Tombol Login Orang Tua (Pakai Google Auth) */}
          <button
            onClick={handleParentLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-emerald-100 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 transition-all group disabled:opacity-50"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-emerald-500 rounded-xl group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-emerald-900 text-lg">Dasbor Orang Tua</p>
                <p className="text-xs text-emerald-600 font-medium">Masuk dengan Google</p>
              </div>
            </div>
            <LogIn className="w-6 h-6 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
          </button>
        </div>

        {/* Indikator Loading */}
        {isLoading && (
          <p className="text-center text-sm font-bold text-emerald-600 animate-pulse pt-2">
            Membuka gerbang KIDO...
          </p>
        )}
      </div>
    </div>
  );
}