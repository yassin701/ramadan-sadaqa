import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

async function run() {
    try {
        const indexName = process.env.PINECONE_INDEX_NAME || "casa-ramadan-2026";
        const index = pc.index(indexName);
        const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

        console.log("TEST: Embedding...");
        const result = await embedModel.embedContent({
            content: { parts: [{ text: "Test family" }] },
            taskType: "RETRIEVAL_DOCUMENT",
            title: "Test",
            outputDimensionality: 768
        });
        console.log("SUCCESS AI");

        console.log("TEST: Upserting...");
        await index.upsert([{
            id: "test-1",
            values: result.embedding.values,
            metadata: { text: "Test context" }
        }]);
        console.log("SUCCESS PINECONE");

    } catch (e) {
        console.error("DEBUG ERROR:", e);
    }
}

run();
