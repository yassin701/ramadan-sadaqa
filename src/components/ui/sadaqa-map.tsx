"use client";

import { motion } from "framer-motion";
import { useSadaqa } from "@/components/context/sadaqa-context";

export function SadaqaMap() {
    const { selectedNeighborhood, setSelectedNeighborhood } = useSadaqa();

    const hotspots = [
        { name: "Maarif", top: "40%", left: "45%", value: 124 },
        { name: "Sidi Moumen", top: "35%", left: "75%", value: 342 },
        { name: "Hay Hassani", top: "60%", left: "30%", value: 156 },
        { name: "Ain Chock", top: "70%", left: "55%", value: 89 },
        { name: "Anfa", top: "30%", left: "25%", value: 210 },
    ];

    return (
        <div className="relative w-full aspect-[16/10] bg-night-blue/5 rounded-3xl border border-white/5 overflow-hidden group">
            {/* Decorative Wave/Topo lines placeholder */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg width="100%" height="100%">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    Distribution Casablanca R+1
                </h4>
                {selectedNeighborhood && (
                    <button
                        onClick={() => setSelectedNeighborhood(null)}
                        className="text-[9px] font-black text-souss-orange uppercase tracking-widest hover:underline"
                    >
                        Réinitialiser ×
                    </button>
                )}
            </div>

            {hotspots.map((spot, i) => {
                const isActive = selectedNeighborhood === spot.name;
                return (
                    <motion.div
                        key={spot.name}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        style={{ top: spot.top, left: spot.left }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
                        onClick={() => setSelectedNeighborhood(spot.name)}
                    >
                        <div className="relative group/spot">
                            <div className={`absolute -inset-4 rounded-full transition-all duration-500 ${isActive ? "bg-souss-orange/40 scale-125" : "bg-souss-orange/20 animate-ping group-hover/spot:bg-souss-orange/30"}`} />
                            <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 relative z-10 ${isActive ? "bg-white border-souss-orange scale-125 shadow-orange" : "bg-souss-orange border-white shadow-lg"}`} />

                            <div className={`absolute top-6 left-1/2 -translate-x-1/2 transition-all duration-300 whitespace-nowrap bg-night-blue border border-white/10 text-white text-[9px] font-black px-3 py-1.5 rounded-xl shadow-2xl pointer-events-none 
                                ${isActive ? "opacity-100 scale-100" : "opacity-0 scale-90 group-hover/spot:opacity-100 group-hover/spot:scale-100"}`}>
                                {spot.name}: {spot.value} Paniers
                            </div>
                        </div>
                    </motion.div>
                );
            })}

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
