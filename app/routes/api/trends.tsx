import { FunctionCallingMode, SchemaType } from "@google-cloud/vertexai";
import { generativeModel, getEmbedding } from "~/lib/vertexai/lib";
import { findPostBySimilarity } from "~/repositories/posts";
import type { PostWithMetadata } from "~/repositories/schema";

async function generateTrendList(posts: PostWithMetadata[]) {
  const userPosts = posts.reverse().map((p) => {
    const dateString = new Date(p.timestamp).toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return `
  ---
  ## 日付
  ${dateString}
  ## 内容
  ${p.content}
  ---
  `;
  });

  const systemMessage = `
心療内科に通っている人のSNSの過去ポストです。
症状のトレンドをTwitter（現X）のトレンド風にまとめてください。
トレンドリストに表示するので、簡潔な単語にすること。
重要そうなトレンドから並べること。
`;

  const res = await generativeModel.generateContent({
    systemInstruction: systemMessage,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `
ユーザーの過去ポスト
\`\`\`
${userPosts.join("\n")}
\`\`\`
`,
          },
        ],
      },
    ],
    generationConfig: {
      responseSchema: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.STRING,
          description: "トレンドリスト",
        },
      },

      responseMimeType: "application/json",
    },
  });

  return JSON.parse(
    res.response.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
  ) as string[];
}

async function* generateTrendSummary(
  posts: PostWithMetadata[],
  trends: string[]
) {
  const today = new Date();
  const todayInstruction = today.toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const userPosts = posts.reverse().map((p) => {
    const dateString = new Date(p.timestamp).toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return `
  ---
  ## 日付
  ${dateString}
  ## 内容
  ${p.content}
  ---
  `;
  });

  const systemMessage = `
心療内科に通っている人のSNSの過去ポストとトレンドリストから、患者の体調のまとめを作成します。
このまとめはmarkdownで、患者自身が読みます。
読む負担を抑えるためにそこそこ簡潔に、トレンドにある症状の改善案をコンテンツとし、それだけ出力すること。
「承知いたしました」等は不要です。
今日の日付は${todayInstruction}です。
`;

  const res = await generativeModel.generateContentStream({
    systemInstruction: systemMessage,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `
## トレンドリスト
\`\`\`
${trends.join("\n- ")}
\`\`\`


## ユーザーの過去ポスト
\`\`\`
${userPosts.join("\n")}
\`\`\`
`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
    },
  });

  for await (const chunk of res.stream) {
    const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      yield text;
    }
  }
}

async function* generateConsultation(
  uid: string,
  posts: PostWithMetadata[],
  trends: string[]
) {
  const today = new Date();
  const todayInstruction = today.toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const userPosts = posts.reverse().map((p) => {
    const dateString = new Date(p.timestamp).toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return `
---
### 日付
${dateString}
### 内容
${p.content}
---
`;
  });

  const functionCallRes = await generativeModel.generateContent({
    systemInstruction: `
心療内科に通っている人のSNSの過去ポストとトレンドリストから、患者が医師に相談する際の相談例を生成することが目的です。
直近のポストとトレンドを基にポストの検索を行うことでさらに過去のポストを参照できます。
相談例の生成に役立ててください。
`,
    toolConfig: {
      functionCallingConfig: {
        mode: FunctionCallingMode.ANY,
      },
    },
    tools: [
      {
        functionDeclarations: [
          {
            name: "similarity_search",
            description: "類似度検索を行います",
            parameters: {
              required: ["queries"],
              type: SchemaType.OBJECT,
              description: "検索クエリ",
              properties: {
                queries: {
                  type: SchemaType.ARRAY,
                  items: {
                    type: SchemaType.STRING,
                  },
                },
              },
            },
          },
        ],
      },
    ],
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `
## トレンドリスト
\`\`\`
${trends.join("\n- ")}
\`\`\`


## ユーザーの過去ポスト
\`\`\`
${userPosts.join("\n")}
\`\`\`


`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
    },
  });
  const queries = (
    functionCallRes.response.candidates?.[0]?.content?.parts?.[0].functionCall
      ?.args as {
      queries: string[];
    }
  ).queries;

  const embeddings = await Promise.all(
    queries.filter((e) => e.length > 0).map((e) => getEmbedding(e))
  );

  const similarPosts = await Promise.all(
    embeddings.map((embedding) => {
      if (!embedding) {
        return [];
      }
      return findPostBySimilarity(uid, embedding).then(
        (result) => result || []
      );
    })
  );

  const allPosts = Array.from(
    new Map([...posts, ...similarPosts.flat()].map((p) => [p.id, p])).values()
  );
  allPosts.sort((a, b) => a.timestamp - b.timestamp);

  const allPostsString = allPosts.reverse().map((p) => {
    const dateString = new Date(p.timestamp).toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return `
---
### 日付
${dateString}
### 内容
${p.content}
---
  `;
  });

  const res = await generativeModel.generateContentStream({
    systemInstruction: `
心療内科に通っている人のSNSの過去ポストとトレンドリストから、患者が医師に相談する際の相談例を生成することが目的です。
症状について相談する際の文面のみ、markdownで出力すること。
承知しましたなどは不要です。
今日の日付は${todayInstruction}です。

`,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `
## トレンドリスト
\`\`\`
${trends.join("\n- ")}
\`\`\`


## ユーザーの過去ポスト
\`\`\`
${allPostsString.join("\n")}
\`\`\`
`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
    },
  });

  for await (const chunk of res.stream) {
    const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      yield text;
    }
  }
}
