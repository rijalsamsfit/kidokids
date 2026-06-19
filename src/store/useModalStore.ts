import { create } from 'zustand';

type ModalType = 'alert' | 'confirm';

interface ModalState {
  isOpen: boolean;
  type: ModalType;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: (() => void) | null;
  
  // Fungsi untuk memanggil pop-up biasa (Hanya tombol OK)
  showAlert: (title: string, message: string) => void;
  
  // Fungsi untuk memanggil pop-up pilihan (Tombol Batal & Lanjut)
  showConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string, cancelText?: string) => void;
  
  // Fungsi untuk menutup pop-up
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  type: 'alert',
  title: '',
  message: '',
  confirmText: 'Oke',
  cancelText: 'Batal',
  onConfirm: null,

  showAlert: (title, message) => set({
    isOpen: true,
    type: 'alert',
    title,
    message,
    onConfirm: null,
  }),

  showConfirm: (title, message, onConfirm, confirmText = 'Oke', cancelText = 'Batal') => set({
    isOpen: true,
    type: 'confirm',
    title,
    message,
    onConfirm,
    confirmText,
    cancelText,
  }),

  closeModal: () => set({ isOpen: false }),
}));