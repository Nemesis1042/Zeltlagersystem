import { useCamp } from '../context/CampContext'
import { useState, useEffect } from 'react'
import api from '../utils/api'
import ElternLayout from '../components/ElternLayout'

export default function ElternPhotos({ onLogout }) {
  const { campId } = useCamp()
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPhotos()
  }, [])

  const loadPhotos = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await api.get(`/photos/?camp_id=${campId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      // Filter only released photos
      const releasedPhotos = (Array.isArray(response.data) ? response.data : []).filter(p => p.released)
      setPhotos(releasedPhotos)
    } catch (err) {
      setError('Fehler beim Laden der Fotos')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ElternLayout onLogout={onLogout}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-3">⏳</div>
            <p className="text-slate-600">Fotos werden geladen...</p>
          </div>
        </div>
      </ElternLayout>
    )
  }

  return (
    <ElternLayout onLogout={onLogout}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-green-600 mb-2">📸 Lagerfotografien</h2>
          <p className="text-slate-600">Fotos vom Lager</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
            <p className="font-semibold">Fehler</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {photos.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-slate-600">Noch keine Fotos verfügbar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map(photo => (
              <div key={photo.id} className="card overflow-hidden hover:shadow-lg transition-shadow">
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
                <h3 className="font-semibold text-slate-800 mb-2">
                  {photo.description || `Foto #${photo.id}`}
                </h3>
                <p className="text-xs text-slate-600">
                  {new Date(photo.created_at).toLocaleDateString('de-DE')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ElternLayout>
  )
}
