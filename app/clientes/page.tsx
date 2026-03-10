"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { UserPlus, MessageSquare, Search, Loader2 } from "lucide-react";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", city: "" });

  useEffect(() => { fetchClientes(); }, []);

  const fetchClientes = async () => {
    const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
    if (data) setClientes(data);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("customers").insert([form]);
    if (!error) {
      setForm({ name: "", phone: "", city: "" });
      fetchClientes();
    }
    setLoading(false);
  };

  const filtrados = clientes.filter(c => c.name.toLowerCase().includes(busqueda.toLowerCase()) || c.phone.includes(busqueda));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-3xl font-black italic uppercase text-[#facc15]">Gestión de Clientes</h2>
      
      {/* FORMULARIO TÁCTICO */}
      <form onSubmit={guardar} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#0f172a] p-6 rounded-3xl border border-[#1e293b]">
        <input className="bg-[#1e293b] p-3 rounded-xl outline-none focus:ring-2 ring-[#facc15]" placeholder="NOMBRE" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <input className="bg-[#1e293b] p-3 rounded-xl outline-none focus:ring-2 ring-[#facc15]" placeholder="TELÉFONO" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
        <input className="bg-[#1e293b] p-3 rounded-xl outline-none focus:ring-2 ring-[#facc15]" placeholder="CIUDAD" value={form.city} onChange={e => setForm({...form, city: e.target.value})} required />
        <button className="bg-[#facc15] text-black font-black uppercase rounded-xl hover:scale-105 transition-all">
          {loading ? <Loader2 className="animate-spin mx-auto" /> : "REGISTRAR"}
        </button>
      </form>

      {/* TABLA DE REGISTROS */}
      <div className="bg-[#0f172a] rounded-3xl border border-[#1e293b] overflow-hidden">
        <div className="p-4 border-b border-[#1e293b]">
          <input className="w-full bg-[#1e293b] p-3 rounded-xl text-sm" placeholder="BUSCAR CLIENTE..." onChange={e => setBusqueda(e.target.value)} />
        </div>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#1e293b] text-[#facc15] uppercase">
              <th className="p-4">Nombre</th>
              <th className="p-4">Ciudad</th>
              <th className="p-4">WhatsApp</th>
              <th className="p-4 text-center">Chatwoot</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(c => (
              <tr key={c.id} className="border-b border-[#1e293b] hover:bg-[#1e293b]/50">
                <td className="p-4 font-bold uppercase">{c.name}</td>
                <td className="p-4 italic text-slate-400">{c.city}</td>
                <td className="p-4 font-mono">{c.phone}</td>
                <td className="p-4 text-center">
                  <button onClick={() => window.open(`https://app.chatwoot.com/app/accounts/1/contacts?search=${c.phone}`, "_blank")} className="text-[#facc15] hover:underline flex items-center gap-2 mx-auto">
                    <MessageSquare size={14} /> ENLAZAR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}