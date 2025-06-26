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

  // 投稿更新（気分・本文・日付など）
  const handleUpdate = (updatedPost: PostWithMetadata) => {
    setList((prev) =>
      prev.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PostForm onAdd={handleAddPost} />
      <Timeline
        posts={list}
        onDelete={handleDelete}
        onAppend={handleAppend}
        onUpdate={handleUpdate}
        hasMore={hasMore}
        isLoading={
          fetcher.state === "submitting" || fetcher.state === "loading"
        }
      />
    </div>
  );
};

export default Home;
