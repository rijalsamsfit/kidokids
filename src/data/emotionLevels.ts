// src/data/emotionLevels.ts

export const EMOTION_DB: Record<string, any> = {
  // ==========================================
  // TIER 1: Usia 4 - 6 Tahun (Fokus Emosi Dasar)
  // ==========================================
  "tier1": {
    title: "Kenali Wajah",
    passingScore: 2,
    questions: [
      {
        id: 1,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Loudly%20crying%20face/3D/loudly_crying_face_3d.png",
        situation: "Es krim temanmu jatuh ke tanah. Bagaimana perasaannya?",
        options: [
          { id: "A", text: "Sedih", icon: "😭", isCorrect: true },
          { id: "B", text: "Senang", icon: "😆", isCorrect: false },
          { id: "C", text: "Takut", icon: "😨", isCorrect: false },
        ]
      },
      {
        id: 2,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pleading%20face/3D/pleading_face_3d.png",
        situation: "Adik tidak bisa mengambil mainan di atas lemari.",
        options: [
          { id: "A", text: "Marah", icon: "😡", isCorrect: false },
          { id: "B", text: "Minta Tolong", icon: "🥺", isCorrect: true },
          { id: "C", text: "Tertawa", icon: "😂", isCorrect: false },
        ]
      },
      {
        id: 3,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Tired%20face/3D/tired_face_3d.png",
        situation: "Ibu baru saja selesai membersihkan seluruh rumah.",
        options: [
          { id: "A", text: "Bersemangat", icon: "🤩", isCorrect: false },
          { id: "B", text: "Lelah", icon: "😫", isCorrect: true },
          { id: "C", text: "Kaget", icon: "😲", isCorrect: false },
        ]
      }
    ]
  },

  // ==========================================
  // TIER 2: Usia 7 - 9 Tahun (Fokus Sebab & Akibat / Sensasi Fisik)
  // ==========================================
  "tier2": {
    title: "Sebab & Akibat",
    passingScore: 2,
    questions: [
      {
        id: 1,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Partying%20face/3D/partying_face_3d.png",
        situation: "Temanmu mendapat kado kejutan ulang tahun!",
        options: [
          { id: "A", text: "Senang", icon: "🥳", isCorrect: true },
          { id: "B", text: "Sedih", icon: "😢", isCorrect: false },
          { id: "C", text: "Mengantuk", icon: "😴", isCorrect: false },
        ]
      },
      {
        id: 2,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pouting%20face/3D/pouting_face_3d.png",
        situation: "Mainan kakak direbut secara paksa oleh anak lain.",
        options: [
          { id: "A", text: "Marah", icon: "😡", isCorrect: true },
          { id: "B", text: "Senang", icon: "😊", isCorrect: false },
          { id: "C", text: "Lapar", icon: "🤤", isCorrect: false },
        ]
      },
      {
        id: 3,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Cold%20face/3D/cold_face_3d.png",
        situation: "Kakak pulang sekolah saat hujan deras tanpa payung.",
        options: [
          { id: "A", text: "Kepanasan", icon: "🥵", isCorrect: false },
          { id: "B", text: "Kedinginan", icon: "🥶", isCorrect: true },
          { id: "C", text: "Gembira", icon: "😆", isCorrect: false },
        ]
      }
    ]
  },

  // ==========================================
  // TIER 3: Usia 10+ Tahun (Fokus Ujian Pahlawan & Situasi Kompleks)
  // ==========================================
  "tier3": {
    title: "Ujian Pahlawan",
    passingScore: 3, // Harus benar semua (3/3)
    questions: [
      {
        id: 1,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Hugging%20face/3D/hugging_face_3d.png",
        situation: "Melihat adik menangis karena jatuh, apa tindakan Pahlawanmu?",
        options: [
          { id: "A", text: "Menertawakan", icon: "😂", isCorrect: false },
          { id: "B", text: "Memeluk/Membantu", icon: "🫂", isCorrect: true },
          { id: "C", text: "Meninggalkan", icon: "🏃", isCorrect: false },
        ]
      },
      {
        id: 2,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Smiling%20face%20with%20halo/3D/smiling_face_with_halo_3d.png",
        situation: "Kamu tidak sengaja menumpahkan air ke buku temanmu.",
        options: [
          { id: "A", text: "Minta Maaf", icon: "🙏", isCorrect: true },
          { id: "B", text: "Pura-pura diam", icon: "🤫", isCorrect: false },
          { id: "C", text: "Marah", icon: "😡", isCorrect: false },
        ]
      },
      {
        id: 3,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Star-struck/3D/star-struck_3d.png",
        situation: "Ibu memasakkan makanan kesukaanmu untuk makan malam.",
        options: [
          { id: "A", text: "Biasa saja", icon: "😐", isCorrect: false },
          { id: "B", text: "Menangis", icon: "😭", isCorrect: false },
          { id: "C", text: "Bilang Terima Kasih", icon: "🤩", isCorrect: true },
        ]
      }
    ]
  }
};