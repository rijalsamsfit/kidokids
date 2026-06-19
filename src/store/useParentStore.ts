// src/store/useParentStore.ts
import { create } from 'zustand';
import { checkAndCreateParentProfile } from '@/lib/parentService';

type PlanType = "basic" | "pro" | "annual" | "lifetime";

interface ParentState {
  parentPlan: PlanType;
  isPlanLoading: boolean;
  isPlanFetched: boolean; // Penanda biar gak narik data 2x
  fetchParentData: () => Promise<void>;
  setParentPlan: (plan: PlanType) => void;
}

export const useParentStore = create<ParentState>((set, get) => ({
  parentPlan: "basic", // Default selalu basic
  isPlanLoading: false,
  isPlanFetched: false,
  
  // Fungsi pinter untuk narik data (hanya jalan kalau belum pernah ditarik)
  fetchParentData: async () => {
    if (get().isPlanFetched) return; // Kalau udah ada di ransel, stop! Gak usah ke Firebase lagi.
    
    set({ isPlanLoading: true });
    try {
      const parentProfile = await checkAndCreateParentProfile();
      if (parentProfile && parentProfile.subscriptionPlan) {
        set({ 
          parentPlan: parentProfile.subscriptionPlan as PlanType, 
          isPlanFetched: true 
        });
      }
    } catch (error) {
      console.error("Gagal narik data langganan Ortu:", error);
    } finally {
      set({ isPlanLoading: false });
    }
  },
  
  // Fungsi buat nembak status instan (berguna pas Ortu baru selesai bayar di halaman Kasir)
  setParentPlan: (plan) => set({ parentPlan: plan }),
}));