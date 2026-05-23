import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminDashboard from './pages/AdminDashboard'
import MADashboard from './pages/MADashboard'
import ElternDashboard from './pages/ElternDashboard'
import RegistrationForm from './pages/RegistrationForm'
import ProtectedRoute from './components/ProtectedRoute'

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

        <Route
          path="/admin"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AdminDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ma-dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <MADashboard onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/eltern-dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ElternDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
