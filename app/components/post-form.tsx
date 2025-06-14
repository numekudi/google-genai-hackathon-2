import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import type { action } from "~/routes/api/posts";
import type { PostWithMetadata } from "../repositories/schema";

type PostFormProps = {
  onAdd: (post: PostWithMetadata) => void;
};

const PostForm = ({ onAdd }: PostFormProps) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const fetcher = useFetcher<typeof action>();

  useEffect(() => {
    if (fetcher.state === "idle" && formRef.current) {
      formRef.current.reset();
    }
    if (fetcher.data) {
      // フォームデータが存在する場合は、投稿を追加
      const createdPost = fetcher.data.created as PostWithMetadata;
      if (createdPost) {
        onAdd(createdPost);
      }
    }
  }, [fetcher.state]);

  return (
    <fetcher.Form
      ref={formRef}
      method="post"
      action="/api/posts"
      style={{ display: "flex", gap: 8, marginBottom: 16 }}
    >
      <input
        name="content"
        placeholder="新しい投稿..."
        required
        style={{ flex: 1 }}
      />
      <button type="submit" disabled={fetcher.state === "submitting"}>
        {fetcher.state === "submitting" ? "投稿中..." : "投稿"}
      </button>
    </fetcher.Form>
  );
};

export default PostForm;
