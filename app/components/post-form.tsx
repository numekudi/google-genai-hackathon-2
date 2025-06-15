import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import type { action } from "~/routes/api/posts";
import type { PostWithMetadata } from "../repositories/schema";

type PostFormProps = {
  onAdd: (post: PostWithMetadata) => void;
};

const PostForm = ({ onAdd }: PostFormProps) => {
  const fetcher = useFetcher<typeof action>();
  const [input, setInput] = useState("");

  useEffect(() => {
    if (fetcher.data) {
      // フォームデータが存在する場合は、投稿を追加
      const createdPost = fetcher.data.created;
      if (createdPost) {
        onAdd(createdPost);
      }
    }
  }, [fetcher.data]);

  const handleSubmit = () => {
    fetcher.submit(
      { content: input },
      { method: "POST", action: "/api/posts" }
    );
    setInput("");
  };

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      <input
        placeholder="新しい投稿..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ flex: 1 }}
      />
      <button onClick={handleSubmit} disabled={fetcher.state === "submitting"}>
        {fetcher.state === "submitting" ? "投稿中..." : "投稿"}
      </button>
    </div>
  );
};

export default PostForm;
