import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Mendefinisikan tipe data untuk State Game KIDO
interface GameState {
  xp: number;
  level: number;
  coins: number;
  streak: number;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  incrementStreak: () => void;
  resetProgress: () => void;
}

// Membuat Global Store menggunakan Zustand
export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      // Nilai awal saat anak pertama kali main
      xp: 0,
      level: 1,
      coins: 0,
      streak: 0,

      // Fungsi untuk menambah XP dan mengecek kenaikan level otomatis
      addXP: (amount: number) => set((state) => {
        const newXP = state.xp + amount;
        
        // Logika Level Engine: requiredXP = level * level * 100
        // Contoh: Mau ke level 2 butuh 100 XP. Mau ke level 3 butuh 400 XP.
        let newLevel = state.level;
        const xpForNextLevel = state.level * state.level * 100;
        
        if (newXP >= xpForNextLevel) {
          newLevel = state.level + 1;
        }
        
        return { xp: newXP, level: newLevel };
      }),

      // Fungsi untuk menambah koin (bisa dipakai untuk beli item avatar nanti)
      addCoins: (amount: number) => set((state) => ({ 
        coins: state.coins + amount 
      })),

      // Fungsi untuk menambah streak harian
      incrementStreak: () => set((state) => ({ 
        streak: state.streak + 1 
      })),

      // Fungsi darurat/testing untuk mereset semua data kembali ke nol
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