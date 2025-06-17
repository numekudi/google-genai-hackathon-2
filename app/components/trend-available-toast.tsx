import { toast } from "sonner";

export function showTrendAvailableToast() {
  toast.success("トレンドが利用可能になりました！", {
    description:
      "新しいトレンド分析が利用できます。トレンドページをチェックしてください。",
    duration: 4000,
  });
}
