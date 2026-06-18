// src/data/detectiveLevels.ts

export const DETECTIVE_LEVELS: Record<string, any> = {
  "1": {
    title: "Misi Kamar Tidur",
    description: "Pisahkan mainan dan baju kotor!",
    passingScore: 3, // Harus membereskan 3 barang
    containers: [
      { id: "kotak_mainan", name: "Kotak Mainan", icon: "📦", color: "bg-amber-100 border-amber-400 text-amber-700" },
      { id: "keranjang_baju", name: "Keranjang Baju", icon: "🧺", color: "bg-blue-100 border-blue-400 text-blue-700" }
    ],
    items: [
      { id: "item_1", name: "Mobil-mobilan", icon: "🚗", correctContainerId: "kotak_mainan" },
      { id: "item_2", name: "Kaus Kaki Bau", icon: "🧦", correctContainerId: "keranjang_baju" },
      { id: "item_3", name: "Boneka Beruang", icon: "🧸", correctContainerId: "kotak_mainan" },
    ]
  },
  "2": {
    title: "Misi Meja Belajar",
    description: "Rapikan alat tulis dan buang sampah!",
    passingScore: 4,
    containers: [
      { id: "tempat_pensil", name: "Tempat Pensil", icon: "🖍️", color: "bg-emerald-100 border-emerald-400 text-emerald-700" },
      { id: "tempat_sampah", name: "Tempat Sampah", icon: "🗑️", color: "bg-slate-200 border-slate-400 text-slate-700" }
    ],
    items: [
      { id: "item_1", name: "Kertas Lecek", icon: "📃", correctContainerId: "tempat_sampah" },
      { id: "item_2", name: "Pensil Warna", icon: "✏️", correctContainerId: "tempat_pensil" },
      { id: "item_3", name: "Bungkus Permen", icon: "🍬", correctContainerId: "tempat_sampah" },
      { id: "item_4", name: "Penggaris", icon: "📏", correctContainerId: "tempat_pensil" },
    ]
  },
  "3": {
    title: "Misi Ruang Makan",
    description: "Bantu ibu merapikan meja makan!",
    passingScore: 4,
    containers: [
      { id: "kulkas", name: "Kulkas", icon: "❄️", color: "bg-cyan-100 border-cyan-400 text-cyan-700" },
      { id: "tempat_cucian", name: "Bak Cuci", icon: "🚰", color: "bg-indigo-100 border-indigo-400 text-indigo-700" }
    ],
    items: [
      { id: "item_1", name: "Piring Kotor", icon: "🍽️", correctContainerId: "tempat_cucian" },
      { id: "item_2", name: "Susu Kotak", icon: "🥛", correctContainerId: "kulkas" },
      { id: "item_3", name: "Gelas Bekas", icon: "🥃", correctContainerId: "tempat_cucian" },
      { id: "item_4", name: "Buah Apel", icon: "🍎", correctContainerId: "kulkas" },
    ]
  },
  "4": {
    title: "Misi Kamar Mandi",
    description: "Kembalikan barang ke tempatnya!",
    passingScore: 4,
    containers: [
      { id: "rak_mandi", name: "Rak Mandi", icon: "🧴", color: "bg-teal-100 border-teal-400 text-teal-700" },
      { id: "gantungan", name: "Gantungan", icon: "🪝", color: "bg-rose-100 border-rose-400 text-rose-700" }
    ],
    items: [
      { id: "item_1", name: "Handuk Basah", icon: "🧖‍♀️", correctContainerId: "gantungan" },
      { id: "item_2", name: "Sabun Wangi", icon: "🧼", correctContainerId: "rak_mandi" },
      { id: "item_3", name: "Sikat Gigi", icon: "🪥", correctContainerId: "rak_mandi" },
      { id: "item_4", name: "Baju Ganti", icon: "👕", correctContainerId: "gantungan" },
    ]
  },
  "5": {
    title: "Ujian Detektif (BOSS)",
    description: "Ujian ketangkasan membereskan barang!",
    passingScore: 5,
    containers: [
      { id: "lemari_buku", name: "Rak Buku", icon: "📚", color: "bg-orange-100 border-orange-400 text-orange-700" },
      { id: "kotak_mainan", name: "Kotak Mainan", icon: "📦", color: "bg-amber-100 border-amber-400 text-amber-700" }
    ],
    items: [
      { id: "item_1", name: "Buku Cerita", icon: "📖", correctContainerId: "lemari_buku" },
      { id: "item_2", name: "Robot-robotan", icon: "🤖", correctContainerId: "kotak_mainan" },
      { id: "item_3", name: "Buku Mewarnai", icon: "📗", correctContainerId: "lemari_buku" },
      { id: "item_4", name: "Bola Sepak", icon: "⚽", correctContainerId: "kotak_mainan" },
      { id: "item_5", name: "Yoyo", icon: "🪀", correctContainerId: "kotak_mainan" },
    ]
  }
};