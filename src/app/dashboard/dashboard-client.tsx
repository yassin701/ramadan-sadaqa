"use client";

import React from "react";
import { SadaqaProvider } from "@/components/context/sadaqa-context";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface DashboardClientProps {
    chat: React.ReactNode;
    explorer: React.ReactNode;
}

export default function DashboardClient({ chat, explorer }: DashboardClientProps) {
    const router = useRouter();
    const { data: session } = authClient.useSession();

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push("/login");
    };

    return (
        <SadaqaProvider>
            <div className="flex h-screen w-full flex-col overflow-hidden bg-casa-night text-slate-200">
                <header className="flex h-20 items-center justify-between px-10 border-b border-white/5 bg-white/2 backdrop-blur-2xl sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-souss-orange/20 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-souss-orange/10">🌙</div>
                        <h1 className="text-2xl font-black sadaqa-gradient-text tracking-tighter">
                            Aura-Sadaqa
                        </h1>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compte Actif</span>
                            <span className="text-xs font-bold text-white">{session?.user?.name || "Bénévole"}</span>
                        </div>

                        <button
                            onClick={handleSignOut}
                            className="px-6 py-2.5 bg-white/5 text-white border border-white/10 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all flex items-center gap-2 group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100 transition-opacity"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                            Déconnexion
                        </button>
                    </div>
                </header>

                <main className="flex-1 flex overflow-hidden p-8 gap-8">
                    <aside className="w-[450px] flex flex-col glass-card overflow-hidden">
                        {chat}
                    </aside>
                    <div className="flex-1 min-w-0 glass-card overflow-hidden">
                        {explorer}
                    </div>
                </main>
            </div>
        </SadaqaProvider>
    );
}
