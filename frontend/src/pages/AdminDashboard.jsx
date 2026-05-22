import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import ParticipantsPage from './ParticipantsPage'
import CheckInPage from './CheckInPage'
import TentsPage from './TentsPage'
import ActivitiesPage from './ActivitiesPage'
import GalleryPage from './GalleryPage'

export default function AdminDashboard({ onLogout }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [user, setUser] = useState(null)
  const [participants, setParticipants] = useState([])
  const [checkInStatus, setCheckInStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadUser()
    loadParticipants()
    loadCheckInStatus()
  }, [])

  const loadUser = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data)
    } catch (err) {
      navigate('/login')
    }
  }

  const loadParticipants = async () => {
    try {
      const response = await axios.get('/api/participants/?camp_id=1')
      setParticipants(response.data)
    } catch (err) {
      console.error('Error loading participants:', err)
    }
  }

  const loadCheckInStatus = async () => {
    try {
      const response = await axios.get('/api/check-in/status/1')
      setCheckInStatus(response.data)
    } catch (err) {
      console.error('Error loading check-in status:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    onLogout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">BULA2026 Admin Panel</h1>
          <div className="flex items-center space-x-4">
            {user && <span className="text-gray-700">{user.vorname} {user.nachname}</span>}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex space-x-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-4 ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            📊 Übersicht
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`py-2 px-4 ${activeTab === 'participants' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            👥 Teilnehmer
          </button>
          <button
            onClick={() => setActiveTab('check-in')}
            className={`py-2 px-4 ${activeTab === 'check-in' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            ✓ Check-In
          </button>
          <button
            onClick={() => setActiveTab('tents')}
            className={`py-2 px-4 ${activeTab === 'tents' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            🏕️ Zeltplätze
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`py-2 px-4 ${activeTab === 'activities' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            🎯 Aktivitäten
          </button>
          <button
            onClick={() => setActiveTab('pocket-money')}
            className={`py-2 px-4 ${activeTab === 'pocket-money' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            💰 Taschengeld
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`py-2 px-4 ${activeTab === 'gallery' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            📷 Galerie
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {checkInStatus && (
              <>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-600 text-sm font-medium">Angekommen</h3>
                  <p className="text-3xl font-bold text-green-600">{checkInStatus.checked_in}/{checkInStatus.total}</p>
                  <p className="text-xs text-gray-500">{checkInStatus.percentage}%</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-600 text-sm font-medium">Fehlen noch</h3>
                  <p className="text-3xl font-bold text-red-600">{checkInStatus.pending}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-600 text-sm font-medium">Teilnehmer Total</h3>
                  <p className="text-3xl font-bold text-blue-600">{participants.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-600 text-sm font-medium">System Status</h3>
                  <p className="text-lg font-bold text-green-600">✓ Online</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Participants */}
        {activeTab === 'participants' && (
          <ParticipantsPage />
        )}

        {/* Check-In */}
        {activeTab === 'check-in' && (
          <CheckInPage />
        )}

        {/* Tents */}
        {activeTab === 'tents' && (
          <TentsPage />
        )}

        {/* Activities */}
        {activeTab === 'activities' && (
          <ActivitiesPage />
        )}

        {/* Pocket Money */}
        {activeTab === 'pocket-money' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">💰 Taschengeld-System</h2>
            <p className="text-gray-600">Taschengeld & QR-Scanner verfügbar unter /scanner</p>
          </div>
        )}

        {/* Gallery */}
        {activeTab === 'gallery' && (
          <GalleryPage />
        )}
      </main>
    </div>
  )
}
