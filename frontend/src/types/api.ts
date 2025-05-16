const API_BASE_URL = 'http://localhost:3001';

// ../types/api.ts
export const apiRequest = async <T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: any,
  token?: string // Changed to string | undefined
): Promise<T> => {
  const headers: HeadersInit = {
    "Content-Type": body instanceof FormData ? "multipart/form-data" : "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`http://localhost:3001${endpoint}`, {
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || response.statusText);
  }

  return response.json();
};