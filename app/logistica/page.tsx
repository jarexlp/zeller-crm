"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { 
  Truck, 
  Clock, 
  CheckCircle, 
  MapPin, 
  Users, 
  Loader2, 
  MessageCircle,
  Package 
} from "lucide-react";

export default function LogisticaPage() {
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    fetchOrdenes(); 
  }, []);

  const fetchOrdenes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sales")
      .select(`
        id, 
        quantity, 
        delivery_status, 
        created_at,
        products(model, size, color),
        customers(name, phone, city)
      `)
      .order("created_at", { ascending: false });
    
    if (data) setOrdenes(data);
    setLoading(false);
  };

  const confirmarVenta = async (id: string) => {
    const { error } = await supabase
      .from("sales")
      .update({ delivery_status: "LISTO PARA DESPACHO" })
      .eq("id", id);
    
    if (!error) fetchOrdenes();
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white">
          Gestión <span className="text-[#facc15]">Logística</span>
        </h1>
        <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px] mt-2 italic leading-none">
          Caminos 1524 / Control de Despacho
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="animate-spin text-[#facc15]" size={40} />
          </div>
        ) : ordenes.length > 0 ? (
          ordenes.map((orden) => (
            <div 
              key={orden.id} 
              className={`bg-[#0f172a] p-6 rounded-[2.5rem] border transition-all ${
                orden.delivery_status === 'PENDIENTE' 
                ? 'border-red-900/30 bg-gradient-to-r from-[#0f172a] to-[#1a0a0a]' 
                : 'border-emerald-900/30'
              } flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl`}
            >
              <div className="flex items-center gap-6 w-full">
                <div className={`p-5 rounded-2xl ${
                  orden.delivery_status === 'PENDIENTE' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                }`}>
                  {orden.delivery_status === 'PENDIENTE' ? <Clock size={28} /> : <Truck size={28} />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest bg-[#1e293b] px-2 py-0.5 rounded">ORD #{orden.id.slice(0,5)}</span>
                    <span className={`text-[9px] font-black px-3 py-0.5 rounded-full uppercase italic ${
                      orden.delivery_status === 'PENDIENTE' ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500 text-black'
                    }`}>
                      {orden.delivery_status}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">
                    {orden.products?.model} <span className="text-[#facc15]">T{orden.products?.size}</span>
                  </h3>
                  
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-[11px] font-bold text-slate-400 uppercase italic">
                    <span className="flex items-center gap-2"><Users size={14} className="text-slate-600" /> {orden.customers?.name || "Sin nombre"}</span>
                    <span className="flex items-center gap-2"><MapPin size={14} className="text-slate-600" /> {orden.customers?.city || "S/C"}</span>
                    <button 
                      onClick={() => window.open(`https://wa.me/${orden.customers?.phone?.replace(/\D/g,'')}`, "_blank")}
                      className="flex items-center gap-2 text-emerald-500 hover:text-white transition-colors"
                    >
                      <MessageCircle size={14} /> {orden.customers?.phone}
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto min-w-[200px]">
                {orden.delivery_status === "PENDIENTE" ? (
                  <button 
                    onClick={() => confirmarVenta(orden.id)}
                    className="w-full bg-[#facc15] text-black font-black px-8 py-4 rounded-2xl uppercase italic text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_10px_20px_rgba(250,204,21,0.2)]"
                  >
                    Confirmar Despacho
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-3 text-emerald-500 font-black italic uppercase text-xs border border-emerald-500/20 p-4 rounded-2xl bg-emerald-500/5">
                    <CheckCircle size={20} /> Pedido Verificado
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-20 bg-[#0f172a] rounded-[3rem] border border-[#1e293b]">
            <Package size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-500 font-black uppercase italic tracking-widest text-xs">No hay órdenes registradas hoy</p>
          </div>
        )}
      </div>
    </div>
  );
}