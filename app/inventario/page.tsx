"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { 
  Search, Package, Plus, ChevronRight, X, Save, 
  ShoppingCart, User, Hash, Loader2, AlertTriangle, Image as ImageIcon 
} from "lucide-react";

export default function InventarioPage() {
  // Estados de Inventario
  const [productos, setProductos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Estados de Modales/Paneles
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null); // Controla el panel lateral
  
  // Estados de Acción (Guardar/Vender)
  const [isSaving, setIsSaving] = useState(false);
  const [isSelling, setIsSelling] = useState(false);
  
  // Estado para Venta Directa
  const [ventaForm, setVentaForm] = useState({ customer_id: "", quantity: 1 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: p } = await supabase.from("products").select("*").order("model");
    const { data: c } = await supabase.from("customers").select("*").order("name");
    if (p) setProductos(p);
    if (c) setClientes(c);
    setLoading(false);
  };

  // --- LÓGICA DE VENTA DIRECTA DESDE PANEL ---
  const ejecutarVentaDirecta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !ventaForm.customer_id) return alert("DATOS INCOMPLETOS");
    if (selectedProduct.stock < ventaForm.quantity) return alert("STOCK INSUFICIENTE");

    setIsSelling(true);
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Registrar Venta (Pendiente)
    const { error: vError } = await supabase.from("sales").insert([{
      product_id: selectedProduct.id,
      customer_id: ventaForm.customer_id,
      seller_id: user?.id,
      quantity: ventaForm.quantity,
      total_price: selectedProduct.sale_price * ventaForm.quantity,
      delivery_status: "PENDIENTE"
    }]);

    if (!vError) {
      // 2. Actualizar Stock en DB
      await supabase.from("products")
        .update({ stock: selectedProduct.stock - ventaForm.quantity })
        .eq("id", selectedProduct.id);
      
      alert("✅ VENTA REGISTRADA: Verifique en Logística.");
      setSelectedProduct(null); // Cerrar panel
      setVentaForm({ customer_id: "", quantity: 1 });
      fetchData(); // Recargar inventario
    }
    setIsSelling(false);
  };

  const productosFiltrados = productos.filter((p) => {
    const term = busqueda.toLowerCase();
    return `${p.model} ${p.sku} ${p.color} ${p.size}`.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 relative overflow-hidden">
      {/* HEADER Y BUSCADOR (Igual que antes) */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white">
            Control de <span className="text-[#facc15]">Inventario</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px] mt-2 italic">Caminos 1524 / Stock Táctico</p>
        </div>
        <button onClick={() => setShowNewModal(true)} className="bg-[#facc15] text-black font-black px-6 py-3 rounded-2xl flex items-center gap-2 hover:scale-105 transition-all text-xs uppercase italic"><Plus size={18} /></button>
      </header>

      <div className="relative group">
        <Search className="absolute inset-y-0 left-5 flex items-center text-slate-500 group-focus-within:text-[#facc15]" size={20} style={{top: '50%', transform: 'translateY(-50%)'}} />
        <input type="text" placeholder="BUSCAR MODELO, TALLA, COLOR..." className="w-full bg-[#0f172a] border border-[#1e293b] p-6 pl-14 rounded-[2rem] text-white font-bold outline-none focus:border-[#facc15]" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
      </div>

      {/* LISTADO INTERACTIVO */}
      <div className="grid grid-cols-1 gap-3">
        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#facc15]" size={40} /></div>
        ) : productosFiltrados.map((p) => (
          <div 
            key={p.id} 
            onClick={() => setSelectedProduct(p)} // ABRIR PANEL LATERAL
            className="bg-[#0f172a] border border-[#1e293b] hover:border-[#facc15]/50 p-5 rounded-[2rem] flex items-center justify-between gap-6 transition-all group cursor-pointer shadow-xl hover:shadow-[0_0_30px_rgba(250,204,21,0.1)]"
          >
            <div className="flex items-center gap-6 w-full">
              {/* Miniatura de imagen o icono */}
              <div className="bg-[#1e293b] p-2 rounded-2xl w-20 h-20 flex items-center justify-center overflow-hidden border border-white/5">
                {p.image_urls && p.image_urls.length > 0 ? (
                  <img src={p.image_urls[0]} alt={p.model} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <ImageIcon size={32} className="text-slate-600" />
                )}
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase italic mb-1">Modelo</p>
                  <h3 className="text-xl font-black text-white uppercase italic leading-none">{p.model}</h3>
                </div>
                <div className="flex gap-8">
                  <div><p className="text-[10px] font-black text-slate-500 uppercase italic mb-1">Talla</p><p className="text-white font-black italic text-lg leading-none">{p.size}</p></div>
                  <div><p className="text-[10px] font-black text-slate-500 uppercase italic mb-1">Color</p><p className="text-white font-bold text-xs uppercase leading-none">{p.color}</p></div>
                </div>
                <div><p className="text-[10px] font-black text-slate-500 uppercase italic mb-1">Precio Venta</p><p className="text-[#facc15] font-black text-lg leading-none">C$ {p.sale_price.toLocaleString()}</p></div>
                <div className="flex flex-col items-end md:items-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase italic mb-1">Stock</p>
                  <span className={`text-3xl font-black italic ${p.stock <= 2 ? 'text-red-500' : 'text-white'}`}>{p.stock}</span>
                </div>
              </div>
            </div>
            <ChevronRight className="text-slate-700 group-hover:text-[#facc15] transition-colors" size={24} />
          </div>
        ))}
      </div>

      {/* 🟢 PANEL LATERAL TÁCTICO (DETALLE + VENTA) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedProduct(null)}>
          <div 
            className="bg-[#0f172a] border-l border-[#1e293b] w-full max-w-lg h-screen p-10 relative shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col animate-in slide-in-from-right duration-500"
            onClick={(e) => e.stopPropagation()} // Evitar cerrar al hacer clic dentro
          >
            <button onClick={() => setSelectedProduct(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={24} /></button>
            
            <header className="mb-8 pr-10">
              <span className="text-[10px] font-black text-slate-500 uppercase italic bg-[#1e293b] px-3 py-1 rounded-full">SKU: {selectedProduct.sku}</span>
              <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter mt-3">{selectedProduct.model}</h2>
              <p className="text-[#facc15] font-bold text-sm uppercase">Talla {selectedProduct.size} / {selectedProduct.color}</p>
            </header>

            {/* GALERÍA DE FOTOS */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-8">
              <section>
                <h4 className="text-[11px] font-black text-slate-400 uppercase italic mb-3 tracking-wider">Galería de Imágenes</h4>
                {selectedProduct.image_urls && selectedProduct.image_urls.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedProduct.image_urls.map((url: string, index: number) => (
                      <img key={index} src={url} alt={`Foto ${index}`} className="w-full h-32 object-cover rounded-2xl border border-[#1e293b] hover:scale-105 transition-all cursor-pointer" />
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#1e293b] rounded-2xl p-8 text-center border border-dashed border-[#334155]">
                    <ImageIcon size={32} className="mx-auto text-slate-600 mb-2" />
                    <p className="text-slate-500 text-[10px] font-bold uppercase">No hay fotos disponibles</p>
                  </div>
                )}
              </section>

              {/* FORMULARIO DE VENTA INMEDIATA */}
              <section className="bg-[#161e2b] p-8 rounded-[2rem] border border-[#1e293b] shadow-inner">
                <h4 className="text-xl font-black italic uppercase text-[#facc15] mb-6 flex items-center gap-3">
                  <ShoppingCart size={20} strokeWidth={3} /> Desplegar Venta
                </h4>
                
                {selectedProduct.stock > 0 ? (
                  <form onSubmit={ejecutarVentaDirecta} className="space-y-5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase italic ml-2 flex items-center gap-1.5"><User size={12}/> Cliente</label>
                      <select required className="w-full bg-[#0f172a] p-4 rounded-xl outline-none border border-[#1e293b] focus:border-[#facc15] text-white text-xs" value={ventaForm.customer_id} onChange={e => setVentaForm({...ventaForm, customer_id: e.target.value})}>
                        <option value="">Seleccionar...</option>
                        {clientes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.city})</option>)}
                      </select>
                    </div>

                    <div className="flex gap-4 items-end">
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase italic ml-2 flex items-center gap-1.5"><Hash size={12}/> Cantidad</label>
                        <input required type="number" min="1" max={selectedProduct.stock} className="w-full bg-[#0f172a] p-4 rounded-xl outline-none border border-[#1e293b] focus:border-[#facc15] text-white font-black text-lg" value={ventaForm.quantity} onChange={e => setVentaForm({...ventaForm, quantity: parseInt(e.target.value)})} />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase italic">Precio Total</p>
                        <p className="text-2xl font-black text-white mt-1">C$ {(selectedProduct.sale_price * ventaForm.quantity).toLocaleString()}</p>
                      </div>
                    </div>

                    <button disabled={isSelling} className="w-full bg-[#facc15] text-black font-black p-5 rounded-xl uppercase italic hover:scale-[1.02] active:scale-95 transition-all shadow-[0_15px_30px_rgba(250,204,21,0.2)] flex items-center justify-center gap-3 disabled:opacity-50 mt-4">
                      {isSelling ? <Loader2 className="animate-spin" /> : <Save size={18} strokeWidth={3} />}
                      Registrar y Confirmar Venta
                    </button>
                  </form>
                ) : (
                  <div className="text-center p-6 border border-red-900/30 rounded-2xl bg-red-500/5">
                    <AlertTriangle className="mx-auto text-red-500 mb-2" size={24} />
                    <p className="text-red-500 font-black uppercase italic text-xs tracking-wider">PRODUCTO AGOTADO. No se puede generar venta.</p>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE NUEVO ITEM (El mismo de antes) */}
      {showNewModal && ( <div className="fixed inset-0 z-50 ..."> ... formulario de nuevo item ... </div> )}
    </div>
  );
}