export const resolveSocketUrl = () => {
  const fromEnv = (import.meta as any)?.env?.VITE_SOCKET_URL as
    | string
    | undefined
  if (fromEnv) {
    return fromEnv
  }

  const api = (import.meta as any)?.env?.VITE_API_URL as string | undefined
  if (api) {
    try {
      const parsed = new URL(api)
      return parsed.origin
    } catch {
      // ignore parse errors and fall back to default
    }
  }

  return 'http://localhost:3000'
}
