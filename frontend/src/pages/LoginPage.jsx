import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/login', { email, password })
      const token = response.data.token
      const user = response.data.user

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      onLogin(token, user)

      // Rollen-basierte Weiterleitung
      const role = user.role
      if (role === 'admin') {
        navigate('/admin')
      } else if (role === 'ma') {
        navigate('/ma-dashboard')
      } else if (role === 'eltern') {
        navigate('/eltern-dashboard')
      } else {
        navigate('/admin')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-navy text-gold text-3xl font-bold px-6 py-4 rounded-2xl mb-4">
            ⛺ BULA2026
          </div>
          <h1 className="text-3xl font-bold text-navy">Zeltlager Portal</h1>
          <p className="text-slate-600 mt-2">Mitarbeiter • Admin • Eltern</p>
        </div>

        {/* Card */}
        <div className="card">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-start gap-3">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="font-semibold">Login fehlgeschlagen</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                📧 Email-Adresse
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.de"
                className="input-field"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                🔐 Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                required
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span> Wird angemeldet...
                </>
              ) : (
                <>
                  <span>🔓</span> Anmelden
                </>
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-gold/10 border border-gold/20 rounded-xl">
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-navy">💡 Hinweis:</span> Du wirst automatisch zum passenden Dashboard weitergeleitet basierend auf deiner Rolle.
            </p>
          </div>
        </div>

        {/* Registration Link */}
        <div className="mt-6 text-center">
          <p className="text-slate-600 mb-2">Noch kein Account?</p>
          <Link
            to="/anmeldung"
            className="inline-block bg-navy text-white px-6 py-2 rounded-xl hover:bg-navy-light transition-colors font-medium"
          >
            Zur Anmeldung →
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-500 space-y-1">
          <p>🔒 Sichere Anmeldung</p>
          <p>Mitarbeiter | Admin | Eltern</p>
        </div>
      </div>
    </div>
  )
}
