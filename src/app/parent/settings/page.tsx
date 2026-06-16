"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { 
  getChildrenProfiles, 
  createChildProfile, 
  updateChildPin, 
  updateChildSettings 
} from "@/lib/childService";
import { 
  ArrowLeft, Users, UserPlus, Eye, EyeOff, Clock, Moon, 
  ShieldCheck, CreditCard, LogOut, X, Loader2, ChevronRight, Settings 
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [childrenData, setChildrenData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk visibilitas PIN
  const [visiblePins, setVisiblePins] = useState<{ [key: string]: boolean }>({});

  // State untuk Modal Tambah Anak
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildPin, setNewChildPin] = useState("");
  
  // State untuk Modal Settings (PIN, Waktu Main, Jam Tidur)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeChild, setActiveChild] = useState<any>(null);
  const [settingType, setSettingType] = useState<"screenTime" | "sleepTime" | "pin" | null>(null);
  const [inputValue, setInputValue] = useState("");
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

  // ✅ FUNGSI BUKA MODAL SETTINGS
  const openSettings = (child: any, type: "screenTime" | "sleepTime" | "pin") => {
    setActiveChild(child);
    setSettingType(type);
    
    // Set default value ke input
    if (type === "screenTime") setInputValue(child.screenTimeLimit?.toString() || "30");
    if (type === "sleepTime") setInputValue(child.sleepTime || "21:00");
    if (type === "pin") setInputValue("");
    
    setIsSettingsOpen(true);
  };

  // ✅ FUNGSI SIMPAN SETTINGS
  const handleSaveSettings = async () => {
    if (!activeChild) return;
    setIsSubmitting(true);
    try {
      if (settingType === "pin") {
        await updateChildPin(activeChild.id, inputValue);
      } else if (settingType === "screenTime") {
        await updateChildSettings(activeChild.id, { screenTimeLimit: Number(inputValue) });
      } else if (settingType === "sleepTime") {
        await updateChildSettings(activeChild.id, { sleepTime: inputValue });
      }
      alert("Berhasil diperbarui!");
      setIsSettingsOpen(false);
      fetchChildren();
    } catch (error) {
      alert("Gagal menyimpan pengaturan.");
    } finally {
      setIsSubmitting(false);
    }
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
      alert(`🎉 Profil ${newChildName} berhasil dibuat!`);
      setIsAddChildOpen(false);
      setNewChildName("");
      setNewChildPin("");
      fetchChildren();
    } catch (error) {
      alert("Gagal menambahkan anak.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (confirm("Yakin ingin keluar?")) {
      await signOut(auth);
      router.push("/login");
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
        
        {/* SEKSI 1: MANAJEMEN PASUKAN */}
        <section>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2">
            <Users className="w-4 h-4" /> Pasukan Pahlawan
          </h2>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {childrenData.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm font-medium">Belum ada profil anak.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {childrenData.map((child) => (
                  <div key={child.id} className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 font-black text-xl rounded-full flex items-center justify-center uppercase">
                          {child.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-[15px]">{child.name}</p>
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">Level {child.level || 1}</p>
                        </div>
                      </div>
                      <button onClick={() => togglePinVisibility(child.id)} className="text-slate-400 flex items-center gap-2">
                        {visiblePins[child.id] ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                        <span className="font-mono font-bold text-sm tracking-widest">{visiblePins[child.id] ? child.pin : "••••"}</span>
                      </button>
                    </div>

                    {/* ✅ TOMBOL AKSI PENGATURAN */}
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => openSettings(child, "screenTime")} className="text-[10px] font-bold bg-amber-50 text-amber-700 py-2 rounded-lg border border-amber-100">Waktu Main</button>
                      <button onClick={() => openSettings(child, "sleepTime")} className="text-[10px] font-bold bg-indigo-50 text-indigo-700 py-2 rounded-lg border border-indigo-100">Jam Tidur</button>
                      <button onClick={() => openSettings(child, "pin")} className="text-[10px] font-bold bg-emerald-50 text-emerald-700 py-2 rounded-lg border border-emerald-100">Ubah PIN</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setIsAddChildOpen(true)} className="w-full p-4 flex items-center justify-center space-x-2 text-blue-600 font-bold bg-blue-50/50 hover:bg-blue-50">
              <UserPlus className="w-5 h-5" /> <span>Tambah Profil Anak</span>
            </button>
          </div>
        </section>

        {/* SEKSI 3: AKUN */}
        <section>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Akun & Keamanan
          </h2>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            <div className="w-full p-4 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3 text-slate-500"><ShieldCheck className="w-5 h-5" /><span className="font-bold text-sm">Akun Google</span></div>
              <span className="text-xs font-semibold text-slate-500">{userEmail}</span>
            </div>
            <Link href="/parent/billing" className="w-full p-4 flex items-center justify-between hover:bg-slate-50">
              <div className="flex items-center space-x-3 text-slate-700"><CreditCard className="w-5 h-5 text-blue-500" /><span className="font-bold">Langganan</span></div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>
          </div>
        </section>

        <button onClick={handleLogout} className="w-full p-4 bg-rose-50 text-rose-600 font-bold rounded-2xl border border-rose-100 flex items-center justify-center space-x-2">
          <LogOut className="w-5 h-5" /> <span>Keluar Akun</span>
        </button>
      </div>

      {/* ✅ MODAL SETTINGS (DYNAMIC) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm shadow-2xl">
            <h3 className="font-black text-lg mb-4 capitalize">Edit {settingType === "screenTime" ? "Batas Waktu (Menit)" : settingType === "sleepTime" ? "Jam Tidur" : "PIN Baru"}</h3>
            <input 
              type={settingType === "pin" ? "text" : settingType === "screenTime" ? "number" : "time"}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full p-4 bg-slate-100 rounded-2xl mb-6 font-black text-lg outline-none"
            />
            <div className="flex gap-3">
              <button onClick={() => setIsSettingsOpen(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold">Batal</button>
              <button onClick={handleSaveSettings} disabled={isSubmitting} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH ANAK */}
      {isAddChildOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
            <div className="bg-white w-full sm:w-[400px] rounded-t-[2rem] sm:rounded-3xl p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-extrabold text-slate-800">Profil Baru</h3>
                <button onClick={() => setIsAddChildOpen(false)} className="p-2 bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddChild} className="space-y-4">
                <input type="text" value={newChildName} onChange={(e) => setNewChildName(e.target.value)} placeholder="Nama Anak" className="w-full p-4 bg-slate-50 rounded-2xl" required />
                <input type="text" pattern="[0-9]*" maxLength={4} value={newChildPin} onChange={(e) => setNewChildPin(e.target.value.replace(/[^0-9]/g, ''))} placeholder="PIN (4 Digit)" className="w-full p-4 bg-slate-50 rounded-2xl" required />
                <button type="submit" className="w-full p-4 bg-blue-600 text-white rounded-2xl font-bold">Buat Profil</button>
              </form>
            </div>
        </div>
      )}
    </div>
  );
}