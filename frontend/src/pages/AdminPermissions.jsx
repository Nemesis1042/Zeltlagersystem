import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import PermissionsManagement from '../components/PermissionsManagement'

export default function AdminPermissions({ onLogout }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(false)
    } catch (err) {
      setError('Fehler beim Laden der Berechtigungen')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout onLogout={onLogout}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-3">⏳</div>
            <p className="text-slate-600">Berechtigungen werden geladen...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-navy mb-2">🔐 Berechtigungen & Benutzer</h2>
          <p className="text-slate-600">Verwalten Sie Rollen, Berechtigungen und Benutzerkonten</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-semibold">Fehler</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Role Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card border-l-4 border-purple-500">
            <div className="flex items-start gap-3">
              <div className="text-3xl">👑</div>
              <div>
                <h3 className="font-bold text-navy">Admin</h3>
                <p className="text-sm text-slate-600">Vollständiger Zugriff auf alle Funktionen</p>
                <div className="mt-2 space-y-1 text-xs">
                  <p>✓ Camp-Verwaltung</p>
                  <p>✓ Alle Daten einsehen</p>
                  <p>✓ Berechtigungen ändern</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-l-4 border-blue-500">
            <div className="flex items-start gap-3">
              <div className="text-3xl">👨‍💼</div>
              <div>
                <h3 className="font-bold text-navy">Mitarbeiter (MA)</h3>
                <p className="text-sm text-slate-600">Verwaltung vor Ort</p>
                <div className="mt-2 space-y-1 text-xs">
                  <p>✓ Check-In durchführen</p>
                  <p>✓ Aktivitäten verwalten</p>
                  <p>✓ Taschengeld tracken</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-l-4 border-green-500">
            <div className="flex items-start gap-3">
              <div className="text-3xl">👨‍👩‍👧</div>
              <div>
                <h3 className="font-bold text-navy">Eltern</h3>
                <p className="text-sm text-slate-600">Begrenzte Einsicht</p>
                <div className="mt-2 space-y-1 text-xs">
                  <p>✓ Kinderdaten ansehen</p>
                  <p>✓ Kontaktformular nutzen</p>
                  <p>✓ Fotos sehen</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Permissions Management Component */}
        <PermissionsManagement />

        {/* Permission Matrix */}
        <div className="card overflow-x-auto">
          <h3 className="text-xl font-bold text-navy mb-6">Detaillierte Berechtigungsmatrix</h3>
          <table className="w-full text-sm">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-navy font-semibold">Funktion</th>
                <th className="px-4 py-3 text-center text-navy font-semibold">👑 Admin</th>
                <th className="px-4 py-3 text-center text-navy font-semibold">👨‍💼 MA</th>
                <th className="px-4 py-3 text-center text-navy font-semibold">👨‍👩‍👧 Eltern</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Camp-Verwaltung', admin: true, ma: false, eltern: false },
                { feature: 'Teilnehmer hinzufügen', admin: true, ma: true, eltern: false },
                { feature: 'Check-In durchführen', admin: true, ma: true, eltern: false },
                { feature: 'Zelte zuweisen', admin: true, ma: true, eltern: false },
                { feature: 'Aktivitäten erstellen', admin: true, ma: true, eltern: false },
                { feature: 'Taschengeld verwalten', admin: true, ma: true, eltern: false },
                { feature: 'Fotos hochladen', admin: true, ma: true, eltern: false },
                { feature: 'Berichte exportieren', admin: true, ma: true, eltern: false },
                { feature: 'Berechtigungen ändern', admin: true, ma: false, eltern: false },
                { feature: 'Finanzen verwalten', admin: true, ma: false, eltern: false },
                { feature: 'System-Administration', admin: true, ma: false, eltern: false },
                { feature: 'Kinderdaten ansehen', admin: true, ma: true, eltern: true },
                { feature: 'Fotos ansehen', admin: true, ma: true, eltern: true },
                { feature: 'Feedback geben', admin: true, ma: true, eltern: true },
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{row.feature}</td>
                  <td className="px-4 py-3 text-center">
                    {row.admin ? <span className="text-green-600 font-bold">✓</span> : <span className="text-red-600">✗</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.ma ? <span className="text-green-600 font-bold">✓</span> : <span className="text-red-600">✗</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.eltern ? <span className="text-green-600 font-bold">✓</span> : <span className="text-red-600">✗</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Best Practices */}
        <div className="card bg-blue-50 border border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-3">💡 Best Practices</h3>
          <ul className="space-y-2 text-sm text-blue-900">
            <li>✓ Geben Sie jedem Benutzer nur die notwendigen Berechtigungen</li>
            <li>✓ Überprüfen Sie regelmäßig die aktiven Benutzer</li>
            <li>✓ Deaktivieren Sie inaktive Konten nach dem Camp</li>
            <li>✓ Verwenden Sie sichere Passwörter für alle Konten</li>
            <li>✓ Protokollieren Sie alle Administratoränderungen</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  )
}
