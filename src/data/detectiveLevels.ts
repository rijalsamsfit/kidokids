// src/data/detectiveLevels.ts

export const DETECTIVE_LEVELS: Record<string, any> = {
  // ==========================================
  // TIER 1: Usia 4 - 6 Tahun (Fokus Kamar Tidur & Mainan)
  // ==========================================
  "tier1": {
    title: "Misi Kamar Tidur",
    description: "Ayo pisahkan mainan dan baju kotor ke tempatnya!",
    passingScore: 5, // Harus membereskan 5 barang
    containers: [
      { id: "kotak_mainan", name: "Kotak Mainan", icon: "📦", color: "bg-amber-100 border-amber-400 text-amber-700" },
      { id: "keranjang_baju", name: "Keranjang Baju", icon: "🧺", color: "bg-blue-100 border-blue-400 text-blue-700" }
    ],
    items: [
      { id: "item_1", name: "Mobil-mobilan", icon: "🚗", correctContainerId: "kotak_mainan" },
      { id: "item_2", name: "Kaus Kaki Bau", icon: "🧦", correctContainerId: "keranjang_baju" },
      { id: "item_3", name: "Boneka Beruang", icon: "🧸", correctContainerId: "kotak_mainan" },
      { id: "item_4", name: "Robot-robotan", icon: "🤖", correctContainerId: "kotak_mainan" },
      { id: "item_5", name: "Baju Ganti", icon: "👕", correctContainerId: "keranjang_baju" },
    ]
  },

  // ==========================================
  // TIER 2: Usia 7 - 9 Tahun (Fokus Meja Belajar & Kebersihan)
  // ==========================================
  "tier2": {
    title: "Misi Meja Belajar",
    description: "Rapikan alat tulis, kembalikan alat mandi, dan buang sampah!",
    passingScore: 6,
    containers: [
      { id: "tempat_pensil", name: "Tempat Pensil", icon: "🖍️", color: "bg-emerald-100 border-emerald-400 text-emerald-700" },
      { id: "tempat_sampah", name: "Tempat Sampah", icon: "🗑️", color: "bg-slate-200 border-slate-400 text-slate-700" },
      { id: "rak_mandi", name: "Rak Mandi", icon: "🧴", color: "bg-teal-100 border-teal-400 text-teal-700" }
    ],
    items: [
      { id: "item_1", name: "Kertas Lecek", icon: "📃", correctContainerId: "tempat_sampah" },
      { id: "item_2", name: "Pensil Warna", icon: "✏️", correctContainerId: "tempat_pensil" },
      { id: "item_3", name: "Bungkus Permen", icon: "🍬", correctContainerId: "tempat_sampah" },
      { id: "item_4", name: "Penggaris", icon: "📏", correctContainerId: "tempat_pensil" },
      { id: "item_5", name: "Sabun Wangi", icon: "🧼", correctContainerId: "rak_mandi" },
      { id: "item_6", name: "Sikat Gigi", icon: "🪥", correctContainerId: "rak_mandi" },
    ]
  },

  // ==========================================
  // TIER 3: Usia 10+ Tahun (Fokus Ruang Makan & Ruang Baca)
  // ==========================================
  "tier3": {
    title: "Misi Rumah Super",
    description: "Bantu Ibu mengatur barang di Kulkas, Bak Cuci, dan Rak Buku!",
    passingScore: 6,
    containers: [
      { id: "kulkas", name: "Kulkas", icon: "❄️", color: "bg-cyan-100 border-cyan-400 text-cyan-700" },
      { id: "tempat_cucian", name: "Bak Cuci", icon: "🚰", color: "bg-indigo-100 border-indigo-400 text-indigo-700" },
      { id: "lemari_buku", name: "Rak Buku", icon: "📚", color: "bg-orange-100 border-orange-400 text-orange-700" }
    ],
    items: [
      { id: "item_1", name: "Piring Kotor", icon: "🍽️", correctContainerId: "tempat_cucian" },
      { id: "item_2", name: "Susu Kotak", icon: "🥛", correctContainerId: "kulkas" },
      { id: "item_3", name: "Gelas Bekas", icon: "🥃", correctContainerId: "tempat_cucian" },
      { id: "item_4", name: "Buah Apel", icon: "🍎", correctContainerId: "kulkas" },
      { id: "item_5", name: "Buku Cerita", icon: "📖", correctContainerId: "lemari_buku" },
      { id: "item_6", name: "Buku Mewarnai", icon: "📗", correctContainerId: "lemari_buku" },
    ]
  }
};