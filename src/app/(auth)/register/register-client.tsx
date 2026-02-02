"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { authSchema, AuthInput } from "@/lib/validators/form-schema";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterClient() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm<AuthInput>({
        resolver: zodResolver(authSchema)
    });

    async function onSubmit(data: AuthInput) {
        setLoading(true);
        setError(null);
        const { error } = await authClient.signUp.email({
            email: data.email,
            password: data.password,
            name: data.name || "",
        });

        if (error) {
            setError(error.message || "Une erreur est survenue");
            setLoading(false);
        } else {
            router.push("/");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-night-blue relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-souss-orange/5 rounded-full blur-[120px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-souss-orange/2 rounded-full blur-[120px] -ml-64 -mb-64" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md p-10 glass-card space-y-8 relative z-10"
            >
                <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-souss-orange/20 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-xl shadow-souss-orange/10 mb-2">🏮</div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">Ahlan bik 🏮</h1>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Créer un Accès Aura-Sadaqa</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Nom complet</label>
                            <input
                                {...register("name")}
                                className="w-full px-6 py-5 bg-white/5 rounded-2xl border border-white/5 focus:border-souss-orange/50 focus:ring-0 transition-all text-sm font-semibold text-white placeholder:text-slate-600"
                                placeholder="Yassine El ..."
                            />
                            {errors.name && <p className="text-[10px] text-red-500 font-bold pl-1 uppercase tracking-widest">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">E-mail de contact</label>
                            <input
                                {...register("email")}
                                className="w-full px-6 py-5 bg-white/5 rounded-2xl border border-white/5 focus:border-souss-orange/50 focus:ring-0 transition-all text-sm font-semibold text-white placeholder:text-slate-600"
                                placeholder="nom@exemple.com"
                            />
                            {errors.email && <p className="text-[10px] text-red-500 font-bold pl-1 uppercase tracking-widest">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Clé d'accès</label>
                            <input
                                type="password"
                                {...register("password")}
                                className="w-full px-6 py-5 bg-white/5 rounded-2xl border border-white/5 focus:border-souss-orange/50 focus:ring-0 transition-all text-sm font-semibold text-white placeholder:text-slate-600"
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="text-[10px] text-red-500 font-bold pl-1 uppercase tracking-widest">{errors.password.message}</p>}
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black text-red-500 uppercase tracking-widest text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-6 bg-souss-orange text-night-blue rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-souss-orange/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? "Création..." : "S'enregistrer"}
                    </button>
                </form>

                <p className="text-center text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                    Déjà un accès ?{" "}
                    <Link href="/login" className="text-souss-orange hover:underline decoration-2 underline-offset-4">
                        Se connecter
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
