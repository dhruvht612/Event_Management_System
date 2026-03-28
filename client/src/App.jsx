import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { Layout } from './components/Layout.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { AdminRedirect } from './components/AdminRedirect.jsx'
import { AdminLayout } from './components/admin/AdminLayout.jsx'
import { Home } from './pages/Home.jsx'
import { Login } from './pages/Login.jsx'
import { Register } from './pages/Register.jsx'
import { ForgotPassword } from './pages/ForgotPassword.jsx'
import { AuthCallback } from './pages/AuthCallback.jsx'
import { Events } from './pages/Events.jsx'
import { EventDetail } from './pages/EventDetail.jsx'
import { Dashboard } from './pages/Dashboard.jsx'
import { NewEvent } from './pages/NewEvent.jsx'
import { Account } from './pages/Account.jsx'
import { NotFound } from './pages/NotFound.jsx'
import { AdminOverview } from './pages/admin/AdminOverview.jsx'
import { AdminEvents } from './pages/admin/AdminEvents.jsx'
import { AdminUsers } from './pages/admin/AdminUsers.jsx'
import { AdminRegistrations } from './pages/admin/AdminRegistrations.jsx'
import { AdminMemberships } from './pages/admin/AdminMemberships.jsx'
import { AdminModeration } from './pages/admin/AdminModeration.jsx'
import { AdminAnalytics } from './pages/admin/AdminAnalytics.jsx'
import { AdminSettings } from './pages/admin/AdminSettings.jsx'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminOverview />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="registrations" element={<AdminRegistrations />} />
              <Route path="memberships" element={<AdminMemberships />} />
              <Route path="moderation" element={<AdminModeration />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminRedirect>
                      <Dashboard />
                    </AdminRedirect>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/new"
                element={
                  <ProtectedRoute roles={['admin', 'organizer']}>
                    <NewEvent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                }
              />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
