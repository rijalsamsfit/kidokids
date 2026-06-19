"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { compressImage } from "@/utils/imageCompression";
import { signOut } from "firebase/auth";
import { 
  getChildrenProfiles, 
  createChildProfile, 
  updateChildPin, 
  updateChildSettings 
} from "@/lib/childService";
import { 
  ArrowLeft, Users, UserPlus, Eye, EyeOff, Clock, Moon, 
  ShieldCheck, CreditCard, LogOut, X, Loader2, ChevronRight, Settings,
  Tv, Crown, Edit3, Camera, Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { useParentStore } from "@/store/useParentStore";

export default function SettingsPage() {
  const router = useRouter();
  
  const { parentPlan, fetchParentData, isPlanLoading } = useParentStore();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [parentData, setParentData] = useState<any>(null); // State Data Ortu
  const [childrenData, setChildrenData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [visiblePins, setVisiblePins] = useState<{ [key: string]: boolean }>({});
  
  // State Modals
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditParentOpen, setIsEditParentOpen] = useState(false); // Modal Edit Ortu
  const [isEditChildOpen, setIsEditChildOpen] = useState(false);   // Modal Edit Anak

  // Form State - Tambah Anak
  const [newChildName, setNewChildName] = useState("");
  const [newChildPin, setNewChildPin] = useState("");
  const [newChildAge, setNewChildAge] = useState<string>(""); 

  // Form State - Setting Anak (Waktu/PIN)
  const [activeChild, setActiveChild] = useState<any>(null);
  const [settingType, setSettingType] = useState<"screenTime" | "sleepTime" | "pin" | null>(null);
  const [inputValue, setInputValue] = useState("");

  // Form State - Edit Profil Ortu
  const [editParentName, setEditParentName] = useState("");
  const [editParentPin, setEditParentPin] = useState("");

  // Form State - Edit Profil Anak
  const [editChildName, setEditChildName] = useState("");
  const [editChildAge, setEditChildAge] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
        fetchParentData();
        fetchDashboardData(user.uid);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router, fetchParentData]);

  const fetchDashboardData = async (uid: string) => {
    setIsLoading(true);
    try {
      // Tarik Data Ortu Manual
      const pSnap = await getDoc(doc(db, "parents", uid));
      if (pSnap.exists()) {
        setParentData(pSnap.data());
      }

      // Tarik Data Anak
      const profiles = await getChildrenProfiles();
      setChildrenData(profiles);
    } catch (error) {
      console.error("Gagal menarik data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePinVisibility = (id: string) => {
    setVisiblePins(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // ==========================================
  // LOGIKA EDIT PROFIL ORANG TUA
  // ==========================================
  const openEditParent = () => {
    setEditParentName(parentData?.name || "");
    setEditParentPin(parentData?.pin || "");
    setIsEditParentOpen(true);
  };

  const handleSaveParentProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editParentPin.length !== 4) return alert("PIN wajib 4 angka!");
    
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, "parents", auth.currentUser!.uid), {
        name: editParentName,
        pin: editParentPin
      });
      alert("Profil Orang Tua diperbarui!");
      setIsEditParentOpen(false);
      fetchDashboardData(auth.currentUser!.uid);
    } catch (error) {
      alert("Gagal update profil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // LOGIKA EDIT PROFIL ANAK & UPLOAD FOTO
  // ==========================================
  const openEditChild = (child: any) => {
    setActiveChild(child);
    setEditChildName(child.name);
    setEditChildAge(child.age?.toString() || "");
    setPreviewImage(child.photoUrl || null);
    setSelectedImage(null);
    setIsEditChildOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handlePhotoClick = () => {
    // 🛡️ LOGIKA PAYWALL: Kunci fitur foto untuk akun Basic
    if (parentPlan === "basic") {
      const wantsToUpgrade = window.confirm(
        "Fitur Upload Foto Wajah Anak hanya tersedia untuk akun KIDO Premium! 👑\n\nMau lihat pilihan paket Premium sekarang?"
      );
      if (wantsToUpgrade) {
        router.push("/parent/billing");
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleSaveChildProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChild) return;
    setIsSubmitting(true);
    
    try {
      let finalPhotoUrl = activeChild.photoUrl || null;

      // PROSES UPLOAD JIKA ADA FOTO BARU
      if (selectedImage) {
        // 1. Kompresi Gambar agar ringan
        const compressedFile = await compressImage(selectedImage);
        
        // 2. Upload ke Firebase Storage
        const storageRef = ref(storage, `child_profiles/${activeChild.id}_${Date.now()}.jpg`);
        await uploadBytes(storageRef, compressedFile);
        
        // 3. Dapatkan Link Gambar
        finalPhotoUrl = await getDownloadURL(storageRef);
      }

      // UPDATE FIRESTORE
      await updateDoc(doc(db, "children", activeChild.id), {
        name: editChildName,
        age: Number(editChildAge),
        photoUrl: finalPhotoUrl
      });

      alert("Profil Anak berhasil diperbarui!");
      setIsEditChildOpen(false);
      fetchDashboardData(auth.currentUser!.uid);
    } catch (error) {
      console.error("Gagal update anak:", error);
      alert("Gagal memperbarui profil anak.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // LOGIKA PENGATURAN LAIN (WAKTU & PIN)
  // ==========================================
  const openSettings = (child: any, type: "screenTime" | "sleepTime" | "pin") => {
    setActiveChild(child);
    setSettingType(type);
    if (type === "screenTime") setInputValue(child.screenTimeLimit?.toString() || "30");
    if (type === "sleepTime") setInputValue(child.sleepTime || "21:00");
    if (type === "pin") setInputValue("");
    setIsSettingsOpen(true);
  };

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
      alert("Pengaturan berhasil diperbarui!");
      setIsSettingsOpen(false);
      fetchDashboardData(auth.currentUser!.uid);
    } catch (error) {
      alert("Gagal menyimpan pengaturan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAddChild = () => {
    if (parentPlan === "basic" && childrenData.length >= 1) {
      const wantsToUpgrade = window.confirm(
        "Batas Profil Gratis Habis! 🚨\n\nAkun Basic hanya bisa memiliki 1 profil anak. Upgrade ke KIDO Premium untuk menambahkan pahlawan tanpa batas!\n\nMau lihat paket Premium sekarang?"
      );
      if (wantsToUpgrade) router.push("/parent/billing");
      return;
    }
    setIsAddChildOpen(true);
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim() || newChildPin.length !== 4 || !newChildAge) {
      alert("Nama, Umur, dan PIN 4 digit harus diisi!");
      return;
    }
    setIsSubmitting(true);
    try {
      await createChildProfile(newChildName, newChildPin, newChildAge); 
      alert(`🎉 Profil ${newChildName} berhasil dibuat!`);
      setIsAddChildOpen(false);
      setNewChildName(""); setNewChildPin(""); setNewChildAge("");
      fetchDashboardData(auth.currentUser!.uid);
    } catch (error) {
      alert("Gagal menambahkan anak.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (confirm("Yakin ingin keluar dari akun Orang Tua?")) {
      await signOut(auth);
      router.push("/login");
    }
  };

  const isPageLoading = isLoading || isPlanLoading;

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans selection:bg-indigo-200">
      
      {/* HEADER */}
      <div className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm border-b border-slate-200">
        <div className="flex items-center gap-4">
          <Link href="/parent" className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-black text-slate-800">Pengaturan Pangkalan</h1>
        </div>
      </div>

      <div className="p-6 space-y-8 max-w-2xl mx-auto">
        
        {/* SEKSI PROFIL ORANG TUA */}
        <section>
          <div className="flex justify-between items-end mb-3 ml-2">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Profil Orang Tua
            </h2>
            {parentPlan !== "basic" && (
              <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                <Crown className="w-3 h-3" /> SUPER PARENT
              </span>
            )}
          </div>
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center border border-indigo-200">
                 <ShieldCheck className="w-7 h-7 text-indigo-600" />
               </div>
               <div>
                 <h3 className="font-black text-lg text-slate-800">{parentData?.name || "Orang Tua"}</h3>
                 <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mt-1">
                   <span>PIN Rahasia:</span>
                   <span className="font-mono tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
                     {visiblePins["parent"] ? parentData?.pin : "••••"}
                   </span>
                   <button onClick={() => togglePinVisibility("parent")} className="hover:text-indigo-600">
                     {visiblePins["parent"] ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                   </button>
                 </div>
               </div>
            </div>
            <button onClick={openEditParent} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95">
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* SEKSI PASUKAN PAHLAWAN (ANAK) */}
        <section>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2">
            <Users className="w-4 h-4" /> Pasukan Pahlawan
          </h2>
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            {childrenData.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-medium">Belum ada profil anak yang terdaftar.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {childrenData.map((child) => (
                  <div key={child.id} className="p-5 space-y-4 hover:bg-slate-50/50 transition-colors">
                    
                    {/* Header Anak */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center">
                          {child.photoUrl ? (
                            <img src={child.photoUrl} alt={child.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl font-black text-slate-400 uppercase">{child.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-800 text-lg leading-none">{child.name}</h3>
                            <button onClick={() => openEditChild(child)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 font-semibold mt-1">Level {child.level || 1} • {child.age || "?"} Tahun</p>
                        </div>
                      </div>
                      
                      <button onClick={() => togglePinVisibility(child.id)} className="text-slate-400 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                        {visiblePins[child.id] ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                        <span className="font-mono font-bold text-sm tracking-widest">{visiblePins[child.id] ? child.pin : "••••"}</span>
                      </button>
                    </div>

                    {/* Tombol Pengaturan Lanjutan */}
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => openSettings(child, "screenTime")} className="flex items-center justify-center gap-1 text-[10px] font-extrabold bg-amber-50 hover:bg-amber-100 text-amber-900 py-2 rounded-xl border border-amber-200 transition-colors">
                        <Clock className="w-3 h-3" /> Waktu Main
                      </button>
                      <button onClick={() => openSettings(child, "sleepTime")} className="flex items-center justify-center gap-1 text-[10px] font-extrabold bg-indigo-50 hover:bg-indigo-100 text-indigo-900 py-2 rounded-xl border border-indigo-200 transition-colors">
                        <Moon className="w-3 h-3" /> Jam Tidur
                      </button>
                      <button onClick={() => openSettings(child, "pin")} className="flex items-center justify-center gap-1 text-[10px] font-extrabold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 py-2 rounded-xl border border-emerald-200 transition-colors">
                        <ShieldCheck className="w-3 h-3" /> Ubah PIN
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={handleOpenAddChild} className="w-full p-5 flex items-center justify-center space-x-2 text-indigo-600 font-bold bg-indigo-50 hover:bg-indigo-100 transition-colors">
              <UserPlus className="w-5 h-5" /> <span>Tambah Pahlawan Baru</span>
            </button>
          </div>
        </section>

        {/* SEKSI AKUN & TAGIHAN */}
        <section>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Sistem Akun
          </h2>
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            <div className="w-full p-5 flex items-center justify-between bg-slate-50/50 cursor-default">
              <span className="font-bold text-slate-600 text-sm">Akun Google Tertaut</span>
              <span className="text-xs font-semibold text-slate-500">{userEmail}</span>
            </div>
            <Link href="/parent/billing" className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-3 text-slate-700">
                <span className="font-bold">Paket Langganan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{parentPlan}</span>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            </Link>
          </div>
        </section>

        {/* TOMBOL KELUAR */}
        <section className="space-y-3 pt-6">
          <button 
            onClick={() => router.push("/profiles")} 
            className="w-full p-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl flex items-center justify-center space-x-2 shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Tv className="w-5 h-5" /> <span>Kembali ke Gerbang Profil</span>
          </button>

          <button 
            onClick={handleLogout} 
            className="w-full p-4 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-2xl border border-rose-200 flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <LogOut className="w-5 h-5" /> <span>Keluar dari Akun KIDO</span>
          </button>
        </section>

      </div>

      {/* ======================================================== */}
      {/* KUMPULAN MODAL (POP-UP) */}
      {/* ======================================================== */}

      {/* 1. MODAL EDIT PROFIL ORTU */}
      {isEditParentOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xl text-slate-900">Edit Profil Ortu</h3>
              <button onClick={() => setIsEditParentOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveParentProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Nama Panggilan</label>
                <input type="text" value={editParentName} onChange={(e) => setEditParentName(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-indigo-500" required />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">PIN Rahasia (4 Angka)</label>
                <input type="text" pattern="[0-9]*" maxLength={4} value={editParentPin} onChange={(e) => setEditParentPin(e.target.value.replace(/[^0-9]/g, ''))} className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-black text-xl tracking-[0.5em] text-center text-slate-900 outline-none focus:border-indigo-500" required />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-4 bg-indigo-600 text-white rounded-xl font-black flex justify-center items-center hover:bg-indigo-700 transition-colors">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Simpan Perubahan"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL EDIT PROFIL ANAK (NAMA, UMUR, FOTO) */}
      {isEditChildOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xl text-slate-900">Edit Profil Anak</h3>
              <button onClick={() => setIsEditChildOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSaveChildProfile} className="space-y-5">
              
              {/* 🛡️ AREA UPLOAD FOTO DENGAN PAYWALL VIP */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-24 h-24 rounded-full border-4 border-slate-100 bg-slate-50 overflow-hidden mb-3 group cursor-pointer" onClick={handlePhotoClick}>
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-slate-300" /></div>
                  )}
                  
                  {/* Overlay Hitam Pas Di-Hover */}
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {parentPlan === "basic" ? (
                      <>
                        <Crown className="w-6 h-6 text-amber-400 mb-1" />
                        <span className="text-[8px] text-amber-400 font-bold uppercase">VIP Only</span>
                      </>
                    ) : (
                       <Camera className="w-6 h-6 text-white" />
                    )}
                  </div>
                </div>
                
                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageChange} />
                
                <button 
                  type="button" 
                  onClick={handlePhotoClick} 
                  className={`text-xs font-bold px-4 py-2 rounded-xl border flex items-center gap-2 transition-colors ${
                    parentPlan === "basic" 
                    ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" 
                    : "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100"
                  }`}
                >
                  {parentPlan === "basic" ? <><Crown className="w-4 h-4" /> Buka Akses Foto (VIP)</> : "Ganti Foto Wajah"}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Nama</label>
                  <input type="text" value={editChildName} onChange={(e) => setEditChildName(e.target.value)} className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-indigo-500" required />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Umur</label>
                  <input type="number" value={editChildAge} onChange={(e) => setEditChildAge(e.target.value)} className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-center text-slate-900 outline-none focus:border-indigo-500" required />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-2 bg-indigo-600 text-white rounded-xl font-black flex justify-center items-center hover:bg-indigo-700 transition-colors">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Simpan Profil"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL PENGATURAN LAIN (WAKTU MAIN, JAM TIDUR, PIN ANAK) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-lg capitalize text-slate-900">
                {settingType === "screenTime" ? "Batas Waktu (Menit)" : settingType === "sleepTime" ? "Atur Jam Tidur" : "PIN Masuk Anak"}
              </h3>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X className="w-5 h-5" /></button>
            </div>
            
            <input 
              type={settingType === "pin" ? "text" : settingType === "screenTime" ? "number" : "time"}
              pattern={settingType === "pin" ? "[0-9]*" : undefined}
              maxLength={settingType === "pin" ? 4 : undefined}
              value={inputValue}
              onChange={(e) => {
                if (settingType === "pin") setInputValue(e.target.value.replace(/[^0-9]/g, ''));
                else setInputValue(e.target.value);
              }}
              placeholder={settingType === "pin" ? "••••" : ""}
              className={`w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl mb-6 font-black text-xl text-slate-900 outline-none focus:border-indigo-500 ${settingType === "pin" ? "text-center tracking-[0.5em]" : ""}`}
            />
            
            <div className="flex gap-3">
              <button onClick={() => setIsSettingsOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-xl font-bold">Batal</button>
              <button onClick={handleSaveSettings} disabled={isSubmitting || (settingType === "pin" && inputValue.length !== 4)} className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold disabled:opacity-50 flex justify-center items-center">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Terapkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL TAMBAH ANAK */}
      {isAddChildOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800">Rekrut Pahlawan Baru</h3>
                <button onClick={() => setIsAddChildOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddChild} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Nama Panggilan</label>
                  <input type="text" value={newChildName} onChange={(e) => setNewChildName(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:border-indigo-500" required />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Umur Anak</label>
                  <select value={newChildAge} onChange={(e) => setNewChildAge(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:border-indigo-500 appearance-none" required >
                    <option value="" disabled>Pilih Umur...</option>
                    <option value="4">4 Tahun (Rumah Bahagia)</option>
                    <option value="5">5 Tahun (Rumah Bahagia)</option>
                    <option value="6">6 Tahun (Rumah Bahagia)</option>
                    <option value="7">7 Tahun (Rumah Bahagia)</option>
                    <option value="8">8 Tahun (Akademi Hebat)</option>
                    <option value="9">9 Tahun (Akademi Hebat)</option>
                    <option value="10">10 Tahun (Akademi Hebat)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">PIN Masuk Anak (4 Angka)</label>
                  <input type="text" pattern="[0-9]*" maxLength={4} value={newChildPin} onChange={(e) => setNewChildPin(e.target.value.replace(/[^0-9]/g, ''))} className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-black text-center tracking-[0.5em] text-xl outline-none focus:border-indigo-500" required />
                </div>
                
                <button type="submit" disabled={isSubmitting || newChildPin.length !== 4} className="w-full p-4 bg-indigo-600 text-white rounded-xl font-black flex justify-center items-center mt-6 disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Buat Profil Anak"}
                </button>
              </form>
            </div>
        </div>
      )}

    </div>
  );
}