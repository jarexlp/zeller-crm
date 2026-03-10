"use client";

import { Trophy, DollarSign, X } from "lucide-react";

export function CierreDia({ ventasHoy, comisionHoy, onClose }: any) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#05070a]/90 backdrop-blur-md p-4">
      <div className="bg-[#0f172a] border-2 border-[#facc15] p-8 rounded-3xl shadow-[0_0_50px_rgba(250,204,21,0.2)] max-w-md w-full relative animate-in zoom-in duration-300">
        
        {/* Botón para salir del reporte */}
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="bg-[#facc15]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#facc15]/20">
            <Trophy className="text-[#facc15]" size={40} />
          </div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            CIERRE DE <span className="text-[#facc15]">MISIÓN</span>
          </h2>
          <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.3em] mt-2">Resumen Operativo del Día</p>
        </div>

        <div className="space-y-4">
          <div className="bg-[#05070a] p-5 rounded-2xl border border-[#1e293b] flex justify-between items-center group hover:border-[#facc15]/30 transition-all">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pares Vendidos</span>
            <span className="text-2xl font-black text-white italic">{ventasHoy}</span>
          </div>
          <div className="bg-[#05070a] p-5 rounded-2xl border border-[#1e293b] flex justify-between items-center group hover:border-emerald-500/30 transition-all">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ganancia del Turno</span>
            <span className="text-2xl font-black text-emerald-500 italic">C$ {comisionHoy.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button 
            onClick={() => window.print()}
            className="flex-1 bg-white text-black py-4 rounded-xl font-black uppercase italic text-xs hover:bg-slate-200 transition-all shadow-xl"
          >
            PDF / IMPRIMIR
          </button>
        </div>
        
        <p className="text-center text-[8px] text-slate-600 uppercase font-bold mt-6 tracking-[0.2em]">
          ID de Sesión: {Math.random().toString(36).substring(7).toUpperCase()}
        </p>
      </div>
    </div>
  );
}