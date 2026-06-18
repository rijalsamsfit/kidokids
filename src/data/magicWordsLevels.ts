// src/data/magicWordsLevels.ts

export const MAGIC_WORDS_LEVELS: Record<string, any> = {
  "1": {
    title: "Dasar Kata Ajaib",
    passingScore: 2,
    questions: [
      {
        id: 1,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Smiling%20face%20with%20hearts/3D/smiling_face_with_hearts_3d.png",
        situation: "Temanmu memberikan permen yang sangat manis kepadamu. Apa yang harus kamu ucapkan?",
        options: [
          { id: "maaf", text: "Maaf", icon: "🙏", isCorrect: false },
          { id: "tolong", text: "Tolong", icon: "🙋‍♂️", isCorrect: false },
          { id: "terimakasih", text: "Terima Kasih", icon: "🥰", isCorrect: true },
        ]
      },
      {
        id: 2,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Face%20holding%20back%20tears/3D/face_holding_back_tears_3d.png",
        situation: "Kamu berlari dan tidak sengaja menginjak kaki temanmu. Apa yang harus kamu ucapkan?",
        options: [
          { id: "maaf", text: "Maaf", icon: "🙏", isCorrect: true },
          { id: "tolong", text: "Tolong", icon: "🙋‍♂️", isCorrect: false },
          { id: "terimakasih", text: "Terima Kasih", icon: "🥰", isCorrect: false },
        ]
      },
      {
        id: 3,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pleading%20face/3D/pleading_face_3d.png",
        situation: "Kamu ingin mengambil mainan, tapi tempatnya terlalu tinggi. Apa yang harus kamu ucapkan kepada Ayah?",
        options: [
          { id: "maaf", text: "Maaf", icon: "🙏", isCorrect: false },
          { id: "tolong", text: "Tolong", icon: "🙋‍♂️", isCorrect: true },
          { id: "terimakasih", text: "Terima Kasih", icon: "🥰", isCorrect: false },
        ]
      }
    ]
  },
  "2": {
    title: "Sopan di Rumah",
    passingScore: 2,
    questions: [
      {
        id: 1,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Drooling%20face/3D/drooling_face_3d.png",
        situation: "Ibu memasakkan ayam goreng kesukaanmu untuk makan malam. Kata apa yang tepat?",
        options: [
          { id: "maaf", text: "Maaf", icon: "🙏", isCorrect: false },
          { id: "tolong", text: "Tolong", icon: "🙋‍♂️", isCorrect: false },
          { id: "terimakasih", text: "Terima Kasih", icon: "🥰", isCorrect: true },
        ]
      },
      {
        id: 2,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Grimacing%20face/3D/grimacing_face_3d.png",
        situation: "Yah, kamu tidak sengaja menumpahkan segelas air di lantai. Apa yang harus diucapkan ke Ibu?",
        options: [
          { id: "maaf", text: "Maaf", icon: "🙏", isCorrect: true },
          { id: "tolong", text: "Tolong", icon: "🙋‍♂️", isCorrect: false },
          { id: "terimakasih", text: "Terima Kasih", icon: "🥰", isCorrect: false },
        ]
      },
      {
        id: 3,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Confounded%20face/3D/confounded_face_3d.png",
        situation: "Tali sepatumu lepas dan kamu kesulitan mengikatnya sendiri. Kepada Kakak, kamu bilang?",
        options: [
          { id: "maaf", text: "Maaf", icon: "🙏", isCorrect: false },
          { id: "tolong", text: "Tolong", icon: "🙋‍♂️", isCorrect: true },
          { id: "terimakasih", text: "Terima Kasih", icon: "🥰", isCorrect: false },
        ]
      }
    ]
  },
  "3": {
    title: "Bermain Sama Teman",
    passingScore: 2,
    questions: [
      {
        id: 1,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Star-struck/3D/star-struck_3d.png",
        situation: "Wah, mainan mobil-mobilan temanmu bagus sekali. Saat ingin meminjamnya, kamu bilang?",
        options: [
          { id: "maaf", text: "Maaf", icon: "🙏", isCorrect: false },
          { id: "tolong", text: "Tolong", icon: "🙋‍♂️", isCorrect: true },
          { id: "terimakasih", text: "Terima Kasih", icon: "🥰", isCorrect: false },
        ]
      },
      {
        id: 2,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pensive%20face/3D/pensive_face_3d.png",
        situation: "Kamu menyenggol istana pasir buatan temanmu sampai roboh. Apa yang harus diucapkan?",
        options: [
          { id: "maaf", text: "Maaf", icon: "🙏", isCorrect: true },
          { id: "tolong", text: "Tolong", icon: "🙋‍♂️", isCorrect: false },
          { id: "terimakasih", text: "Terima Kasih", icon: "🥰", isCorrect: false },
        ]
      },
      {
        id: 3,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Smiling%20face%20with%20halo/3D/smiling_face_with_halo_3d.png",
        situation: "Temanmu mengembalikan pensil warna yang tadi dia pinjam. Apa jawabanmu?",
        options: [
          { id: "maaf", text: "Maaf", icon: "🙏", isCorrect: false },
          { id: "tolong", text: "Tolong", icon: "🙋‍♂️", isCorrect: false },
          { id: "terimakasih", text: "Terima Kasih", icon: "🥰", isCorrect: true },
        ]
      }
    ]
  },
  "4": {
    title: "Berani & Jujur",
    passingScore: 2,
    questions: [
      {
        id: 1,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Fearful%20face/3D/fearful_face_3d.png",
        situation: "Kamu tersesat di swalayan. Saat melihat ibu kasir, kata pertama yang diucapkan adalah?",
        options: [
          { id: "maaf", text: "Maaf", icon: "🙏", isCorrect: false },
          { id: "tolong", text: "Tolong", icon: "🙋‍♂️", isCorrect: true },
          { id: "terimakasih", text: "Terima Kasih", icon: "🥰", isCorrect: false },
        ]
      },
      {
        id: 2,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Hugging%20face/3D/hugging_face_3d.png",
        situation: "Bapak Satpam berhasil membantumu menemukan Ibumu kembali. Kamu harus bilang apa?",
        options: [
          { id: "maaf", text: "Maaf", icon: "🙏", isCorrect: false },
          { id: "tolong", text: "Tolong", icon: "🙋‍♂️", isCorrect: false },
          { id: "terimakasih", text: "Terima Kasih", icon: "🥰", isCorrect: true },
        ]
      },
      {
        id: 3,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Flushed%20face/3D/flushed_face_3d.png",
        situation: "Kamu berlarian di lorong toko dan menabrak keranjang belanjaan orang. Apa kata yang tepat?",
        options: [
          { id: "maaf", text: "Maaf", icon: "🙏", isCorrect: true },
          { id: "tolong", text: "Tolong", icon: "🙋‍♂️", isCorrect: false },
          { id: "terimakasih", text: "Terima Kasih", icon: "🥰", isCorrect: false },
        ]
      }
    ]
  },
  "5": {
    title: "Ujian Kesopanan (BOSS)",
    passingScore: 3, // Boss stage harus benar semua
    questions: [
      {
        id: 1,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Loudly%20crying%20face/3D/loudly_crying_face_3d.png",
        situation: "Kamu merebut buku cerita yang sedang dibaca adikmu sampai dia menangis. Kamu harus bilang?",
        options: [
          { id: "maaf", text: "Maaf", icon: "🙏", isCorrect: true },
          { id: "tolong", text: "Tolong", icon: "🙋‍♂️", isCorrect: false },
          { id: "terimakasih", text: "Terima Kasih", icon: "🥰", isCorrect: false },
        ]
      },
      {
        id: 2,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Yawning%20face/3D/yawning_face_3d.png",
        situation: "Kamu sudah mengantuk tapi ingin dibuatkan susu hangat sebelum tidur. Kepada Ayah, kamu bilang?",
        options: [
          { id: "maaf", text: "Maaf", icon: "🙏", isCorrect: false },
          { id: "tolong", text: "Tolong", icon: "🙋‍♂️", isCorrect: true },
          { id: "terimakasih", text: "Terima Kasih", icon: "🥰", isCorrect: false },
        ]
      },
      {
        id: 3,
        image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Partying%20face/3D/partying_face_3d.png",
        situation: "Ayah dan Ibu membelikanmu hadiah ulang tahun yang sangat kamu impikan. Ucapkan dengan keras!",
        options: [
          { id: "maaf", text: "Maaf", icon: "🙏", isCorrect: false },
          { id: "tolong", text: "Tolong", icon: "🙋‍♂️", isCorrect: false },
          { id: "terimakasih", text: "Terima Kasih", icon: "🥰", isCorrect: true },
        ]
      }
    ]
  }
};