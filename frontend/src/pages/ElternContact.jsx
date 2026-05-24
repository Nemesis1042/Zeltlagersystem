import { useState } from 'react'
import ElternLayout from '../components/ElternLayout'

export default function ElternContact({ onLogout }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In production, this would send to backend
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 3000)
  }

  return (
    <ElternLayout onLogout={onLogout}>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-3xl font-bold text-green-600 mb-2">💬 Kontaktieren Sie uns</h2>
          <p className="text-slate-600">Haben Sie Fragen oder Bedenken? Schreiben Sie uns!</p>
        </div>

        {submitted && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl">
            <p className="font-semibold">✓ Danke!</p>
            <p className="text-sm">Ihre Nachricht wurde gesendet. Wir werden uns bald bei Ihnen melden.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card text-center">
            <div className="text-3xl mb-2">📧</div>
            <h3 className="font-bold text-slate-800 mb-1">Email</h3>
            <p className="text-sm text-slate-600">info@bula2026.de</p>
          </div>
          <div className="card text-center">
            <div className="text-3xl mb-2">📱</div>
            <h3 className="font-bold text-slate-800 mb-1">Telefon</h3>
            <p className="text-sm text-slate-600">+49 123 456789</p>
          </div>
          <div className="card text-center">
            <div className="text-3xl mb-2">⏰</div>
            <h3 className="font-bold text-slate-800 mb-1">Bürozeiten</h3>
            <p className="text-sm text-slate-600">Mo-Fr 9-17 Uhr</p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Nachricht senden</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Betreff *</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nachricht *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Nachricht senden
            </button>
          </form>
        </div>

        {/* FAQ */}
        <div className="card">
          <h3 className="text-lg font-bold text-slate-800 mb-4">❓ Häufig gestellte Fragen</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-slate-800">Wie kann ich Daten meines Kindes ändern?</p>
              <p className="text-slate-600 mt-1">Kontaktieren Sie bitte die Lagerleitung. Änderungen müssen durch die Administration erfolgen.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Kann ich mein Kind jederzeit abholen?</p>
              <p className="text-slate-600 mt-1">Im Notfall ja. Bitte kontaktieren Sie uns sofort per Telefon.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Wann werden Fotos hochgeladen?</p>
              <p className="text-slate-600 mt-1">Fotos werden täglich hochgeladen und nach Genehmigung freigegeben.</p>
            </div>
          </div>
        </div>
      </div>
    </ElternLayout>
  )
}
