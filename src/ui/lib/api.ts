export const getApiBase = () => {
  const apiProxy = import.meta.env.VITE_API_PROXY as string | undefined
  if (apiProxy) {
    return apiProxy.replace(/\/$/, '')
  }
  return ''
}
