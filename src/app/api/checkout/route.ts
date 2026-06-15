// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { orderId, amount, customerName, customerEmail } = await request.json();

    // Mengambil Server Key dari .env.local (wajib ada!)
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    
    // Midtrans mensyaratkan otentikasi Basic dengan format Base64(ServerKey:)
    const encodedSecret = Buffer.from(serverKey + ":").toString("base64");

    // Hit API Midtrans Sandbox untuk minta Snap Token
    const response = await fetch("https://app.sandbox.midtrans.com/snap/v1/transactions", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Basic ${encodedSecret}`
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: orderId,
          gross_amount: amount
        },
        customer_details: {
          first_name: customerName || "Ortu KIDO",
          email: customerEmail || "ortu@kidokids.com"
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error_messages?.[0] || "Gagal membuat token Midtrans");
    }

    // Kembalikan token ke frontend
    return NextResponse.json({ token: data.token });
    
  } catch (error: any) {
    console.error("Eror Checkout:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}