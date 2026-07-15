"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sourceId, setSourceId] = useState("");
  const [status, setStatus] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const params = new URLSearchParams();
      if (sourceId) params.append("sourceId", sourceId);
      if (status) params.append("status", status);

      const res = await fetch(`${API_URL}/api/events?${params}`);
      const data = await res.json();
      setEvents(data.items || []);
      setLoading(false);
    }
    load();
  }, [sourceId, status, refresh]);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Webhook Hub — События</h1>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Source ID"
          value={sourceId}
          onChange={(e) => setSourceId(e.target.value)}
          className="border p-2 rounded w-64"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Все статусы</option>
          <option value="received">Received</option>
          <option value="pending">Pending</option>
          <option value="delivered">Delivered</option>
          <option value="failed">Failed</option>
        </select>
        <button
          onClick={() => setRefresh((r) => r + 1)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Обновить
        </button>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : events.length === 0 ? (
        <p>События не найдены</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">ID</th>
              <th className="border p-2 text-left">Source ID</th>
              <th className="border p-2 text-left">Статус</th>
              <th className="border p-2 text-left">Получено</th>
              <th className="border p-2 text-left">Действия</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="border p-2 font-mono text-sm">
                  {event.id.slice(0, 8)}...
                </td>
                <td className="border p-2 font-mono text-sm">
                  {event.sourceId.slice(0, 8)}...
                </td>
                <td className="border p-2">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      event.delivery.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : event.delivery.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {event.delivery.status}
                  </span>
                </td>
                <td className="border p-2 text-sm">
                  {new Date(event.receivedAt).toLocaleString("ru")}
                </td>
                <td className="border p-2">
                  <Link
                    href={`/events/${event.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    Детали
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
