export function getWebSocketUrl(path: string, token?: string | null): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Convert http/https to ws/wss
  let wsUrl = baseUrl.replace(/^http:/i, 'ws:').replace(/^https:/i, 'wss:');
  if (!wsUrl.endsWith('/')) {
    wsUrl += '/';
  }
  
  const fullUrl = new URL(cleanPath, wsUrl);
  
  const authToken = token || localStorage.getItem('medtrax_token');
  if (authToken) {
    fullUrl.searchParams.set('token', authToken);
  }
  
  return fullUrl.toString();
}
