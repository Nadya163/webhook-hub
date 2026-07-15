# Webhook Hub

Сервис для приёма, хранения и доставки webhook-событий.

## Как это работает

1. Создаёшь источник с именем и опциональным секретом
2. Внешний сервис шлёт POST на `/webhooks/:sourceId`
3. Мы проверяем секрет, сохраняем событие и сразу отвечаем 202
4. В фоне доставляем на `subscriberUrl` — до 3 попыток при ошибке
5. Все события видны в UI на localhost:3000

## Стек

- Node.js + Express — API (порт 4002)
- Next.js — UI (порт 3000)
- JSON файлы — хранение данных

## Запуск

Нужно три терминала:

**Терминал 1 — API:**

```bash
cd api
npm install
npm run dev
```

**Терминал 2 — Mock подписчик:**

```bash
node scripts/mock-subscriber.mjs
```

**Терминал 3 — UI:**

```bash
cd web
npm install
npm run dev
```

## Быстрый старт

```bash
curl -X POST http://localhost:4002/api/sources \
  -H "Content-Type: application/json" \
  -d '{"name":"payments","secret":"s3cret","subscriberUrl":"http://localhost:5001/deliver"}'

curl -X POST http://localhost:4002/webhooks/<SOURCE_ID> \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: s3cret" \
  -d '{"orderId": 42, "amount": 100}'

```

## Тест ретраев

```bash
curl -X POST http://localhost:4002/api/sources \
  -H "Content-Type: application/json" \
  -d '{"name":"test","subscriberUrl":"http://localhost:5001/deliver?fail=1"}'
```

## API

| Метод | Путь                  | Описание           |
| ----- | --------------------- | ------------------ |
| POST  | /api/sources          | Создать источник   |
| POST  | /webhooks/:sourceId   | Принять webhook    |
| GET   | /api/events           | Список событий     |
| GET   | /api/events/:id       | Детали события     |
| POST  | /api/events/:id/retry | Повторить доставку |
| GET   | /health               | Проверка сервера   |

## Переменные окружения

**api/.env:**

PORT=4002
SUBSCRIBER_URL=http://localhost:5001/deliver

**web/.env.local:**
NEXT_PUBLIC_API_URL=http://localhost:4002
