"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { 
  ShoppingCart, 
  Search, 
  User, 
  Hash, 
  Loader2, 
  CheckCircle2, 
  X,
  ChevronDown
} from "lucide-react";

export default function VentasPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [form, setForm] = useState({ 
    product_id: "", 
    product_name: "Seleccionar Calzado...",
    customer_id: "", 
    quantity: 1 
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: p } = await supabase.from("products").select("*").gt("stock", 0);
      const { data: c } = await supabase.from("customers").select("*").order("name");
      setProductos(p || []);
      setClientes(c || []);
    };
    fetchData();
  }, []);

  // FILTRADO DINÁMICO DE PRODUCTOS
  const productosFiltrados = productos.filter(p => 
    `${p.model} ${p.size} ${p.color} ${p.sku}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const seleccionarProducto = (p: any) => {
    setForm({ 
      ...form, 
      product_id: p.id, 
      product_name: `${p.model} - T${p.size} (${p.color})` 
    });
    setSearchTerm("");
    setShowDropdown(false);
  };

  const registrarVenta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_id || !form.customer_id) return alert("DATOS INCOMPLETOS");
    
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const prod = productos.find(p => p.id === form.product_id);

    const { error } = await supabase.from("sales").insert([{
      product_id: form.product_id,
      customer_id: form.customer_id,
      seller_id: user?.id,
      quantity: form.quantity,
      total_price: prod.sale_price * form.quantity,
      delivery_status: "PENDIENTE"
    }]);

    if (!error) {
      await supabase.from("products").update({ stock: prod.stock - form.quantity }).eq("id", form.product_id);
      alert("VENTA REGISTRADA EXITOSAMENTE");
      setForm({ product_id: "", product_name: "Seleccionar Calzado...", customer_id: "", quantity: 1 });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
      <header className="text-center">
        <h2 className="text-5xl font-black italic uppercase text-[#facc15] tracking-tighter">Terminal de <span className="text-white">Ventas</span></h2>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2 italic">Caminos 1524 / Operaciones</p>
      </header>

      <form onSubmit={registrarVenta} className="bg-[#0f172a] p-10 rounded-[3rem] border border-[#1e293b] shadow-2xl space-y-8 relative">
        
        {/* BUSCADOR DE PRODUCTOS (COMBOBOX) */}
        <div className="space-y-2 relative">
          <label className="text-[10px] font-black text-slate-500 uppercase italic ml-2 flex items-center gap-2">
            <Search size={14} className="text-[#facc15]" /> Buscar Producto (Modelo, Talla o Color)
          </label>
          
          <div 
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full bg-[#1e293b] p-5 rounded-2xl border border-transparent focus-within:border-[#facc15] transition-all cursor-pointer flex justify-between items-center"
          >
            <span className={`font-black uppercase italic ${form.product_id ? 'text-white' : 'text-slate-500'}`}>
              {form.product_name}
            </span>
            <ChevronDown size={20} className="text-slate-500" />
          </div>

          {showDropdown && (
            <div className="absolute z-50 w-full mt-2 bg-[#1e293b] border border-[#facc15]/30 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2">
              <div className="p-4 border-b border-white/5 bg-[#161e2b]">
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Escribe modelo o talla..."
                  className="w-full bg-[#0f172a] p-3 rounded-xl outline-none text-white font-bold text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                {productosFiltrados.length > 0 ? productosFiltrados.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => seleccionarProducto(p)}
                    className="p-4 hover:bg-[#facc15] hover:text-black cursor-pointer transition-colors border-b border-white/5 last:border-0 group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-black uppercase italic text-sm">{p.model}</span>
                      <span className="text-[10px] font-bold bg-black/10 px-2 py-0.5 rounded uppercase">Stock: {p.stock}</span>
                    </div>
                    <div className="flex gap-3 text-[10px] font-bold uppercase opacity-70 group-hover:opacity-100">
                      <span>Talla: {p.size}</span>
                      <span>Color: {p.color}</span>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-slate-500 font-black uppercase italic text-xs">No hay coincidencias</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SELECCIÓN DE CLIENTE */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase italic ml-2 flex items-center gap-2">
            <User size={14} /> Cliente
          </label>
          <select 
            className="w-full bg-[#1e293b] p-5 rounded-2xl outline-none border border-transparent focus:border-[#facc15] text-white font-bold appearance-none cursor-pointer"
            value={form.customer_id}
            onChange={e => setForm({...form, customer_id: e.target.value})}
            required
          >
            <option value="">Seleccionar Cliente...</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.name.toUpperCase()} ({c.city})</option>
            ))}
          </select>
        </div>

        {/* CANTIDAD */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase italic ml-2 flex items-center gap-2">
            <Hash size={14} /> Cantidad de Pares
          </label>
          <input 
            type="number" 
            min="1"
            className="w-full bg-[#1e293b] p-5 rounded-2xl outline-none border border-transparent focus:border-[#facc15] text-white font-black text-2xl"
            value={form.quantity}
            onChange={e => setForm({...form, quantity: parseInt(e.target.value)})}
          />
        </div>

        <button 
          disabled={loading || !form.product_id}
          className="w-full bg-[#facc15] text-black font-black p-6 rounded-2xl uppercase italic text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_40px_rgba(250,204,21,0.25)] flex items-center justify-center gap-4 disabled:opacity-30 disabled:grayscale"
        >
          {loading ? <Loader2 className="animate-spin" /> : <ShoppingCart size={28} strokeWidth={3} />}
          REGISTRAR SALIDA
        </button>
      </form>
    </div>
  );
}