"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { TrendingUp, Users, Package, Target, DollarSign, Loader2, BarChart3, ShieldCheck } from "lucide-react";

export default function WarRoom() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    ventasTotales: 0,
    clientesTotales: 0,
    stockTotal: 0,
    comisiones: 0,
    paresVendidos: 0,
    nivelComision: "Sin comisión",
    valorInventario: 0 // Nuevo para Admin
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Verificar Rol en la tabla profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();
      
      const userRole = profile?.role || 'vendedor';
      setRole(userRole);

      // 2. Traer Stock y Clientes (Global)
      const { data: products } = await supabase.from("products").select("stock, sale_price");
      const totalStock = products?.reduce((acc, p) => acc + p.stock, 0) || 0;
      const valInv = products?.reduce((acc, p) => acc + (p.stock * p.sale_price), 0) || 0;
      
      const { count: customersCount } = await supabase.from("customers").select("*", { count: 'exact', head: true });

      // 3. Lógica de Ventas (Si es admin trae TODO, si es vendedora solo lo suyo)
      let salesQuery = supabase.from("sales").select("total_price, quantity");
      if (userRole !== 'admin') {
        salesQuery = salesQuery.eq("seller_id", user?.id);
      }
      
      const { data: sales } = await salesQuery;
      const totalSales = sales?.reduce((acc, s) => acc + s.total_price, 0) || 0;
      const totalPares = sales?.reduce((acc, s) => acc + s.quantity, 0) || 0;

      // --- LÓGICA DE COMISIONES CAMINOS 1524 ---
      let montoComision = 0;
      let nivel = "Nivel 0 (Honorario Fijo)";
      if (totalPares >= 10 && totalPares <= 15) { montoComision = totalPares * 50; nivel = "Nivel 1 (C$ 50/par)"; }
      else if (totalPares >= 16 && totalPares <= 30) { montoComision = totalPares * 75; nivel = "Nivel 2 (C$ 75/par)"; }
      else if (totalPares >= 31 && totalPares <= 49) { montoComision = totalPares * 90; nivel = "Nivel 3 (C$ 90/par)"; }
      else if (totalPares >= 50) { montoComision = 0; nivel = "Nivel Especial (Negociación)"; }

      setMetrics({
        ventasTotales: totalSales,
        clientesTotales: customersCount || 0,
        stockTotal: totalStock,
        comisiones: montoComision,
        paresVendidos: totalPares,
        nivelComision: nivel,
        valorInventario: valInv
      });
      setLoading(false);
    };

    fetchDashboard();
  }, []);

  if (loading) return <div className="p-10 text-[#facc15] font-black italic animate-pulse text-2xl">SINCRONIZANDO INTELIGENCIA...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-7xl font-black italic uppercase tracking-tighter text-white">
            War <span className="text-[#facc15]">Room</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-2 italic">
            {role === 'admin' ? "Panel de Control de Comandancia" : "Monitoreo de Objetivos y Comisiones"}
          </p>
        </div>
        {role === 'admin' && (
          <div className="bg-[#facc15] text-black px-4 py-2 rounded-full font-black text-[10px] flex items-center gap-2 italic">
            <ShieldCheck size={14} /> MODO ADMINISTRADOR
          </div>
        )}
      </header>

      {/* MÉTRICAS PARA ADMIN */}
      {role === 'admin' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0f172a] p-10 rounded-[3rem] border border-[#facc15]/30 shadow-[0_0_30px_rgba(250,204,21,0.05)] relative overflow-hidden group">
            <DollarSign className="absolute -right-8 -bottom-8 text-[#facc15]/5 group-hover:text-[#facc15]/10 transition-all" size={180} />
            <p className="text-[10px] font-black text-slate-500 uppercase italic mb-2">Ventas Globales (Mes)</p>
            <h3 className="text-6xl font-black text-white italic tracking-tighter">C$ {metrics.ventasTotales.toLocaleString()}</h3>
          </div>

          <div className="bg-[#0f172a] p-10 rounded-[3rem] border border-[#1e293b]">
            <p className="text-[10px] font-black text-slate-500 uppercase italic mb-2">Valor Total Inventario</p>
            <h3 className="text-6xl font-black text-[#facc15] italic tracking-tighter">C$ {metrics.valorInventario.toLocaleString()}</h3>
          </div>

          <div className="bg-[#0f172a] p-10 rounded-[3rem] border border-[#1e293b]">
            <p className="text-[10px] font-black text-slate-500 uppercase italic mb-2">Clientes en Base</p>
            <h3 className="text-6xl font-black text-white italic tracking-tighter">{metrics.clientesTotales}</h3>
          </div>
        </div>
      ) : (
        /* MÉTRICAS PARA VENDEDORA (Lo que ya tenías) */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0f172a] p-8 rounded-[2.5rem] border border-[#1e293b]">
            <p className="text-[10px] font-black text-slate-500 uppercase italic mb-2">Pares Vendidos</p>
            <h3 className="text-5xl font-black text-white">{metrics.paresVendidos}</h3>
            <p className="text-[#facc15] text-[10px] font-bold mt-2 uppercase">{metrics.nivelComision}</p>
          </div>

          <div className="bg-[#0f172a] p-8 rounded-[2.5rem] border border-[#1e293b] relative overflow-hidden">
            <p className="text-[10px] font-black text-slate-500 uppercase italic mb-2">Comisión Acumulada</p>
            <h3 className="text-5xl font-black text-emerald-500">
              {metrics.paresVendidos >= 50 ? "PENDIENTE" : `C$ ${metrics.comisiones.toLocaleString()}`}
            </h3>
          </div>

          <div className="bg-[#0f172a] p-8 rounded-[2.5rem] border border-[#1e293b]">
            <p className="text-[10px] font-black text-slate-500 uppercase italic mb-2">Stock Disponible</p>
            <h3 className="text-5xl font-black text-white">{metrics.stockTotal}</h3>
          </div>
        </div>
      )}

      {/* BARRA DE OBJETIVOS (Visible para ambos pero con contexto distinto) */}
      <div className="bg-[#0f172a] p-10 rounded-[3rem] border border-[#1e293b] shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h4 className="text-white font-black italic uppercase text-xl flex items-center gap-2">
                <Target className="text-[#facc15]" /> {role === 'admin' ? "Objetivo Global Mensual" : "Progreso de Meta Personal"}
              </h4>
              <p className="text-slate-400 text-[10px] font-bold uppercase mt-1">Siguiente hito importante: 50 pares</p>
            </div>
            <span className="text-4xl font-black text-[#facc15]">{Math.round((metrics.paresVendidos / 50) * 100)}%</span>
          </div>
          
          <div className="w-full bg-[#1e293b] h-10 rounded-2xl overflow-hidden p-2 border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-yellow-600 to-[#facc15] rounded-xl transition-all duration-1000"
              style={{ width: `${Math.min((metrics.paresVendidos / 50) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}