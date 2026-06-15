// src/app/api/webhook/midtrans/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase"; // ✅ Memakai file koneksi firebase yang sudah lu punya
import { doc, setDoc } from "firebase/firestore"; // ✅ Memakai fungsi modular bawaan Firestore

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Ambil data status transaksi dari Midtrans
    const { order_id, transaction_status } = body;
    
    // Pengaman: Jika order_id tidak dikirim oleh Midtrans, gagalkan agar tidak crash
    if (!order_id) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    // Asumsi order_id formatnya: "sub_PARENTUID_timestamp"
    // Contoh: "sub_user12345_1718460000" -> di-split akan mengambil "user12345"
    const parentId = order_id.split("_")[1]; 

    if (!parentId) {
      return NextResponse.json({ error: "Format order_id tidak valid" }, { status: 400 });
    }

    // ⚡ JIKA PEMBAYARAN SUKSES ATAU BERHASIL DI-CAPTURE
    if (transaction_status === "settlement" || transaction_status === "capture") {
      
      // ✅ Cara tulis Firestore Client SDK yang benar: doc(database, koleksi, id_dokumen)
      const parentRef = doc(db, "parents", parentId);
      
      // Simpan/Update data status premium ke dokumen milik orang tua tersebut
      await setDoc(parentRef, {
        isPremium: true,
        updatedAt: new Date().toISOString(),
        premiumUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Otomatis aktif 30 hari
      }, { merge: true }); // merge: true memastikan data lain tidak terhapus
      
      console.log(`=== WEBHOOK SUCCESS: Akun ${parentId} resmi menjadi PREMIUM! ===`);
    }

    // Next.js Route wajib mengembalikan response standar menggunakan NextResponse
    return NextResponse.json({ status: "OK", message: "Webhook processed successfully" });

  } catch (error: any) {
    console.error("Terjadi eror di Webhook Midtrans:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}