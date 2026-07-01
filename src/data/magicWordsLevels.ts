// src/data/magicWordsLevels.ts

export const MAGIC_WORDS_LEVELS: Record<string, any> = {
  // ==========================================
  // TIER 1: Usia 4 - 6 Tahun (Dasar Kata Ajaib)
  // ==========================================
  "tier1": {
    title: "Dasar Kata Ajaib",
    passingScore: 2,
    questions: [
      {
        id: 1,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Smiling%20face%20with%20hearts/3D/smiling_face_with_hearts_3d.png",
        situation: "Temanmu memberikan permen yang manis. Apa yang harus kamu ucapkan?",
        options: [
          { id: "maaf", text: "Maaf", icon: "🙏", isCorrect: false },
          { id: "tolong", text: "Tolong", icon: "🙋‍♂️", isCorrect: false },
          { id: "terimakasih", text: "Terima Kasih", icon: "🥰", isCorrect: true },
        ]
      },
      {
        id: 2,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Face%20holding%20back%20tears/3D/face_holding_back_tears_3d.png",
        situation: "Kamu tidak sengaja menginjak kaki temanmu. Kamu bilang?",
        options: [
          { id: "maaf", text: "Maaf", icon: "🙏", isCorrect: true },
          { id: "tolong", text: "Tolong", icon: "🙋‍♂️", isCorrect: false },
          { id: "terimakasih", text: "Terima Kasih", icon: "🥰", isCorrect: false },
        ]
      },
      {
        id: 3,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pleading%20face/3D/pleading_face_3d.png",
        situation: "Kamu ingin mengambil mainan, tapi lemarinya terlalu tinggi.",
        options: [
          { id: "maaf", text: "Maaf", icon: "🙏", isCorrect: false },
          { id: "tolong", text: "Tolong", icon: "🙋‍♂️", isCorrect: true },
          { id: "terimakasih", text: "Terima Kasih", icon: "🥰", isCorrect: false },
        ]
      }
    ]
  },

  // ==========================================
  // TIER 2: Usia 7 - 9 Tahun (Sopan Santun di Sekolah & Rumah)
  // ==========================================
  "tier2": {
    title: "Anak Sopan",
    passingScore: 2,
    questions: [
      {
        id: 1,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Star-struck/3D/star-struck_3d.png",
        situation: "Wah, mobil-mobilan temanmu bagus sekali. Saat ingin meminjamnya, kamu bilang?",
        options: [
          { id: "A", text: "Eh, pinjem dong bentar!", icon: "😠", isCorrect: false },
          { id: "B", text: "Tolong bolehkah aku pinjam?", icon: "🙋‍♂️", isCorrect: true },
          { id: "C", text: "Maaf, ini punyaku sekarang.", icon: "😈", isCorrect: false },
        ]
      },
      {
        id: 2,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pensive%20face/3D/pensive_face_3d.png",
        situation: "Kamu menyenggol istana pasir buatan temanmu sampai roboh.",
        options: [
          { id: "A", text: "Maaf ya, mari kubantu bangun lagi.", icon: "🙏", isCorrect: true },
          { id: "B", text: "Terima kasih sudah buat istana ini.", icon: "😅", isCorrect: false },
          { id: "C", text: "Bukan salahku, kamu yang taruh situ.", icon: "🙄", isCorrect: false },
        ]
      },
      {
        id: 3,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Fearful%20face/3D/fearful_face_3d.png",
        situation: "Kamu tersesat di swalayan. Saat melihat ibu kasir, kata pertama yang diucapkan adalah?",
        options: [
          { id: "A", text: "Hei, ibuku di mana?", icon: "🗣️", isCorrect: false },
          { id: "B", text: "Permisi, tolong bantu aku.", icon: "🙋‍♂️", isCorrect: true },
          { id: "C", text: "Maaf aku merepotkan.", icon: "😢", isCorrect: false },
        ]
      }
    ]
  },

  // ==========================================
  // TIER 3: Usia 10+ Tahun (Asertivitas & Tanggung Jawab)
  // ==========================================
  "tier3": {
    title: "Ujian Kedewasaan",
    passingScore: 3, // Harus benar semua
    questions: [
      {
        id: 1,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Flushed%20face/3D/flushed_face_3d.png",
        situation: "Temanmu memaksa meminjam PR-mu untuk dicontek. Bagaimana cara menolaknya dengan sopan?",
        options: [
          { id: "A", text: "Maaf, aku gak bisa kasih contek, tapi kita bisa belajar bareng.", icon: "🛡️", isCorrect: true },
          { id: "B", text: "Gak mau! Kamu pemalas sekali.", icon: "😠", isCorrect: false },
          { id: "C", text: "Ini tolong disalin cepat ya.", icon: "🤫", isCorrect: false },
        ]
      },
      {
        id: 2,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Grimacing%20face/3D/grimacing_face_3d.png",
        situation: "Kamu tidak sengaja memecahkan piring, dan Ibu terlihat sangat marah.",
        options: [
          { id: "A", text: "Lari ke kamar dan sembunyi.", icon: "🏃", isCorrect: false },
          { id: "B", text: "Maafkan aku Bu, biar aku bantu bersihkan pecahannya.", icon: "🧹", isCorrect: true },
          { id: "C", text: "Kucing yang menyenggolnya tadi!", icon: "🐈", isCorrect: false },
        ]
      },
      {
        id: 3,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Partying%20face/3D/partying_face_3d.png",
        situation: "Paman memberimu hadiah buku yang sebenarnya sudah kamu punya.",
        options: [
          { id: "A", text: "Yah, aku sudah punya yang ini.", icon: "😒", isCorrect: false },
          { id: "B", text: "Terima kasih Paman! Buku ini bagus sekali.", icon: "🥰", isCorrect: true },
          { id: "C", text: "Tolong belikan mainan saja.", icon: "🤖", isCorrect: false },
        ]
      }
    ]
  }
};