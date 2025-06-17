import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import type { action } from "~/routes/api/posts";
import type { PostWithMetadata } from "../repositories/schema";
import { showTrendAvailableToast } from "./trend-available-toast";
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
        showTrendAvailableToast();
      }
    }
  }, [fetcher.data]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await fetcher.submit(
      { content: input },
      { method: "POST", action: "/api/posts" }
    );
    setInput("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4"
    >
      <input type="hidden" name="type" value="note" />
      <div className="space-y-4 pt-2">
        <textarea
          name="content"
          className="border border-gray-200 dark:border-gray-700 dark:text-white w-full focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 field-sizing-content resize-none p-4 bg-white dark:bg-gray-900 placeholder-gray-400 dark:placeholder-gray-500 transition"
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
            className={`px-6 py-2 shadow-lg text-white font-bold text-base transition border-0 bg-indigo-400 hover:bg-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-600 ${
              fetcher.state === "submitting"
                ? "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
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
