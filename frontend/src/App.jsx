import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import BrowseFeed from './pages/BrowseFeed.jsx'
import PostDetails from './pages/PostDetails.jsx'
import UserProfile from './pages/UserProfile.jsx'
import ProfileEdit from './pages/ProfileEdit.jsx'
import ReportIssue from './pages/ReportIssue.jsx'
import Settings from './pages/Settings.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import { getTheme, setTheme } from './services/authService'

export default function App() {
  // Restore the saved theme before any page renders.
  useEffect(() => {
    setTheme(getTheme())
  }, [])

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/browse_feed" element={<BrowseFeed />} />
        <Route path="/post/:id" element={<PostDetails />} />
        <Route path="/user" element={<UserProfile />} />
        <Route path="/edit_profile" element={<ProfileEdit />} />
        <Route path="/report" element={<ReportIssue />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
