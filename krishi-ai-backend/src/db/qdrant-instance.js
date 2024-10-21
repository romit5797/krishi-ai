import { QdrantClient } from "@qdrant/js-client-rest";
import { QDRANT_API_KEY, QDRANT_HOST_URL } from "../config/config.js";

// or connect to Qdrant Cloud
export const qdrantClient = new QdrantClient({
  url: QDRANT_HOST_URL,
  apiKey: QDRANT_API_KEY,
});

console.log({ QDRANT_HOST_URL, QDRANT_API_KEY });

const collections = await qdrantClient.getCollections();
console.log(collections);

if (!collections.collections.some((e) => e.name === "krishi")) {
  const response = await qdrantClient.createCollection("krishi", {
    vectors: {
      size: 1536, // Vector dimension (size of embeddings)
      distance: "Cosine", // Distance metric: 'Cosine', 'Euclidean', or 'Dot'
    },
  });
  console.log("Collection created:", response);

  await qdrantClient.createPayloadIndex("krishi", {
    field_name: "mode",
    field_schema: "keyword",
  });

  console.log("Index created");
}
