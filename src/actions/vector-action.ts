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

    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
    
        if (!session) {
            return { error: "Veuillez vous connecter pour importer des données." };
        }

        let chunks: string[] = [];
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
    
        if (file.type === "application/pdf") {
            // Extraction du texte PDF
            try {
                const data = await (PDFParse as any)(buffer);
                const text = data.text;

                if (!text || text.trim().length === 0) {
                    return { error: "Le PDF est vide ou illisible." };
                }
                chunks = text.split(/\n\s*\n/).filter((chunk: string) => chunk.trim().length > 50);
            } catch (pdfErr) {
                console.error("PDF Parsing Error:", pdfErr);
                return { error: "Erreur lors de la lecture du PDF. Est-il protégé par mot de passe ?" };
            }
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

            chunks = jsonData.map((row) => {
                const rowContent = Object.entries(row)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(", ");
                return `Registre: ${rowContent}`;
            });
        }

        if (chunks.length === 0) {
            return { error: "Aucun segment n'a pu être extrait." };
        }

        const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const metaModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const index = pc.index(process.env.PINECONE_INDEX_NAME || "casa-ramadan-2026");

        // Global Metadata Extraction
        const docSummary = chunks.slice(0, 10).join("\n").substring(0, 3000);
        const metaPrompt = `Analyse ce document d'association. 
        Extrais: quartier, besoin_principal, priorite. 
        Texte: "${docSummary}"
        Réponds UNIQUEMENT en JSON: {"neighborhood": "...", "need": "...", "status": "..."}`;

        let globalMetadata = { neighborhood: "Casablanca", need: "Sadaqa", status: "Standard" };
        try {
            const metaResult = await metaModel.generateContent(metaPrompt);
            const metaText = metaResult.response.text();
            const cleanedJson = metaText.replace(/```json|```/g, "").trim();
            globalMetadata = JSON.parse(cleanedJson);
        } catch (e) {
            console.warn("Metadata extraction failed, using defaults.");
        }

        const limitedChunks = chunks.slice(0, 100);
        const vectors = [];

        for (const chunk of limitedChunks) {
            const res = await embedModel.embedContent({
                content: { parts: [{ text: chunk }] },
                taskType: "RETRIEVAL_DOCUMENT",
                outputDimensionality: 768
            } as any);

            vectors.push({
                id: `doc-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                values: res.embedding.values,
                metadata: {
                    text: chunk,
                    category: "famille",
                    source: file.name,
                    ...globalMetadata
                }
            });
        }

        // Correct Pinecone v7.0.0 syntax for this project
        await index.upsert({ records: vectors as any });

        return { success: true, message: `${vectors.length} segments indexés.` };
    } catch (error: any) {
        console.error("Vector Action Error:", error);
        return { error: `Échec: ${error.message}` };
    }
}


