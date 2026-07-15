"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EventDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/events/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);
        setLoading(false);
      });
  }, [id]);

  async function handleRetry() {
    setRetrying(true);
    await fetch(`${API_URL}/api/events/${id}/retry`, { method: "POST" });
    setTimeout(() => {
      fetch(`${API_URL}/api/events/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setEvent(data);
          setRetrying(false);
        });
    }, 2000);
  }

  if (loading) return <div className="p-8">Загрузка...</div>;
  if (!event) return <div className="p-8">Событие не найдено</div>;

  return (
    <main className="p-8 max-w-4xl">
      <button
        onClick={() => router.back()}
        className="text-blue-500 hover:underline mb-6 block"
      >
        ← Назад
      </button>

      <h1 className="text-2xl font-bold mb-6">Событие {id.slice(0, 8)}...</h1>

      <div className="flex items-center gap-4 mb-6">
        <span
          className={`px-3 py-1 rounded ${
            event.delivery.status === "delivered"
              ? "bg-green-100 text-green-800"
              : event.delivery.status === "failed"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {event.delivery.status}
        </span>
        <button
          onClick={handleRetry}
          disabled={retrying}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
        >
          {retrying ? "Повторяем..." : "Повторить доставку"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border rounded p-4">
          <h2 className="font-bold mb-2">Информация</h2>
          <p className="text-sm">
            <b>ID:</b> {event.id}
          </p>
          <p className="text-sm">
            <b>Source ID:</b> {event.sourceId}
          </p>
          <p className="text-sm">
            <b>Получено:</b> {new Date(event.receivedAt).toLocaleString("ru")}
          </p>
        </div>
        <div className="border rounded p-4">
          <h2 className="font-bold mb-2">Headers</h2>
          <pre className="text-sm bg-gray-50 p-2 rounded overflow-auto">
            {JSON.stringify(event.headers, null, 2)}
          </pre>
        </div>
      </div>

      <div className="border rounded p-4 mb-6">
        <h2 className="font-bold mb-2">Body</h2>
        <pre className="text-sm bg-gray-50 p-2 rounded overflow-auto">
          {JSON.stringify(event.body, null, 2)}
        </pre>
      </div>

      <div className="border rounded p-4">
        <h2 className="font-bold mb-2">
          История доставки ({event.delivery.attempts.length} попыток)
        </h2>
        {event.delivery.attempts.length === 0 ? (
          <p className="text-sm text-gray-500">Попыток ещё не было</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left text-sm">Время</th>
                <th className="border p-2 text-left text-sm">Статус код</th>
                <th className="border p-2 text-left text-sm">Ошибка</th>
              </tr>
            </thead>
            <tbody>
              {event.delivery.attempts.map((attempt, i) => (
                <tr key={i}>
                  <td className="border p-2 text-sm">
                    {new Date(attempt.at).toLocaleString("ru")}
                  </td>
                  <td className="border p-2 text-sm">
                    {attempt.statusCode || "-"}
                  </td>
                  <td className="border p-2 text-sm text-red-600">
                    {attempt.error || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {event.delivery.lastError && (
          <p className="mt-2 text-sm text-red-600">
            Последняя ошибка: {event.delivery.lastError}
          </p>
        )}
      </div>
    </main>
  );
}
