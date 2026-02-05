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

    (async () => {
        try {
            console.log("Chat Action Started for message:", message);
            const session = await auth.api.getSession({
                headers: await headers(),
            });

            if (!session) {
                console.warn("Chat Action: No session found");
                stream.error("Inactif : Veuillez vous connecter.");
                stream.done();
                return;
            }

            const indexName = process.env.PINECONE_INDEX_NAME || "casa-ramadan-2026";
            const index = pc.index(indexName);

            // 1. Generate Query Embedding
            console.log("Generating embedding...");
            const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
            const embedResult = await embedModel.embedContent({
                content: { parts: [{ text: message }] },
                taskType: "RETRIEVAL_QUERY",
                outputDimensionality: 768
            } as any);
            const queryVector = embedResult.embedding.values;

            // 2. Query Pinecone
            console.log("Querying Pinecone index:", indexName);
            const filter: any = { category: "famille" };
            if (currentContext?.neighborhood) {
                // Support both keys just in case
                filter.neighborhood = currentContext.neighborhood;
            }

            const queryResponse = await index.query({
                vector: queryVector,
                topK: 5,
                includeMetadata: true,
                filter
            });

            console.log(`Found ${queryResponse.matches.length} matches in Pinecone`);

            const contextText = queryResponse.matches
                .map(m => (m.metadata as any)?.text)
                .filter(Boolean)
                .join("\n\n---\n\n");

            // 3. Inject context into Gemini
            console.log("Calling Gemini for completion...");
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                systemInstruction: `Tu es Aura-Sadaqa, l'assistant solidaire d'une association caritative à Casablanca.
                Ton ton est fraternel, humble et respectueux des traditions du Ramadan au Maroc.
                Utilise des expressions comme "Salam", "Baraka Allahu fik", "Ramadan Karim".
                
                RÈGLES STRICTES :
                1. Utilise UNIQUEMENT le contexte fourni pour répondre aux questions précises sur les familles.
                2. Si l'information n'est pas dans le contexte, aide l'utilisateur avec tes connaissances générales sur la gestion caritative et le rite Malékite au Maroc, mais précise que ce n'est pas dans les fichiers.
                3. Ne mentionne jamais Pinecone ou l'IA, tu es un membre de l'équipe.
                4. Réponds en Français, avec des touches subtiles de Darija (si approprié).`
            });

            const fullPrompt = `CONTEXTE DES DOCUMENTS :\n${contextText || "Aucune donnée spécifique trouvée dans le registre pour ce quartier."}\n\nQUESTION DU BÉNÉVOLE : ${message}`;

            const result = await model.generateContentStream(fullPrompt);

            // 4. Stream response word by word
            for await (const chunk of result.stream) {
                const text = chunk.text();
                stream.update(text);
            }

            console.log("Chat Action: Stream completed successfully");
            stream.done();
        } catch (error: any) {
            console.error("Chat Action Error Details:", error);
            stream.error(`Échec: ${error.message || "Erreur inconnue"}`);
            stream.done();
        }
    })();

    return { output: stream.value };
}

