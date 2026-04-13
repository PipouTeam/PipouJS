const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function getToken() {
  return localStorage.getItem('token')
}

async function request(method, path, body = null, auth = false) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Erreur serveur')
  return data
}

export const api = {
  get:    (path, auth = false)         => request('GET',    path, null, auth),
  post:   (path, body, auth = false)   => request('POST',   path, body, auth),
  put:    (path, body, auth = false)   => request('PUT',    path, body, auth),
  delete: (path, auth = false)         => request('DELETE', path, null, auth),
}
