import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import type { action } from "~/routes/api/posts";
import type { PostWithMetadata } from "../repositories/schema";
import { showTrendAvailableToast } from "./trend-available-toast";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

type PostFormProps = {
  onAdd: (post: PostWithMetadata) => void;
};

const PostForm = ({ onAdd }: PostFormProps) => {
  const fetcher = useFetcher<typeof action>();
  const [input, setInput] = useState("");
  const [mood, setMood] = useState<number | undefined>(undefined);

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
    const formData = { content: input, ...(mood && { mood: mood.toString() }) };
    await fetcher.submit(
      formData,
      { method: "POST", action: "/api/posts" }
    );
    setInput("");
    setMood(undefined);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4"
    >
      <input type="hidden" name="type" value="note" />
      <div className="space-y-4 pt-2">
        <Textarea
          name="content"
          className="resize-none dark:text-white"
          placeholder="反芻思考、体調の変化、睡眠などを記録しよう"
          maxLength={1024}
          required
          disabled={fetcher.state === "submitting"}
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            気分レベル（任意）
          </label>
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setMood(level)}
                  disabled={fetcher.state === "submitting"}
                  className={`h-8 rounded-md border-2 transition ${
                    mood === level
                      ? "border-indigo-500 bg-indigo-500"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-gray-700"
                  }`}
                >
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>低調</span>
              <span>普通</span>
              <span>良好</span>
            </div>
            <div className="flex items-center justify-between">
              {mood && (
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  選択中: {mood}/7
                </span>
              )}
              {mood && (
                <button
                  type="button"
                  onClick={() => setMood(undefined)}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  disabled={fetcher.state === "submitting"}
                >
                  選択をクリア
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-row-reverse">
          <Button
            type="submit"
            className={`cursor-pointer px-6 py-2 shadow-lg text-white font-bold text-base transition border-0 bg-indigo-400 hover:bg-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-600 ${
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
