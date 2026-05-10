export function getBackendBaseUrl(): string {
  const env = import.meta.env
  const baseUrl =
    env.PROD
      ? (env.VITE_BACKEND_API_URL as string | undefined)
      : "http://localhost:4000"

  if (!baseUrl) {
    throw new Error("Missing VITE_BACKEND_API_URL in production environment")
  }

  return baseUrl.replace(/\/+$/, "")
}
