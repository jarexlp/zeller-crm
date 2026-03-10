"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Home, Package, Users, ShoppingCart, Truck, LogOut } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      if (!session && pathname !== "/login") {
        router.push("/login");
      }
      setLoading(false);
    };
    checkAuth();
  }, [pathname, router]);

  const navItems = [
    { name: "Inicio", href: "/", icon: Home },
    { name: "Inventario", href: "/inventario", icon: Package },
    { name: "Clientes", href: "/clientes", icon: Users },
    { name: "Ventas", href: "/ventas", icon: ShoppingCart },
    { name: "Logística", href: "/logistica", icon: Truck },
  ];

  return (
    <html lang="es">
      <body className={`${inter.className} bg-[#05070a] text-white flex h-screen overflow-hidden`}>
        {loading ? (
          <div className="flex items-center justify-center w-full h-screen text-[#facc15] font-black italic uppercase tracking-[0.3em] animate-pulse">
            Cargando Sistema...
          </div>
        ) : (
          <>
            {!pathname.includes("/login") && isAuthenticated && (
              <aside className="w-72 bg-[#0f172a] border-r border-[#1e293b] flex flex-col shadow-2xl">
                <div className="p-8 border-b border-[#1e293b]">
                  <h1 className="text-2xl font-black italic uppercase tracking-tighter">
                    Caminos <span className="text-[#facc15]">1524</span>
                  </h1>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1">CRM Operativo</p>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 font-black italic uppercase text-xs tracking-wider">
                  {navItems.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link 
                        key={item.href} 
                        href={item.href} 
                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                          active 
                          ? 'bg-[#facc15] text-black shadow-[0_0_20px_rgba(250,204,21,0.2)]' 
                          : 'text-slate-400 hover:bg-[#1e293b] hover:text-white'
                        }`}
                      >
                        <item.icon size={18} strokeWidth={3} />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>

                <div className="p-6 border-t border-[#1e293b]">
                  <button 
                    onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} 
                    className="flex items-center gap-4 w-full p-4 rounded-2xl text-red-500 hover:bg-red-500/10 font-black uppercase italic text-xs transition-all"
                  >
                    <LogOut size={18} /> Cerrar Sesión
                  </button>
                </div>
              </aside>
            )}
            <main className="flex-1 overflow-y-auto p-10">
              {children}
            </main>
          </>
        )}
      </body>
    </html>
  );
}