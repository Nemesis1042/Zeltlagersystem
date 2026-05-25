import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function PhotoUpload({ campId = 1, onUploadSuccess = null }) {
  const [photos, setPhotos] = useState([])
  const [file, setFile] = useState(null)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    loadPhotos()
  }, [campId])

  const loadPhotos = async () => {
    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('token')

      const response = await api.get(`/photos/?camp_id=${campId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      // Ensure photos is always an array
      const photosData = Array.isArray(response.data) ? response.data : []
      setPhotos(photosData)
    } catch (err) {
      console.error('Error loading photos:', err)
      setError('Fehler beim Laden der Fotos')
      setPhotos([])
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError('')

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleUploadPhoto = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Bitte wählen Sie ein Foto aus')
      return
    }

    try {
      setUploading(true)
      setError('')

      const formData = new FormData()
      formData.append('file', file)
      formData.append('description', description)
      formData.append('camp_id', campId)

      const token = localStorage.getItem('token')

      await api.post('/photos/', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      setSuccess('Foto erfolgreich hochgeladen!')
      setFile(null)
      setDescription('')
      setPreview(null)
      setTimeout(() => setSuccess(''), 3000)

      // Reload photos
      await loadPhotos()

      // Call callback if provided
      if (onUploadSuccess) {
        onUploadSuccess()
      }
    } catch (err) {
      console.error('Error uploading photo:', err)
      setError(err.response?.data?.error || 'Fehler beim Upload des Fotos')
    } finally {
      setUploading(false)
    }
  }

  const handleReleasePhoto = async (photoId) => {
    try {
      setError('')
      const token = localStorage.getItem('token')

      await api.patch(`/photos/${photoId}`, { released: true }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      setSuccess('Foto freigegeben!')
      setTimeout(() => setSuccess(''), 3000)
      await loadPhotos()
    } catch (err) {
      console.error('Error releasing photo:', err)
      setError('Fehler beim Freigeben des Fotos')
    }
  }

  const handleUnreleasePhoto = async (photoId) => {
    try {
      setError('')
      const token = localStorage.getItem('token')

      await api.patch(`/photos/${photoId}`, { released: false }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      setSuccess('Foto versteckt!')
      setTimeout(() => setSuccess(''), 3000)
      await loadPhotos()
    } catch (err) {
      console.error('Error hiding photo:', err)
      setError('Fehler beim Verstecken des Fotos')
    }
  }

  const handleDeletePhoto = async (photoId) => {
    if (!confirm('Möchten Sie dieses Foto wirklich löschen?')) return

    try {
      setError('')
      const token = localStorage.getItem('token')

      await api.delete(`/photos/${photoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      setSuccess('Foto gelöscht!')
      setTimeout(() => setSuccess(''), 3000)

      setPhotos(prev => Array.isArray(prev) ? prev.filter(p => p.id !== photoId) : [])
    } catch (err) {
      console.error('Error deleting photo:', err)
      setError('Fehler beim Löschen des Fotos')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-3">⏳</div>
          <p className="text-slate-600">Fotos werden geladen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          <p className="font-semibold">Fehler</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl">
          <p className="font-semibold">Erfolg</p>
          <p className="text-sm">{success}</p>
        </div>
      )}

      {/* Upload Form */}
      <div className="card">
        <h3 className="text-xl font-bold text-navy mb-6">📸 Foto hochladen</h3>
        <form onSubmit={handleUploadPhoto} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Fotodatei *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4 file:rounded-lg
                file:border-0 file:text-sm file:font-semibold
                file:bg-gold file:text-navy hover:file:bg-gold/80"
              required
            />
          </div>

          {preview && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Vorschau</p>
              <img
                src={preview}
                alt="Vorschau"
                className="w-full max-h-64 object-cover rounded-lg border border-slate-200"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Beschreibung (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Was ist auf dem Foto zu sehen?"
              rows="3"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full px-6 py-2 bg-gold text-navy rounded-lg hover:bg-gold/80 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? '⏳ wird hochgeladen...' : '📸 Hochladen'}
          </button>
        </form>
      </div>

      {/* Photos Grid */}
      {Array.isArray(photos) && photos.length > 0 ? (
        <div className="card">
          <h3 className="text-xl font-bold text-navy mb-6">📷 Fotos ({photos.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map(photo => (
              <div key={photo.id} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {photo.url && (
                  <img
                    src={photo.url}
                    alt={photo.description || 'Foto'}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  {photo.description && (
                    <p className="text-sm text-slate-700 mb-3">{photo.description}</p>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {photo.released ? (
                      <>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                          ✓ Freigegeben
                        </span>
                        <button
                          onClick={() => handleUnreleasePhoto(photo.id)}
                          className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200 transition-colors"
                        >
                          Verstecken
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded font-medium">
                          🔒 Versteckt
                        </span>
                        <button
                          onClick={() => handleReleasePhoto(photo.id)}
                          className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                        >
                          Freigeben
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 transition-colors ml-auto"
                    >
                      🗑️ Löschen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-slate-600">📷 Noch keine Fotos vorhanden</p>
        </div>
      )}
    </div>
  )
}
