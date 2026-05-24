import { useCamp } from '../context/CampContext'
import { useState, useEffect } from 'react'
import api from '../utils/api'
import AdminLayout from '../components/AdminLayout'

export default function AdminFinances({ onLogout }) {
  const { campId } = useCamp()
  const [transactions, setTransactions] = useState([])
  const [participants, setParticipants] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [formData, setFormData] = useState({
    participant_id: '',
    product_name: '',
    amount: '',
    description: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      // Load transactions
      const transResponse = await api.get(`/transactions/?camp_id=${campId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setTransactions(Array.isArray(transResponse.data) ? transResponse.data : [])

      // Load participants
      const partResponse = await api.get(`/participants/?camp_id=${campId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setParticipants(Array.isArray(partResponse.data) ? partResponse.data : [])

      // Load statistics
      const statsResponse = await api.get(`/finances/statistics/?camp_id=${campId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setStats(statsResponse.data)
    } catch (err) {
      setError('Fehler beim Laden der Daten')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')

      const payload = {
        participant_id: parseInt(formData.participant_id),
        product_name: formData.product_name,
        amount: parseFloat(formData.amount),
        description: formData.description
      }

      await api.post('/transactions/', payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      setFormData({
        participant_id: '',
        product_name: '',
        amount: '',
        description: ''
      })
      setShowForm(false)
      loadData()
    } catch (err) {
      setError('Fehler beim Erstellen der Transaktion')
      console.error('Error:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const getFilteredTransactions = () => {
    if (filter === 'all') return transactions
    if (filter === 'income') return transactions.filter(t => t.amount > 0)
    if (filter === 'expense') return transactions.filter(t => t.amount < 0)
    return transactions
  }

  const filteredTransactions = getFilteredTransactions()

  if (loading) {
    return (
      <AdminLayout onLogout={onLogout}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-3">⏳</div>
            <p className="text-slate-600">Finanzdaten werden geladen...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-navy">💰 Finanzen & Transaktionen</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-gold text-navy rounded-lg hover:bg-gold/80 transition-colors font-semibold"
          >
            {showForm ? '✕ Abbrechen' : '+ Neue Transaktion'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-semibold">Fehler</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-sm text-slate-600 font-medium">Gesamt Einnahmen</p>
              <p className="text-3xl font-bold text-green-600">€ {parseFloat(stats.total_income || 0).toFixed(2)}</p>
            </div>
            <div className="card">
              <p className="text-sm text-slate-600 font-medium">Gesamt Ausgaben</p>
              <p className="text-3xl font-bold text-red-600">€ {parseFloat(Math.abs(stats.total_expenses || 0)).toFixed(2)}</p>
            </div>
            <div className="card">
              <p className="text-sm text-slate-600 font-medium">Netto</p>
              <p className={`text-3xl font-bold ${(stats.net_balance >= 0) ? 'text-green-600' : 'text-red-600'}`}>
                € {parseFloat(stats.net_balance || 0).toFixed(2)}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-slate-600 font-medium">Transaktionen</p>
              <p className="text-3xl font-bold text-navy">{transactions.length}</p>
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="card">
            <h3 className="text-xl font-bold text-navy mb-6">Neue Transaktion</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Teilnehmer *</label>
                  <select
                    name="participant_id"
                    value={formData.participant_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  >
                    <option value="">-- Teilnehmer wählen --</option>
                    {participants.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.tn_vorname} {p.tn_familienname}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Betrag (€) *</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    step="0.01"
                    required
                    placeholder="z.B. 25.50 oder -10.00"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Artikel/Grund *</label>
                  <input
                    type="text"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleChange}
                    required
                    placeholder="z.B. Getränk, Snack, Eintritt"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Beschreibung</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setFormData({
                      participant_id: '',
                      product_name: '',
                      amount: '',
                      description: ''
                    })
                  }}
                  className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gold text-navy rounded-lg hover:bg-gold/80 transition-colors font-semibold"
                >
                  Speichern
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'Alle' },
            { id: 'income', label: 'Einnahmen' },
            { id: 'expense', label: 'Ausgaben' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === tab.id
                  ? 'bg-gold text-navy'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-slate-600 text-lg">Keine Transaktionen gefunden</p>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-navy font-semibold">Datum</th>
                  <th className="px-4 py-3 text-navy font-semibold">Teilnehmer</th>
                  <th className="px-4 py-3 text-navy font-semibold">Artikel</th>
                  <th className="px-4 py-3 text-navy font-semibold">Betrag</th>
                  <th className="px-4 py-3 text-navy font-semibold">Beschreibung</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(trans => {
                  const participant = participants.find(p => p.id === trans.participant_id)
                  return (
                    <tr key={trans.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-700">
                        {new Date(trans.created_at).toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {participant ? `${participant.tn_vorname} ${participant.tn_familienname}` : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{trans.product_name}</td>
                      <td className={`px-4 py-3 font-semibold ${trans.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trans.amount > 0 ? '+' : ''}€ {parseFloat(trans.amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{trans.description || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
