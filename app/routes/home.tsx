import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import PostForm from "../components/post-form";
import Timeline from "../components/timeline";
import type { PostWithMetadata } from "../repositories/schema";

const Home = () => {
  const [list, setList] = useState<PostWithMetadata[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const fetcher = useFetcher();

  // 初回ロード
  useEffect(() => {
    fetcher.load("/api/posts");
  }, []);

  useEffect(() => {
    if (fetcher.data?.posts) {
      setList(fetcher.data.posts);
      setHasMore(fetcher.data.posts.length > 0);
    }
  }, [fetcher.data]);

  // 投稿追加
  const handleAddPost = (post: PostWithMetadata) => {
    setList((prev) => [post, ...prev]);
  };

  // 投稿削除
  const handleDelete = (id: string) => {
    // useFetcherでDELETEリクエスト
    fetcher.submit({ postId: id }, { method: "delete", action: "/api/posts" });
    setList((prev) => prev.filter((p) => p.id !== id));
  };

  // タイムラインから新規投稿を追加
  const handleAppend = (posts: PostWithMetadata[]) => {
    setList((prev) => [...prev, ...posts]);
    if (posts.length === 0) setHasMore(false);
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <h2>ホーム</h2>
      <PostForm onAdd={handleAddPost} />
      <Timeline
        posts={list}
        onDelete={handleDelete}
        onAppend={handleAppend}
        hasMore={hasMore}
        isLoading={
          fetcher.state === "submitting" || fetcher.state === "loading"
        }
      />
    </div>
  );
};

export default Home;
