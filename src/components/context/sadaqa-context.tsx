"use client";

import React, { createContext, useContext, useState } from "react";

interface SadaqaContextType {
    isThinking: boolean;
    setIsThinking: (val: boolean) => void;
    activeFamily: string | null;
    setActiveFamily: (id: string | null) => void;
}

const SadaqaContext = createContext<SadaqaContextType | undefined>(undefined);

export function SadaqaProvider({ children }: { children: React.ReactNode }) {
    const [isThinking, setIsThinking] = useState(false);
    const [activeFamily, setActiveFamily] = useState<string | null>(null);

    return (
        <SadaqaContext.Provider value={{ isThinking, setIsThinking, activeFamily, setActiveFamily }}>
            {children}
        </SadaqaContext.Provider>
    );
}

export function useSadaqa() {
    const context = useContext(SadaqaContext);
    if (!context) throw new Error("useSadaqa must be used within SadaqaProvider");
    return context;
}
