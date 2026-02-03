import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

async function test() {
    try {
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent({
            content: { parts: [{ text: "Hello world" }] },
            taskType: "RETRIEVAL_DOCUMENT",
            title: "Test",
            outputDimensionality: 1024
        });
        console.log("SUCCESS:", result.embedding.values.length);
    } catch (e) {
        console.error("FAIL:", e);
    }
}

test();
