"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });

export async function chatAction(formData: FormData) {
    const message = formData.get("message") as string;
    if (!message) return { error: "Message vide" };

    try {
        const index = pc.index(process.env.PINECONE_INDEX_NAME || "casa-ramadan-2026");

        // 1. Generer l'embedding de la question
        const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const embedResult = await embedModel.embedContent(message);
        const queryEmbedding = embedResult.embedding.values;

        // 2. Recherche Vectorielle dans Pinecone
        const queryResponse = await index.query({
            vector: queryEmbedding,
            topK: 3,
            includeMetadata: true,
        });

        const context = queryResponse.matches
            .map(match => (match.metadata as any)?.text)
            .filter(Boolean)
            .join("\n\n---\n\n");

        // 3. Generation avec Gemini Flash
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Tu es Aura-Sadaqa, l'assistant expert des associations caritatives de Casablanca.
    Ta mission est d'aider les bénévoles et donateurs en te basant sur le contexte récupéré des documents de l'association.
    
    Réponds en français de manière chaleureuse, précise et respectueuse des valeurs du Ramadan.
    Si le contexte ne contient pas l'information, réponds en fonction de tes connaissances générales sur la Zakat et la Sadaqa, mais précise que ce n'est pas spécifié dans les fichiers internes.

    Contexte récupéré :
    ${context || "Aucun document spécifique trouvé."}

    Question : ${message}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;

        return { text: response.text() };
    } catch (error) {
        console.error("Chat Action Error:", error);
        return { error: "Erreur lors de la génération. Vérifiez vos clés API." };
    }
}
