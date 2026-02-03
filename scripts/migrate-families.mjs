import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");



const families = [
    {
        id: "SM-2026-A-1",
        name: "Famille El Amrani",
        neighborhood: "Sidi Moumen (Bloc B)",
        need: "Panier Alimentaire Complet + Kit Hygiène",
        status: "Prioritaire",
        notes: "Veuve avec enfants scolarisés",
        members: 4
    },
    {
        id: "SM-2026-A-2",
        name: "Famille Mansouri",
        neighborhood: "Sidi Moumen (Derb Sultan)",
        need: "Zakat Al Fitr uniquement",
        status: "Validé",
        members: 2
    },
    {
        id: "HH-2026-B-1",
        name: "Famille Tazi",
        neighborhood: "Hay Hassani (Près de la Mosquée El Firdaous)",
        need: "Aide médicale + Panier de base",
        status: "Urgent",
        notes: "Patient nécessite des médicaments pour le diabète",
        members: 6
    },
    {
        id: "HH-2026-B-2",
        name: "Famille Benjelloun",
        neighborhood: "Maarif (Extérieur)",
        need: "Panier Alimentaire",
        status: "En attente de validation sociale",
        members: 3
    }
];

async function run() {
    const indexName = process.env.PINECONE_INDEX_NAME || "casa-ramadan-2026";
    console.log("DEBUG: Using Index:", indexName);
    console.log("DEBUG: API Key Loaded:", !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);

    const index = pc.index(indexName);
    const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

    console.log(`Starting migration to Pinecone index: ${indexName}...`);

    for (const family of families) {
        const textToEmbed = `Famille: ${family.name}. Quartier: ${family.neighborhood}. Besoin: ${family.need}. Statut: ${family.status}. membres: ${family.members}. Notes: ${family.notes || "N/A"}`;

        console.log(`Embedding: ${family.name}`);
        const result = await embedModel.embedContent({
            content: { parts: [{ text: textToEmbed }] },
            taskType: "RETRIEVAL_DOCUMENT",
            title: family.name,
            outputDimensionality: 768
        });
        const vector = result.embedding.values;
        console.log(`Vector length: ${vector.length}`);

        await index.upsert({
            records: [{
                id: family.id,
                values: vector,
                metadata: {
                    text: textToEmbed,
                    name: family.name,
                    neighborhood: family.neighborhood,
                    status: family.status,
                    type: "family"
                }
            }]
        });
        console.log(`Upserted: ${family.name}`);
    }

    console.log("Migration complete!");
}

run().catch((err) => {
    console.error("Migration Failed Error details:");
    if (err.name === 'PineconeArgumentError') {
        console.error("Format Error:", err.message);
    } else {
        console.error(err);
    }
    process.exit(1);
});
