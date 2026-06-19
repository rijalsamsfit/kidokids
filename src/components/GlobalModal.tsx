"use client";

import { useModalStore } from "@/store/useModalStore";
import { AlertTriangle, BellRing } from "lucide-react";

export default function GlobalModal() {
  const { 
    isOpen, type, title, message, confirmText, cancelText, onConfirm, closeModal 
  } = useModalStore();

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden border border-slate-100">
        
        {/* Dekorasi Visual Atas */}
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-[1.5rem] shadow-inner border border-slate-100 bg-slate-50">
          {type === 'alert' ? (
            <BellRing className="w-8 h-8 text-indigo-500" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          )}
        </div>

        {/* Area Teks */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight">{title}</h3>
          <p className="text-slate-500 font-medium text-sm leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>

        {/* Area Tombol Berdasarkan Tipe Modal */}
        <div className="flex gap-3">
          {type === 'confirm' && (
            <button
              onClick={closeModal}
              className="flex-1 py-3.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-bold transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={type === 'alert' ? closeModal : handleConfirm}
            className={`flex-1 py-3.5 text-white rounded-xl font-black transition-transform active:scale-95 shadow-lg ${
              type === 'alert' 
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30' 
                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
            }`}
          >
            {type === 'alert' ? 'Mengerti' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}