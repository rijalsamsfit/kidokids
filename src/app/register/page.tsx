"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ShieldCheck, User, Lock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

// ✅ IMPORT PABRIK POP-UP KIDO
import { useModalStore } from "@/store/useModalStore";

export default function RegisterPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ AMBIL FUNGSI SHOW ALERT DARI ZUSTAND
  const { showAlert } = useModalStore();

  // State Form
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Pre-fill nama dari akun Google kalau ada
        if (currentUser.displayName) {
          setName(currentUser.displayName);
        }

        try {
          // CEK DATABASE: Apakah Ortu ini sudah pernah daftar manual?
          const parentSnap = await getDoc(doc(db, "parents", currentUser.uid));
          if (parentSnap.exists()) {
            // Kalau udah punya data lengkap, lempar ke Layar Pilih Profil
            router.replace("/profiles");
          } else {
            // Kalau belum, biarkan dia mengisi form
            setIsLoading(false);
          }
        } catch (error) {
          console.error("Gagal mengecek data:", error);
          setIsLoading(false);
        }
      } else {
        // Kalau belum login Google, lempar ke halaman login
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ VALIDASI MENGGUNAKAN CUSTOM ALERT KIDO
    if (!name.trim()) return showAlert("Data Belum Lengkap", "Nama panggilan tidak boleh kosong ya.");
    if (pin.length !== 4) return showAlert("PIN Kurang Aman", "PIN Rahasia wajib terdiri dari 4 angka.");
    if (pin !== confirmPin) return showAlert("PIN Tidak Cocok", "Kombinasi PIN pertama dan kedua berbeda. Coba ketik ulang dengan hati-hati.");
    if (!isAgreed) return showAlert("Belum Centang", "Kamu harus menyetujui Syarat & Ketentuan untuk melanjutkan petualangan.");

    setIsSubmitting(true);

    try {
      // BIKIN PROFIL MANUAL KE FIRESTORE
      const parentRef = doc(db, "parents", user.uid);
      await setDoc(parentRef, {
        uid: user.uid,
        email: user.email,
        name: name.trim(),
        pin: pin, 
        subscriptionPlan: "basic", // Default awal selalu Basic
        subscriptionExpiry: null,
        createdAt: new Date().toISOString(),
      });

      // Misi Selesai! Lempar Ortu ke Layar Pilih Profil (Netflix Style)
      router.replace("/profiles");
    } catch (error: any) {
      console.error("Gagal menyimpan data registrasi:", error);
      showAlert("Gangguan Sistem", "Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.");
      setIsSubmitting(false);
    }
  };

  // Filter input PIN agar hanya menerima angka
  const handlePinChange = (val: string, type: "pin" | "confirm") => {
    const onlyNums = val.replace(/[^0-9]/g, '').slice(0, 4);
    if (type === "pin") setPin(onlyNums);
    else setConfirmPin(onlyNums);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="font-bold text-slate-500 animate-pulse">Menyiapkan Ruang Kendali...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 selection:bg-indigo-200">
      
      {/* HEADER DI LUAR CARD (LEBIH PROPORSIONAL) */}
      <div className="text-center mb-8 animate-in slide-in-from-top-6 duration-500">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-600/30">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Setup Pangkalan</h1>
        <p className="text-slate-500 text-sm font-medium px-4 max-w-xs mx-auto">Langkah terakhir sebelum memulai petualangan pahlawan kecilmu.</p>
      </div>

      {/* CARD FORM MELAYANG */}
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-6 duration-500">
        <form onSubmit={handleSubmit} className="p-7 sm:p-8 space-y-6">
          
          <div className="space-y-5">
            {/* Input Nama */}
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nama Panggilan Ortu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Bunda Ana"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            {/* Input PIN & Konfirmasi */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Buat PIN (4 Angka)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    inputMode="numeric"
                    value={pin}
                    onChange={(e) => handlePinChange(e.target.value, "pin")}
                    placeholder="••••"
                    className="w-full pl-9 pr-3 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-center text-xl text-slate-800 tracking-[0.3em] outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Ulangi PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  value={confirmPin}
                  onChange={(e) => handlePinChange(e.target.value, "confirm")}
                  placeholder="••••"
                  className="w-full px-3 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-center text-xl text-slate-800 tracking-[0.3em] outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>
            
            <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-100">
              <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
                *PIN ini digunakan untuk mengunci Dasbor Orang Tua agar tidak bisa diakses oleh anak.
              </p>
            </div>
          </div>

          {/* Persetujuan TOS */}
          <div className="flex items-start gap-3 mt-8 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAgreed(!isAgreed)}
              className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border-2 transition-all ${
                isAgreed ? "bg-indigo-600 border-indigo-600" : "bg-slate-50 border-slate-300"
              }`}
            >
              {isAgreed && <CheckCircle2 className="w-4 h-4 text-white" />}
            </button>
            <p className="text-[11px] font-medium text-slate-500 leading-relaxed cursor-pointer" onClick={() => setIsAgreed(!isAgreed)}>
              Saya setuju dengan <span className="text-indigo-600 font-bold hover:underline">Syarat & Ketentuan</span> dan siap mendampingi petualangan anak saya di KIDO.
            </p>
          </div>

          {/* Tombol Selesai */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all mt-4 ${
              isSubmitting || !isAgreed || pin.length !== 4
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/30 active:scale-95"
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                Selesai & Buka Pangkalan <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}