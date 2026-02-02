"use client";

import { motion } from "framer-motion";

export function StatCard({ title, value, sub, color }: { title: string, value: string, sub: string, color: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-3 hover:bg-white/10 transition-all group backdrop-blur-md"
        >
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-souss-orange transition-colors">{title}</div>
            <div className={`text-3xl font-black tracking-tighter ${color} glow-orange`}>{value}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{sub}</div>
        </motion.div>
    );
}

export function FamilyRecord({ name, neighborhood, status }: { name: string, neighborhood: string, status: "prioritaire" | "validé" | "en attente" }) {
    const statusColors = {
        prioritaire: "bg-red-500/10 text-red-500 border-red-500/20",
        validé: "bg-green-500/10 text-green-500 border-green-500/20",
        "en attente": "bg-amber-500/10 text-amber-500 border-amber-500/20"
    };

    return (
        <motion.div
            whileHover={{ x: 5 }}
            className="p-5 border border-white/5 rounded-2xl flex items-center justify-between bg-white/2 hover:bg-white/5 hover:border-white/10 transition-all backdrop-blur-sm"
        >
            <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-white/5 to-white/0 border border-white/10 flex items-center justify-center text-sm font-black text-souss-orange shadow-lg">
                    {name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                    <div className="text-[13px] font-black text-white tracking-tight">{name}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5 font-bold uppercase tracking-wider">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-souss-orange"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                        {neighborhood}
                    </div>
                </div>
            </div>
            <div className={`px-3 py-1 rounded-lg text-[9px] font-black border uppercase tracking-[0.15em] shadow-sm ${statusColors[status]}`}>
                {status}
            </div>
        </motion.div>
    );
}
