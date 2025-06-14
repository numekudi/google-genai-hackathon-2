import { useCallback, useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import type { PostWithMetadata } from "../repositories/schema";
import type { loader } from "./api/posts";

const Posts = () => {
  const fetcher = useFetcher<typeof loader>();
  console.log(fetcher.data);
  console.log(fetcher.state);
  const [list, setList] = useState<PostWithMetadata[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // 初回ロード
  useEffect(() => {
    fetcher.load("/api/posts");
  }, []);

  // 投稿取得時のリスト更新
  useEffect(() => {
    if (fetcher.data) {
      // 追加分が0件ならhasMoreをfalseに
      if (fetcher.data.posts.length === 0) {
        setHasMore(false);
      }
      setList((prev) => [...prev, ...fetcher.data!.posts]);
      setIsLoading(false);
    }
  }, [fetcher.data]);

  // 無限スクロール: IntersectionObserver
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (
        entries[0].isIntersecting &&
        hasMore &&
        !isLoading &&
        list.length > 0
      ) {
        setIsLoading(true);
        fetcher.load(`/api/posts?offset=${list.length}`);
      }
    },
    [hasMore, isLoading, list, fetcher]
  );

  useEffect(() => {
    const observer = new window.IntersectionObserver(handleIntersection, {
      threshold: 0.1,
    });
    const currentRef = loadMoreRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [handleIntersection]);

  // 投稿削除
  const handleDelete = (id: string) => {
    setList((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <h2>ホーム</h2>
      <fetcher.Form
        method="POST"
        style={{ display: "flex", gap: 8, marginBottom: 16 }}
        action="/api/posts"
      >
        <input
          name="content"
          placeholder="新しい投稿..."
          required
          style={{ flex: 1 }}
        />
        <button type="submit">投稿</button>
      </fetcher.Form>
      <div
        style={{
          minHeight: 400,
          border: "1px solid #ccc",
          borderRadius: 8,
          paddingBottom: 16,
        }}
      >
        {list.length === 0 && !hasMore && (
          <div style={{ textAlign: "center", color: "#888", padding: 32 }}>
            <span style={{ fontSize: 32, display: "block" }}>📝</span>
            <span style={{ fontSize: 16 }}>まだ投稿がありません</span>
          </div>
        )}
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
            <fetcher.Form
              method="DELETE"
              action="/api/posts"
              onSubmit={() => handleDelete(post.id)}
            >
              <input type="hidden" name="postId" value={post.id} />
              <button type="submit" style={{ color: "red" }}>
                削除
              </button>
            </fetcher.Form>
          </div>
        ))}
        <div ref={loadMoreRef} style={{ height: 32 }} />
        {isLoading && (
          <div style={{ textAlign: "center", padding: 8 }}>
            <span className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-400"></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Posts;
