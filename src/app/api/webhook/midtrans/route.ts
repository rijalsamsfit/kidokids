// src/app/api/webhook/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase"; 
import { doc, setDoc } from "firebase/firestore"; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Ambil data status transaksi dari Midtrans
    const { order_id, transaction_status } = body;
    
    // Pengaman 1: Jika order_id tidak dikirim oleh Midtrans, gagalkan agar tidak crash
    if (!order_id) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    // Membelah order_id hasil racikan kita -> plan_PARENTUID_timestamp
    // Contoh: "lifetime_user12345_1718460000"
    const parts = order_id.split("_");
    const planType = parts[0]; // Hasil: "pro", "annual", atau "lifetime"
    const parentId = parts[1]; // Hasil: "user12345"

    // Pengaman 2: Pastikan formatnya benar
    if (!parentId || !planType) {
      return NextResponse.json({ error: "Format order_id tidak valid" }, { status: 400 });
    }

    // ⚡ JIKA PEMBAYARAN SUKSES ATAU BERHASIL DI-CAPTURE
    if (transaction_status === "settlement" || transaction_status === "capture") {
      
      // ✅ LOGIKA MASA AKTIF SESUAI PAKET
      let expiryDate: string | null = null;
      
      if (planType === "pro") {
        // PRO: Tambah 30 Hari
        expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      } else if (planType === "annual") {
        // TAHUNAN: Tambah 365 Hari
        expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      } else if (planType === "lifetime") {
        // LIFETIME: Null (Berlaku Seumur Hidup!)
        expiryDate = null; 
      }

      // Hubungkan ke laci orang tua di Firestore
      const parentRef = doc(db, "parents", parentId);
      
      // ✅ UPDATE DATA ORTU SESUAI KASTANYA
      await setDoc(parentRef, {
        subscriptionPlan: planType,
        subscriptionExpiry: expiryDate,
        updatedAt: new Date().toISOString()
      }, { merge: true }); // merge: true biar data email/nama ortu gak ilang
      
      console.log(`=== 🟢 WEBHOOK SUCCESS: Akun ${parentId} resmi menjadi kasta ${planType.toUpperCase()}! ===`);
    } else if (transaction_status === "cancel" || transaction_status === "expire" || transaction_status === "deny") {
      console.log(`=== 🔴 WEBHOOK INFO: Transaksi ${order_id} gagal/dibatalkan. ===`);
    }

    // Midtrans wajib menerima respon 200 OK, kalau nggak, dia bakal ngirim pesan ini terus-terusan
    return NextResponse.json({ status: "OK", message: "Webhook processed successfully" });

  } catch (error: any) {
    console.error("Terjadi eror di Webhook Midtrans:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}