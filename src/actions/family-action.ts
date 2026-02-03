"use server";

import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });

export async function getFamiliesAction() {
    try {
        const index = pc.index(process.env.PINECONE_INDEX_NAME || "casa-ramadan-2026");

        // Fetching "all" records from Pinecone is not direct, so we use a dummy query or list
        // For a true "explorer", we fetch the latest vectors
        const queryResponse = await index.query({
            vector: Array(768).fill(0),
            topK: 100, // Increase limit
            includeMetadata: true,
            filter: {
                $or: [
                    { type: "family" },
                    { category: "famille" }
                ]
            }
        });

        const records = queryResponse.matches.map(match => {
            const meta = match.metadata as any;
            return {
                id: match.id,
                name: meta.name || meta.source || "Inconnu",
                neighborhood: meta.neighborhood || meta.quartier || "Casablanca",
                status: meta.status || meta.priorite || "Standard",
                ...meta
            };
        });

        return { success: true, data: records };
    } catch (error) {
        console.error("Fetch Families Error:", error);
        return { success: false, error: "Erreur lors de la récupération des données" };
    }
}

export async function getStatsAction() {
    try {
        const index = pc.index(process.env.PINECONE_INDEX_NAME || "casa-ramadan-2026");
        const stats = await index.describeIndexStats();
        const familyCount = stats.totalRecordCount || 0;

        return {
            success: true,
            data: {
                donations: "128.5k DH",
                paniers: familyCount.toString(),
                benevoles: "46"
            }
        };
    } catch (error) {
        console.error("Fetch Stats Error:", error);
        return { success: false, error: "Erreur lors du calcul des statistiques" };
    }
}
