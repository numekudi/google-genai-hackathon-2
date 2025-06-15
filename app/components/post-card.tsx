import { useState } from "react";
import { FaEyeSlash, FaTrash } from "react-icons/fa";
import { FaEye } from "react-icons/fa6";
import type { PostWithMetadata } from "../repositories/schema";
import ConfirmDeleteDialog from "./confirm-delete-dialog";

export default function PostCard({
  post,
  removePost,
  onToggleVisibility,
}: {
  post: PostWithMetadata;
  removePost: () => void;
  onToggleVisibility: (id: string, next: boolean) => void;
}) {
  const [isInvisible, setIsInvisible] = useState(post.isInvisible);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleToggleVisibility = () => {
    onToggleVisibility(post.id, !isInvisible);
    setIsInvisible(!isInvisible);
  };

  const handleDelete = () => {
    try {
      removePost();
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <div className="w-full flex flex-col bg-white/90 shadow-lg border border-indigo-100 p-6 transition">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-indigo-400 font-semibold tracking-wide">
          {new Date(post.createdAt || post.timestamp).toLocaleString()}
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleToggleVisibility}
            className={`p-2 rounded-full border-0 bg-indigo-50 hover:bg-indigo-100 text-indigo-500 transition`}
            title={isInvisible ? "表示する" : "非表示にする"}
          >
            {isInvisible ? <FaEye /> : <FaEyeSlash />}
          </button>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="p-2 rounded-full border-0 bg-red-50 hover:bg-red-100 text-red-400 transition"
            title="削除"
          >
            <FaTrash />
          </button>
        </div>
      </div>
      {isInvisible ? (
        <p className="text-gray-400 italic text-sm">非表示</p>
      ) : (
        <div className="flex flex-col gap-2">
          {post.type === "note" && (
            <div className="pl-2 text-base text-gray-800 whitespace-pre-line">
              {post.content}
            </div>
          )}
        </div>
      )}
      <ConfirmDeleteDialog
        open={isDialogOpen}
        onConfirm={handleDelete}
        onClose={() => setIsDialogOpen(false)}
        message="このポストを削除しますか？"
      />
    </div>
  );
}
