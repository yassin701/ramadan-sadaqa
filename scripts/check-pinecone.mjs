import * as dotenv from "dotenv";
dotenv.config();

import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

async function checkConnection() {
    try {
        console.log("Checking Pinecone connection...");
        const indexName = process.env.PINECONE_INDEX_NAME || "casa-ramadan-2026";
        const index = pc.index(indexName);

        const stats = await index.describeIndexStats();
        console.log("✅ Successfully connected to Pinecone!");
        console.log("Index Name:", indexName);
        console.log("Index Stats:", JSON.stringify(stats, null, 2));
    } catch (error) {
        console.error("❌ Failed to connect to Pinecone.");
        console.error("Error Details:", error.message);
    }
}

checkConnection();
