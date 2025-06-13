import {
  GoogleAuthProvider,
  signInAnonymously,
  signInWithPopup,
} from "firebase/auth";
import { useState } from "react";
import Markdown from "react-markdown";
import { useFetcher } from "react-router";
import { Button } from "../components/ui/button";
import { auth } from "../lib/firebase.client";

export default function Home() {
  const [isPolicyAccepted, setIsPolicyAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const fetcher = useFetcher();
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const loginUser = await signInWithPopup(auth, provider);
      const idToken = await loginUser.user.getIdToken();
      fetcher.submit(
        { idToken },
        {
          method: "post",
          action: "/api/sessions",
        }
      );
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    try {
      const loginUser = await signInAnonymously(auth);
      const idToken = await loginUser.user.getIdToken();

      fetcher.submit(
        { idToken },
        {
          method: "post",
          action: "/api/sessions",
        }
      );
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-clover dark:bg-gray-950 text-gray-800 dark:text-gray-100">
      <div className="w-full mt-16 px-12 bg-white dark:bg-gray-900 rounded-lg">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-4 tracking-tight">
            Solilo
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
            Soliloは「独り言・独白」を意味するSoliloquyから生まれた、一人用SNSアプリです。
            自分だけの空間で、内なる声や日々の気持ちを気軽につぶやき、記録できます。
          </p>
          <p className="text-md text-gray-500 dark:text-gray-400 mb-4">
            「自分だけの空間でつぶやく」新しい体験を。
          </p>
        </div>
        <div className="text-center">
          <img
            width={200}
            height={200}
            src="/icon.jpeg"
            alt="Soliloのイメージ"
            className="mx-auto rounded-lg w-full max-w-48"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-6">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              トレンド可視化
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              あなたの投稿から自動でトレンドを抽出。日々の気分や体調の変化をグラフで可視化し、
              自分自身をより深く理解する手助けをします。
            </p>
          </div>
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              会話シミュレーション
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              仮想のカウンセラーや医師との会話をシミュレート。伝えたいことを整理し、
              本番の診察や相談の前に気持ちをまとめられます。
            </p>
          </div>
        </div>
        <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg max-h-40 overflow-y-auto text-sm text-gray-600 dark:text-gray-300">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
            プライバシーポリシー
          </h3>
          <Markdown>{`
# プライバシーポリシー

本アプリ（以下「当アプリ」）では、ユーザーのプライバシーを尊重し、個人情報の保護に最大限努めます。本ポリシーでは、当アプリにおける情報の取り扱いについて説明します。

## 1. 収集する情報

当アプリでは、以下の情報を収集・保存します：

- ユーザーが投稿したテキスト（任意入力）
- Googleログインによって取得される、名前・メールアドレス等のアカウント情報
- Firebase匿名ログインによる一意の識別子（UID）
- 利用状況に関するデータ（Google Analytics等による）

## 2. 利用目的

収集した情報は、以下の目的で利用します：

- ユーザーの投稿やプロフィールの表示
- アプリの改善、利用状況の把握
- セキュリティや不正利用の防止
- ユーザーサポート対応

## 3. データの保存と管理

ユーザーの投稿やアカウント情報は、Firebase（Google LLCが提供するクラウドサービス）上に安全に保存されます。保存されるサーバーは国外（主に米国）に所在する可能性があります。

## 4. 匿名ログインとアカウント連携

ユーザーは匿名のままアプリを利用開始できますが、Googleアカウントとの連携によって投稿やデータを引き継ぐことができます。匿名アカウントのまま利用を終了した場合、再ログイン時に以前のデータは復元されない可能性があります。

## 5. 第三者提供について

ユーザーの情報は、法令に基づく場合を除き、第三者に提供することはありません。ただし、Google Analyticsなどの解析サービスを通じて匿名化された利用データを収集することがあります。

## 6. アカウント削除とデータの取り扱い

ユーザーがアカウントを削除した場合、そのアカウントに紐づく投稿や個人情報は速やかに削除されます。匿名アカウントも、一定期間利用がない場合、自動的に削除されることがあります。

## 7. セキュリティ対策

ユーザー情報は暗号化された通信を通じて送信され、安全に保存されます。不正アクセスや漏洩を防ぐための対策を講じています。

## 8. ポリシーの変更について

必要に応じて、本プライバシーポリシーの内容を変更する場合があります。重要な変更がある場合は、アプリ内またはWebページ上でお知らせします。

`}</Markdown>
        </div>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="acceptPolicy"
            className="mr-2"
            checked={isPolicyAccepted}
            onChange={(e) => setIsPolicyAccepted(e.target.checked)}
          />
          <label
            htmlFor="acceptPolicy"
            className="text-gray-800 dark:text-gray-100"
          >
            プライバシーポリシーに同意します
          </label>
        </div>
        <div className="space-x-2 text-center pb-8">
          <Button
            className="w-full md:w-auto bg-gray-500 dark:bg-gray-700 hover:bg-gray-600 dark:hover:bg-gray-800 text-white px-4 py-2 rounded mb-4 shadow-md disabled:bg-gray-300 dark:disabled:bg-gray-600"
            onClick={handleAnonymousLogin}
            disabled={!isPolicyAccepted || loading}
          >
            匿名ではじめる（オススメ）
          </Button>
          <Button
            className="w-full md:w-auto bg-indigo-500 dark:bg-indigo-700 hover:bg-indigo-600 dark:hover:bg-indigo-800 text-white px-4 py-2 rounded shadow-md disabled:bg-gray-300 dark:disabled:bg-gray-600"
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
