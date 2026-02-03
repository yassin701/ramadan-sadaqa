"use client";

import React, { createContext, useContext, useState } from "react";

interface SadaqaContextType {
    isThinking: boolean;
    setIsThinking: (val: boolean) => void;
    activeFamily: any | null;
    setActiveFamily: (family: any | null) => void;
    selectedNeighborhood: string | null;
    setSelectedNeighborhood: (n: string | null) => void;
    familyList: any[];
    setFamilyList: (list: any[]) => void;
}

const SadaqaContext = createContext<SadaqaContextType | undefined>(undefined);

export function SadaqaProvider({ children }: { children: React.ReactNode }) {
    const [isThinking, setIsThinking] = useState(false);
    const [activeFamily, setActiveFamily] = useState<any | null>(null);
    const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
    const [familyList, setFamilyList] = useState<any[]>([]);

    return (
        <SadaqaContext.Provider value={{
            isThinking, setIsThinking,
            activeFamily, setActiveFamily,
            selectedNeighborhood, setSelectedNeighborhood,
            familyList, setFamilyList
        }}>
            {children}
        </SadaqaContext.Provider>
    );
}

export function useSadaqa() {
    const context = useContext(SadaqaContext);
    if (!context) throw new Error("useSadaqa must be used within SadaqaProvider");
    return context;
}
