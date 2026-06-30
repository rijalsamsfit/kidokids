"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { ShieldCheck, Sparkles, CreditCard, CheckCircle2, Loader2, ArrowLeft, Crown, CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

declare global {
  interface Window {
    snap: any;
  }
}

// ✅ UPDATE: Menambahkan tipe 'annual' ke dalam kasta
type PlanType = "basic" | "pro" | "annual" | "lifetime";

export default function BillingPage() {
  const [plan, setPlan] = useState<PlanType>("basic");
  const [premiumUntil, setPremiumUntil] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [processLoading, setProcessLoading] = useState<string | null>(null); 

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const parentRef = doc(db, "parents", user.uid); 
        
        const unsubscribeSnapshot = onSnapshot(parentRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setPlan(data.subscriptionPlan || "basic");
            setPremiumUntil(data.subscriptionExpiry || null);
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

  // ✅ UPDATE: Menambahkan 'annual' ke dalam parameter fungsi
  const handleUpgrade = async (selectedPlan: "pro" | "annual" | "lifetime", amount: number) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Kamu harus login terlebih dahulu!");
      return;
    }

    setProcessLoading(selectedPlan);

    try {
      const orderId = `KIDO-${Date.now()}`;
      
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: orderId,
          amount: amount, 
          customerName: user.displayName || "Orang Tua KIDO",
          customerEmail: user.email || "ortu@kidokids.com",
          planType: selectedPlan 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal meracik token pembayaran");
      }

      if (!window.snap) {
        throw new Error("Sistem kasir Midtrans belum siap. Silakan coba beberapa detik lagi.");
      }

      window.snap.pay(data.token, {
        onSuccess: function(result: any) {
          console.log('Pembayaran Berhasil:', result);
          setProcessLoading(null);
        },
        onPending: function(result: any) {
          console.log('Menunggu Pembayaran:', result);
          alert("Permintaan pembayaran berhasil dibuat! Silakan selesaikan transaksi sesuai petunjuk di layar.");
          setProcessLoading(null);
        },
        onError: function(result: any) {
          console.error('Pembayaran Eror:', result);
          alert("Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.");
          setProcessLoading(null);
        },
        onClose: function() {
          console.log('User menutup popup kasir');
          setProcessLoading(null); 
        }
      });

    } catch (error: any) {
      console.error("Gagal memulai pembayaran:", error);
      alert(error.message || "Terjadi masalah koneksi ke server kasir.");
      setProcessLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm text-slate-500 mt-2 font-medium">Memuat info kasir...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen pb-24">
      <div className="flex items-center space-x-3 mb-6">
        <Link href="/parent" className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-black text-slate-800">Langganan & Billing</h1>
      </div>

      {/* KONDISI 1: JIKA USER SUDAH PUNYA PAKET AKTIF (PRO, ANNUAL, ATAU LIFETIME) 🎉 */}
      {plan !== "basic" && (
        <div className={`rounded-[2.5rem] p-6 text-white shadow-xl relative overflow-hidden mb-6 
          ${plan === 'lifetime' ? 'bg-gradient-to-br from-yellow-400 to-amber-600 shadow-amber-500/20' : 
            plan === 'annual' ? 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-500/20' :
            'bg-gradient-to-br from-slate-700 to-slate-900 shadow-slate-500/20'}`}>
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="flex items-center space-x-3 bg-white/20 w-fit px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4 border border-white/20">
            {plan === 'lifetime' ? <Crown className="w-3.5 h-3.5 fill-white" /> : <Sparkles className="w-3.5 h-3.5 fill-white" />}
            <span>Akun {plan === 'lifetime' ? 'Lifetime' : plan === 'annual' ? 'Tahunan' : 'Pro'} Aktif</span>
          </div>
          <h2 className="text-2xl font-black">Super Parent {plan === 'lifetime' ? 'VIP' : plan === 'annual' ? 'Tahunan' : 'Pro'}</h2>
          <p className="text-white/80 text-xs mt-1 font-medium leading-relaxed">
            {plan === 'lifetime' 
              ? 'Terima kasih telah berinvestasi seumur hidup untuk perkembangan anakmu.' 
              : 'Status langganan kamu aktif otomatis berkat kasir Midtrans.'}
          </p>
          
          {(plan === 'pro' || plan === 'annual') && premiumUntil && (
            <div className="mt-6 pt-4 border-t border-white/20 text-xs flex justify-between items-center">
              <span className="text-white/80">Berlaku sampai:</span>
              <span className="font-bold bg-white text-slate-800 px-3 py-1 rounded-lg">
                {new Date(premiumUntil).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
          )}
        </div>
      )}

      {/* KONDISI 2: TAMPILKAN STATUS GRATISAN JIKA BASIC */}
      {plan === "basic" && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Paket Saat Ini</p>
            <h3 className="text-lg font-black text-slate-700 mt-0.5">Pahlawan Gratisan</h3>
          </div>
          <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1.5 rounded-md border border-slate-200 uppercase tracking-wider">Free Tier</span>
        </div>
      )}

      {/* ETALASE JUALAN: HANYA TAMPIL JIKA BUKAN LIFETIME */}
      {plan !== "lifetime" && (
        <div className="space-y-6">
          <div className="flex items-center space-x-2 px-1 mb-2">
            <h2 className="text-lg font-bold text-slate-800">Pilih Paket Upgrade</h2>
          </div>

          {/* PAKET 1: LIFETIME (TARGET UTAMA) */}
          <div className="bg-gradient-to-b from-yellow-50 to-white rounded-[2.5rem] p-6 border-2 border-yellow-400 shadow-lg relative overflow-hidden ring-4 ring-yellow-400/20 transform transition-all hover:scale-[1.01]">
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-950 text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Crown className="w-3 h-3 fill-yellow-950" /> Best Value
            </div>
            
            <h3 className="font-black text-xl text-yellow-900 mt-2">KIDO Lifetime</h3>
            <p className="text-xs text-yellow-700/80 mt-1 font-semibold">Sekali bayar. Bebas langganan selamanya.</p>
            
            <div className="mt-4 flex flex-col">
              <span className="text-xs text-slate-400 font-bold line-through">Rp 500.000</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-black text-yellow-600">Rp 299.000</span>
              </div>
            </div>

            <ul className="space-y-3 mt-5 border-t border-yellow-200/50 pt-5 text-xs text-slate-700">
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Semua Fitur PRO:</strong> Akses penuh tanpa batas.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Gratis Update Selamanya:</strong> Dapat akses game baru gratis.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Badge Founding Family:</strong> Lencana eksklusif di aplikasi anak.</span>
              </li>
            </ul>

            <button
              onClick={() => handleUpgrade("lifetime", 299000)}
              disabled={processLoading !== null}
              className="w-full mt-6 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 p-4 rounded-2xl font-black shadow-lg shadow-yellow-400/30 transition-all active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {processLoading === "lifetime" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Ambil Akses Seumur Hidup</span>
                </>
              )}
            </button>
          </div>

          {/* PAKET 2: TAHUNAN (THE DECOY / UMPAN) - Tidak tampil jika sudah tahunan */}
          {(plan === "basic" || plan === "pro") && (
            <div className="bg-white rounded-[2.5rem] p-6 border-2 border-blue-400 shadow-md relative overflow-hidden transition-all hover:border-blue-500">
              <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider border-b border-l border-blue-200">
                Lebih Hemat
              </div>

              <h3 className="font-black text-xl text-blue-950 mt-2">KIDO Tahunan</h3>
              <p className="text-xs text-slate-400 mt-1">Pembentukan kebiasaan jangka panjang.</p>
              
              <div className="mt-4 flex flex-col">
                <span className="text-xs text-slate-400 font-bold line-through">Rp 348.000</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-blue-700">Rp 199.000</span>
                  <span className="text-xs text-slate-400 font-medium">/ tahun</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 bg-emerald-50 w-fit px-2 py-0.5 rounded-md border border-emerald-100">Cuma Rp 16.500 / bulan</span>
              </div>

              <ul className="space-y-3 mt-5 border-t border-slate-100 pt-5 text-xs text-slate-600">
                <li className="flex items-start space-x-2.5">
                  <CalendarDays className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>Lebih hemat 40% dibanding paket bulanan.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>Akses semua fitur PRO selama 12 bulan penuh.</span>
                </li>
              </ul>

              <button
                onClick={() => handleUpgrade("annual", 199000)}
                disabled={processLoading !== null}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {processLoading === "annual" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span>Langganan 1 Tahun</span>
                )}
              </button>
            </div>
          )}

          {/* PAKET 3: PRO BULANAN (TIDAK TAMPIL JIKA SUDAH PRO ATAU LEBIH TINGGI) */}
          {plan === "basic" && (
            <div className="bg-slate-50 rounded-[2.5rem] p-6 border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:bg-white">
              <h3 className="font-black text-lg text-slate-800">KIDO Bulanan</h3>
              <p className="text-[11px] text-slate-400 mt-1">Coba dulu sebulan.</p>
              
              <div className="mt-4 flex items-baseline space-x-1">
                <span className="text-xl font-black text-slate-700">Rp 29.000</span>
                <span className="text-xs text-slate-400 font-medium">/ bulan</span>
              </div>

              <button
                onClick={() => handleUpgrade("pro", 29000)}
                disabled={processLoading !== null}
                className="w-full mt-6 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 p-3.5 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {processLoading === "pro" ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                ) : (
                  <span className="text-sm">Mulai Bulanan</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      <Navigation />
    </div>
  );
}