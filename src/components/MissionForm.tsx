"use client";

import { useState } from "react";
import { Target, Zap, Clock, X, Check } from "lucide-react";

interface MissionFormProps {
  onClose: () => void;
  // Sementara kita pakai 'any' untuk data submission sebelum integrasi penuh ke Zustand/Firebase
  onSubmit: (mission: any) => void; 
}

export default function MissionForm({ onClose, onSubmit }: MissionFormProps) {
  const [title, setTitle] = useState("");
  const [xp, setXp] = useState(10);
  const [time, setTime] = useState("Pagi");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSubmit({
      id: Date.now(),
      title,
      xp,
      time,
      status: "pending"
    });
    
    // Reset form setelah disubmit
    setTitle("");
    setXp(10);
    setTime("Pagi");
  };

  return (
    // Overlay background gelap, z-[60] supaya di atas bottom navigation
    // items-end untuk mobile (muncul dari bawah), sm:items-center untuk tablet (muncul di tengah)
    <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
      
      {/* Card Form */}
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 duration-300">
        
        {/* Header Form */}
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

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Input Judul Misi - DIPERBAIKI KONTRASNYA */}
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
              // Tambahan text-slate-900, font-bold, border-2, dan placeholder styling
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Input Waktu */}
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

          {/* Input XP Reward */}
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

          {/* Tombol Simpan */}
          <button 
            type="submit"
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 mt-4"
          >
            <Check className="w-5 h-5" />
            <span>Simpan Misi</span>
          </button>

        </form>
      </div>
    </div>
  );
}