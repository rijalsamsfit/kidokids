"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { getChildrenProfiles, createChildProfile } from "@/lib/childService";
import { 
  ArrowLeft, Users, UserPlus, Eye, EyeOff, Clock, Moon, 
  ShieldCheck, CreditCard, LogOut, ChevronRight, X, Loader2 
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [childrenData, setChildrenData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk visibilitas PIN (Mata terbuka/tertutup)
  const [visiblePins, setVisiblePins] = useState<{ [key: string]: boolean }>({});

  // State untuk Modal Tambah Anak
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildPin, setNewChildPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
        fetchChildren();
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchChildren = async () => {
    setIsLoading(true);
    try {
      const profiles = await getChildrenProfiles();
      setChildrenData(profiles);
    } catch (error) {
      console.error("Gagal menarik data anak:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePinVisibility = (childId: string) => {
    setVisiblePins(prev => ({
      ...prev,
      [childId]: !prev[childId]
    }));
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim() || newChildPin.length !== 4) {
      alert("Nama harus diisi dan PIN harus 4 digit angka!");
      return;
    }

    setIsSubmitting(true);
    try {
      await createChildProfile(newChildName, newChildPin);
      alert(`🎉 Profil pahlawan ${newChildName} berhasil dibuat!`);
      setIsAddChildOpen(false);
      setNewChildName("");
      setNewChildPin("");
      fetchChildren(); // Refresh daftar anak
    } catch (error) {
      alert("Gagal menambahkan anak. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Yakin ingin keluar dari akun Orang Tua?");
    if (!confirmLogout) return;

    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      alert("Gagal keluar akun.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      
      {/* HEADER */}
      <div className="bg-white px-6 py-4 flex items-center space-x-4 sticky top-0 z-10 shadow-sm border-b border-slate-200">
        <Link href="/parent" className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-black text-slate-800">Pengaturan</h1>
      </div>

      <div className="p-6 space-y-8">
        
        {/* SEKSI 1: MANAJEMEN PASUKAN (ANAK) */}
        <section>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2">
            <Users className="w-4 h-4" /> Pasukan Pahlawan
          </h2>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {childrenData.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm font-medium">
                Belum ada profil anak.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {childrenData.map((child) => (
                  <div key={child.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 font-black text-xl rounded-full flex items-center justify-center uppercase">
                        {child.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-[15px]">{child.name}</p>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">Level {child.level || 1}</p>
                      </div>
                    </div>
                    
                    {/* Tampilan PIN & Toggle Mata */}
                    <div className="flex items-center space-x-3 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                      <span className="font-mono font-bold text-slate-600 tracking-widest text-sm">
                        {visiblePins[child.id] ? child.pin : "••••"}
                      </span>
                      <button 
                        onClick={() => togglePinVisibility(child.id)}
                        className="text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        {visiblePins[child.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Tombol Tambah Anak */}
            <button 
              onClick={() => setIsAddChildOpen(true)}
              className="w-full p-4 flex items-center justify-center space-x-2 text-blue-600 font-bold bg-blue-50/50 hover:bg-blue-50 transition-colors active:bg-blue-100"
            >
              <UserPlus className="w-5 h-5" />
              <span>Tambah Profil Anak</span>
            </button>
          </div>
        </section>

        {/* SEKSI 2: KONTROL WAKTU & DISIPLIN (Roadmap UI) */}
        <section>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Disiplin Layar (Roadmap)
          </h2>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
              <div className="flex items-center space-x-3 text-slate-700">
                <Clock className="w-5 h-5 text-amber-500" />
                <span className="font-bold">Batas Waktu Main</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <span className="text-sm font-semibold text-amber-600">30 Menit</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
              <div className="flex items-center space-x-3 text-slate-700">
                <Moon className="w-5 h-5 text-indigo-500" />
                <span className="font-bold">Jam Tidur (Kunci Otomatis)</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <span className="text-sm font-semibold text-indigo-600">21:00 - 05:00</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </section>

        {/* SEKSI 3: KEAMANAN & AKUN */}
        <section>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Akun & Keamanan
          </h2>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            
            {/* Info Email (Hanya Display) */}
            <div className="w-full p-4 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3 text-slate-500">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-bold text-sm">Akun Google</span>
              </div>
              <span className="text-xs font-semibold text-slate-500 truncate max-w-[150px]">{userEmail}</span>
            </div>

            <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
              <div className="flex items-center space-x-3 text-slate-700">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span className="font-bold">Ubah PIN Orang Tua</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <Link href="/parent/billing" className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
              <div className="flex items-center space-x-3 text-slate-700">
                <CreditCard className="w-5 h-5 text-blue-500" />
                <span className="font-bold">Langganan & Billing</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* TOMBOL LOGOUT */}
        <button 
          onClick={handleLogout}
          className="w-full p-4 bg-rose-50 text-rose-600 font-bold rounded-2xl border border-rose-100 hover:bg-rose-100 hover:border-rose-200 transition-colors flex items-center justify-center space-x-2 active:scale-95 shadow-sm"
        >
          <LogOut className="w-5 h-5" />
          <span>Keluar Akun (Logout)</span>
        </button>

      </div>

      {/* MODAL TAMBAH ANAK */}
      {isAddChildOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white w-full sm:w-[400px] rounded-t-[2rem] sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-blue-500" /> Profil Baru
              </h3>
              <button onClick={() => setIsAddChildOpen(false)} className="p-2 bg-slate-100 text-slate-400 rounded-full hover:bg-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddChild} className="space-y-5">
              <div>
                <label className="text-sm font-bold text-slate-600 ml-1">Nama Panggilan Anak</label>
                <input 
                  type="text" 
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  placeholder="Cth: Budi" 
                  maxLength={15}
                  className="w-full mt-1.5 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-400 focus:bg-white outline-none transition-all font-bold text-slate-700" 
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-bold text-slate-600 ml-1">PIN Rahasia (4 Digit)</label>
                <p className="text-[11px] text-slate-400 ml-1 mb-1.5 leading-tight">PIN ini dipakai anak untuk masuk ke area bermainnya. Buat yang gampang diingat ya!</p>
                <input 
                  type="text" 
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={4}
                  value={newChildPin}
                  onChange={(e) => setNewChildPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Cth: 1234" 
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-400 focus:bg-white outline-none transition-all font-mono tracking-[1em] text-center font-black text-slate-700 text-xl" 
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting || newChildPin.length !== 4 || !newChildName}
                className="w-full mt-8 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-4 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Buat Profil Pahlawan</span>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}