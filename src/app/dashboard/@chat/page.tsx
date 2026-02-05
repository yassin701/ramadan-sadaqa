"use client";

import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useSadaqa } from "@/components/context/sadaqa-context";
import { chatSchema, ChatInput } from "@/lib/validators/form-schema";
import { chatAction } from "@/actions/chat-action";
import { readStreamableValue } from "@ai-sdk/rsc";

export default function ChatPage() {
    const { isThinking, setIsThinking, selectedNeighborhood } = useSadaqa();
    const [messages, setMessages] = useState<{ id: string; role: "user" | "ai"; text: string }[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const { register, handleSubmit, reset } = useForm<ChatInput>({
        resolver: zodResolver(chatSchema)
    });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isThinking]);

    async function onSubmit(data: ChatInput) {
        const userMsg = data.message;
        setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", text: userMsg }]);
        reset();
        setIsThinking(true);

        try {
            const { output } = await chatAction(userMsg, {
                neighborhood: selectedNeighborhood
            });

            const aiMsgId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: aiMsgId, role: "ai", text: "" }]);

            let fullContent = "";
            for await (const delta of readStreamableValue(output)) {
                if (delta) {
                    fullContent += delta;
                    setMessages(prev => {
                        const updated = [...prev];
                        const idx = updated.findIndex(m => m.id === aiMsgId);
                        if (idx !== -1) updated[idx].text = fullContent;
                        return updated;
                    });
                }
            }
        } catch (error: any) {
            const errorMsg = error?.message || "Erreur inconnue";
            const statusCode = error?.status || error?.statusCode || "";
            const detailedError = statusCode
                ? `Salam, une erreur s'est produite (${statusCode}): ${errorMsg}`
                : `Salam, une erreur s'est produite: ${errorMsg}`;

            console.error("Chat Error Details:", error);

            setMessages(prev => [
                ...prev,
                { id: Date.now().toString(), role: "ai", text: detailedError }
            ]);
        } finally {
            setIsThinking(false);
        }
    }

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Header */}
            <div className="p-8 border-b border-white/5 bg-white/2 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-white tracking-tight">AI Assistant</h2>
                    <p className="text-[10px] text-souss-orange uppercase font-black tracking-widest mt-1">Intelligence Capillaire</p>
                </div>
                {isThinking ? (
                    <motion.div
                        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="w-12 h-12 flex items-center justify-center bg-souss-orange/20 rounded-2xl shadow-lg shadow-souss-orange/20"
                    >
                        <span className="text-2xl glow-orange">🌙</span>
                    </motion.div>
                ) : (
                    <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-2xl opacity-50">🌙</span>
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                <AnimatePresence>
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center text-center space-y-6 px-12"
                        >
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-5xl shadow-inner border border-white/5">🌙</div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-white tracking-tighter">Ahlan bikum</h3>
                                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                    Je suis Aura-Sadaqa. Comment puis-je vous aider dans votre mission aujourd'hui ?
                                </p>
                            </div>
                        </motion.div>
                    )}
                    {messages.map((m) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 15, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`max-w-[90%] p-6 rounded-3xl text-[13px] font-semibold leading-relaxed shadow-xl border ${m.role === "user"
                                ? "bg-linear-to-br from-night-blue to-[#050b14] text-white border-white/10 rounded-tr-none"
                                : "bg-white/5 border-white/5 text-slate-200 rounded-tl-none backdrop-blur-md"
                                }`}>
                                {m.text}
                            </div>
                        </motion.div>
                    ))}
                    {isThinking && messages.length > 0 && messages[messages.length - 1].text === "" && (
                        <div className="flex justify-start">
                            <div className="bg-white/5 border border-white/5 p-6 rounded-3xl rounded-tl-none flex space-x-2">
                                <span className="w-2 h-2 bg-souss-orange rounded-full animate-bounce" />
                                <span className="w-2 h-2 bg-souss-orange rounded-full animate-bounce [animation-delay:0.2s]" />
                                <span className="w-2 h-2 bg-souss-orange rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 bg-transparent">
                <div className="relative group">
                    <input
                        {...register("message")}
                        autoComplete="off"
                        className="w-full pl-8 pr-28 py-6 bg-white/5 rounded-3xl border border-white/10 focus:border-souss-orange/50 focus:ring-0 transition-all font-semibold text-sm placeholder:text-slate-500 backdrop-blur-lg"
                        placeholder="Écrivez votre question ici..."
                    />
                    <button
                        type="submit"
                        disabled={isThinking}
                        className="absolute right-3 top-3 bottom-3 px-8 bg-souss-orange text-night-blue rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-souss-orange/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isThinking ? "..." : "Send"}
                    </button>
                </div>
            </form>
        </div>
    );
}
