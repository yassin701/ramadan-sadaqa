"use server";

import { db } from "@/lib/db";
import { families } from "@/lib/db/schema";
import { desc, count, sql } from "drizzle-orm";

export async function getFamiliesAction() {
    try {
        const records = await db.select()
            .from(families)
            .orderBy(desc(families.createdAt))
            .limit(10);
        return { success: true, data: records };
    } catch (error) {
        console.error("Fetch Families Error:", error);
        return { success: false, error: "Erreur lors de la récupération des données" };
    }
}

export async function getStatsAction() {
    try {
        const [familyCount] = await db.select({ value: count() }).from(families);

        // Mocking some stats for now as we don't have a full donation table yet
        // But making family count real
        return {
            success: true,
            data: {
                donations: "128.5k DH",
                paniers: familyCount.value.toString(),
                benevoles: "46"
            }
        };
    } catch (error) {
        console.error("Fetch Stats Error:", error);
        return { success: false, error: "Erreur lors du calcul des statistiques" };
    }
}
