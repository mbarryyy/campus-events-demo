const BASE = '/api/events';

export async function getEvents(category) {
  const url = category ? `${BASE}?category=${encodeURIComponent(category)}` : BASE;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Failed to fetch events');
  }
  return res.json();
}

export async function getEvent(id) {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Failed to fetch event');
  }
  return res.json();
}

export async function createEvent(data) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Failed to create event');
  }
  return res.json();
}
