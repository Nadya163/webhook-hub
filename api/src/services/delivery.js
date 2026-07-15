import { getEvents, saveEvents } from "./storage.js";

const DELAYS = [1000, 3000, 9000];

export async function attempt(event, subscriberUrl) {
  const response = await fetch(subscriberUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventId: event.id,
      sourceId: event.sourceId,
      payload: event.body,
      receivedAt: event.receivedAt,
    }),
  });
  return response;
}

async function updateEvent(eventId, update) {
  const events = await getEvents();
  const index = events.findIndex((event) => event.id === eventId);
  if (index === -1) return;

  update(events[index]);
  await saveEvents(events);
}

export async function deliverEvent(event, source) {
  const subscriberUrl = source.subscriberUrl || process.env.SUBSCRIBER_URL;

  if (!subscriberUrl) {
    await updateEvent(event.id, (e) => {
      e.delivery.status = "failed";
      e.delivery.lastError = "subscriberUrl не указан";
    });
    return;
  }

  for (let i = 0; i < 3; i++) {
    try {
      const response = await attempt(event, subscriberUrl);

      await updateEvent(event.id, (e) => {
        e.delivery.attempts.push({
          at: new Date().toISOString(),
          statusCode: response.status,
          error: null,
        });
      });

      if (response.ok) {
        await updateEvent(event.id, (e) => {
          e.delivery.status = "delivered";
        });
        return;
      }

      await updateEvent(event.id, (e) => {
        e.delivery.lastError = `HTTP ${response.status}`;
      });
    } catch (error) {
      await updateEvent(event.id, (e) => {
        e.delivery.attempts.push({
          at: new Date().toISOString(),
          statusCode: null,
          error: error.message,
        });
        e.delivery.lastError = error.message;
      });
    }
    if (i < 2) {
      await new Promise((resolve) => setTimeout(resolve, DELAYS[i]));
    }
  }
  await updateEvent(event.id, (e) => {
    e.delivery.status = "failed";
  });
}
