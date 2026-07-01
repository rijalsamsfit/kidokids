const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

// 1. Panggil Kunci Master rahasia yang udah lu amankan tadi
const serviceAccount = require("../firebase-admin-key.json");

// 2. Inisialisasi Firebase Admin (Menggunakan Gaya Modular Baru)
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// 3. Baca file JSON data soal
const dataPath = path.join(__dirname, "questsData.json");
const rawData = fs.readFileSync(dataPath);
const games = JSON.parse(rawData);

async function seedDatabase() {
  console.log("🚀 Memulai injeksi data ke Firestore...");
  
  try {
    for (const game of games) {
      const { gameId, tiers, ...gameMeta } = game;
      
      // Bikin Laci Utama (game_banks)
      const gameRef = db.collection("game_banks").doc(gameId);
      await gameRef.set(gameMeta);
      console.log(`✅ Laci Game Utama Dibuat: ${gameId}`);

      // Bikin Laci Sub-koleksi (tiers) untuk pembagian kelompok umur
      for (const [tierId, tierData] of Object.entries(tiers)) {
        await gameRef.collection("tiers").doc(tierId).set(tierData);
        console.log(`  ➔ Tier berhasil dimasukkan: ${tierId} (${tierData.questions.length} soal)`);
      }
    }
    
    console.log("🎉 INJEKSI SELESAI! Semua soal berhasil masuk ke Database Sultan!");
  } catch (error) {
    console.error("❌ Gagal melakukan injeksi:", error);
  }
}

seedDatabase();