import {
  GoogleAuthProvider,
  signInAnonymously,
  signInWithPopup,
} from "firebase/auth";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { auth } from "../lib/firebase";

export default function Home() {
  const [isPolicyAccepted, setIsPolicyAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      // TODO: セッションAPI連携やリダイレクト処理を追加
      alert("Googleログイン成功: " + cred.user?.uid);
    } catch (e) {
      alert("Googleログイン失敗: " + e);
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    try {
      const cred = await signInAnonymously(auth);
      // TODO: セッションAPI連携やリダイレクト処理を追加
      alert("匿名ログイン成功: " + cred.user?.uid);
    } catch (e) {
      alert("匿名ログイン失敗: " + e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-clover text-gray-800">
      <div className="w-full mt-16 px-12 bg-white rounded-lg">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
            BrooRec - タイムライン型メモツール
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            BrooRecはLLMを活用した心療内科に通院する人のための一人用タイムライン型メモツールです。
            日々のメモからトレンドを生成し、心療内科医との会話をシミュレート。
            自身の体調を把握し、貴重な通院の機会を最大限に活用しましょう。
          </p>
        </div>
        <div className="text-center">
          <img
            width={200}
            height={200}
            src="/broorec.jpg"
            alt="BrooRecのイメージ"
            className="mx-auto rounded-lg w-full max-w-48"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              トレンド生成
            </h2>
            <p className="text-gray-600 leading-relaxed">
              あなたの直近のメモからトレンドを自動生成。日々の気分や体調の変化を視覚化し、
              自分自身をより深く理解する手助けをします。
            </p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              医師との会話シミュレーション
            </h2>
            <p className="text-gray-600 leading-relaxed">
              心療内科医との会話をシミュレートすることで、通院時に伝えたいことを整理し、
              限られた時間を有効に活用できます。
            </p>
          </div>
        </div>
        <div className="mb-4 p-4 bg-gray-100 rounded-lg max-h-40 overflow-y-auto text-sm text-gray-600">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            プライバシーポリシー
          </h3>
          <p>
            本アプリ（以下「当アプリ」）では、ユーザーのプライバシーを尊重し、個人情報の保護に最大限努めます。本ポリシーでは、当アプリにおける情報の取り扱いについて説明します。
            ...（省略。必要に応じて全文を記載）...
          </p>
        </div>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="acceptPolicy"
            className="mr-2"
            checked={isPolicyAccepted}
            onChange={(e) => setIsPolicyAccepted(e.target.checked)}
          />
          <label htmlFor="acceptPolicy" className="text-gray-800">
            プライバシーポリシーに同意します
          </label>
        </div>
        <div className="space-x-2 text-center pb-8">
          <Button
            className="w-full md:w-auto bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded mb-4 shadow-md disabled:bg-gray-300"
            onClick={handleAnonymousLogin}
            disabled={!isPolicyAccepted || loading}
          >
            匿名ではじめる（オススメ）
          </Button>
          <Button
            className="w-full md:w-auto bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded shadow-md disabled:bg-gray-300"
            onClick={handleGoogleLogin}
            disabled={!isPolicyAccepted || loading}
          >
            Googleではじめる
          </Button>
        </div>
      </div>
    </div>
  );
}
