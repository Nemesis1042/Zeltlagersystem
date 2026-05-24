import { useState, useRef, useEffect } from 'react'
import api from '../utils/api'
import StaffLayout from '../components/StaffLayout'
import jsQR from 'jsqr'

export default function StaffVerkauf({ onLogout }) {
  const [products, setProducts] = useState([])
  const [scannedParticipant, setScannedParticipant] = useState(null)
  const [participantBalance, setParticipantBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [cameraActive, setCameraActive] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await api.get('/products/')
      setProducts(Array.isArray(response.data) ? response.data : [])
      setLoading(false)
    } catch (err) {
      setMessage('Fehler beim Laden der Produkte')
      setLoading(false)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
        scanQRCode()
      }
    } catch (err) {
      setMessage('Kamera-Zugriff verweigert')
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop())
    }
    setCameraActive(false)
  }

  const scanQRCode = () => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video || !cameraActive) return

    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, canvas.width, canvas.height)

    if (code) {
      const participantId = parseInt(code.data)
      if (!isNaN(participantId)) {
        loadParticipant(participantId)
        stopCamera()
        return
      }
    }

    if (cameraActive) {
      requestAnimationFrame(scanQRCode)
    }
  }

  const loadParticipant = async (participantId) => {
    try {
      const response = await api.get(`/pocket-money/participant/${participantId}/?camp_id=1`)
      setScannedParticipant(participantId)
      setParticipantBalance(response.data.balance || 0)
      setMessage(`✓ Teilnehmer ${participantId} gescannt`)
    } catch (err) {
      setMessage('Teilnehmer nicht gefunden')
    }
  }

  const handleSale = async (product) => {
    if (!scannedParticipant) {
      setMessage('Bitte zuerst Teilnehmer scannen')
      return
    }

    try {
      const response = await api.post('/pocket-money/sale/', {
        account_id: scannedParticipant,
        product_id: product.id,
        amount: product.price
      })

      setParticipantBalance(response.data.new_balance)
      setMessage(`✓ ${product.name} verkauft! Neues Guthaben: €${response.data.new_balance.toFixed(2)}`)
    } catch (err) {
      setMessage('Verkauf fehlgeschlagen: ' + (err.response?.data?.error || 'Fehler'))
    }
  }

  return (
    <StaffLayout onLogout={onLogout}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-blue-600 mb-2">🛒 Verkauf</h2>
          <p className="text-slate-600">Produkte an Teilnehmer verkaufen</p>
        </div>

        {message && (
          <div className={`p-4 rounded-lg text-white ${message.includes('✓') ? 'bg-green-600' : 'bg-red-600'}`}>
            {message}
          </div>
        )}

        {/* QR Scanner */}
        <div className="card">
          <h3 className="text-xl font-bold text-blue-600 mb-4">📱 Teilnehmer scannen</h3>

          {!cameraActive ? (
            <button
              onClick={startCamera}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              📷 Kamera starten
            </button>
          ) : (
            <div className="space-y-4">
              <video ref={videoRef} className="w-full rounded-lg" />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <button
                onClick={stopCamera}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
              >
                ✕ Kamera stoppen
              </button>
            </div>
          )}

          {scannedParticipant && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-lg font-bold text-blue-700">TN #{scannedParticipant}</p>
              <p className="text-2xl font-bold text-blue-600">€{participantBalance.toFixed(2)}</p>
              <button
                onClick={() => {
                  setScannedParticipant(null)
                  setParticipantBalance(0)
                  setMessage('')
                }}
                className="mt-2 px-4 py-2 bg-slate-300 text-slate-700 rounded hover:bg-slate-400"
              >
                Andere scannen
              </button>
            </div>
          )}
        </div>

        {/* Products */}
        {scannedParticipant && (
          <div className="card">
            <h3 className="text-xl font-bold text-blue-600 mb-4">🛍️ Produkte</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <button
                  key={product.id}
                  onClick={() => handleSale(product)}
                  disabled={participantBalance < product.price}
                  className={`p-4 rounded-lg font-bold text-center transition-colors ${
                    participantBalance < product.price
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-yellow-400 text-blue-600 hover:bg-yellow-500'
                  }`}
                >
                  <div className="text-2xl mb-2">{product.name.split(' ')[0]}</div>
                  <div>{product.name.split(' ').slice(1).join(' ')}</div>
                  <div className="text-lg mt-2">€{product.price.toFixed(2)}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  )
}
