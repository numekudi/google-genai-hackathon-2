import { toast } from "sonner";

export function showTrendAvailableToast() {
  toast.success("新しいトレンドが利用可能になりました！", {
    duration: 4000,
    position: "top-center",
  });
}
