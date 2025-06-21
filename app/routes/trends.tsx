import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { redirect, type LoaderFunctionArgs } from "react-router";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer, ChartTooltip } from "~/components/ui/chart";
import { adminAuth } from "~/lib/firebaseAdmin.server";
import { getPostsByTimeRange } from "~/repositories/posts";
import { getSession } from "~/sessions.server";
import type { Route } from "./+types/trends";

interface TrendsDelta {
  type: "trends";
  trends: string[];
}
interface SummaryDelta {
  type: "summary";
  content: string;
}
interface ConsultationDelta {
  type: "consultation";
  content: string;
}

type SSEMessage = TrendsDelta | SummaryDelta | ConsultationDelta;

interface MoodData {
  date: string;
  mood: number;
  timestamp: number;
}

export async function loader({ request }: LoaderFunctionArgs) {
  // /api/posts から気分データを取得
  const session = await getSession(request.headers.get("Cookie"));
  const idToken = session.get("idToken");
  if (!idToken) return redirect("/");
  const user = await adminAuth.verifyIdToken(idToken as string);
  const userId = user.uid; // Use the verified user ID from Firebase
  const res = await getPostsByTimeRange(
    userId,
    new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000), // 過去90日間
    100
  );
  if (!res) return { posts: [] };
  const posts = res.map((post) => ({
    ...post,
  }));
  return { posts };
}

export default function TrendsPage({ loaderData }: Route.ComponentProps) {
  const [trends, setTrends] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [consultation, setConsultation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const url = "/api/trends";
    const eventSource = new EventSource(url);
    setIsGenerating(true);
    eventSource.onmessage = (event) => {
      try {
        const data: SSEMessage = JSON.parse(event.data);
        if (data.type === "trends") setTrends(data.trends);
        if (data.type === "summary") setSummary((prev) => prev + data.content);
        if (data.type === "consultation")
          setConsultation((prev) => prev + data.content);
      } catch (e) {
        setError("データの解析に失敗しました");
      }
    };
    eventSource.onerror = () => {
      setIsGenerating(false);
      setLoading(false);
      eventSource.close();
    };
    eventSource.onopen = () => setLoading(false);
    return () => eventSource.close();
  }, []);

  // 気分データを処理
  const postsWithMood = loaderData.posts
    .filter((post: any) => post.mood !== undefined)
    .map((post: any) => ({
      // timestampはDate型に変換しておく
      timestamp: new Date(post.createdAt || post.timestamp).getTime(),
      mood: post.mood,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="border-x border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-lg p-4 max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-indigo-500 dark:text-indigo-400 mb-4 flex items-center gap-2">
        <span>「いま」を見つめよう</span>
        <span className="text-lg">✨</span>
      </h2>
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 bg-indigo-50 dark:bg-gray-800 rounded-xl border border-indigo-100 dark:border-gray-700 shadow-inner animate-fade-in">
          <div className="mb-4">
            <span className="block w-10 h-10 border-4 border-indigo-300 border-t-indigo-500 rounded-full animate-spin"></span>
          </div>
          <div className="text-indigo-500 dark:text-indigo-400 font-semibold text-lg tracking-wide">
            読み込み中...
          </div>
          <div className="text-gray-400 dark:text-gray-300 text-sm mt-2">
            トレンドを集計しています。少々お待ちください。
          </div>
        </div>
      )}
      {/* 生成中UI */}
      {!loading && isGenerating && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center justify-center px-4 py-3 bg-yellow-50 dark:bg-gray-800 rounded-xl border border-yellow-200 dark:border-gray-700 shadow-lg animate-fade-in min-w-[220px] max-w-xs">
          <div className="text-yellow-500 dark:text-yellow-400 text-xs">
            AIがまとめや相談例を生成しています
          </div>
        </div>
      )}
      {error && <div className="text-red-500 dark:text-red-400">{error}</div>}
      {!loading && !error && trends.length === 0 && (
        <p className="p-4 text-gray-400 dark:text-gray-300 bg-indigo-50 dark:bg-gray-800 rounded-xl text-center">
          ポストを作成することでトレンドを生成できます。
          <br />
          ポストしてみましょう！
        </p>
      )}
      {!loading && !error && trends.length > 0 && (
        <div className="space-y-6">
          {/* 気分チャート */}
          {postsWithMood.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-2 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <span>気分の変化</span>
                <span>📊</span>
              </h3>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <ChartContainer
                  config={{
                    mood: {
                      label: "気分",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px] max-w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={postsWithMood}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis
                        dataKey="timestamp"
                        className="text-xs fill-muted-foreground"
                        tickFormatter={(ts) => {
                          const d = new Date(ts);
                          return `${d.getMonth() + 1}/${d.getDate()}`;
                        }}
                        type="number"
                        domain={["dataMin", "dataMax"]}
                        scale="time"
                      />
                      <YAxis
                        domain={[1, 7]}
                        className="text-xs fill-muted-foreground"
                      />
                      <ChartTooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const d = new Date(payload[0].payload.timestamp);
                            return (
                              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-lg">
                                <p className="text-sm font-medium">{`日付: ${
                                  d.getMonth() + 1
                                }/${d.getDate()} ${d.getHours()}:${d
                                  .getMinutes()
                                  .toString()
                                  .padStart(2, "0")}`}</p>
                                <p className="text-sm text-indigo-600 dark:text-indigo-400">
                                  {`気分: ${payload[0].value}/7`}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="mood"
                        stroke="hsl(239, 84%, 67%)"
                        strokeWidth={3}
                        dot={{
                          fill: "hsl(239, 84%, 67%)",
                          strokeWidth: 2,
                          r: 4,
                        }}
                        activeDot={{
                          r: 6,
                          stroke: "hsl(239, 84%, 67%)",
                          strokeWidth: 2,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                  横軸: 日付・時刻 / 縦軸: 気分レベル (1-7)
                </div>
              </div>
            </section>
          )}

          <section>
            <h3 className="text-lg font-semibold mb-2 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <span>トレンドリスト</span>
              <span>📈</span>
            </h3>
            <ul className="list-disc pl-5 text-base text-gray-700 dark:text-gray-300">
              {trends.map((trend, i) => (
                <li key={i}>{trend}</li>
              ))}
            </ul>
          </section>
          {consultation && (
            <section>
              <h3 className="text-lg font-semibold mb-2 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <span>相談例</span>
                <span>💬</span>
              </h3>
              <div className="bg-indigo-50 dark:bg-gray-800 p-3 rounded whitespace-pre-line text-gray-700 dark:text-gray-300">
                <ReactMarkdown>{consultation}</ReactMarkdown>
              </div>
            </section>
          )}
          <section>
            <h3 className="text-lg font-semibold mb-2 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <span>まとめ</span>
              <span>📝</span>
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded whitespace-pre-line text-gray-700 dark:text-gray-300">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
