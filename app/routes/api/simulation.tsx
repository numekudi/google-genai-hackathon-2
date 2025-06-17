import { SchemaType } from "@google-cloud/vertexai";
import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { adminAuth } from "../../lib/firebaseAdmin.server";
import { generativeModel } from "../../lib/vertexai/lib";
import { getPostsByTimeRange } from "../../repositories/posts";
import type { PostWithMetadata } from "../../repositories/schema";
import { getSession } from "../../sessions.server";

export type HumanMessage = {
  role: "doctor" | "user";
  content: string;
};

export type SuggestionsRequest = {
  messages: HumanMessage[];
};

export type SuggestionsResponse = {
  suggestions: string[];
};

const generateDoctorMessages = async (messages: HumanMessage[]) => {
  const systemMessage = `
心療内科医がしそうな質問を3~5個生成すること。
`;
  const res = await generativeModel.generateContent({
    systemInstruction: systemMessage,
    contents: messages.map((m) => {
      return {
        parts: [
          {
            text: m.content,
          },
        ],
        role: m.role === "doctor" ? "assistant" : "user",
      };
    }),
    generationConfig: {
      responseSchema: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.STRING,
          description: "心療内科医がしそうな質問",
        },
      },
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(
    res.response.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]"
  ) as string[];
};

const generateUserMessages = async (
  messages: HumanMessage[],
  posts: PostWithMetadata[]
) => {
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
心療内科に通う患者になりきってください。
ユーザーの過去ポストを参考に、心療内科医への返答候補を3~5個生成すること。
ユーザーの過去ポストの内容を引用できるとより良いです。
質問候補のみ出力すること。

## トレンド
${posts[0]?.trend?.trends ?? ""}

## ユーザーの過去ポスト
\
${userPosts.join("\n")}
\

`;

  const res = await generativeModel.generateContent({
    systemInstruction: systemMessage,
    contents: messages.map((m) => {
      return {
        parts: [
          {
            text: m.content,
          },
        ],
        role: m.role === "doctor" ? "user" : "assistant",
      };
    }),
    generationConfig: {
      responseSchema: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.STRING,
          description: "患者が回答しそうな内容",
        },
      },
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(
    res.response.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]"
  ) as string[];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const idToken = session.get("idToken");
  if (!idToken) return redirect("/");
  const user = await adminAuth.verifyIdToken(idToken as string);
  const reqBody: HumanMessage[] = await request.json();
  if (reqBody[reqBody.length - 1].role === "user") {
    const res = await generateDoctorMessages(reqBody);
    const body: SuggestionsResponse = {
      suggestions: res,
    };
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } else {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const posts = await getPostsByTimeRange(user.uid, oneMonthAgo);
    const res = await generateUserMessages(reqBody, posts);
    const body: SuggestionsResponse = {
      suggestions: res,
    };
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
};
