"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ShieldCheck, User, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // State Form
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);

  // State Status
  const [errorMsg, setErrorMsg] = useState("");
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
            // Kalau udah punya data lengkap, ngapain di sini? Lempar ke Layar Pilih Profil!
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
    setErrorMsg("");

    // Validasi Ketat ala Vibe Coding
    if (!name.trim()) return setErrorMsg("Nama panggilan tidak boleh kosong.");
    if (pin.length !== 4) return setErrorMsg("PIN Rahasia wajib 4 angka.");
    if (pin !== confirmPin) return setErrorMsg("Kombinasi PIN tidak cocok. Coba cek lagi.");
    if (!isAgreed) return setErrorMsg("Kamu harus menyetujui Syarat & Ketentuan untuk melanjutkan.");

    setIsSubmitting(true);

    try {
      // BIKIN PROFIL MANUAL KE FIRESTORE
      const parentRef = doc(db, "parents", user.uid);
      await setDoc(parentRef, {
        uid: user.uid,
        email: user.email,
        name: name.trim(),
        pin: pin, // <-- PIN Rahasia Ortu akhirnya tersimpan!
        subscriptionPlan: "basic", // Default awal selalu Basic
        subscriptionExpiry: null,
        createdAt: new Date().toISOString(),
      });

      // Misi Selesai! Lempar Ortu ke Layar Pilih Profil (Netflix Style)
      router.replace("/profiles");
    } catch (error: any) {
      console.error("Gagal menyimpan data registrasi:", error);
      setErrorMsg("Terjadi kesalahan pada sistem. Silakan coba beberapa saat lagi.");
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-indigo-200">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
        
        {/* HEADER FORM */}
        <div className="bg-indigo-600 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-[-50%] right-[-20%] w-48 h-48 bg-purple-500/30 blur-[50px] rounded-full pointer-events-none"></div>
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-1">Setup Pangkalan</h1>
          <p className="text-indigo-100 text-sm font-medium">Langkah terakhir sebelum memulai petualangan pahlawan kecilmu.</p>
        </div>

        {/* BODY FORM */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {errorMsg && (
            <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-rose-800 leading-snug">{errorMsg}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Input Nama */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nama Panggilan Ortu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Bunda Ana"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            {/* Input PIN & Konfirmasi (Bersebelahan) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Buat PIN (4 Angka)</label>
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
                    className="w-full pl-10 pr-3 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-center text-xl text-slate-800 tracking-[0.3em] outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Ulangi PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  value={confirmPin}
                  onChange={(e) => handlePinChange(e.target.value, "confirm")}
                  placeholder="••••"
                  className="w-full px-3 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-center text-xl text-slate-800 tracking-[0.3em] outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>
            <p className="text-[10px] font-bold text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">
              *PIN ini digunakan untuk mengunci Dasbor Orang Tua agar tidak bisa diakses oleh anak. Harap diingat!
            </p>
          </div>

          {/* Persetujuan TOS */}
          <div className="flex items-start gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsAgreed(!isAgreed)}
              className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border-2 transition-all ${
                isAgreed ? "bg-indigo-600 border-indigo-600" : "bg-slate-50 border-slate-300"
              }`}
            >
              {isAgreed && <CheckCircle2 className="w-4 h-4 text-white" />}
            </button>
            <p className="text-xs font-medium text-slate-500 leading-relaxed cursor-pointer" onClick={() => setIsAgreed(!isAgreed)}>
              Saya setuju dengan <span className="text-indigo-600 font-bold hover:underline">Syarat & Ketentuan</span> dan menyatakan komitmen untuk mendampingi petualangan karakter anak saya di KIDOKIDS.
            </p>
          </div>

          {/* Tombol Selesai */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all mt-8 ${
              isSubmitting || !isAgreed || pin.length !== 4
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 active:scale-95"
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