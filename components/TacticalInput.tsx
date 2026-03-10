export function TacticalInput({ label, ...props }: any) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
        {label}
      </label>
      <input 
        {...props}
        className="bg-[#05070a] border border-[#1e293b] text-white p-3 rounded-lg
                   font-bold text-sm transition-all duration-200
                   caret-[#facc15] placeholder:text-slate-800
                   focus:border-[#facc15] focus:bg-[#0a0f1d] focus:shadow-[0_0_15px_rgba(250,204,21,0.1)]"
      />
    </div>
  );
}