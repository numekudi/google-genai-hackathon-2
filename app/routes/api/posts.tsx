import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { adminAuth } from "~/lib/firebaseAdmin.server";
import { getEmbedding } from "../../lib/vertexai/lib";
import { createPost, deletePost, getPosts } from "../../repositories/posts";
import type { PostWithMetadata } from "../../repositories/schema";
import { getSession } from "../../sessions.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const idToken = session.get("idToken");
  if (!idToken) return redirect("/");
  const user = await adminAuth.verifyIdToken(idToken as string);
  const userId = user.uid; // Use the verified user ID from Firebase
  const url = new URL(request.url);
  const offset = url.searchParams.get("offset");
  let posts: PostWithMetadata[];
  if (offset) {
    posts = await getPosts(userId, 10, Number(offset));
  } else {
    posts = await getPosts(userId, 10, 0);
  }
  return { posts };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const idToken = session.get("idToken");
  if (!idToken) return redirect("/");
  const user = await adminAuth.verifyIdToken(idToken as string);
  const userId = user.uid; // Use the verified user ID from Firebase

  if (request.method === "POST") {
    console.log("POSTリクエストを受信");
    const formData = await request.formData();
    const content = formData.get("content");
    if (typeof content === "string" && content.trim()) {
      let contentEmbeddings: number[] | undefined = undefined;
      try {
        contentEmbeddings = await getEmbedding(content);
      } catch (e) {
        console.error("embedding生成失敗", e);
      }
      const created = await createPost(
        { content, type: "note", contentEmbeddings },
        userId
      );
      console.log("created post", created);
      return { created };
    }
  } else if (request.method === "DELETE") {
    const formData = await request.formData();
    const postId = formData.get("postId");
    if (typeof postId === "string") {
      await deletePost(userId, postId);
      return { deleted: true };
    }
  }
  return null;
};
