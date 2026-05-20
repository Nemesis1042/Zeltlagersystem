import { useState, useEffect } from 'react'
import axios from 'axios'

export default function GalleryPage() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [filterReleased, setFilterReleased] = useState('all')
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  const CAMP_ID = 1
  const token = localStorage.getItem('token')

  useEffect(() => {
    loadPhotos()
  }, [filterReleased])

  const loadPhotos = async () => {
    try {
      let url = `/api/photos/?camp_id=${CAMP_ID}`
      if (filterReleased !== 'all') {
        url += `&released=${filterReleased === 'released'}`
      }

      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setPhotos(response.data)
    } catch (err) {
      console.error('Error loading photos:', err)
    }
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setLoading(true)
    let uploaded = 0

    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('camp_id', CAMP_ID)
        formData.append('description', 'Lager-Foto')

        await axios.post('/api/photos/', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(progress)
          }
        })
        uploaded++
      } catch (err) {
        console.error('Error uploading file:', err)
      }
    }

    setMessage(`✓ ${uploaded}/${files.length} Fotos hochgeladen`)
    setTimeout(() => setMessage(''), 3000)
    setUploadProgress(0)
    setShowUpload(false)
    setLoading(false)
    await loadPhotos()
  }

  const handleReleasePhoto = async (photoId, released) => {
    try {
      await axios.patch(
        `/api/photos/${photoId}`,
        { released },
        { headers: { 'Authorization': `Bearer ${token}` } }
      )

      setMessage(released ? '✓ Foto freigegeben' : '✓ Freigabe entzogen')
      setTimeout(() => setMessage(''), 2000)
      await loadPhotos()
    } catch (err) {
      setError('Fehler beim Aktualisieren des Fotos')
      setTimeout(() => setError(''), 2000)
    }
  }

  const handleDeletePhoto = async (photoId) => {
    if (!confirm('Foto wirklich löschen?')) return

    try {
      await axios.delete(`/api/photos/${photoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      setMessage('✓ Foto gelöscht')
      setTimeout(() => setMessage(''), 2000)
      await loadPhotos()
    } catch (err) {
      setError('Fehler beim Löschen des Fotos')
      setTimeout(() => setError(''), 2000)
    }
  }

  const releasedCount = photos.filter(p => p.released).length
  const pendingCount = photos.filter(p => !p.released).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📷 Lager-Galerie</h2>
        <button
          onClick={() => setShowUpload(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Fotos hochladen
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="bg-green-100 text-green-800 p-3 rounded-lg">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Total Fotos</p>
          <p className="text-3xl font-bold text-blue-600">{photos.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Freigegeben</p>
          <p className="text-3xl font-bold text-green-600">{releasedCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Ausstehend</p>
          <p className="text-3xl font-bold text-orange-600">{pendingCount}</p>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Fotos hochladen</h3>

            <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center mb-4">
              <input
                type="file"
                id="file-input"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={loading}
                className="hidden"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <div className="text-4xl mb-2">📸</div>
                <p className="font-bold text-gray-700">Klicke zum Hochladen</p>
                <p className="text-sm text-gray-500">oder ziehe Fotos hier rein</p>
              </label>
            </div>

            {uploadProgress > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">{uploadProgress}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowUpload(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:bg-gray-200"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { value: 'all', label: 'Alle Fotos' },
          { value: 'released', label: '✓ Freigegeben' },
          { value: 'pending', label: '⏳ Ausstehend' }
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilterReleased(tab.value)}
            className={`px-4 py-2 ${
              filterReleased === tab.value
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map(photo => (
          <div
            key={photo.id}
            className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
          >
            {/* Image */}
            <div className="relative overflow-hidden h-48 bg-gray-200">
              <img
                src={photo.url}
                alt="Lager-Foto"
                className="w-full h-full object-cover group-hover:scale-105 transition cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              />
              {photo.released && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                  ✓ Freigegeben
                </div>
              )}
              {!photo.released && (
                <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
                  ⏳ Ausstehend
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3">
              <p className="text-xs text-gray-500">
                {new Date(photo.created_at).toLocaleDateString('de-CH')}
              </p>
              <p className="text-sm text-gray-600 truncate">{photo.description}</p>
            </div>

            {/* Actions */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 opacity-0 group-hover:opacity-100 transition">
              <div className="space-y-2">
                {!photo.released && (
                  <button
                    onClick={() => handleReleasePhoto(photo.id, true)}
                    className="w-full px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    ✓ Freigeben
                  </button>
                )}
                {photo.released && (
                  <button
                    onClick={() => handleReleasePhoto(photo.id, false)}
                    className="w-full px-2 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700"
                  >
                    🔒 Sperren
                  </button>
                )}
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="w-full px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                >
                  🗑️ Löschen
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {photos.length === 0 && (
        <div className="col-span-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-lg text-gray-600 mb-4">📷 Noch keine Fotos</p>
          <button
            onClick={() => setShowUpload(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Erste Fotos hochladen
          </button>
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg overflow-hidden max-w-2xl w-full">
            <div className="relative">
              <img
                src={selectedPhoto.url}
                alt="Vergrößertes Bild"
                className="w-full h-auto"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500">
                {new Date(selectedPhoto.created_at).toLocaleDateString('de-CH')}
              </p>
              <p className="text-gray-700 mt-2">{selectedPhoto.description}</p>
              <div className="flex gap-2 mt-4">
                {!selectedPhoto.released && (
                  <button
                    onClick={() => {
                      handleReleasePhoto(selectedPhoto.id, true)
                      setSelectedPhoto(null)
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    ✓ Freigeben
                  </button>
                )}
                {selectedPhoto.released && (
                  <button
                    onClick={() => {
                      handleReleasePhoto(selectedPhoto.id, false)
                      setSelectedPhoto(null)
                    }}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                  >
                    🔒 Sperren
                  </button>
                )}
                <button
                  onClick={() => {
                    handleDeletePhoto(selectedPhoto.id)
                    setSelectedPhoto(null)
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  🗑️ Löschen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
