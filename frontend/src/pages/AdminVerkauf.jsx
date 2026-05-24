import { useState, useRef, useEffect } from 'react'
import api from '../utils/api'
import AdminLayout from '../components/AdminLayout'
import jsQR from 'jsqr'

export default function AdminVerkauf({ onLogout }) {
  const [products, setProducts] = useState([])
  const [scannedParticipant, setScannedParticipant] = useState(null)
  const [participantBalance, setParticipantBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
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
      setMessageType('error')
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
      setMessageType('error')
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
      setMessage(`Teilnehmer ${participantId} gescannt`)
      setMessageType('success')
    } catch (err) {
      setMessage('Teilnehmer nicht gefunden')
      setMessageType('error')
    }
  }

  const handleSale = async (product) => {
    if (!scannedParticipant) {
      setMessage('Bitte zuerst Teilnehmer scannen')
      setMessageType('error')
      return
    }

    try {
      const response = await api.post('/pocket-money/sale/', {
        account_id: scannedParticipant,
        product_id: product.id,
        amount: product.price
      })

      setParticipantBalance(response.data.new_balance)
      setMessage(`${product.name} verkauft!`)
      setMessageType('success')
    } catch (err) {
      setMessage('Verkauf fehlgeschlagen')
      setMessageType('error')
    }
  }

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-[#0B132B] mb-2">Verkauf</h2>
          <p className="text-slate-600 text-lg">QR-Code scannen und Produkte verkaufen</p>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl font-medium transition-all ${
            messageType === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scanner Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden p-6">
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Scanner</div>

              {!cameraActive ? (
                <button
                  onClick={startCamera}
                  className="w-full px-6 py-4 bg-[#0B132B] text-white rounded-xl hover:bg-[#1c2541] font-bold transition-colors active:scale-95 text-lg"
                >
                  📷 Kamera starten
                </button>
              ) : (
                <div className="space-y-4">
                  <video ref={videoRef} className="w-full rounded-xl bg-black" autoPlay playsInline />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  <button
                    onClick={stopCamera}
                    className="w-full px-6 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 font-bold transition-colors active:scale-95"
                  >
                    ✕ Beenden
                  </button>
                </div>
              )}

              {scannedParticipant && (
                <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
                  <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Gescannter Teilnehmer</p>
                  <p className="text-3xl font-bold text-[#0B132B] mt-2">TN #{scannedParticipant}</p>
                  <p className="text-sm text-slate-600 mt-1">Guthaben</p>
                  <p className="text-4xl font-bold text-[#C5A059] mt-1">€{participantBalance.toFixed(2)}</p>
                  <button
                    onClick={() => {
                      setScannedParticipant(null)
                      setParticipantBalance(0)
                      setMessage('')
                      setCameraActive(false)
                    }}
                    className="mt-6 w-full px-4 py-2 bg-[#0B132B] text-white rounded-lg font-semibold hover:bg-[#1c2541] transition-colors text-sm"
                  >
                    Anderen scannen
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Products Section */}
          <div className="lg:col-span-2">
            {scannedParticipant ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Verfügbare Produkte</div>
                    <h3 className="text-2xl font-bold text-[#0B132B] mt-1">Wählen Sie ein Produkt</h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map(product => (
                    <button
                      key={product.id}
                      onClick={() => handleSale(product)}
                      disabled={participantBalance < product.price}
                      className={`group p-4 rounded-xl transition-all transform active:scale-95 font-bold text-center border-2 ${
                        participantBalance < product.price
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                          : 'bg-gradient-to-br from-[#C5A059] to-[#b38e4a] text-white border-[#C5A059] hover:shadow-lg hover:-translate-y-1'
                      }`}
                    >
                      <div className="text-3xl mb-2">📦</div>
                      <div className="text-sm font-semibold leading-tight">{product.name}</div>
                      <div className="mt-3 pt-3 border-t border-white border-opacity-30">
                        <div className="text-2xl font-bold">€{product.price.toFixed(2)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-12 text-center">
                <div className="text-6xl mb-4">📱</div>
                <h3 className="text-2xl font-bold text-slate-700 mb-2">Scanner aktivieren</h3>
                <p className="text-slate-500">Starten Sie oben den Scanner, um einen Teilnehmer zu scannen und Produkte anzuzeigen</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
