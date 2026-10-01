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
import Notification from './pages/Notification.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminOverview from './pages/admin/AdminOverview.jsx'
import AdminIssues from './pages/admin/AdminIssues.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'
import AdminCategories from './pages/admin/AdminCategories.jsx'
import AdminAnalytics from './pages/admin/AdminAnalytics.jsx'
import AdminSettingsPage from './pages/admin/AdminSettingsPage.jsx'
import { getTheme, setTheme, isAuthenticated, getUser } from './services/authService'

// Admins land in the admin panel instead of the public homepage —
// covers page refreshes / direct visits to "/", not just the login moment.
function HomeRoute() {
  if (isAuthenticated() && getUser().isAdmin) {
    return <Navigate to="/admin" replace />
  }
  return <Home />
}

export default function App() {
  useEffect(() => {
    setTheme(getTheme())
  }, [])

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/login" element={<Login />} />
        <Route path="/browse_feed" element={<BrowseFeed />} />
        <Route path="/post/:id" element={<PostDetails />} />
        <Route path="/user" element={<UserProfile />} />
        <Route path="/edit_profile" element={<ProfileEdit />} />
        <Route path="/report" element={<ReportIssue />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notification />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="issues" element={<AdminIssues />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}