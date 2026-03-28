import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

/** Sends admins to the Admin Portal instead of the attendee dashboard. */
export function AdminRedirect({ children }) {
  const { user } = useAuth()
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />
  }
  return children
}
