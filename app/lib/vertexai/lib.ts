import { helpers, PredictionServiceClient } from "@google-cloud/aiplatform";
import type { google } from "@google-cloud/aiplatform/build/protos/protos";
import { VertexAI, SchemaType } from "@google-cloud/vertexai";

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

export const estimateMood = async (content: string): Promise<number> => {
  try {
    const response = await generativeModel.generateContent({
      systemInstruction: `
        あなたは精神的健康専門家です。日本語のソーシャルメディア投稿から感情状態を分析してください。
        以下の基準で1から7の気分スコアを返してください：
        
        1-2: 非常にネガティブ（強い不安、絶望、うつ状態）
        3-5: 中性的・混合（普通、平坦、軽い不安や悩み）
        6-7: ポジティブ（希望的、前向き、幸福感）
        
        返答は数値のみで、説明は不要です。
      `,
      contents: [{ role: "user", parts: [{ text: content }] }],
      generationConfig: {
        responseSchema: {
          type: SchemaType.NUMBER,
          description: "Mood score from 1-7"
        },
        responseMimeType: "application/json",
        temperature: 0.1,
      }
    });
    
    const moodScore = JSON.parse(response.response.candidates?.[0]?.content?.parts?.[0]?.text ?? "4");
    return Math.max(1, Math.min(7, Math.round(moodScore)));
  } catch (error) {
    console.error("Error estimating mood:", error);
    return 4;
  }
};
