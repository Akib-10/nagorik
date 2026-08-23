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

// Theme ("light" | "dark") persisted in "nagorik_theme"; the dark look is
// applied by setting data-theme="dark" on <html>, which both stylesheets
// react to via their [data-theme="dark"] token overrides.
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
