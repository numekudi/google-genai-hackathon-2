import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

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

export default function TrendsPage() {
  const [trends, setTrends] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [consultation, setConsultation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = "/api/trends";
    const eventSource = new EventSource(url);
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
    eventSource.onerror = (e) => {
      eventSource.close();
    };
    eventSource.onopen = () => setLoading(false);
    return () => eventSource.close();
  }, []);

  return (
    <div className="overflow-y-scroll pb-20 hidden-scrollbar h-full border-x border-gray-200 bg-white/80 rounded-2xl shadow-lg p-4 max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-indigo-500 mb-4 flex items-center gap-2">
        <span>「いま」を見つめよう</span>
        <span className="text-lg">✨</span>
      </h2>
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 bg-indigo-50 rounded-xl border border-indigo-100 shadow-inner animate-fade-in">
          <div className="mb-4">
            <span className="block w-10 h-10 border-4 border-indigo-300 border-t-indigo-500 rounded-full animate-spin"></span>
          </div>
          <div className="text-indigo-500 font-semibold text-lg tracking-wide">
            読み込み中...
          </div>
          <div className="text-gray-400 text-sm mt-2">
            トレンドを集計しています。少々お待ちください。
          </div>
        </div>
      )}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && trends.length === 0 && (
        <p className="p-4 text-gray-400 bg-indigo-50 rounded-xl text-center">
          ポストを作成することでトレンドを生成できます。
          <br />
          ポストしてみましょう！
        </p>
      )}
      {!loading && !error && trends.length > 0 && (
        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-semibold mb-2 text-indigo-600 flex items-center gap-1">
              <span>トレンドリスト</span>
              <span>📈</span>
            </h3>
            <ul className="list-disc pl-5 text-base text-gray-700">
              {trends.map((trend, i) => (
                <li key={i}>{trend}</li>
              ))}
            </ul>
          </section>
          {consultation && (
            <section>
              <h3 className="text-lg font-semibold mb-2 text-indigo-600 flex items-center gap-1">
                <span>相談例</span>
                <span>💬</span>
              </h3>
              <div className="bg-indigo-50 p-3 rounded whitespace-pre-line text-gray-700">
                <ReactMarkdown>{consultation}</ReactMarkdown>
              </div>
            </section>
          )}
          <section>
            <h3 className="text-lg font-semibold mb-2 text-indigo-600 flex items-center gap-1">
              <span>まとめ</span>
              <span>📝</span>
            </h3>
            <div className="bg-gray-50 p-3 rounded whitespace-pre-line text-gray-700">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
