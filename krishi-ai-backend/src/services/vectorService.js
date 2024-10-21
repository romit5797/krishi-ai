import { qdrantClient } from "../db/qdrant-instance.js";
import { getEmbeddingsBatch } from "./chatGptService.js";
import { v4 as uuidv4 } from "uuid"; // Import UUID generator

// Function to upload embeddings to Qdrant in batches
async function uploadBatchToQdrant(paragraphs, metadata, embeddings) {
  const points = paragraphs.map((_, index) => {
    return {
      id: uuidv4(), // Generate a UUID for each point
      vector: embeddings[index],
      payload: metadata[index],
    };
  });

  try {
    // Upsert points (upload) to Qdrant
    const response = await qdrantClient.upsert("krishi", {
      points: points,
    });

    console.log("Batch uploaded to Qdrant:", response);
  } catch (error) {
    console.error("Error uploading batch to Qdrant:", error);
    throw error;
  }
}

// Function to handle generating embeddings and uploading to Qdrant in batches of 100 vectors
async function processBatchesAndUpload(paragraphs, metadata) {
  try {
    const embeddings = await getEmbeddingsBatch(paragraphs);
    await uploadBatchToQdrant(paragraphs, metadata, embeddings);
  } catch (error) {
    console.log("err in qdrant embedding", error);
    throw error;
  }
}

async function searchQdrant(query, mode) {
  try {
    const [queryEmbedding] = await getEmbeddingsBatch([query]);

    const response = await qdrantClient.search("krishi", {
      vector: queryEmbedding,
      filter: {
        must: [
          {
            key: "mode", // The field where vision metadata is stored
            match: {
              value: mode, // The mode you want to match ("text", "vision")
            },
          },
        ],
      },
      limit: 5,
    });

    console.log("Search results:", response);
    return response;
  } catch (error) {
    console.log("err in qdrant search", error);
    throw error;
  }
}

export default {
  uploadBatchToQdrant,
  processBatchesAndUpload,
  searchQdrant,
};
