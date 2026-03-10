"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { Lock, Zap } from "lucide-react";
import { TacticalInput } from "@/components/TacticalInput";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("ACCESO DENEGADO: CREDENCIALES INVÁLIDAS");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070a] p-4">
      <div className="bg-[#0f172a] p-10 rounded-2xl border border-[#1e293b] w-full max-w-md shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#facc15] shadow-[0_0_15px_#facc15]"></div>

        <div className="flex flex-col items-center mb-10">
          <div className="bg-[#1e293b] p-4 rounded-full mb-4 border border-[#facc15]/20">
            <Lock className="text-[#facc15]" size={32} />
          </div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase text-center">
            WAR <span className="text-[#facc15]">ROOM</span>
          </h2>
          <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.4em] mt-2">Seguridad Caminos 1524</p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-[10px] mb-6 text-center font-black border border-red-500/20 uppercase">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <TacticalInput 
            label="ID DE OPERADOR" 
            type="email" 
            placeholder="usuario@caminos.com"
            value={email} 
            onChange={(e: any) => setEmail(e.target.value)} 
          />
          <TacticalInput 
            label="CLAVE DE ENCRIPTACIÓN" 
            type="password" 
            placeholder="••••••••"
            value={password} 
            onChange={(e: any) => setPassword(e.target.value)} 
          />
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#facc15] text-black p-4 rounded-xl font-black uppercase italic tracking-tighter hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 disabled:bg-slate-800 disabled:text-slate-600 shadow-[0_0_20px_rgba(250,204,21,0.2)]"
          >
            {loading ? "VERIFICANDO..." : <><Zap size={18} fill="currentColor" /> AUTENTICAR</>}
          </button>
        </form>
      </div>
    </div>
  );
}