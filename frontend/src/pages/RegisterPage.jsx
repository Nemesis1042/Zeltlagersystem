import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

export default function RegisterPage({ onRegister }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    vorname: '',
    nachname: '',
    telefon: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('/api/auth/register', formData)
      localStorage.setItem('token', response.data.access_token)
      onRegister(response.data.access_token)
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">MA-Registrierung</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Vorname</label>
            <input
              type="text"
              name="vorname"
              value={formData.vorname}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Nachname</label>
            <input
              type="text"
              name="nachname"
              value={formData.nachname}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Telefon</label>
            <input
              type="tel"
              name="telefon"
              value={formData.telefon}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Passwort</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Bereits registriert?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Zum Login
          </Link>
        </p>
      </div>
    </div>
  )
}
