import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminDashboard from './pages/AdminDashboard'
import RegistrationForm from './pages/RegistrationForm'
import ScannerPage from './pages/ScannerPage'
import ProtectedRoute from './components/ProtectedRoute'
import { registerServiceWorker } from './utils/offlineStorage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'))

  useEffect(() => {
    registerServiceWorker()
  }, [])

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
        <Route
          path="/anmeldung"
          element={isAuthenticated ? <Navigate to="/admin" replace /> : <RegistrationForm />}
        />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage onRegister={handleLogin} />} />

        <Route
          path="/scanner"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ScannerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AdminDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={isAuthenticated ? <Navigate to="/admin" replace /> : <Navigate to="/anmeldung" replace />} />
      </Routes>
    </Router>
  )
}

export default App
