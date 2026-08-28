import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { setPageStyles } from './styles/usePageStyles'

const LANDING_PATHS = new Set(['/', '/login'])
setPageStyles(LANDING_PATHS.has(window.location.pathname) ? 'landing' : 'app')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)