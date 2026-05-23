import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function PhotoUpload({ campId = 1 }) {
  const [photos, setPhotos] = useState([])
  const [file, setFile] = useState(null)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    loadPhotos()
  }, [])

  const loadPhotos = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await api.get(`/photos/?camp_id=${campId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setPhotos(response.data || [])
    } catch (err) {
      console.error('Error loading photos:', err)
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const uploadPhoto = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Bitte wählen Sie ein Foto aus')
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('description', description)
      formData.append('camp_id', campId)

      const token = localStorage.getItem('token')
      const response = await api.post('/photos/', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      setPhotos([response.data.photo, ...photos])
      setFile(null)
      setDescription('')
      setPreview(null)
      setSuccess('Foto erfolgreich hochgeladen!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Upload')
    } finally {
      setLoading(false)
    }
  }

  const releasePhoto = async (photoId) => {
    try {
      const token = localStorage.getItem('token')
      await api.post(`/photos/${photoId}/release`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      await loadPhotos()
      setSuccess('Foto freigegeben!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError('Fehler beim Freigeben des Fotos')
    }
  }

  const unreleasePhoto = async (photoId) => {
    try {
      const token = localStorage.getItem('token')
      await api.post(`/photos/${photoId}/unreleased`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      await loadPhotos()
      setSuccess('Foto versteckt!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError('Fehler beim Verstecken des Fotos')
    }
  }

  const deletePhoto = async (photoId) => {
    if (!confirm('Foto wirklich löschen?')) return

    try {
      const token = localStorage.getItem('token')
      await api.delete(`/photos/${photoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setPhotos(photos.filter(p => p.id !== photoId))
      setSuccess('Foto gelöscht!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError('Fehler beim Löschen des Fotos')
    }
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

      {/* Upload Form */}
      <div className="card">
        <h3 className="text-xl font-bold text-navy mb-4">📸 Foto hochladen</h3>
        <form onSubmit={uploadPhoto} className="space-y-4">
          {/* File Input */}
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">Fotodatei</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4 file:rounded-lg
                file:border-0 file:text-sm file:font-semibold
                file:bg-gold file:text-navy hover:file:bg-gold/80"
            />
          </div>

          {/* Preview */}
          {preview && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-navy mb-2">Vorschau</p>
              <img
                src={preview}
                alt="Preview"
                className="w-full max-h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">Beschreibung (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Was passiert auf dem Foto?"
              className="input-field h-24"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="btn-primary w-full"
          >
            {loading ? '⏳ Wird hochgeladen...' : '📸 Hochladen'}
          </button>
        </form>
      </div>

      {/* Photos Grid */}
      <div className="card">
        <h3 className="text-xl font-bold text-navy mb-4">📷 Fotos ({photos.length})</h3>
        {photos.length > 0 ? (
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
                    <p className="text-sm text-slate-700 mb-2">{photo.description}</p>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {photo.is_released ? (
                      <>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          ✓ Freigegeben
                        </span>
                        <button
                          onClick={() => unreleasePhoto(photo.id)}
                          className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200"
                        >
                          Verstecken
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded">
                          ⚠️ Versteckt
                        </span>
                        <button
                          onClick={() => releasePhoto(photo.id)}
                          className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                        >
                          Freigeben
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 ml-auto"
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-600">Noch keine Fotos vorhanden</p>
          </div>
        )}
      </div>
    </div>
  )
}
