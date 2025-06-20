import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  ShouldRevalidateFunctionArgs,
} from "react-router";
import { redirect } from "react-router";
import { adminAuth } from "~/lib/firebaseAdmin.server";
import { getEmbedding, estimateMood } from "../../lib/vertexai/lib";
import {
  createPost,
  deletePost,
  getPosts,
  updatePost,
} from "../../repositories/posts";
import type { PostWithMetadata } from "../../repositories/schema";
import { getSession } from "../../sessions.server";

export function shouldRevalidate({}: ShouldRevalidateFunctionArgs) {
  return false;
}

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
    const formData = await request.formData();
    const content = formData.get("content");
    const moodStr = formData.get("mood");
    if (typeof content === "string" && content.trim()) {
      let contentEmbeddings: number[] | undefined = undefined;
      try {
        contentEmbeddings = await getEmbedding(content);
      } catch (e) {
        console.error("embedding生成失敗", e);
      }
      
      let mood = moodStr && typeof moodStr === "string" ? Number(moodStr) : undefined;
      let moodType: "manual" | "estimated" | undefined = undefined;
      
      if (mood && mood >= 1 && mood <= 7) {
        moodType = "manual";
      } else {
        try {
          mood = await estimateMood(content);
          moodType = "estimated";
        } catch (error) {
          console.error("Failed to estimate mood:", error);
          mood = 4;
          moodType = "estimated";
        }
      }
      
      const postData: any = { content, type: "note", contentEmbeddings, mood, moodType };
      
      const created = await createPost(postData, userId);
      return { created };
    }
  } else if (request.method === "DELETE") {
    const formData = await request.formData();
    const postId = formData.get("postId");
    if (typeof postId === "string") {
      await deletePost(userId, postId);
      return { deleted: true };
    }
  } else if (request.method === "PATCH") {
    const formData = await request.formData();
    const postId = formData.get("postId");
    const isInvisible = formData.get("isInvisible");
    const moodStr = formData.get("mood");
    
    if (typeof postId === "string") {
      const updateData: any = {};
      
      if (isInvisible === "true" || isInvisible === "false") {
        updateData.isInvisible = isInvisible === "true";
      }
      
      if (moodStr && typeof moodStr === "string") {
        const mood = Number(moodStr);
        if (mood >= 1 && mood <= 7) {
          updateData.mood = mood;
          updateData.moodType = "manual";
        }
      }
      
      if (Object.keys(updateData).length > 0) {
        await updatePost(userId, postId, updateData);
        return { updated: { id: postId, ...updateData } };
      }
    }
  }
  return null;
};
