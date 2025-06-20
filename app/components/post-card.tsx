import { useState } from "react";
import { FaEyeSlash, FaTrash, FaEdit } from "react-icons/fa";
import { FaEye } from "react-icons/fa6";
import type { PostWithMetadata } from "../repositories/schema";
import ConfirmDeleteDialog from "./confirm-delete-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";

export default function PostCard({
  post,
  removePost,
  onToggleVisibility,
  onUpdateMood,
}: {
  post: PostWithMetadata;
  removePost: () => void;
  onToggleVisibility: (id: string, next: boolean) => void;
  onUpdateMood?: (id: string, mood: number) => void;
}) {
  const [isInvisible, setIsInvisible] = useState(post.isInvisible);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMoodDialogOpen, setIsMoodDialogOpen] = useState(false);
  const [tempMood, setTempMood] = useState(post.mood || 4);

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

  const handleMoodSave = () => {
    if (onUpdateMood) {
      onUpdateMood(post.id, tempMood);
    }
    setIsMoodDialogOpen(false);
  };

  const getMoodColor = (mood: number) => {
    if (mood <= 2) return "text-red-500 dark:text-red-400";
    if (mood <= 5) return "text-yellow-500 dark:text-yellow-400";
    return "text-green-500 dark:text-green-400";
  };
  return (
    <div className="w-full flex flex-col bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold tracking-wide">
          {new Date(post.createdAt || post.timestamp).toLocaleString()}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setTempMood(post.mood || 4);
              setIsMoodDialogOpen(true);
            }}
            className="p-2 rounded-full border-0 bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-blue-600 dark:text-blue-300 transition"
            title={post.mood ? "気分を編集" : "気分を追加"}
          >
            <FaEdit />
          </button>
          <button
            onClick={handleToggleVisibility}
            className={`p-2 rounded-full border-0 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 transition`}
            title={isInvisible ? "表示する" : "非表示にする"}
          >
            {isInvisible ? <FaEye /> : <FaEyeSlash />}
          </button>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="p-2 rounded-full border-0 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-rose-400 dark:text-rose-300 transition"
            title="削除"
          >
            <FaTrash />
          </button>
        </div>
      </div>
      {isInvisible ? (
        <p className="text-gray-400 dark:text-gray-500 italic text-sm">
          非表示
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {post.type === "note" && (
            <div className="pl-2 text-base text-gray-800 dark:text-gray-100 whitespace-pre-line">
              {post.content}
            </div>
          )}
          {post.mood && (
            <div className="pl-2 mt-2">
              <span className={`text-sm font-medium ${getMoodColor(post.mood)}`}>
                気分: {post.mood}/7{post.moodType === "estimated" ? " (推定)" : ""}
              </span>
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
      
      <Dialog open={isMoodDialogOpen} onOpenChange={setIsMoodDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle>{post.mood ? "気分レベルを編集" : "気分レベルを追加"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                気分レベル (1-7)
              </label>
              <div className="space-y-2">
                <div className="grid grid-cols-7 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setTempMood(level)}
                      className={`h-8 rounded-md border-2 transition ${
                        tempMood === level
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
                <div className="text-center">
                  <span className={`text-sm font-medium ${getMoodColor(tempMood)}`}>
                    選択中: {tempMood}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsMoodDialogOpen(false)}
              className="mr-2"
            >
              キャンセル
            </Button>
            <Button
              type="button"
              onClick={handleMoodSave}
              className="bg-indigo-400 hover:bg-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-600"
            >
              {post.mood ? "保存" : "追加"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
