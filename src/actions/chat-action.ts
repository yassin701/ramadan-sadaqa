"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createStreamableValue } from "@ai-sdk/rsc";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });

/**
 * Chat Action with RAG & Streaming
 */
export async function chatAction(message: string, currentContext?: any) {
    const stream = createStreamableValue("");
    const requestHeaders = await headers();

    (async () => {
        try {
            const session = await auth.api.getSession({
                headers: requestHeaders,
            });

            if (!session) {
                stream.error("Inactif : Veuillez vous connecter.");
                stream.done();
                return;
            }

            const indexName = process.env.PINECONE_INDEX_NAME || "casa-ramadan-2026";
            const index = pc.index(indexName);

            // 1. Generate Query Embedding
            const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
            const embedResult = await embedModel.embedContent(message);
            const queryVector = embedResult.embedding.values;

            // 2. Query Pinecone
            const filter: any = {
                $or: [
                    { category: "famille" },
                    { category: { $exists: false } }
                ]
            };

            if (currentContext?.neighborhood) {
                filter.neighborhood = currentContext.neighborhood;
            }

            const queryResponse = await index.query({
                vector: queryVector,
                topK: 5,
                includeMetadata: true,
                filter
            });

            const contextText = queryResponse.matches
                .map(m => (m.metadata as any)?.text)
                .filter(Boolean)
                .join("\n\n---\n\n");

            // 3. Inject context into Gemini
            const model = genAI.getGenerativeModel({
                model: "gemini-flash-latest",
                systemInstruction: `Tu es Aura-Sadaqa, l’assistant solidaire d’une association caritative basée à Casablanca, chargé d’accompagner les citoyens dans leurs actions d’entraide.

Ton ton est fraternel, humble et respectueux, en accord avec les valeurs marocaines et l’esprit du Ramadan.

Tu utilises des expressions chaleureuses et appropriées comme “Salam”, “Baraka Allahu fik”, “Ramadan Karim” lorsque le contexte s’y prête.`
            });

            const fullPrompt = `CONTEXTE :\n${contextText || "Aucune donnée disponible dans le registre pour ce quartier."}\n\nQUESTION : ${message}`;

            const result = await model.generateContentStream(fullPrompt);

            // 4. Stream response word by word
            for await (const chunk of result.stream) {
                const text = chunk.text();
                stream.update(text);
            }

            stream.done();
        } catch (error: any) {
            console.error("Chat Action Error:", error);
            stream.error(`Désolé, une erreur technique est survenue: ${error.message || "Connexion perdue"}`);
            stream.done();
        }
    })();

    return { output: stream.value };
}

