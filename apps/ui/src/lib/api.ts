export async function api<T>(path: string, body: T) {
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (res.status !== 200) {
    throw new Error(await res.text());
  }

  return res.json();
}
