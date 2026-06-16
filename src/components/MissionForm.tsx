"use client";

import { useState, useEffect } from "react";
import { Target, Zap, Clock, X, Check, Sparkles, Star, Plus, Users, Loader2 } from "lucide-react";
// ✅ Import fungsi narik data anak
import { getChildrenProfiles } from "@/lib/childService";

interface MissionFormProps {
  onClose: () => void;
  onSubmit: (mission: any) => void; 
}

export default function MissionForm({ onClose, onSubmit }: MissionFormProps) {
  const [title, setTitle] = useState("");
  const [xp, setXp] = useState(10);
  const [time, setTime] = useState("Pagi");
  const [isFavorite, setIsFavorite] = useState(false);
  
  // ✅ STATE BARU: Untuk Manajemen Multi-Profile
  const [childrenList, setChildrenList] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);

  // ✅ Tarik daftar anak saat form pertama kali dibuka
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const profiles = await getChildrenProfiles();
        setChildrenList(profiles);
        // Kalau ada data anak, otomatis pilih anak urutan pertama
        if (profiles.length > 0) {
          setSelectedChildId(profiles[0].id);
        }
      } catch (error) {
        console.error("Gagal menarik data anak di Form:", error);
      } finally {
        setIsLoadingChildren(false);
      }
    };
    fetchChildren();
  }, []);

  // ✅ TEMPLATE MISI SAKTI (AUTO-FILL)
  const missionTemplates = [
    { title: "Beresin Kasur", xp: 15, time: "Pagi" },
    { title: "Mandi Sendiri", xp: 10, time: "Pagi" },
    { title: "Kerjain PR", xp: 20, time: "Siang" },
    { title: "Sikat Gigi", xp: 10, time: "Malam" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!selectedChildId) {
      alert("Pilih dulu misi ini mau ditugaskan ke siapa!");
      return;
    }
    
    onSubmit({
      id: Date.now(),
      title,
      xp,
      time,
      status: "pending",
      isFavorite,
      childId: selectedChildId // 👈 SEKARANG MISI PUNYA TUANNYA!
    });
    
    // Reset form
    setTitle("");
    setXp(10);
    setTime("Pagi");
    setIsFavorite(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
      
      {/* Card Form: Dibuat max-h biar bisa di-scroll kalau layar HP kecil */}
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 duration-300">
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Buat Misi Baru</h3>
            <p className="text-xs text-slate-500 mt-1">Tantang si kecil jadi lebih baik</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ✅ FITUR BARU: PILIH ANAK */}
        <div className="mb-6 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
          <label className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Users className="w-4 h-4" /> Tugaskan Kepada:
          </label>
          
          {isLoadingChildren ? (
            <div className="flex items-center text-sm font-bold text-blue-500 animate-pulse">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memuat daftar pahlawan...
            </div>
          ) : childrenList.length === 0 ? (
            <p className="text-sm font-bold text-rose-500">
              Belum ada profil anak. Bikin dulu di menu Pengaturan ya!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 mt-2">
              {childrenList.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => setSelectedChildId(child.id)}
                  className={`py-2 px-4 rounded-xl text-sm font-bold border-2 transition-all active:scale-95 flex items-center gap-2 ${
                    selectedChildId === child.id 
                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200" 
                    : "bg-white border-blue-100 text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    selectedChildId === child.id ? "bg-white text-blue-600" : "bg-blue-100 text-blue-600"
                  }`}>
                    {child.name.charAt(0).toUpperCase()}
                  </div>
                  {child.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 🔥 REKOMENDASI CEPAT */}
        <div className="mb-6">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" /> Pilih Cepat (Sekali Klik)
          </label>
          <div className="flex flex-wrap gap-2">
            {missionTemplates.map((template, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTitle(template.title);
                  setXp(template.xp);
                  setTime(template.time);
                }}
                className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 px-3 py-2 rounded-xl text-[13px] font-bold flex items-center transition-colors active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> {template.title}
              </button>
            ))}
          </div>
        </div>

        {/* Pembatas Visual */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px bg-slate-200 flex-1"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ATAU KETIK CUSTOM</span>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-bold text-slate-700">
              <Target className="w-4 h-4 text-blue-500" />
              <span>Apa misinya?</span>
            </label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Cth: Rapikan mainan setelah main" 
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-bold text-slate-700">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Waktu Pelaksanaan</span>
            </label>
            <div className="flex space-x-2">
              {["Pagi", "Siang", "Sore", "Malam"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTime(t)}
                  className={`flex-1 py-2 px-1 text-xs font-bold rounded-xl border transition-all ${
                    time === t 
                    ? "bg-amber-100 border-amber-300 text-amber-700" 
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-bold text-slate-700">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span>Hadiah XP</span>
            </label>
            <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <span className="text-sm font-bold text-emerald-800">Beri tambahan XP</span>
              <div className="flex items-center space-x-4">
                <button 
                  type="button"
                  onClick={() => setXp(Math.max(5, xp - 5))}
                  className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-emerald-600 font-bold shadow-sm active:scale-90"
                >
                  -
                </button>
                <span className="font-extrabold text-lg text-emerald-700 w-8 text-center">{xp}</span>
                <button 
                  type="button"
                  onClick={() => setXp(xp + 5)}
                  className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-emerald-600 font-bold shadow-sm active:scale-90"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* ✅ FITUR SIMPAN KE DAFTAR FAVORIT */}
          <div className="pt-2">
            <label className="flex items-start space-x-3 cursor-pointer group">
              <div className="relative flex items-center justify-center w-6 h-6 mt-0.5">
                <input 
                  type="checkbox" 
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 bg-slate-100 border-2 border-slate-300 rounded-md peer-checked:bg-amber-400 peer-checked:border-amber-400 transition-all"></div>
                <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={4} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700 group-hover:text-amber-600 transition-colors flex items-center gap-1.5">
                  Simpan sebagai Template <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                </span>
                <span className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  Centang agar misi ini tersimpan dan gampang dipanggil lagi besok tanpa perlu ngetik ulang.
                </span>
              </div>
            </label>
          </div>

          <button 
            type="submit"
            disabled={childrenList.length === 0}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-4 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 mt-4"
          >
            <Check className="w-5 h-5" />
            <span>Simpan Misi</span>
          </button>

        </form>
      </div>
    </div>
  );
}