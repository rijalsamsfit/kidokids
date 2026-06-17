import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
// FASE 3: Import konfigurasi Firebase dan metode Firestore
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Inisialisasi Gemini (Otomatis narik kunci dari .env.local)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    // Keamanan: Pastikan API Key ada
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API Key Gemini belum terpasang' }, { status: 500 });
    }

    // Menerima data anak dari halaman Ortu (Termasuk childId dari Fase 2)
    const body = await request.json();
    const { 
      childId, 
      childName, 
      level, 
      xp, 
      completedMissions, 
      rejectedMissions, 
      recentRewards 
    } = body;

    // Validasi dasar: Pastikan childId ada untuk keperluan Firestore relasional
    if (!childId) {
      return NextResponse.json({ error: 'childId tidak ditemukan dalam request' }, { status: 400 });
    }

    // 🧠 RACIKAN PROMPT RAHASIA
    const prompt = `
      Kamu adalah seorang pakar parenting psikologi anak yang bijak, hangat, dan suportif.
      Saya memiliki anak bernama ${childName || 'Pahlawan'}, saat ini berada di Level ${level} dengan ${xp} XP di aplikasi game kebiasaan baik kami.
      
      Berikut adalah catatan aktivitasnya akhir-akhir ini:
      - Misi yang rajin/berhasil diselesaikan: ${completedMissions && completedMissions.length > 0 ? completedMissions.join(', ') : 'Belum ada misi selesai.'}
      - Misi yang ditolak/gagal/malas dilakukan: ${rejectedMissions && rejectedMissions.length > 0 ? rejectedMissions.join(', ') : 'Tidak ada misi yang ditolak.'}
      - Hadiah yang baru saja dia tukar (Motivasinya): ${recentRewards && recentRewards.length > 0 ? recentRewards.join(', ') : 'Belum menukar hadiah.'}

      Tolong berikan analisis singkat yang ditujukan untuk saya (sebagai orang tuanya). 
      Gunaka bahasa Indonesia yang santai, penuh empati, dan tidak menggurui. 
      Format jawaban wajib menggunakan Markdown dan terbagi menjadi 3 bagian:
      
      1. **Pujian & Kekuatan**: Analisis positif tentang apa yang sudah dia lakukan dengan baik.
      2. **Area Perkembangan**: Analisis lembut tentang tantangannya (berdasarkan misi yang ditolak) dan apa gaya motivasinya (berdasarkan hadiah).
      3. **Tips Praktis Besok Pagi**: 2-3 langkah nyata yang sangat spesifik dan bisa saya lakukan besok pagi untuk memotivasinya.
      
      Batasi jawaban maksimal 250-300 kata agar mudah dibaca oleh orang tua yang sibuk.
    `;

    // Panggil model Gemini pilihan lu yang sudah terbukti sukses di env lu
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // ─── FASE 3: OPERASI DAPUR FIRESTORE (REKAM DATA) ───
    // Menyimpan wejangan AI otomatis ke koleksi 'parent_analyses'
    await addDoc(collection(db, "parent_analyses"), {
      childId: childId,
      childName: childName || 'Pahlawan',
      analysis: text,
      createdAt: serverTimestamp() // Menggunakan waktu server Firebase agar akurat untuk limit Cooldown
    });

    // Kembalikan jawaban AI ke frontend seperti semula
    return NextResponse.json({ analysis: text });

  } catch (error: any) {
    console.error('Error memanggil Gemini atau menyimpan data:', error);
    return NextResponse.json({ error: error.message || 'Gagal menganalisis data. Coba lagi nanti.' }, { status: 500 });
  }
}