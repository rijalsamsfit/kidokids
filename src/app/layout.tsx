import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// ✅ 1. IMPORT GLOBAL MODAL DI SINI
import GlobalModal from "@/components/GlobalModal";

// ✅ PERBAIKAN: Kurung siku ganda [["latin"]] diubah menjadi satu kurung siku ["latin"]
const nunito = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KIDO - Game Edukasi Karakter",
  description: "Aplikasi pembinaan karakter anak berbasis gamifikasi dan kebiasaan positif di dunia nyata.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f8fafc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${nunito.className} bg-slate-50 text-slate-900 antialiased min-h-screen`}>
        {/* Pembungkus utama biar ukuran HP/Tab */}
        <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl pb-20 relative">
          {children}
        </div>

        {/* ✅ 2. SUNTIK GLOBAL MODAL DI SINI BIAR MERAJAI SELURUH HALAMAN */}
        <GlobalModal />

        {/* Masukkan Script Midtrans Sandbox di bawah ini untuk testing */}
        <Script 
          src="https://app.sandbox.midtrans.com/snap/snap.js" 
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}