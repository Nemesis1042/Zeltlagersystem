import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import jsQR from 'jsqr'
import { offlineStorage, isOnline, syncTransactions, onOnlineStatusChange } from '../utils/offlineStorage'

export default function ScannerPage() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [scannedData, setScannedData] = useState(null)
  const [participant, setParticipant] = useState(null)
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [online, setOnline] = useState(isOnline())
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [transactionAmount, setTransactionAmount] = useState('')
  const [transactionDesc, setTransactionDesc] = useState('')
  const [scanning, setScanning] = useState(true)

  useEffect(() => {
    startCamera()
    const unsubscribe = onOnlineStatusChange(setOnline)
    return () => unsubscribe()
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
          scanQRCode()
        }
      }
    } catch (err) {
      setError('Kamerazugriff verweigert. Bitte Berechtigung erteilen.')
      console.error('Camera error:', err)
    }
  }

  const scanQRCode = () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas || !scanning) return

    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    ctx.drawImage(video, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)

    if (code) {
      setScannedData(code.data)
      setScanning(false)
      lookupParticipant(code.data)
    } else {
      setTimeout(scanQRCode, 100)
    }
  }

  const lookupParticipant = async (qrData) => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get(`/participants/${qrData}`)
      setParticipant(response.data)
      await loadAccount(response.data.id)
    } catch (err) {
      setError('Teilnehmer nicht gefunden')
      setScanning(true)
      setTimeout(scanQRCode, 2000)
    } finally {
      setLoading(false)
    }
  }

  const loadAccount = async (participantId) => {
    try {
      const response = await api.get(
        `/pocket-money/accounts/${participantId}`
      )
      setAccount(response.data)
    } catch (err) {
      console.error('Error loading account:', err)
    }
  }

  const handleAddTransaction = async (e) => {
    e.preventDefault()
    if (!participant || !account) return

    const amount = parseFloat(transactionAmount) || 0
    if (amount <= 0) {
      setError('Betrag muss größer als 0 sein')
      return
    }

    const transactionData = {
      participant_id: participant.id,
      pocket_money_account_id: account.id,
      type: 'spending',
      amount: amount,
      description: transactionDesc || 'QR-Scanner Transaktion',
      product_id: null,
      timestamp: new Date().toISOString()
    }

    try {
      if (online) {
        await api.post('/pocket-money/transactions', {
          participant_id: participant.id,
          product_name: transactionDesc || 'QR-Scanner Transaktion',
          amount: amount,
          description: transactionDesc || 'QR-Scanner Transaktion'
        })
        setMessage('✓ Transaktion durchgeführt')
      } else {
        await offlineStorage.saveTransaction(transactionData)
        setMessage('✓ Transaktion gespeichert (offline)')
      }

      setTransactionAmount('')
      setTransactionDesc('')
      setShowTransactionForm(false)
      setTimeout(() => {
        setParticipant(null)
        setAccount(null)
        setScannedData(null)
        setMessage('')
        setScanning(true)
        scanQRCode()
      }, 1500)
    } catch (err) {
      setError('Fehler beim Speichern der Transaktion')
      console.error('Transaction error:', err)
    }
  }

  const handleSync = async () => {
    if (!online) {
      setError('Offline - Synchronisierung nicht möglich')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const result = await syncTransactions(token)
      setMessage(`✓ ${result.synced} Transaktionen synchronisiert`)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError('Synchronisierung fehlgeschlagen')
      console.error('Sync error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">📱 QR-Scanner</h1>
        <button
          onClick={() => navigate('/admin')}
          className="px-3 py-1 bg-blue-700 rounded hover:bg-blue-800 text-sm"
        >
          Admin
        </button>
      </header>

      {/* Status Bar */}
      <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center text-sm">
        <span>
          {online ? '🟢 Online' : '🔴 Offline'}
        </span>
        {!online && (
          <button
            onClick={handleSync}
            className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 text-sm"
          >
            ↻ Synchronisieren
          </button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-500 text-white p-3 text-sm">
          {error}
        </div>
      )}
      {message && (
        <div className="bg-green-500 text-white p-3 text-sm">
          {message}
        </div>
      )}

      {/* Scanner Area */}
      {!participant ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-sm">
            <video
              ref={videoRef}
              className="w-full rounded-lg border-4 border-blue-500"
              playsInline
              autoPlay
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-yellow-400 rounded-lg"></div>
            </div>
          </div>
          <p className="mt-4 text-white text-center text-sm">
            {loading ? 'Lädt...' : 'QR-Code scannen'}
          </p>
        </div>
      ) : (
        /* Participant Detail & Transaction Form */
        <div className="flex-1 flex flex-col p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
            {/* Participant Info */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">
                {participant.vorname} {participant.nachname}
              </h2>
              <p className="text-gray-600">TN #{participant.id}</p>
              {account && (
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                  <p className="text-sm text-gray-600">Aktueller Kontostand</p>
                  <p className="text-3xl font-bold text-blue-600">
                    CHF {(account.balance || 0).toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* Transaction Form */}
            {!showTransactionForm ? (
              <button
                onClick={() => setShowTransactionForm(true)}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
              >
                + Transaktion hinzufügen
              </button>
            ) : (
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <h3 className="font-bold text-lg">Neue Transaktion</h3>

                <div>
                  <label className="block text-sm font-medium mb-2">Betrag (CHF)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Beschreibung (optional)</label>
                  <input
                    type="text"
                    value={transactionDesc}
                    onChange={(e) => setTransactionDesc(e.target.value)}
                    placeholder="z.B. Getränk, Snack..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
                  >
                    ✓ Durchführen
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTransactionForm(false)}
                    className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            )}

            <button
              onClick={() => {
                setParticipant(null)
                setAccount(null)
                setScannedData(null)
                setShowTransactionForm(false)
                setError('')
                setScanning(true)
                scanQRCode()
              }}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
            >
              ← Neuer QR-Code
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
