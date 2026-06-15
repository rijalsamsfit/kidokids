"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Trophy } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  // Sembunyikan navigasi bawah di halaman Login atau Landing Page awal
  // Navigasi ini hanya muncul kalau user sudah masuk ke area dalam aplikasi
  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return null;
  }

  // Menu navigasi. Nanti bisa kita tambah sesuai perkembangan fitur.
  const navItems = [
    { name: "Area Anak", href: "/child", icon: Trophy },
    { name: "Orang Tua", href: "/parent", icon: ShieldCheck },
  ];

  return (
    // Membungkus navigasi di bagian paling bawah layar (fixed bottom)
    // Sesuai Rule #6: Responsif Mobile First
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-slate-200 z-50">
      {/* max-w-md mx-auto memastikan navigasi tidak melebar ke kiri-kanan saat dibuka di layar komputer/laptop */}
      <div className="max-w-md mx-auto flex justify-around items-center h-16 pb-1">
        {navItems.map((item) => {
          // Mengecek apakah halaman saat ini sedang aktif (URL cocok dengan href menu)
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon 
                className={`w-6 h-6 ${
                  isActive ? "fill-blue-100 stroke-2" : "stroke-[1.5]"
                }`} 
              />
              <span 
                className={`text-[11px] font-bold ${
                  isActive ? "text-blue-600" : "text-slate-500"
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