import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inisialisasi Gemini (Otomatis narik kunci dari .env.local)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    // Keamanan: Pastikan API Key ada
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API Key Gemini belum terpasang' }, { status: 500 });
    }

    // Menerima data anak dari halaman Ortu
    const body = await request.json();
    const { childName, level, xp, completedMissions, rejectedMissions, recentRewards } = body;

    // 🧠 RACIKAN PROMPT RAHASIA
    const prompt = `
      Kamu adalah seorang pakar parenting psikologi anak yang bijak, hangat, dan suportif.
      Saya memiliki anak bernama ${childName || 'Pahlawan'}, saat ini berada di Level ${level} dengan ${xp} XP di aplikasi game kebiasaan baik kami.
      
      Berikut adalah catatan aktivitasnya akhir-akhir ini:
      - Misi yang rajin/berhasil diselesaikan: ${completedMissions.length > 0 ? completedMissions.join(', ') : 'Belum ada misi selesai.'}
      - Misi yang ditolak/gagal/malas dilakukan: ${rejectedMissions.length > 0 ? rejectedMissions.join(', ') : 'Tidak ada misi yang ditolak.'}
      - Hadiah yang baru saja dia tukar (Motivasinya): ${recentRewards.length > 0 ? recentRewards.join(', ') : 'Belum menukar hadiah.'}

      Tolong berikan analisis singkat yang ditujukan untuk saya (sebagai orang tuanya). 
      Gunakan bahasa Indonesia yang santai, penuh empati, dan tidak menggurui. 
      Format jawaban wajib menggunakan Markdown dan terbagi menjadi 3 bagian:
      
      1. **Pujian & Kekuatan**: Analisis positif tentang apa yang sudah dia lakukan dengan baik.
      2. **Area Perkembangan**: Analisis lembut tentang tantangannya (berdasarkan misi yang ditolak) dan apa gaya motivasinya (berdasarkan hadiah).
      3. **Tips Praktis Besok Pagi**: 2-3 langkah nyata yang sangat spesifik dan bisa saya lakukan besok pagi untuk memotivasinya.
      
      Batasi jawaban maksimal 250-300 kata agar mudah dibaca oleh orang tua yang sibuk.
    `;

    // Panggil model Gemini yang cepat dan cerdas (Flash)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Kembalikan jawaban AI ke frontend
    return NextResponse.json({ analysis: text });

  } catch (error) {
    console.error('Error memanggil Gemini:', error);
    return NextResponse.json({ error: 'Gagal menganalisis data. Coba lagi nanti.' }, { status: 500 });
  }
}