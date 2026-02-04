"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadSchema, UploadInput } from "@/lib/validators/form-schema";
import { vectorAction } from "@/actions/vector-action";
import { motion, AnimatePresence } from "framer-motion";
import { StatCard, FamilyRecord } from "@/components/ui/explorer-visuals";
import { SadaqaMap } from "@/components/ui/sadaqa-map";
import { getFamiliesAction, getStatsAction } from "@/actions/family-action";
import { useSadaqa } from "@/components/context/sadaqa-context";

export default function ExplorerPage() {
    const { setFamilyList, selectedNeighborhood } = useSadaqa();
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [view, setView] = useState<"upload" | "analytics" | "beneficiaries">("analytics");
    const [familiesData, setFamiliesData] = useState<any[]>([]);
    const [stats, setStats] = useState({ donations: "128.5k DH", paniers: "0", benevoles: "46" });

    const fetchData = async () => {
        const [familiesRes, statsRes] = await Promise.all([
            getFamiliesAction(),
            getStatsAction()
        ]);

        if (familiesRes.success) {
            const data = familiesRes.data as any[];
            setFamiliesData(data);
            setFamilyList(data);
        }
        if (statsRes.success) setStats(statsRes.data as any);
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<UploadInput>({
        resolver: zodResolver(uploadSchema)
    });

    const selectedFile = watch("file") as any;

    async function onSubmit(data: any) {
        setIsUploading(true);
        setStatus("Analyse du document...");

        const formData = new FormData();
        // Since schema transforms to the first file, data.file is already the File object
        formData.append("file", data.file);

        const result = await vectorAction(formData);

        setIsUploading(false);
        if (result.success) {
            setStatus("Succès ! Document indexé.");
            reset();
            await fetchData(); // Refresh data after upload
            setTimeout(() => setView("analytics"), 1500);
        } else {
            setStatus(result.error || "Erreur d'indexation.");
        }

        setTimeout(() => setStatus(null), 3000);
    }

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Nav Header */}
            <div className="p-8 border-b border-white/5 bg-white/2 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-white tracking-tight">Data Explorer</h2>
                    <p className="text-[10px] text-souss-orange uppercase font-black tracking-widest mt-1">Impact Ramadan 2026</p>
                </div>
                <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
                    <button
                        onClick={() => setView("analytics")}
                        className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${view === "analytics" ? "bg-souss-orange text-night-blue shadow-lg" : "text-slate-400 hover:text-white"}`}
                    >
                        Explorer
                    </button>
                    <button
                        onClick={() => setView("upload")}
                        className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${view === "upload" ? "bg-souss-orange text-night-blue shadow-lg" : "text-slate-400 hover:text-white"}`}
                    >
                        Import
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
                <AnimatePresence mode="wait">
                    {view === "analytics" ? (
                        <motion.div
                            key="analytics"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="space-y-10"
                        >
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard title="Donations" value={stats.donations} sub="+18% vs 2025" color="text-white" />
                                <StatCard title="Paniers" value={stats.paniers} sub="Objectif: 2,500" color="text-souss-orange" />
                                <StatCard title="Bénévoles" value={stats.benevoles} sub="Active Now" color="text-white" />
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                                {/* Map View */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] px-2">Répartition Géographique</h3>
                                    <SadaqaMap />
                                </div>

                                {/* Registry View */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Derniers Bénéficiaires</h3>
                                        <button
                                            onClick={() => setView("beneficiaries")}
                                            className="text-[10px] font-black text-souss-orange hover:underline uppercase tracking-widest"
                                        >
                                            Tout voir
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {familiesData.filter(f => !selectedNeighborhood || f.neighborhood === selectedNeighborhood).length > 0 ? (
                                            familiesData
                                                .filter(f => !selectedNeighborhood || f.neighborhood === selectedNeighborhood)
                                                .map((f) => (
                                                    <FamilyRecord
                                                        key={f.id}
                                                        name={f.name}
                                                        neighborhood={f.neighborhood}
                                                        status={f.status.toLowerCase()}
                                                    />
                                                ))
                                        ) : (
                                            <div className="p-10 text-center bg-white/2 rounded-3xl border border-white/5">
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                                    {selectedNeighborhood ? `Aucune famille à ${selectedNeighborhood}` : "Aucune donnée importée"}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : view === "beneficiaries" ? (
                        <motion.div
                            key="beneficiaries"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setView("analytics")}
                                    className="p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="m15 18-6-6 6-6" /></svg>
                                </button>
                                <div>
                                    <h3 className="text-2xl font-black text-white tracking-tight">Registre Complet</h3>
                                    <p className="text-[10px] text-souss-orange uppercase font-black tracking-widest leading-none mt-1">
                                        {familiesData.length} Familles répertoriées
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {familiesData.length > 0 ? (
                                    familiesData.map((f) => (
                                        <div key={f.id} className="glass-card p-6 border border-white/5 hover:border-souss-orange/20 transition-all group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-lg">🏠</div>
                                                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${f.status === "Prioritaire" ? "bg-red-500/10 text-red-400 border border-red-500/10" : "bg-green-500/10 text-green-400 border border-green-500/10"
                                                    }`}>
                                                    {f.status}
                                                </span>
                                            </div>
                                            <h4 className="text-white font-black tracking-tight mb-1">{f.name}</h4>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                                <span>{f.neighborhood}</span>
                                                <span className="opacity-20">•</span>
                                                <span>Aide alimentaire</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full p-20 text-center bg-white/2 rounded-[3rem] border border-white/5">
                                        <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Aucune donnée disponible</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-2xl mx-auto space-y-10 pt-10"
                        >
                            <div className="text-center space-y-3">
                                <h3 className="text-3xl font-black text-white tracking-tighter">Nourrir l'Intelligence</h3>
                                <p className="text-sm text-slate-400 font-medium">Glissez vos listes de distribution (PDF ou Excel) pour indexation immédiate.</p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className={`relative border-2 border-dashed rounded-[2.5rem] p-16 transition-all group backdrop-blur-xl bg-white/2
                                    ${errors.file ? "border-red-500/50 bg-red-500/5" : "border-white/10 hover:border-souss-orange/40"}
                                    ${selectedFile ? "border-souss-orange/40 bg-souss-orange/5" : ""}`}>
                                    <input type="file" accept=".pdf, .xlsx, .xls, .csv" {...register("file")} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                    <div className="text-center space-y-6">
                                        <div className="w-20 h-20 bg-souss-orange/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                            {selectedFile ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-souss-orange glow-orange"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-souss-orange glow-orange"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-lg font-black text-white tracking-tight">
                                                {selectedFile ? selectedFile.name : "Déposer le Registre (PDF/Excel)"}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                                                {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} Mo` : "Format attendu: PDF, XLSX, XLS, CSV (Max 5Mo)"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {errors.file && <p className="text-xs text-red-500 text-center font-black uppercase tracking-widest">{errors.file.message as string}</p>}

                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className="w-full py-6 bg-souss-orange text-night-blue rounded-3xl hover:scale-[1.01] active:scale-95 transition-all font-black text-xs uppercase tracking-[0.3em] disabled:opacity-50 shadow-2xl shadow-souss-orange/20"
                                >
                                    {isUploading ? "Indexation en cours..." : "Lancer l'Ingestion RAG"}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* In-app Notifications */}
            <AnimatePresence>
                {status && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className={`fixed bottom-12 right-12 p-6 rounded-3xl border shadow-2xl z-50 backdrop-blur-2xl
                            ${status.includes("Succès") ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-souss-orange/10 border-souss-orange/20 text-souss-orange"}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-3 h-3 rounded-full bg-current animate-pulse" />
                            <span className="text-[11px] font-black uppercase tracking-widest">{status}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
