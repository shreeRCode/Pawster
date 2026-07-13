// Central API base URL for the whole app. Override with VITE_API_URL in
// production; falls back to the deployed API so the app works out of the box.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://pawster-pi.vercel.app";
