"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { ShieldCheck, Sparkles, CreditCard, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation"; // ✅ Diperbaiki: Menggunakan named import {} agar tidak eror compiler
import Link from "next/link";

declare global {
  interface Window {
    snap: any;
  }
}

export default function BillingPage() {
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [premiumUntil, setPremiumUntil] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [processLoading, setProcessLoading] = useState<boolean>(false);

  // 1. Pantau status pembayaran user secara Realtime dari Firestore
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const parentRef = doc(db, "parents", user.uid);
        
        // Menggunakan onSnapshot agar kalau webhook Midtrans sukses, halaman langsung otomatis berubah murni tanpa refresh!
        const unsubscribeSnapshot = onSnapshot(parentRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setIsPremium(data.isPremium || false);
            setPremiumUntil(data.premiumUntil || null);
          }
          setLoading(false);
        });

        return () => unsubscribeSnapshot();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Fungsi ketika tombol "Upgrade Sekarang" ditekan (Sudah Terintegrasi Midtrans)
  const handleUpgrade = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Kamu harus login terlebih dahulu!");
      return;
    }

    setProcessLoading(true);

    try {
      // format order_id: sub_PARENTUID_timestamp (Dikenali oleh Webhook kita)
      const orderId = `sub_${user.uid}_${Date.now()}`;
      
      // Hubungkan ke API backend Next.js kita untuk minta Snap Token dari Midtrans
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: orderId,
          amount: 29000, // Nominal sesuai paket Rp 29.000
          customerName: user.displayName || "Orang Tua KIDO",
          customerEmail: user.email || "ortu@kidokids.com"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal meracik token pembayaran");
      }

      // Pengaman: Pastikan script snap.js dari layout.tsx sudah termuat sempurna
      if (!window.snap) {
        throw new Error("Sistem kasir Midtrans belum siap. Silakan coba beberapa detik lagi.");
      }

      // ⚡ NYALAKAN POPUP KASIR MIDTRANS SNAP ASLI
      window.snap.pay(data.token, {
        onSuccess: function(result: any) {
          console.log('Pembayaran Berhasil:', result);
          // Kita tidak perlu mematikan loading atau mengubah state di sini, 
          // karena onSnapshot Firestore di atas akan mendeteksi perubahan dari webhook secara realtime!
        },
        onPending: function(result: any) {
          console.log('Menunggu Pembayaran:', result);
          alert("Permintaan pembayaran berhasil dibuat! Silakan selesaikan transaksi sesuai petunjuk di layar.");
          setProcessLoading(false);
        },
        onError: function(result: any) {
          console.error('Pembayaran Eror:', result);
          alert("Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.");
          setProcessLoading(false);
        },
        onClose: function() {
          console.log('User menutup popup kasir tanpa menyelesaikan pembayaran');
          setProcessLoading(false); // Kembalikan tombol ke keadaan normal jika dibatalkan
        }
      });

    } catch (error: any) {
      console.error("Gagal memulai pembayaran:", error);
      alert(error.message || "Terjadi masalah koneksi ke server kasir.");
      setProcessLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm text-slate-500 mt-2 font-medium">Memuat info akun...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header navigasi atas */}
      <div className="flex items-center space-x-3 mb-6">
        <Link href="/parent" className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-black text-slate-800">Langganan & Billing</h1>
      </div>

      {/* KONDISI 1: JIKA USER SUDAH PREMIUM 🎉 */}
      {isPremium ? (
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2.5rem] p-6 text-white shadow-xl shadow-emerald-500/10 relative overflow-hidden mb-6">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          <div className="flex items-center space-x-3 bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            <span>Akun Aktif</span>
          </div>
          <h2 className="text-2xl font-black">Super Parent Premium</h2>
          <p className="text-emerald-100 text-xs mt-1 font-medium">
            Status langganan kamu aktif otomatis berkat kasir otomatis Midtrans.
          </p>
          <div className="mt-6 pt-4 border-t border-white/20 text-xs text-emerald-100 flex justify-between items-center">
            <span>Berlaku sampai:</span>
            <span className="font-bold bg-white text-emerald-700 px-3 py-1 rounded-lg">
              {premiumUntil ? new Date(premiumUntil).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
            </span>
          </div>
        </div>
      ) : (
        /* KONDISI 2: JIKA USER MASIH GRATISAN 💎 */
        <div className="space-y-6">
          {/* Status Card Sekarang */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Paket Kamu Saat Ini</p>
              <h3 className="text-lg font-black text-slate-700 mt-0.5">Pahlawan Gratisan</h3>
            </div>
            <span className="text-xs font-black bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full">Free Tier</span>
          </div>

          {/* Brosur Jualan Premium */}
          <div className="bg-white rounded-[2.5rem] p-6 border-2 border-blue-500 shadow-md relative overflow-hidden ring-4 ring-blue-50">
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider">
              Rekomendasi
            </div>
            
            <h3 className="font-black text-xl text-blue-950 flex items-center space-x-2">
              <span>Super Parent Premium</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Investasi terbaik untuk pembentukan kebiasaan baik anak.</p>
            
            <div className="mt-4 flex items-baseline space-x-1">
              <span className="text-3xl font-black text-slate-900">Rp 29.000</span>
              <span className="text-xs text-slate-400 font-medium">/ bulan</span>
            </div>

            {/* List Fitur Unggulan */}
            <ul className="space-y-3 mt-6 border-t border-slate-100 pt-5 text-xs text-slate-600">
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span><strong className="text-slate-800">Pantau Banyak Anak:</strong> Tambah profile anak tanpa batasan kuota MVP.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span><strong className="text-slate-800">Akses Semua Dunia Edukasi:</strong> Buka 5 peta petualangan karakter eksklusif.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span><strong className="text-slate-800">Analisis Karakter Berbasis AI:</strong> Dapatkan rapor mingguan otomatis perkembangan anak.</span>
              </li>
            </ul>

            {/* Tombol Eksekusi Bayar */}
            <button
              onClick={handleUpgrade}
              disabled={processLoading}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {processLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Upgrade ke Premium Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Navigasi Bawah */}
      <Navigation />
    </div>
  );
}