"use server";

import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PDFParse } from "pdf-parse";
import { db } from "@/lib/db";
import { families } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function vectorAction(formData: FormData) {
    const file = formData.get("file") as File;

    if (!file || file.type !== "application/pdf") {
        return { error: "Fichier PDF invalide" };
    }

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    try {
        // 1. Extraction du texte PDF
        const bytes = await file.arrayBuffer();
        const parser = new PDFParse({ data: Buffer.from(bytes) });
        const data = await parser.getText();
        const text = data.text;

        if (!text || text.trim().length === 0) {
            return { error: "Le PDF est vide ou illisible." };
        }

        // 2. Chunking (Séparation par paragraphes)
        const chunks = text.split(/\n\s*\n/).filter((chunk: string) => chunk.trim().length > 50);

        // 3. Embeddings & Metadata Extraction with Gemini
        const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const metaModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const index = pc.index(process.env.PINECONE_INDEX_NAME || "casa-ramadan-2026");

        for (const chunk of chunks) {
            // Extract metadata using LLM
            const metaPrompt = `Analyse ce fragment de document d'une association caritative à Casablanca.
            Extrais:
            1. Le quartier (ex: Hay Hassani, Maarif, Sidi Moumen). Si non mentionné, réponds "Casablanca - Autre".
            2. Le type de besoin (ex: Panier Alimentaire, Zakat, Médicaments).
            3. Le niveau de priorité (Prioritaire, Standard, Urgent).

            Fragment: "${chunk}"

            Réponds UNIQUEMENT en JSON format: {"quartier": "...", "besoin": "...", "priorite": "..."}`;

            const metaResult = await metaModel.generateContent(metaPrompt);
            const metaText = metaResult.response.text();
            let metadata = { quartier: "Casablanca", besoin: "Sadaqa", priorite: "Standard" };

            try {
                metadata = JSON.parse(metaText.replace(/```json|```/g, ""));
            } catch (e) {
                console.warn("Failed to parse metadata JSON, using defaults.");
            }

            const result = await embedModel.embedContent(chunk);
            const embedding = result.embedding.values;

            // 4. Upsert vers Pinecone with Rich Metadata
            await index.upsert({
                records: [{
                    id: `doc-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                    values: embedding,
                    metadata: {
                        text: chunk as string,
                        source: file.name,
                        category: "famille",
                        ...metadata
                    }
                }]
            });

            // 5. Insert into PostgreSQL (Structured Data)
            // Note: In a real app, we might want to extract a specific family name or ID.
            // For now, we'll store the record metadata.
            try {
                // Heuristic: If we can't find a specific name, use the source filename as identifier
                await db.insert(families).values({
                    id: `fam-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                    name: `Famille - ${file.name.replace(".pdf", "")}`,
                    neighborhood: metadata.quartier,
                    aidType: metadata.besoin,
                    priority: metadata.priorite,
                    status: "En attente",
                    notes: `Extrait de: ${file.name}`,
                    addedBy: session?.user?.id,
                });
            } catch (dbErr) {
                console.error("Database Insert Error:", dbErr);
                // Continue indexing even if DB insert fails
            }
        }

        return { success: true, message: `${chunks.length} segments indexés avec succès.` };
    } catch (error) {
        console.error("Vector Action Error:", error);
        return { error: "Échec de l'indexation. Vérifiez vos clés API." };
    }
}
