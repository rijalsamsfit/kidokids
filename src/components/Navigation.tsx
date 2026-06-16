"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
// ✅ Import semua ikon game dan dashboard yang kita butuhkan
import { Trophy, ShieldCheck, Store, Gamepad2, BarChart3, Home } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  // Sembunyikan navigasi bawah di halaman Login, Register, atau Landing Page awal
  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return null;
  }

  // 👦 1. MENU KHUSUS ANAK (Gamified RPG Style Layout)
  const childNavItems = [
    { name: "Pahlawan", href: "/child", icon: Gamepad2, activeColor: "text-blue-600", activeBg: "bg-blue-100" },
    { name: "Toko Kido", href: "/child/shop", icon: Store, activeColor: "text-amber-500", activeBg: "bg-amber-100" },
  ];

  // 🧕 2. MENU KHUSUS ORANG TUA (Command Center Layout)
  const parentNavItems = [
    { name: "Pantau Misi", href: "/parent", icon: ShieldCheck, activeColor: "text-emerald-600", activeBg: "bg-emerald-100" },
    { name: "Analisis AI", href: "/parent/analytics", icon: BarChart3, activeColor: "text-purple-600", activeBg: "bg-purple-100" },
  ];

  // 🛠️ 3. DETEKSI AKSI: Tentukan menu mana yang mau dimunculkan berdasarkan rute URL
  const isChildSpace = pathname.startsWith("/child");
  const currentNavItems = isChildSpace ? childNavItems : parentNavItems;

  return (
    // Membungkus navigasi di bagian paling bawah layar (fixed bottom) - Mobile First
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-slate-200 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 pb-1">
        {currentNavItems.map((item) => {
          // ✅ Logika cek aktif yang pintar agar sub-halaman gak bentrok highlight-nya
          const isActive = item.href === "/child" || item.href === "/parent"
            ? pathname === item.href 
            : pathname.startsWith(item.href);

          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 ${
                isActive ? item.activeColor : "text-slate-400 hover:text-slate-500"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? item.activeBg : "bg-transparent"}`}>
                <Icon 
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? "stroke-[2.5] scale-110" : "stroke-[1.5]"
                  }`} 
                />
              </div>
              <span 
                className={`text-[10px] tracking-wide font-extrabold transition-colors ${
                  isActive ? item.activeColor : "text-slate-500 font-bold"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}