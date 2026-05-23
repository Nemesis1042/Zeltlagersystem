import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function ElternDashboard({ onLogout }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [participant, setParticipant] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      setUser(userData)

      const token = localStorage.getItem('token')

      // Load participant data
      try {
        const partResponse = await api.get('/participants/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        setParticipant(partResponse.data)
      } catch (err) {
        console.error('Error loading participant:', err)
      }

      // Load photos
      try {
        const photoResponse = await api.get('/photos?camp_id=1', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        setPhotos(photoResponse.data || [])
      } catch (err) {
        console.error('Error loading photos:', err)
      }
    } catch (err) {
      setError('Fehler beim Laden der Daten')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    onLogout()
    navigate('/login')
  }

  const getRegistrationStatusColor = (status) => {
    if (status === 'angemeldet') return 'bg-green-50 border-green-200 text-green-800'
    if (status === 'in-bearbeitung') return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    return 'bg-red-50 border-red-200 text-red-800'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-3xl">⛺</div>
            <div>
              <h1 className="text-2xl font-bold text-navy">BULA2026 Eltern Portal</h1>
              <p className="text-sm text-slate-500">Fotos & Anmeldestatus</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="text-right">
                <p className="font-semibold text-navy">{user.vorname} {user.nachname}</p>
                <p className="text-sm text-slate-600">{user.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Abmelden
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-semibold">Fehler</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-3">⏳</div>
              <p className="text-slate-600">Daten werden geladen...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Registration Status */}
            {participant && (
              <div className="card">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">📋</div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-navy mb-3">Anmeldestatus</h2>
                    <div className={`p-4 rounded-lg border ${getRegistrationStatusColor(participant.status)}`}>
                      <p className="font-semibold mb-1">
                        {participant.status === 'angemeldet' ? '✓ Anmeldung bestätigt' :
                         participant.status === 'in-bearbeitung' ? '⏳ Anmeldung in Bearbeitung' :
                         '⚠️ Anmeldung erforderlich'}
                      </p>
                      {participant.first_name && (
                        <p className="text-sm">
                          <span className="font-semibold">Teilnehmer:</span> {participant.first_name} {participant.last_name}
                        </p>
                      )}
                      {participant.zelt && (
                        <p className="text-sm">
                          <span className="font-semibold">Zeltgruppe:</span> {participant.zelt}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Photos Gallery */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-3xl">📸</div>
                <h2 className="text-2xl font-bold text-navy">Lager-Fotos</h2>
              </div>

              {photos && photos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow"
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption || 'Lager Foto'}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {photo.caption && (
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-end p-4">
                          <p className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {photo.caption}
                          </p>
                        </div>
                      )}
                      {photo.date && (
                        <div className="absolute top-2 right-2 bg-navy/80 text-gold px-3 py-1 rounded-full text-xs font-semibold">
                          {new Date(photo.date).toLocaleDateString('de-DE')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="text-5xl mb-3">📷</div>
                  <p className="text-slate-600 mb-2">Noch keine Fotos vorhanden</p>
                  <p className="text-sm text-slate-500">Fotos werden hier angezeigt, sobald sie hochgeladen wurden.</p>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-gold/10 border border-gold/20 rounded-xl p-6">
              <div className="flex gap-4">
                <span className="text-3xl">💡</span>
                <div>
                  <p className="font-semibold text-navy mb-2">Informationen</p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    In diesem Portal können Sie den Anmeldestatus Ihres Kindes überprüfen und Fotos vom Lager ansehen. Aktualisierungen erfolgen automatisch.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
