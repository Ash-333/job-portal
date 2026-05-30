import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import { queryClient } from './lib/queryClient'
import { useAuthStore } from './lib/store'
import { useEffect, useState } from 'react'
import { authAPI } from './lib/api'
import { ErrorBoundary } from './components/ErrorBoundary'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import JobsPage from './pages/JobsPage'
import JobFormPage from './pages/JobFormPage'
import JobViewPage from './pages/JobViewPage'
import JobApplicantsPage from './pages/JobApplicantsPage'
import JobApprovalsPage from './pages/JobApprovalsPage'
import UsersPage from './pages/UsersPage'
import UserViewPage from './pages/UserViewPage'
import ApplicationsPage from './pages/ApplicationsPage'
import BlogsPage from './pages/BlogsPage'
import BlogFormPage from './pages/BlogFormPage'
import BlogViewPage from './pages/BlogViewPage'
import AnalyticsPage from './pages/AnalyticsPage'
import AuditLogsPage from './pages/AuditLogsPage'
import PlansPage from './pages/PlansPage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import SponsoredCompaniesPage from './pages/SponsoredCompaniesPage'

// Layout
import Layout from './components/Layout'

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  )
}

function App() {
  const { isAuthenticated, admin, isLoading, setLoading, login, logout } = useAuthStore()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('admin_token')
      if (token && !admin) {
        try {
          setLoading(true)
          const response = await authAPI.getProfile()
          login(response.admin, token)
        } catch {
          logout()
        } finally {
          setLoading(false)
          setInitialized(true)
        }
      } else {
        setLoading(false)
        setInitialized(true)
      }
    }

    checkAuth()
  }, [])

  if (!initialized || isLoading) {
    return <LoadingScreen />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route
                path="/login"
                element={
                  isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
                }
              />
              <Route
                path="/register"
                element={
                  isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
                }
              />
              <Route
                path="/*"
                element={
                  isAuthenticated ? (
                    <Layout>
                      <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/jobs" element={<JobsPage />} />
                        <Route path="/jobs/new" element={<JobFormPage />} />
                        <Route path="/jobs/:id" element={<JobViewPage />} />
                        <Route path="/jobs/:id/applicants" element={<JobApplicantsPage />} />
                        <Route path="/jobs/:id/edit" element={<JobFormPage />} />
                        <Route path="/job-approvals" element={<JobApprovalsPage />} />
                        <Route path="/job-seekers" element={<UsersPage role="USER" />} />
                        <Route path="/job-seekers/:id" element={<UserViewPage />} />
                        <Route path="/employers" element={<UsersPage role="EMPLOYER" />} />
                        <Route path="/employers/:id" element={<UserViewPage />} />
                        <Route path="/applications" element={<ApplicationsPage />} />
                        <Route path="/blogs" element={<BlogsPage />} />
                        <Route path="/blogs/new" element={<BlogFormPage />} />
                        <Route path="/blogs/:id" element={<BlogViewPage />} />
                        <Route path="/blogs/:id/edit" element={<BlogFormPage />} />
                        <Route path="/analytics" element={<AnalyticsPage />} />
                        <Route path="/audit-logs" element={<AuditLogsPage />} />
                        <Route path="/plans" element={<PlansPage />} />
                        <Route path="/subscriptions" element={<SubscriptionsPage />} />
                        <Route path="/sponsored-companies" element={<SponsoredCompaniesPage />} />
                      </Routes>
                    </Layout>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
            </Routes>
            <Toaster position="top-right" />
          </div>
        </Router>
      </ErrorBoundary>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

export default App
