import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res) {
  if (!res.ok) {
    throw new Error(`${res.status}: ${res.statusText}`);
  }
}

export async function apiRequest(endpoint, method = "GET", data = null) {
  const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const res = await fetch(url, config);
  await throwIfResNotOk(res);
  
  if (res.headers.get("content-type")?.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

export const getQueryFn = (options = {}) => {
  const { on401 = "throw" } = options;
  
  return async ({ queryKey }) => {
    const endpoint = Array.isArray(queryKey) ? queryKey[0] : queryKey;
    
    try {
      return await apiRequest(endpoint);
    } catch (error) {
      if (error.message.includes("401") && on401 === "returnNull") {
        return null;
      }
      throw error;
    }
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn(),
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});