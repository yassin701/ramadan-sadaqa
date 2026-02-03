import * as dotenv from "dotenv";
dotenv.config();
import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

async function check() {
    const indexName = process.env.PINECONE_INDEX_NAME || "casa-ramadan-2026";
    const index = pc.index(indexName);
    const description = await pc.describeIndex(indexName);
    console.log("DIMENSIONS:", description.dimension);
}

check();
