import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import BrowseFeed from './pages/BrowseFeed.jsx'
import PostDetails from './pages/PostDetails.jsx'
import UserProfile from './pages/UserProfile.jsx'
import ProfileEdit from './pages/ProfileEdit.jsx'
import ReportIssue from './pages/ReportIssue.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/browse_feed" element={<BrowseFeed />} />
      <Route path="/post/:id" element={<PostDetails />} />
      <Route path="/user" element={<UserProfile />} />
      <Route path="/edit_profile" element={<ProfileEdit />} />
      <Route path="/report" element={<ReportIssue />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}