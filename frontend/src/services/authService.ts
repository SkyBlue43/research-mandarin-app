const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function loginUser(username: string, password: string) {
  const result = await fetch(`${BASE}/check-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  });

  if (!result.ok) {
    const errorData = await result.json();
    throw new Error(errorData.detail || "Login failed");
  }

  return await result.json();
}
