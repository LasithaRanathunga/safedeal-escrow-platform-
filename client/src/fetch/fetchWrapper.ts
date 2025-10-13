import ApiError from "./ApiError";

export async function handleAcessToken(
  callback: (token: string) => Promise<undefined>,
  failAction?: () => void
) {
  try {
    // Get token from localStorage
    const token = localStorage.getItem("accessToken") as string;
    console.log("Token:", token);

    const callbackRes = await callback(token);
    return callbackRes;
  } catch (error) {
    console.log("Error in fetchWrapper:", error);
    if (error instanceof ApiError && error.code === "TOKEN_EXPIRED") {
      console.log("Token expired, attempting to refresh...");
      try {
        const refreshToken = localStorage.getItem("refreshToken");

        const res = await fetch("http://localhost:3000/auth/renew-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });

        // If refresh was successful, update the access token in localStorage
        if (res.ok) {
          const resData = await res.json();
          localStorage.setItem("accessToken", resData.accessToken);
        }
      } catch (error) {
        console.log("Error in renewing token:", error);
        return;
      }

      // Get token from localStorage
      const token = localStorage.getItem("accessToken") as string;
      console.log("Token:", token);

      const callbackRes = await callback(token);
      return callbackRes;
    } else {
      if (failAction) {
        failAction();
      }

      return;
    }
  }
}
