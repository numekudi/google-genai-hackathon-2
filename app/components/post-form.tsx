import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import type { action } from "~/routes/api/posts";
import type { PostWithMetadata } from "../repositories/schema";
import { Button } from "./ui/button";

type PostFormProps = {
  onAdd: (post: PostWithMetadata) => void;
};

const PostForm = ({ onAdd }: PostFormProps) => {
  const fetcher = useFetcher<typeof action>();
  const [input, setInput] = useState("");

  useEffect(() => {
    if (fetcher.data) {
      const createdPost = fetcher.data.created;
      if (createdPost) {
        onAdd(createdPost);
      }
    }
  }, [fetcher.data]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    fetcher.submit(
      { content: input },
      { method: "POST", action: "/api/posts" }
    );
    setInput("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-white/90 rounded-2xl shadow-xl border border-indigo-100 p-6 flex flex-col gap-4 mb-4"
    >
      <input type="hidden" name="type" value="note" />
      <div className="space-y-4 pt-2">
        <textarea
          name="content"
          className="border border-indigo-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-indigo-300 field-sizing-content resize-none p-4 text-base bg-indigo-50/60 placeholder-gray-400 transition"
          placeholder="反芻思考、体調の変化、睡眠などを記録しよう"
          maxLength={1024}
          required
          disabled={fetcher.state === "submitting"}
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="flex flex-row-reverse">
          <Button
            type="submit"
            className={`px-6 py-2 rounded-full shadow-lg text-white font-bold text-base transition border-0 bg-gradient-to-r from-indigo-500 to-indigo-400 hover:from-indigo-600 hover:to-indigo-500 ${
              fetcher.state === "submitting"
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : ""
            }`}
            disabled={fetcher.state === "submitting"}
          >
            {fetcher.state === "submitting" ? "投稿中..." : "ポストする"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PostForm;
