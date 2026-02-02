"use client";

import { motion } from "framer-motion";
import { useSadaqa } from "@/components/context/sadaqa-context";

export function SadaqaPulse() {
    const { isThinking } = useSadaqa();

    if (!isThinking) return null;

    return (
        <div className="flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/5 rounded-3xl w-fit backdrop-blur-md">
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 1, 0.6],
                    rotate: [0, 15, -15, 0],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="text-souss-orange glow-orange"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
            </motion.div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Assistant en réflexion...</span>
        </div>
    );
}
