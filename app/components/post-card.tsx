import { useEffect, useState } from "react";
import { FaEdit, FaEyeSlash, FaTrash } from "react-icons/fa";
import { FaEye } from "react-icons/fa6";
import { useFetcher } from "react-router";
import type { PostWithMetadata } from "../repositories/schema";
import ConfirmDeleteDialog from "./confirm-delete-dialog";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Textarea } from "./ui/textarea";
import { TimePicker } from "./ui/timepicker";

export default function PostCard({
  post,
  removePost,
  onToggleVisibility,
  onUpdate,
}: {
  post: PostWithMetadata;
  removePost: () => void;
  onToggleVisibility: (id: string, next: boolean) => void;
  onUpdate?: (post: PostWithMetadata) => void;
}) {
  const [isInvisible, setIsInvisible] = useState(post.isInvisible);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMoodDialogOpen, setIsMoodDialogOpen] = useState(false);
  const [tempMood, setTempMood] = useState(post.mood || 4);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editDate, setEditDate] = useState<Date | null>(
    post.createdAt ? new Date(post.createdAt) : new Date()
  );
  const [editTime, setEditTime] = useState(() => {
    const d = post.createdAt ? new Date(post.createdAt) : new Date();
    return d.toTimeString().slice(0, 5); // "HH:mm"
  });
  const [editMood, setEditMood] = useState(post.mood || 4);
  const [isSaving, setIsSaving] = useState(false);
  const fetcher = useFetcher();

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
    if (onUpdate) {
      onUpdate({ ...post, mood: tempMood, moodType: "manual" });
    }
    setIsMoodDialogOpen(false);
  };

  // PATCH送信
  const handleEditSave = async () => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append("postId", post.id);
    formData.append("content", editContent);
    let date = editDate ? new Date(editDate) : new Date();
    if (editTime) {
      // 時刻を上書き
      const [h, m] = editTime.split(":").map(Number);
      date.setHours(h);
      date.setMinutes(m);
      date.setSeconds(0);
      date.setMilliseconds(0);
    }
    formData.append("createdAt", date.toISOString());
    formData.append("mood", editMood.toString());
    await fetcher.submit(formData, {
      method: "PATCH",
      action: "/api/posts",
    });
    setIsSaving(false);
    setIsEditDialogOpen(false);
  };

  // PATCHの返却値で画面を更新
  useEffect(() => {
    if (fetcher.data && fetcher.data.updated) {
      // すでに反映済みなら何もしない
      if (
        post.mood === fetcher.data.updated.mood &&
        post.content === fetcher.data.updated.content &&
        post.createdAt === fetcher.data.updated.createdAt
      ) {
        return;
      }
      onUpdate && onUpdate({ ...post, ...fetcher.data.updated });
    }
  }, [fetcher.data?.updated, onUpdate, post]);

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
            onClick={handleToggleVisibility}
            className={`p-2 rounded-full border-0 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 transition`}
            title={isInvisible ? "表示する" : "非表示にする"}
          >
            {isInvisible ? <FaEye /> : <FaEyeSlash />}
          </button>
          <button
            onClick={() => setIsEditDialogOpen(true)}
            className="p-2 rounded-full border-0 bg-green-100 hover:bg-green-200 dark:bg-green-800 dark:hover:bg-green-700 text-green-600 dark:text-green-300 transition"
            title="編集"
          >
            <FaEdit />
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
          <div className="pl-2 mt-2 flex items-center w-full">
            {post.mood ? (
              <div
                className={`flex-1 text-sm font-medium ${getMoodColor(
                  post.mood
                )}`}
              >
                気分: {post.mood}/7
                {post.moodType === "estimated" ? " (推定)" : ""}
              </div>
            ) : (
              <div className="flex-1 text-sm font-medium text-gray-400 dark:text-gray-500">
                気分: なし
              </div>
            )}
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
          </div>
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
            <DialogTitle>
              {post.mood ? "気分レベルを編集" : "気分レベルを追加"}
            </DialogTitle>
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
                    ></button>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>低調</span>
                  <span>普通</span>
                  <span>良好</span>
                </div>
                <div className="text-center">
                  <span
                    className={`text-sm font-medium ${getMoodColor(tempMood)}`}
                  >
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

      {/* 編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">
              投稿を編集
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                本文
              </label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                className="mt-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                日付・時刻
              </label>
              <div className="flex gap-2 items-center">
                <div className="flex-1 min-w-0">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                      >
                        {editDate
                          ? editDate.toLocaleDateString()
                          : "日付を選択"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                      <Calendar
                        mode="single"
                        selected={editDate ?? undefined}
                        onSelect={setEditDate}
                        required
                        initialFocus
                        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="w-24 flex-shrink-0">
                  <TimePicker
                    value={editTime}
                    onChange={setEditTime}
                    className="dark:bg-gray-800 dark:text-gray-100 bg-white text-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                気分レベル (1-7)
              </label>
              <div className="grid grid-cols-7 gap-1 mt-1">
                {[1, 2, 3, 4, 5, 6, 7].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setEditMood(level)}
                    className={`h-8 rounded-md border-2 transition ${
                      editMood === level
                        ? "border-indigo-500 bg-indigo-500 text-white dark:text-white"
                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                選択中: {editMood}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="mr-2 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              キャンセル
            </Button>
            <Button
              type="button"
              onClick={handleEditSave}
              disabled={isSaving}
              className="bg-indigo-400 hover:bg-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white dark:text-white"
            >
              {isSaving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
