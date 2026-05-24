import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function PermissionsManagement() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [userPermissions, setUserPermissions] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const availablePermissions = {
    participants: {
      label: 'Teilnehmer-Verwaltung',
      permissions: [
        { key: 'view', label: 'Anzeigen' },
        { key: 'edit', label: 'Bearbeiten' },
        { key: 'create', label: 'Erstellen' },
        { key: 'delete', label: 'Löschen' }
      ]
    },
    tents: {
      label: 'Zeltplatz-Verwaltung',
      permissions: [
        { key: 'view', label: 'Anzeigen' },
        { key: 'assign', label: 'Zuweisen' },
        { key: 'create', label: 'Erstellen' }
      ]
    },
    photos: {
      label: 'Fotos',
      permissions: [
        { key: 'upload', label: 'Hochladen' },
        { key: 'release', label: 'Freigeben' },
        { key: 'delete', label: 'Löschen' }
      ]
    },
    activities: {
      label: 'Aktivitäten',
      permissions: [
        { key: 'view', label: 'Anzeigen' },
        { key: 'create', label: 'Erstellen' },
        { key: 'generate_groups', label: 'Gruppen generieren' }
      ]
    },
    pocket_money: {
      label: 'Taschengeld-System',
      permissions: [
        { key: 'view', label: 'Anzeigen' },
        { key: 'transaction', label: 'Transaktionen' }
      ]
    },
    admin: {
      label: 'Admin-Funktionen',
      permissions: [
        { key: 'users', label: 'Benutzer-Verwaltung' },
        { key: 'permissions', label: 'Berechtigungen' },
        { key: 'settings', label: 'Einstellungen' }
      ]
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await api.get('/users/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      // Ensure response.data is an array
      const userData = Array.isArray(response.data) ? response.data : []
      setUsers(userData.length > 0 ? userData : getMockUsers())
    } catch (err) {
      console.error('Error loading users:', err)
      // Use mock data on error
      setUsers(getMockUsers())
    }
  }

  const getMockUsers = () => [
    { id: 1, vorname: 'Max', nachname: 'Admin', email: 'admin@test.de', role: 'admin' },
    { id: 2, vorname: 'Anna', nachname: 'Mitarbeiter', email: 'ma@test.de', role: 'ma' },
    { id: 3, vorname: 'Peter', nachname: 'Eltern', email: 'eltern@test.de', role: 'eltern' }
  ]

  const loadUserPermissions = async (userId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await api.get(`/users/${userId}/permissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setUserPermissions(response.data || {})
    } catch (err) {
      // Initialize with default permissions
      const defaultPerms = {}
      Object.keys(availablePermissions).forEach(category => {
        defaultPerms[category] = {}
        availablePermissions[category].permissions.forEach(perm => {
          defaultPerms[category][perm.key] = false
        })
      })
      setUserPermissions(defaultPerms)
    }
  }

  const handleSelectUser = (user) => {
    setSelectedUser(user)
    loadUserPermissions(user.id)
  }

  const togglePermission = (category, permKey) => {
    const updated = { ...userPermissions }
    updated[category][permKey] = !updated[category][permKey]
    setUserPermissions(updated)
  }

  const savePermissions = async () => {
    if (!selectedUser) return

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      await api.post(`/users/${selectedUser.id}/permissions`, userPermissions, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setSuccess('Berechtigungen gespeichert!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError('Fehler beim Speichern der Berechtigungen')
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      ma: 'bg-blue-100 text-blue-800',
      eltern: 'bg-green-100 text-green-800'
    }
    return colors[role] || 'bg-slate-100 text-slate-800'
  }

  const getRoleLabel = (role) => {
    const labels = {
      admin: '👨‍💼 Admin',
      ma: '👥 Mitarbeiter',
      eltern: '👨‍👩‍👧 Eltern'
    }
    return labels[role] || role
  }

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-start gap-3">
          <span className="text-lg">✓</span>
          <p>{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Users List */}
        <div className="card">
          <h3 className="text-lg font-bold text-navy mb-4">👤 Benutzer</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {Array.isArray(users) && users.length > 0 ? (
              users.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedUser?.id === user.id
                      ? 'border-gold bg-gold/5'
                      : 'border-slate-200 hover:border-gold/50'
                  }`}
                >
                  <p className="font-semibold text-navy text-sm">{user.vorname} {user.nachname}</p>
                  <p className="text-xs text-slate-600">{user.email}</p>
                  <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${getRoleColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </button>
              ))
            ) : (
              <p className="text-center text-slate-600 py-4">Keine Benutzer gefunden</p>
            )}
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="lg:col-span-3">
          {selectedUser ? (
            <div className="card">
              <h3 className="text-lg font-bold text-navy mb-4">
                🔐 Berechtigungen für {selectedUser.vorname} {selectedUser.nachname}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(availablePermissions).map(([category, categoryData]) => (
                  <div key={category} className="border border-slate-200 rounded-lg p-4">
                    <h4 className="font-semibold text-navy mb-3">{categoryData.label}</h4>
                    <div className="space-y-2">
                      {categoryData.permissions.map(perm => (
                        <label key={perm.key} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={userPermissions[category]?.[perm.key] || false}
                            onChange={() => togglePermission(category, perm.key)}
                            className="w-4 h-4 rounded border-slate-300"
                          />
                          <span className="text-sm text-slate-700">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={savePermissions}
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? '⏳ Speichern...' : '💾 Speichern'}
                </button>
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-slate-600">Wählen Sie einen Benutzer zum Verwalten von Berechtigungen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
