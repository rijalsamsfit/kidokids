"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, Target, Store, Trophy, // Ikon Anak
  ShieldCheck, ClipboardList, ShoppingBag, BarChart3 // Ikon Ortu
} from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  // Sembunyikan navigasi di halaman awal/login
  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return null;
  }

  // 👦 1. MENU KHUSUS ANAK (Full 4 Menu RPG)
  const childNavItems = [
    { name: "Pahlawan", href: "/child", icon: Home, activeColor: "text-blue-600", activeBg: "bg-blue-100" },
    { name: "Misi", href: "/child/quests", icon: Target, activeColor: "text-rose-500", activeBg: "bg-rose-100" },
    { name: "Toko Kido", href: "/child/shop", icon: Store, activeColor: "text-amber-500", activeBg: "bg-amber-100" },
    { name: "Rapor", href: "/child/achievements", icon: Trophy, activeColor: "text-purple-500", activeBg: "bg-purple-100" },
  ];

  // 🧕 2. MENU KHUSUS ORANG TUA (Full 4 Menu Command Center)
  const parentNavItems = [
    { name: "Pantau", href: "/parent", icon: ShieldCheck, activeColor: "text-emerald-600", activeBg: "bg-emerald-100" },
    { name: "Kelola Misi", href: "/parent/missions", icon: ClipboardList, activeColor: "text-blue-600", activeBg: "bg-blue-100" },
    { name: "Kelola Toko", href: "/parent/shop", icon: ShoppingBag, activeColor: "text-amber-600", activeBg: "bg-amber-100" },
    { name: "Analisis AI", href: "/parent/analytics", icon: BarChart3, activeColor: "text-purple-600", activeBg: "bg-purple-100" },
  ];

  // 🛠️ DETEKSI AKSI
  const isChildSpace = pathname.startsWith("/child");
  const currentNavItems = isChildSpace ? childNavItems : parentNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-slate-200 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] pb-safe">
      <div className="max-w-md mx-auto flex justify-between items-center h-16 px-2">
        {currentNavItems.map((item) => {
          // Logika pintar biar highlight-nya presisi
          const isActive = item.href === "/child" || item.href === "/parent"
            ? pathname === item.href 
            : pathname.startsWith(item.href);

          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-[25%] h-full space-y-1 transition-all duration-200 ${
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
                className={`text-[10px] tracking-wide font-extrabold transition-colors truncate w-full text-center ${
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