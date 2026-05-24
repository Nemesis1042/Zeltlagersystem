import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RegistrationForm from './pages/RegistrationForm'
import ProtectedRoute from './components/ProtectedRoute'

// Admin Pages
import AdminOverview from './pages/AdminOverview'
import AdminCamps from './pages/AdminCamps'
import AdminParticipants from './pages/AdminParticipants'
import AdminCheckIn from './pages/AdminCheckIn'
import AdminTents from './pages/AdminTents'
import AdminActivities from './pages/AdminActivities'
import AdminPhotos from './pages/AdminPhotos'
import AdminFinances from './pages/AdminFinances'
import AdminReports from './pages/AdminReports'
import AdminAdministration from './pages/AdminAdministration'
import AdminPermissions from './pages/AdminPermissions'

// MA/Staff Pages
import MADashboard from './pages/MADashboard'

// Eltern Pages
import ElternDashboard from './pages/ElternDashboard'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'))

  const handleLogin = (token) => {
    localStorage.setItem('token', token)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
  }

  return (
    <Router>
      <Routes>
        <Route path="/anmeldung" element={<RegistrationForm />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage onRegister={handleLogin} />} />

        {/* Admin Routes */}
        <Route
          path="/admin/overview"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AdminOverview onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/camps"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AdminCamps onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/finances"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AdminFinances onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AdminReports onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/administration"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AdminAdministration onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/participants"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AdminParticipants onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/check-in"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AdminCheckIn onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tents"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AdminTents onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/activities"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AdminActivities onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/photos"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AdminPhotos onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/permissions"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AdminPermissions onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />

        {/* MA/Staff Routes */}
        <Route
          path="/staff/*"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <MADashboard onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route path="/ma-dashboard" element={<Navigate to="/staff" replace />} />

        {/* Eltern Routes */}
        <Route
          path="/eltern/*"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ElternDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route path="/eltern-dashboard" element={<Navigate to="/eltern" replace />} />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
