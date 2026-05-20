import { useRef, useState } from 'react'

export default function SignatureCanvas({ onSave, label = "Unterschrift" }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)

  const startDrawing = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')

    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
    setIsDrawing(true)
  }

  const draw = (e) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.stroke()
    setIsEmpty(false)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setIsEmpty(true)
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    const dataUrl = canvas.toDataURL('image/png')
    onSave(dataUrl)
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">{label} *</label>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
        <canvas
          ref={canvasRef}
          width={400}
          height={120}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full border border-gray-300 rounded cursor-crosshair bg-white"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={clearCanvas}
          className="px-3 py-2 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
        >
          Löschen
        </button>
        <button
          type="button"
          onClick={saveSignature}
          disabled={isEmpty}
          className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          ✓ Speichern
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Bitte unterschreiben Sie mit der Maus oder auf einem Touch-Gerät mit dem Finger.
      </p>
    </div>
  )
}
