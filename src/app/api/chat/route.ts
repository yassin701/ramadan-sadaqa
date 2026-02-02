import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: req.headers,
    });

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { message } = await req.json();
    if (!message) return new Response("Message missing", { status: 400 });

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });

    try {
        const index = pc.index(process.env.PINECONE_INDEX_NAME || "casa-ramadan-2026");

        // 1. Generate Query Embedding
        const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const embedResult = await embedModel.embedContent(message);
        const queryEmbedding = embedResult.embedding.values;

        // 2. Vector Search
        const queryResponse = await index.query({
            vector: queryEmbedding,
            topK: 4,
            includeMetadata: true,
        });

        const context = queryResponse.matches
            .map(match => (match.metadata as any)?.text)
            .filter(Boolean)
            .join("\n\n---\n\n");

        // 3. Streaming Generation
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Tu es Aura-Sadaqa, l'assistant expert des associations caritatives de Casablanca.
        Ta mission est d'aider les bénévoles et donateurs en te basant sur le contexte récupéré des documents internes de l'association.
        
        Réponds en français de manière chaleureuse, précise et respectueuse des valeurs du Ramadan. 
        Utilise un ton professionnel mais fraternel, typique des interactions à Casablanca.
        Si le contexte ne contient pas l'information, réponds en fonction de tes connaissances générales sur la Zakat et la Sadaqa dans le rite Malékite (Maroc), mais précise que ce n'est pas spécifié dans les fichiers internes.

        Contexte récupéré :
        ${context || "Aucun document spécifique trouvé."}

        Question : ${message}`;

        const result = await model.generateContentStream(prompt);

        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of result.stream) {
                    const chunkText = chunk.text();
                    controller.enqueue(new TextEncoder().encode(chunkText));
                }
                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
            },
        });
    } catch (error) {
        console.error("Streaming Error:", error);
        return new Response("Error during generation", { status: 500 });
    }
}
