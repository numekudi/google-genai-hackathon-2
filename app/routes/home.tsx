import * as React from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, redirect, useFetcher, useLoaderData } from "react-router";

import { adminAuth } from "~/lib/firebaseAdmin.server";
import { getEmbedding } from "../lib/vertexai/lib";
import {
  createPost,
  deletePost,
  getPosts,
  getPostsByTimeRange,
} from "../repositories/posts";
import type { PostWithMetadata } from "../repositories/schema";
import { getSession } from "../sessions.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const idToken = session.get("idToken");
  const user = await adminAuth.verifyIdToken(idToken as string);
  if (!user) return redirect("/");
  const userId = user.uid;
  const url = new URL(request.url);
  const before = url.searchParams.get("before");
  let posts: PostWithMetadata[];
  if (before) {
    posts = await getPostsByTimeRange(userId, new Date(Number(before)), 10);
  } else {
    posts = await getPosts(userId, 10, 0);
  }
  return { posts };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const idToken = session.get("idToken");
  const user = await adminAuth.verifyIdToken(idToken as string);
  if (!user) return redirect("/");
  const userId = user.uid;
  const formData = await request.formData();
  const _action = formData.get("_action");
  if (_action === "create") {
    const content = formData.get("content");
    if (typeof content === "string" && content.trim()) {
      // Post型に合わせてtype: "note"を付与
      let contentEmbeddings: number[] | undefined = undefined;
      try {
        contentEmbeddings = await getEmbedding(content);
      } catch (e) {
        console.error("embedding生成失敗", e);
      }
      console.log(content);
      await createPost({ content, type: "note", contentEmbeddings }, userId);
    }
    return redirect("/home");
  } else if (_action === "delete") {
    const postId = formData.get("postId");
    if (typeof postId === "string") {
      await deletePost(userId, postId);
    }
    return redirect("/home");
  }
  return null;
};

const Home = () => {
  const { posts } = useLoaderData() as {
    posts: PostWithMetadata[];
  };
  const fetcher = useFetcher();
  const [list, setList] = React.useState(posts);
  const [loading, setLoading] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);

  // 無限スクロール
  React.useEffect(() => {
    setList(posts);
  }, [posts]);

  React.useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current;
    const onScroll = () => {
      if (
        el.scrollTop + el.clientHeight >= el.scrollHeight - 10 &&
        !loading &&
        list.length > 0
      ) {
        setLoading(true);
        const last = list[list.length - 1];
        fetcher.load(`/home?before=${last.timestamp}`);
      }
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [list, loading, fetcher]);

  React.useEffect(() => {
    if (fetcher.data?.posts) {
      setList((prev) => [...prev, ...fetcher.data.posts]);
      setLoading(false);
    }
  }, [fetcher.data]);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <h2>ホーム</h2>
      <Form method="post" style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          name="content"
          placeholder="新しい投稿..."
          required
          style={{ flex: 1 }}
        />
        <button type="submit" name="_action" value="create">
          投稿
        </button>
      </Form>
      <div
        ref={listRef}
        style={{
          height: 400,
          overflow: "auto",
          border: "1px solid #ccc",
          borderRadius: 8,
        }}
      >
        {list.map((post) => (
          <div
            key={post.id}
            style={{
              borderBottom: "1px solid #eee",
              padding: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div>{post.content}</div>
              <div style={{ fontSize: 12, color: "#888" }}>
                {new Date(post.createdAt).toLocaleString()}
              </div>
            </div>
            <Form method="post">
              <input type="hidden" name="postId" value={post.id} />
              <button
                type="submit"
                name="_action"
                value="delete"
                style={{ color: "red" }}
              >
                削除
              </button>
            </Form>
          </div>
        ))}
        {loading && (
          <div style={{ textAlign: "center", padding: 8 }}>読み込み中...</div>
        )}
      </div>
    </div>
  );
};

export default Home;
