const API_BASE = 'http://localhost:5000/api/auth'

export function isAuthenticated() {
  return localStorage.getItem('nagorik_auth') === 'true'
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('nagorik_user') || '{}')
  } catch {
    return {}
  }
}

function saveSession(data) {
  localStorage.setItem('nagorik_auth', 'true')
  localStorage.setItem('nagorik_token', data.token)
  localStorage.setItem(
    'nagorik_user',
    JSON.stringify({
      name: data.name,
      email: data.email,
      isAdmin: data.isAdmin
    })
  )
}

export async function signIn({ email, password }) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || 'Sign in failed')
  }
  saveSession(data)
  return data
}

export async function register({ name, email, password }) {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || 'Registration failed')
  }
  saveSession(data)
  return data
}

export function signOut() {
  localStorage.removeItem('nagorik_auth')
  localStorage.removeItem('nagorik_user')
  localStorage.removeItem('nagorik_token')
}

export function getSettings() {
  try {
    return JSON.parse(localStorage.getItem('nagorik_settings') || '{}')
  } catch {
    return {}
  }
}

export function saveSettings(settings) {
  localStorage.setItem('nagorik_settings', JSON.stringify(settings))
}

export function getTheme() {
  return localStorage.getItem('nagorik_theme') === 'dark' ? 'dark' : 'light'
}

export function setTheme(theme) {
  const value = theme === 'dark' ? 'dark' : 'light'
  localStorage.setItem('nagorik_theme', value)
  if (value === 'dark') {
    document.documentElement.dataset.theme = 'dark'
  } else {
    delete document.documentElement.dataset.theme
  }
}