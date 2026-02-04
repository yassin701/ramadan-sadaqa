"use server";

import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PDFParse } from "pdf-parse";
import * as XLSX from "xlsx";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function vectorAction(formData: FormData) {
    const file = formData.get("file") as File;

    if (!file) {
        return { error: "Aucun fichier fourni" };
    }

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    try {
        let chunks: string[] = [];
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        if (file.type === "application/pdf") {
            // Extraction du texte PDF
            const path = await import("path");
            const { pathToFileURL } = await import("url");
            const workerPath = path.resolve("node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs");
            (PDFParse as any).setWorker(pathToFileURL(workerPath).toString());

            const parser = new PDFParse({ data: buffer });
            const data = await parser.getText();
            const text = data.text;

            if (!text || text.trim().length === 0) {
                return { error: "Le PDF est vide ou illisible." };
            }

            // Chunking PDF (Séparation par paragraphes)
            chunks = text.split(/\n\s*\n/).filter((chunk: string) => chunk.trim().length > 50);
        } else if (
            file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            file.type === "application/vnd.ms-excel" ||
            file.type === "text/csv"
        ) {
            // Extraction Excel / CSV
            const workbook = XLSX.read(buffer, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

            if (jsonData.length === 0) {
                return { error: "Le fichier Excel est vide." };
            }

            // Semantic Row Extraction: Transform each row into a descriptive sentence
            chunks = jsonData.map((row) => {
                const rowContent = Object.entries(row)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(", ");
                return `Enregistrement du registre: ${rowContent}`;
            });
        } else {
            return { error: "Format de fichier non supporté." };
        }

        if (chunks.length === 0) {
            return { error: "Aucun segment n'a pu être extrait du document." };
        }

        // 3. Embeddings & Metadata Extraction with Gemini
        const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const metaModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const index = pc.index(process.env.PINECONE_INDEX_NAME || "casa-ramadan-2026");

        // Strategy: Extract GLOBAL metadata once to save quota
        // For Excel, we use the first few rows as context
        const docSummary = chunks.slice(0, 10).join("\n").substring(0, 3000);
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

        // Process in batches or limit to avoid long wait (e.g., max 50 rows for testing)
        // Taking first 100 chunks if it's too big
        const limitedChunks = chunks.slice(0, 100);

        for (const chunk of limitedChunks) {
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

        return { success: true, message: `${limitedChunks.length} segments indexés avec succès.` };
    } catch (error: any) {
        console.error("Vector Action Error:", error);
        const errorMessage = error.message || "Erreur inconnue";
        return { error: `Échec de l'indexation: ${errorMessage}. Vérifiez vos clés API.` };
    }
}

