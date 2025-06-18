import type { User } from "firebase/auth";
import { useEffect, useState } from "react";
import { useFetcher, useNavigate } from "react-router";
import { auth } from "~/lib/firebase.client";
import ConfirmDeleteDialog from "../components/confirm-delete-dialog";
import { Button } from "../components/ui/button";

const Settings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const fetcher = useFetcher();
  const navigator = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setIsUserLoading(false);
      if (!user) navigator("/");
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      fetcher.submit(null, { method: "DELETE", action: "/api/sessions" });
      await auth.signOut();
    } catch (error) {
      console.error("Error logging out: ", error);
    }
    navigator("/");
  };

  const handleDeleteAccount = async () => {
    if (user) {
      try {
        fetcher.submit(null, { method: "DELETE", action: "/api/users" });
        fetcher.submit(null, { method: "DELETE", action: "/api/sessions" });
        await auth.signOut();
        navigator("/");
      } catch (error) {
        console.error("Error deleting account: ", error);
      }
    }
  };

  const handleUpgradeToGoogle = async () => {
    try {
      const { GoogleAuthProvider, linkWithPopup } = await import(
        "firebase/auth"
      );
      const provider = new GoogleAuthProvider();
      if (auth.currentUser) {
        await linkWithPopup(auth.currentUser, provider);
        navigator("/");
      }
    } catch (error) {
      alert("Googleアカウントへの移行に失敗しました");
      console.error(error);
    }
  };

  if (isUserLoading) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4 text-center text-gray-400 dark:text-gray-300">
        Loading...
      </div>
    );
  }

  const isAnonymous = user?.isAnonymous;

  return (
    <div className="max-w-xl mx-auto py-10 px-4 text-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-8 text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
        <span>⚙️</span> アカウント設定
      </h1>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 space-y-6 border border-indigo-100 dark:border-gray-700">
        <div className="flex items-center gap-4">
          {/* アイコン表示は省略（Image未導入のため） */}
          <div>
            {isAnonymous ? (
              <>
                <div className="text-lg font-bold text-gray-500 dark:text-gray-400">
                  匿名ログイン中
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-300 mt-1">
                  Googleアカウントに移行できます
                </div>
              </>
            ) : (
              <>
                <div className="text-lg font-bold text-indigo-700 dark:text-indigo-400">
                  {user?.displayName || "Googleアカウント"}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-300 mt-1">{user?.email}</div>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-4">
          {isAnonymous && (
            <Button
              type="button"
              className="px-6 py-2 rounded-full shadow text-white font-bold text-base border-0 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 transition"
              onClick={handleUpgradeToGoogle}
            >
              Googleアカウントに移行
            </Button>
          )}
          <Button
            type="button"
            className="px-6 py-2 rounded-full shadow text-indigo-600 font-bold text-base border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition"
            onClick={handleLogout}
          >
            ログアウト
          </Button>
          <Button
            type="button"
            className="px-6 py-2 rounded-full shadow text-white font-bold text-base border-0 bg-gradient-to-r from-red-500 to-red-400 hover:from-red-600 hover:to-red-500 transition"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            アカウント削除
          </Button>
        </div>
      </div>
      <ConfirmDeleteDialog
        onConfirm={handleDeleteAccount}
        onClose={() => setIsDeleteDialogOpen(false)}
        open={isDeleteDialogOpen}
        message="アカウントを削除しますか？ポストはすべて削除されます。"
      />
    </div>
  );
};

export default Settings;
