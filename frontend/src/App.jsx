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

// Where a signed-in user belongs: admins in the admin panel, everyone else in
// the browse feed.
function homeFor(user) {
  return user.isAdmin ? '/admin' : '/browse_feed'
}

// The landing page is for signed-out visitors only. A signed-in user who hits
// "/" (browser back button, typed URL, refresh) is redirected with `replace`,
// so the landing page never stays in their history.
function HomeRoute() {
  if (isAuthenticated()) {
    return <Navigate to={homeFor(getUser())} replace />
  }
  return <Home />
}

// Same idea for the login page: no reason to show it to someone already in.
function LoginRoute() {
  if (isAuthenticated()) {
    return <Navigate to={homeFor(getUser())} replace />
  }
  return <Login />
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
        <Route path="/login" element={<LoginRoute />} />
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