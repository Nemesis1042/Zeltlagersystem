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
import AdminVerkauf from './pages/AdminVerkauf'

// Staff Pages
import StaffOverview from './pages/StaffOverview'
import StaffParticipants from './pages/StaffParticipants'
import StaffCheckIn from './pages/StaffCheckIn'
import StaffActivities from './pages/StaffActivities'
import StaffPocketMoney from './pages/StaffPocketMoney'
import StaffVerkauf from './pages/StaffVerkauf'

// Eltern Pages
import ElternOverview from './pages/ElternOverview'
import ElternChild from './pages/ElternChild'
import ElternPhotos from './pages/ElternPhotos'
import ElternActivities from './pages/ElternActivities'
import ElternContact from './pages/ElternContact'

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
        <Route
          path="/admin/verkauf"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AdminVerkauf onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />

        {/* Staff Routes */}
        <Route
          path="/staff/overview"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <StaffOverview onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/participants"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <StaffParticipants onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/check-in"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <StaffCheckIn onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/activities"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <StaffActivities onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/pocket-money"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <StaffPocketMoney onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/verkauf"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <StaffVerkauf onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route path="/staff" element={<Navigate to="/staff/overview" replace />} />
        <Route path="/ma-dashboard" element={<Navigate to="/staff/overview" replace />} />

        {/* Eltern Routes */}
        <Route
          path="/eltern/overview"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ElternOverview onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/eltern/child"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ElternChild onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/eltern/photos"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ElternPhotos onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/eltern/activities"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ElternActivities onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/eltern/contact"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ElternContact onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route path="/eltern" element={<Navigate to="/eltern/overview" replace />} />
        <Route path="/eltern-dashboard" element={<Navigate to="/eltern/overview" replace />} />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
