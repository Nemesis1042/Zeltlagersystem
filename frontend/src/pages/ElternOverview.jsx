import { useState, useEffect } from 'react'
import ElternLayout from '../components/ElternLayout'

export default function ElternOverview({ onLogout }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(false)
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      setUser(userData)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  if (loading) {
    return (
      <ElternLayout onLogout={onLogout}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-3">⏳</div>
            <p className="text-slate-600">Laden...</p>
          </div>
        </div>
      </ElternLayout>
    )
  }

  return (
    <ElternLayout onLogout={onLogout}>
      <div className="space-y-6">
        <div className="card bg-green-50 border border-green-200">
          <h2 className="text-2xl font-bold text-green-600 mb-2">Willkommen!</h2>
          <p className="text-slate-600">
            Hallo {user?.vorname} {user?.nachname}, willkommen im BULA2026 Eltern Portal.
          </p>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/eltern/child" className="card hover:shadow-lg transition-shadow group cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="text-4xl group-hover:scale-110 transition-transform">👤</div>
              <div>
                <h3 className="font-bold text-slate-800 mb-1">Kinddaten anschauen</h3>
                <p className="text-sm text-slate-600">Alle Informationen zu Ihrem Kind</p>
              </div>
            </div>
          </a>

          <a href="/eltern/photos" className="card hover:shadow-lg transition-shadow group cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="text-4xl group-hover:scale-110 transition-transform">📸</div>
              <div>
                <h3 className="font-bold text-slate-800 mb-1">Fotos anschauen</h3>
                <p className="text-sm text-slate-600">Bilder vom Lager</p>
              </div>
            </div>
          </a>

          <a href="/eltern/activities" className="card hover:shadow-lg transition-shadow group cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="text-4xl group-hover:scale-110 transition-transform">🎯</div>
              <div>
                <h3 className="font-bold text-slate-800 mb-1">Aktivitäten</h3>
                <p className="text-sm text-slate-600">Verfügbare Aktivitäten sehen</p>
              </div>
            </div>
          </a>

          <a href="/eltern/contact" className="card hover:shadow-lg transition-shadow group cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="text-4xl group-hover:scale-110 transition-transform">💬</div>
              <div>
                <h3 className="font-bold text-slate-800 mb-1">Kontakt</h3>
                <p className="text-sm text-slate-600">Nachricht an die Lagerleitung</p>
              </div>
            </div>
          </a>
        </div>

        {/* Info Card */}
        <div className="card border-l-4 border-green-500">
          <h3 className="font-bold text-slate-800 mb-3">ℹ️ Wichtig</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>✓ Alle Daten sind verschlüsselt und sicher</li>
            <li>✓ Nur Sie haben Zugriff auf Ihre Kinddaten</li>
            <li>✓ Fotos werden nur mit Erlaubnis hochgeladen</li>
            <li>✓ Bei Fragen können Sie uns jederzeit kontaktieren</li>
          </ul>
        </div>

        {/* Support */}
        <div className="card bg-blue-50 border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-2">❓ Benötigen Sie Hilfe?</h3>
          <p className="text-sm text-blue-800 mb-3">
            Falls Sie Fragen haben oder etwas melden möchten, nutzen Sie bitte das Kontaktformular.
          </p>
          <a href="/eltern/contact" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
            Jetzt Nachricht senden
          </a>
        </div>
      </div>
    </ElternLayout>
  )
}
