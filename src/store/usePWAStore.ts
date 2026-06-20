import { create } from 'zustand';

interface PWAState {
  deferredPrompt: any | null; // Tempat nyimpen sinyal rahasia dari Chrome
  isInstallable: boolean;     // Status apakah aplikasi ini bisa di-download saat ini
  setDeferredPrompt: (prompt: any) => void;
  clearPrompt: () => void;
}

// Membuat Memori Global untuk PWA
export const usePWAStore = create<PWAState>((set) => ({
  deferredPrompt: null,
  isInstallable: false,
  
  // Fungsi untuk menyimpan sinyal saat Chrome mau nampilin notif
  setDeferredPrompt: (prompt) => set({ deferredPrompt: prompt, isInstallable: true }),
  
  // Fungsi untuk menghapus sinyal kalau aplikasi udah sukses di-download
  clearPrompt: () => set({ deferredPrompt: null, isInstallable: false }),
}));