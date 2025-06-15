import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import type { PostWithMetadata } from "../repositories/schema";
import PostCard from "./post-card";

type TimelineProps = {
  posts: PostWithMetadata[];
  onDelete: (id: string) => void;
  onAppend: (posts: PostWithMetadata[]) => void;
  hasMore: boolean;
  isLoading: boolean;
};

const Timeline = ({
  posts,
  onDelete,
  onAppend,
  hasMore,
  isLoading,
}: TimelineProps) => {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [patching, setPatching] = useState<string | null>(null);
  const fetcher = useFetcher();

  // IntersectionObserverで無限スクロール
  useEffect(() => {
    if (!hasMore || isLoading) return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && fetcher.state === "idle") {
          fetcher.load(`/api/posts?offset=${posts.length}`);
        }
      },
      { threshold: 0.1 }
    );
    const currentRef = loadMoreRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasMore, isLoading, posts.length, fetcher]);

  // 新しい投稿の追加（重複防止）
  useEffect(() => {
    if (fetcher.data?.posts) {
      // 既存IDを除外して追加
      const existingIds = new Set(posts.map((p) => p.id));
      const newPosts = fetcher.data.posts.filter(
        (p: PostWithMetadata) => !existingIds.has(p.id)
      );
      if (newPosts.length > 0) {
        onAppend(newPosts);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.data]);

  const handleToggleVisibility = async (id: string, next: boolean) => {
    setPatching(id);
    const formData = new FormData();
    formData.append("postId", id);
    formData.append("isInvisible", next.toString());
    await fetcher.submit(formData, { method: "PATCH", action: "/api/posts" });
    setPatching(null);
    // ここでonAppendやpostsの更新が必要なら追加
  };

  return (
    <div
      style={{
        minHeight: 400,
        border: "1px solid #ccc",
        borderRadius: 8,
        paddingBottom: 16,
      }}
    >
      {posts.length === 0 && !hasMore && (
        <div style={{ textAlign: "center", color: "#888", padding: 32 }}>
          <span style={{ fontSize: 32, display: "block" }}>📝</span>
          <span style={{ fontSize: 16 }}>まだ投稿がありません</span>
        </div>
      )}
      {posts.map((post, i) => (
        <PostCard
          key={post.id}
          post={post}
          removePost={() => onDelete(post.id)}
          onToggleVisibility={handleToggleVisibility}
        />
      ))}
      <div ref={loadMoreRef} style={{ height: 32 }} />
      {(isLoading || fetcher.state === "loading") && (
        <div style={{ textAlign: "center", padding: 8 }}>
          <span className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-400"></span>
        </div>
      )}
    </div>
  );
};

export default Timeline;
