import { useState, useEffect } from 'react'
import api from '../utils/api'
import AdminLayout from '../components/AdminLayout'
import PhotoUpload from '../components/PhotoUpload'

export default function AdminPhotos({ onLogout }) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filterReleased, setFilterReleased] = useState('all')

  useEffect(() => {
    loadPhotos()
  }, [])

  const loadPhotos = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await api.get('/photos/?camp_id=1', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setPhotos(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setError('Fehler beim Laden der Fotos')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleRelease = async (photoId, currentStatus) => {
    try {
      const token = localStorage.getItem('token')
      await api.patch(`/photos/${photoId}`, { released: !currentStatus }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setSuccess('✓ Foto aktualisiert!')
      setTimeout(() => setSuccess(''), 3000)
      loadPhotos()
    } catch (err) {
      setError('Fehler beim Aktualisieren des Fotos')
    }
  }

  const handleDelete = async (photoId) => {
    if (confirm('Möchten Sie dieses Foto wirklich löschen?')) {
      try {
        const token = localStorage.getItem('token')
        await api.delete(`/photos/${photoId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        setSuccess('✓ Foto gelöscht!')
        setTimeout(() => setSuccess(''), 3000)
        loadPhotos()
      } catch (err) {
        setError('Fehler beim Löschen des Fotos')
      }
    }
  }

  const getFilteredPhotos = () => {
    if (filterReleased === 'all') return photos
    if (filterReleased === 'released') return photos.filter(p => p.released)
    if (filterReleased === 'unreleased') return photos.filter(p => !p.released)
    return photos
  }

  const filteredPhotos = getFilteredPhotos()

  if (loading) {
    return (
      <AdminLayout onLogout={onLogout}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-3">⏳</div>
            <p className="text-slate-600">Fotos werden geladen...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-navy mb-2">📸 Fotogalerie</h2>
          <p className="text-slate-600">Verwalten Sie Lagerfotografien und Veröffentlichungen</p>
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

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-start gap-3">
            <span className="text-lg">✓</span>
            <div>
              <p className="font-semibold">Erfolg</p>
              <p className="text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <p className="text-sm text-slate-600 font-medium">Gesamt Fotos</p>
            <p className="text-3xl font-bold text-navy">{photos.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 font-medium">Veröffentlicht</p>
            <p className="text-3xl font-bold text-green-600">{photos.filter(p => p.released).length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 font-medium">In Bearbeitung</p>
            <p className="text-3xl font-bold text-yellow-600">{photos.filter(p => !p.released).length}</p>
          </div>
        </div>

        {/* Photo Upload Component */}
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-navy mb-6">📤 Fotos hochladen</h3>
          <PhotoUpload campId={1} onUploadSuccess={loadPhotos} />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'Alle Fotos' },
            { id: 'released', label: '✓ Veröffentlicht' },
            { id: 'unreleased', label: '⏳ In Bearbeitung' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterReleased(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterReleased === tab.id
                  ? 'bg-gold text-navy'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Photos Grid */}
        {filteredPhotos.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-slate-600 text-lg">
              {filterReleased === 'all' ? 'Noch keine Fotos hochgeladen' : 'Keine Fotos in dieser Kategorie'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPhotos.map(photo => (
              <div key={photo.id} className="card hover:shadow-lg transition-shadow overflow-hidden">
                <div className="aspect-square bg-slate-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {photo.filename ? (
                    <img
                      src={`/uploads/${photo.filename}`}
                      alt={photo.description || 'Photo'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext x="50" y="100" font-size="16" fill="%239ca3af" text-anchor="middle"%3E📷 Foto%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  ) : (
                    <div className="text-5xl">📷</div>
                  )}
                </div>

                <h3 className="font-semibold text-navy mb-2">
                  {photo.description || `Foto #${photo.id}`}
                </h3>

                <p className="text-xs text-slate-600 mb-3">
                  Hochgeladen: {new Date(photo.created_at).toLocaleDateString('de-DE')}
                </p>

                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    photo.released
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {photo.released ? '✓ Veröffentlicht' : '⏳ In Bearbeitung'}
                  </span>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                  <button
                    onClick={() => handleToggleRelease(photo.id, photo.released)}
                    className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors font-medium"
                  >
                    {photo.released ? '🔒 Sperren' : '🔓 Freigeben'}
                  </button>
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors font-medium"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
