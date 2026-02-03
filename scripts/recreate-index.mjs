import * as dotenv from "dotenv";
dotenv.config();
import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

async function recreate() {
    const indexName = process.env.PINECONE_INDEX_NAME || "casa-ramadan-2026";

    console.log(`Deleting index: ${indexName}...`);
    try {
        await pc.deleteIndex(indexName);
        console.log("Index deleted.");
    } catch (e) {
        console.log("Index might not exist or error deleting:", e.message);
    }

    console.log(`Creating index: ${indexName} with 768 dimensions...`);
    await pc.createIndex({
        name: indexName,
        dimension: 768,
        metric: 'cosine',
        spec: {
            serverless: {
                cloud: 'aws',
                region: 'us-east-1'
            }
        }
    });
    console.log("Index creation initiated. Please wait a minute for it to be ready.");
}

recreate().catch(console.error);
