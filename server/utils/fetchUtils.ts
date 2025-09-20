export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("accessToken");

  const headers = {
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    const data = await res.json();

    if (data.code === "TOKEN_EXPIRED") {
      // refresh access token
      const refreshRes = await fetch("http://localhost:3000/auth/renew-token", {
        method: "POST",
        credentials: "include",
      });

      const { accessToken } = await refreshRes.json();

      localStorage.setItem("accessToken", accessToken);

      // retry request
      return apiFetch(url, options);
    }
  }

  return res;
}
