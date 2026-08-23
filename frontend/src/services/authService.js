// Demo session helpers — mirrors assets/js/main.js localStorage behaviour
// ("nagorik_auth" / "nagorik_user" / "nagorik_settings").

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

export function signIn({ name, email }) {
  localStorage.setItem('nagorik_auth', 'true')
  localStorage.setItem('nagorik_user', JSON.stringify({ name, email }))
}

export function signOut() {
  localStorage.removeItem('nagorik_auth')
  localStorage.removeItem('nagorik_user')
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
