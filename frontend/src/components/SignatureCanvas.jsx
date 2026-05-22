import { useRef, useEffect, useState } from 'react'

export default function SignatureCanvas({ label, onSave }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height

      const ctx = canvas.getContext('2d')
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = 2
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }, [])

  const startDrawing = (e) => {
    setIsDrawing(true)
    const { offsetX, offsetY } = e.nativeEvent
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(offsetX, offsetY)
  }

  const draw = (e) => {
    if (!isDrawing) return
    const { offsetX, offsetY } = e.nativeEvent
    const ctx = canvasRef.current.getContext('2d')
    ctx.lineTo(offsetX, offsetY)
    ctx.stroke()
    setIsEmpty(false)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setIsEmpty(true)
    setIsSaved(false)
  }

  const saveSignature = () => {
    if (isEmpty) {
      alert('Bitte unterschreibe zuerst!')
      return
    }
    const signatureData = canvasRef.current.toDataURL()
    onSave(signatureData)
    setIsSaved(true)
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium">{label} *</label>
        {isSaved && <span className="text-green-600 text-sm font-semibold">✓ Gespeichert</span>}
      </div>
      <div className={`border-2 rounded-lg p-4 bg-white transition ${
        isSaved ? 'border-green-300 bg-green-50' : 'border-gray-300'
      }`}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-32 border border-gray-400 rounded cursor-crosshair bg-white"
          style={{ touchAction: 'none' }}
        />
        <div className="flex gap-3 mt-3">
          <button
            type="button"
            onClick={clearSignature}
            className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
          >
            Löschen
          </button>
          <button
            type="button"
            onClick={saveSignature}
            disabled={isEmpty}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            {isSaved ? '✓ Gespeichert' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  )
}
