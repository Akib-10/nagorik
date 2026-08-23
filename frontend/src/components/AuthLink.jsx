import { Link, useNavigate } from 'react-router-dom'
import { isAuthenticated } from '../services/authService'

// Mirrors the [data-requires-auth] click handler in assets/js/main.js:
// unauthenticated visitors are sent to /login with a ?next= return target.
export default function AuthLink({ to, children, className, ...rest }) {
  const navigate = useNavigate()

  const handleClick = (e) => {
    if (!isAuthenticated()) {
      e.preventDefault()
      navigate(`/login?next=${encodeURIComponent(to)}`)
    }
  }

  return (
    <Link to={to} className={className} onClick={handleClick} {...rest}>
      {children}
    </Link>
  )
}
