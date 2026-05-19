const BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

let _token = localStorage.getItem('ber5_token') || null;

export function setToken(token) {
  _token = token;
  if (token) localStorage.setItem('ber5_token', token);
  else localStorage.removeItem('ber5_token');
}

export function getToken() {
  return _token;
}

export async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (_token) headers['Authorization'] = `Bearer ${_token}`;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json.data;
}
