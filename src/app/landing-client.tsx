"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { authClient } from "@/lib/auth-client";

export default function LandingClient() {
    return (
        <div className="min-h-screen bg-night-blue overflow-hidden relative selection:bg-souss-orange/30">
            {/* Decorative Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-souss-orange/5 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-souss-orange/2 rounded-full blur-[120px]" />

            <header className="container mx-auto px-10 py-10 flex justify-between items-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl font-black sadaqa-gradient-text tracking-tighter flex items-center gap-3"
                >
                    <div className="w-8 h-8 bg-souss-orange/20 rounded-lg flex items-center justify-center text-sm shadow-lg">🌙</div>
                    Aura-Sadaqa
                </motion.div>

                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="px-8 py-3 bg-white/5 text-white border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-md">
                        Dashboard
                    </Link>
                    <button
                        onClick={async () => {
                            await authClient.signOut();
                            window.location.reload();
                        }}
                        className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-500/20 transition-all"
                        title="Déconnexion"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                    </button>
                </div>
            </header>

            <main className="container mx-auto px-10 pt-24 pb-32 relative z-10">
                <div className="max-w-5xl mx-auto text-center space-y-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block px-5 py-2 bg-souss-orange/10 text-souss-orange rounded-full text-[10px] font-black tracking-[0.3em] uppercase border border-souss-orange/20"
                    >
                        Casablanca • Ramadan 2026
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-7xl md:text-9xl font-black text-white leading-[0.85] tracking-tighter"
                    >
                        L'intelligence au <br /> service du <span className="sadaqa-gradient-text italic">Don.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium"
                    >
                        Aura-Sadaqa transforme la gestion caritative à Casablanca. Un assistant IA expert,
                        pour une distribution plus rapide, humaine et ciblée.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
                    >
                        <Link href="/dashboard" className="w-full sm:w-auto px-12 py-6 bg-souss-orange text-night-blue rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl shadow-souss-orange/20">
                            Expérimenter Aura
                        </Link>
                        <button className="w-full sm:w-auto px-12 py-6 bg-white/5 text-white border border-white/10 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all backdrop-blur-md">
                            Vision 2026
                        </button>
                    </motion.div>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-48">
                    {[
                        { title: "RAG Local", desc: "Vos listes de familles et besoins indexés instantanément.", icon: "🔍" },
                        { title: "IA Flash", desc: "Réponses en moins de 100ms grâce à Gemini 1.5 Flash.", icon: "⚡" },
                        { title: "Design Souss", desc: "Une interface épurée inspirée par l'héritage marocain.", icon: "🎨" },
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + i * 0.1 }}
                            className="p-10 bg-white/2 backdrop-blur-xl border border-white/5 rounded-[2.5rem] space-y-6 hover:border-souss-orange/20 transition-all group"
                        >
                            <div className="text-4xl glow-orange">{feature.icon}</div>
                            <h3 className="text-xl font-black text-white tracking-tight">{feature.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed font-medium">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </main>

            <footer className="container mx-auto px-10 py-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-500 text-[10px] font-black uppercase tracking-widest relative z-10">
                <div>© 2026 Aura-Sadaqa • Casablanca.</div>
                <div className="flex gap-10">
                    <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
                    <a href="#" className="hover:text-white transition-colors">Zakat Guide</a>
                </div>
            </footer>
        </div>
    );
}
