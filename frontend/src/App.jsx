import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import BrowseFeed from './pages/BrowseFeed.jsx'
import UserProfile from './pages/UserProfile.jsx'
import ReportIssue from './pages/ReportIssue.jsx'
import Settings from './pages/Settings.jsx'
import { getTheme, setTheme } from './services/authService'

export default function App() {
  // Restore the saved theme before any page renders.
  useEffect(() => {
    setTheme(getTheme())
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/browse_feed" element={<BrowseFeed />} />
      <Route path="/user" element={<UserProfile />} />
      <Route path="/report" element={<ReportIssue />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
