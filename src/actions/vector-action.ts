"use server";

import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PDFParse } from "pdf-parse";
import { db } from "@/lib/db";
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
        // Fix for "Cannot find module '...pdf.worker.mjs'" in Server Actions
        // We point it to the actual file in node_modules using an absolute path
        const path = await import("path");
        const { pathToFileURL } = await import("url");
        const workerPath = path.resolve("node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs");
        (PDFParse as any).setWorker(pathToFileURL(workerPath).toString());

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
        const metaModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // More stable quota
        const index = pc.index(process.env.PINECONE_INDEX_NAME || "casa-ramadan-2026");

        // Strategy: Extract GLOBAL metadata once to save quota
        const docSummary = text.substring(0, 3000); // Use first 3k chars for context
        const metaPrompt = `Analyse ce document d'une association caritative à Casablanca.
        Extrais ces informations globales pour le document entier:
        1. Le quartier (ex: Hay Hassani, Maarif, Sidi Moumen).
        2. Le type de besoin principal (ex: Panier Alimentaire, Zakat).
        3. Le niveau de priorité global (Prioritaire, Standard, Urgent).

        Texte: "${docSummary}"

        Réponds UNIQUEMENT en JSON: {"neighborhood": "...", "need": "...", "status": "..."}`;

        let globalMetadata = { neighborhood: "Casablanca", need: "Sadaqa", status: "Standard" };
        try {
            const metaResult = await metaModel.generateContent(metaPrompt);
            const metaText = metaResult.response.text();
            globalMetadata = JSON.parse(metaText.replace(/```json|```/g, ""));
        } catch (e) {
            console.warn("Using default metadata due to API limit or error.");
        }

        for (const chunk of chunks) {
            const result = await embedModel.embedContent({
                content: { parts: [{ text: chunk }] },
                taskType: "RETRIEVAL_DOCUMENT",
                title: file.name,
                outputDimensionality: 768
            } as any);
            const embedding = result.embedding.values;

            // 4. Upsert vers Pinecone with Rich Metadata
            await index.upsert({
                records: [{
                    id: `doc-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                    values: embedding,
                    metadata: {
                        name: file.name,
                        text: chunk as string,
                        source: file.name,
                        category: "famille",
                        ...globalMetadata
                    }
                }]
            });
        }

        return { success: true, message: `${chunks.length} segments indexés avec succès.` };
    } catch (error: any) {
        console.error("Vector Action Error:", error);
        const errorMessage = error.message || "Erreur inconnue";
        return { error: `Échec de l'indexation: ${errorMessage}. Vérifiez vos clés API.` };
    }
}
