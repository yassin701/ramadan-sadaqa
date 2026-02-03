import 'dotenv/config';
import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index(process.env.PINECONE_INDEX_NAME);

async function check() {
    const stats = await index.describeIndexStats();
    console.log('RECORD_COUNT:', stats.totalRecordCount);
}

check();
