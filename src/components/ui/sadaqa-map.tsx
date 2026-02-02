"use client";

import { motion } from "framer-motion";

export function SadaqaMap() {
    const hotspots = [
        { name: "Maarif", top: "40%", left: "45%", value: 124 },
        { name: "Sidi Moumen", top: "35%", left: "75%", value: 342 },
        { name: "Hay Hassani", top: "60%", left: "30%", value: 156 },
        { name: "Ain Chock", top: "70%", left: "55%", value: 89 },
        { name: "Anfa", top: "30%", left: "25%", value: 210 },
    ];

    return (
        <div className="relative w-full aspect-[16/10] bg-night-blue/5 rounded-3xl border border-slate-200 overflow-hidden group">
            {/* Decorative Wave/Topo lines placeholder */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg width="100%" height="100%">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            <div className="absolute top-6 left-6 z-10">
                <h4 className="text-[10px] font-black text-night-blue uppercase tracking-widest bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-100">
                    Distribution Casablanca R+1
                </h4>
            </div>

            {hotspots.map((spot, i) => (
                <motion.div
                    key={spot.name}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    style={{ top: spot.top, left: spot.left }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-help"
                >
                    <div className="relative">
                        <div className="absolute -inset-4 bg-souss-orange/20 rounded-full animate-ping [animation-duration:3s]" />
                        <div className="w-3 h-3 bg-souss-orange rounded-full border-2 border-white shadow-lg relative z-10" />

                        <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-night-blue text-white text-[9px] font-bold px-2 py-1 rounded shadow-xl pointer-events-none">
                            {spot.name}: {spot.value} Paniers
                        </div>
                    </div>
                </motion.div>
            ))}

            {/* Decorative Compass or Legend */}
            <div className="absolute bottom-6 right-6">
                <div className="flex flex-col gap-1 text-[9px] font-bold text-slate-400">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-souss-orange" />
                        <span>Zone Active</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-50">
                        <div className="w-2 h-2 rounded-full bg-slate-200" />
                        <span>Zone Planifiée</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
