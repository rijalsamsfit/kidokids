import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Mendefinisikan tipe data untuk State Game KIDO
interface GameState {
  activeChildId: string | null;
  activeChildName: string | null;
  xp: number;
  level: number;
  coins: number;
  streak: number;
  
  // Fungsi-fungsi (Actions)
  setActiveChild: (id: string, name: string, xp: number, level: number, coins: number) => void;
  clearActiveChild: () => void;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  incrementStreak: () => void;
  resetProgress: () => void;
}

// Membuat Global Store menggunakan Zustand
export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      // Nilai awal
      activeChildId: null,
      activeChildName: null,
      xp: 0,
      level: 1,
      coins: 0,
      streak: 0,

      // Saat anak sukses login pakai PIN, simpan identitasnya
      setActiveChild: (id, name, xp, level, coins) => set({
        activeChildId: id,
        activeChildName: name,
        xp: xp || 0,
        level: level || 1,
        coins: coins || 0
      }),

      // Saat anak logout / kembali ke layar pilih profil
      clearActiveChild: () => set({
        activeChildId: null,
        activeChildName: null,
        xp: 0,
        level: 1,
        coins: 0,
        streak: 0
      }),

      // Fungsi untuk menambah XP dan mengecek kenaikan level otomatis
      addXP: (amount: number) => set((state) => {
        const newXP = state.xp + amount;
        
        // Logika Level Engine: requiredXP = level * level * 100
        let newLevel = state.level;
        const xpForNextLevel = state.level * state.level * 100;
        
        if (newXP >= xpForNextLevel) {
          newLevel = state.level + 1;
        }
        
        return { xp: newXP, level: newLevel };
      }),

      // Fungsi untuk menambah koin
      addCoins: (amount: number) => set((state) => ({ 
        coins: state.coins + amount 
      })),

      // Fungsi untuk menambah streak harian
      incrementStreak: () => set((state) => ({ 
        streak: state.streak + 1 
      })),

      // Fungsi darurat/testing untuk mereset semua data
      resetProgress: () => set({ 
        xp: 0, 
        level: 1, 
        coins: 0, 
        streak: 0 
      }),
    }),
    {
      // Nama key yang akan tersimpan di Local Storage HP/Browser
      name: 'kido-game-storage',
    }
  )
);