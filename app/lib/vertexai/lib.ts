import { helpers, PredictionServiceClient } from "@google-cloud/aiplatform";
import type { google } from "@google-cloud/aiplatform/build/protos/protos";
import { VertexAI } from "@google-cloud/vertexai";

const firebaseConfig = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG || "");
const vertexAI = new VertexAI({
  project: firebaseConfig.projectId,
  location: "us-central1",
});

export const generativeModel = vertexAI.getGenerativeModel({
  model: "gemini-2.0-flash-001",
});

const project = firebaseConfig.projectId;
const location = "us-central1";
const model = "text-embedding-005";
const client = new PredictionServiceClient();
const type = "SEMANTIC_SIMILARITY";

export const getEmbedding = async (text: string) => {
  const endpoint = `projects/${project}/locations/${location}/publishers/google/models/${model}`;
  const instances = helpers.toValue({
    content: text,
    task_type: type,
  }) as google.protobuf.IValue;
  try {
    const [response] = await client.predict({
      endpoint: endpoint,
      instances: [instances],
    });

    return response?.predictions?.[0].structValue?.fields?.embeddings.structValue?.fields?.values.listValue?.values?.map(
      (e) => e.numberValue as number
    );
  } catch (error) {
    console.error("Error:", error);
  }
};
