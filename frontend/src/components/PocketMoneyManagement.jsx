import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function PocketMoneyManagement({ campId = 1 }) {
  const [participants, setParticipants] = useState([])
  const [selectedParticipant, setSelectedParticipant] = useState(null)
  const [account, setAccount] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('spending')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadParticipants()
  }, [campId])

  const loadParticipants = async () => {
    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('token')

      const response = await api.get(`/participants/?camp_id=${campId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      // Ensure participants is always an array
      const partsData = Array.isArray(response.data) ? response.data : []
      setParticipants(partsData)
    } catch (err) {
      console.error('Error loading participants:', err)
      setError('Fehler beim Laden der Teilnehmer')
      setParticipants([])
    } finally {
      setLoading(false)
    }
  }

  const loadAccount = async (participantId) => {
    try {
      const token = localStorage.getItem('token')

      const accountRes = await api.get(`/pocket-money/accounts/${participantId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setAccount(accountRes.data || {})

      const transRes = await api.get(`/pocket-money/accounts/${participantId}/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      // Ensure transactions is always an array
      const transData = Array.isArray(transRes.data) ? transRes.data :
                       (transRes.data?.transactions && Array.isArray(transRes.data.transactions)) ? transRes.data.transactions : []
      setTransactions(transData)
    } catch (err) {
      console.error('Error loading account:', err)
      setAccount({})
      setTransactions([])
    }
  }

  const handleSelectParticipant = (participantId) => {
    const participant = participants.find(p => p.id === parseInt(participantId))
    setSelectedParticipant(participant || null)
    if (participant) {
      loadAccount(participant.id)
    }
  }

  const handleAddTransaction = async (e) => {
    e.preventDefault()
    if (!selectedParticipant || !amount) {
      setError('Bitte Teilnehmer und Betrag auswählen')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      const token = localStorage.getItem('token')

      await api.post('/pocket-money/transactions', {
        participant_id: selectedParticipant.id,
        type: type,
        amount: parseFloat(amount) || 0,
        description: description,
        camp_id: campId
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      setSuccess('Transaktion erfolgreich!')
      setAmount('')
      setDescription('')
      setTimeout(() => setSuccess(''), 3000)

      await loadAccount(selectedParticipant.id)
    } catch (err) {
      console.error('Error adding transaction:', err)
      setError('Fehler beim Hinzufügen der Transaktion')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-3">⏳</div>
          <p className="text-slate-600">Taschengeld-Daten werden geladen...</p>
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

      {/* Participant Selection */}
      <div className="card">
        <h3 className="text-xl font-bold text-navy mb-6">👤 Teilnehmer wählen</h3>
        <select
          value={selectedParticipant?.id || ''}
          onChange={(e) => handleSelectParticipant(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
        >
          <option value="">-- Teilnehmer wählen --</option>
          {Array.isArray(participants) && participants.map(p => (
            <option key={p.id} value={p.id}>
              {p.vorname} {p.nachname} (TN {p.id})
            </option>
          ))}
        </select>

        {selectedParticipant && account && (
          <div className="mt-6 bg-gold/10 border border-gold/20 rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-2">Kontostand</p>
            <p className="text-4xl font-bold text-navy">€{parseFloat(account.balance || 0).toFixed(2)}</p>
            <p className="text-xs text-slate-500 mt-2">{selectedParticipant.vorname} {selectedParticipant.nachname}</p>
          </div>
        )}
      </div>

      {/* Add Transaction */}
      {selectedParticipant && (
        <div className="card">
          <h3 className="text-xl font-bold text-navy mb-6">💰 Transaktion hinzufügen</h3>
          <form onSubmit={handleAddTransaction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Art *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                >
                  <option value="spending">Ausgabe (Kauf)</option>
                  <option value="deposit">Einzahlung</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Betrag (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Beschreibung</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="z.B. Eis, Getränk, Merchandise..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-2 bg-gold text-navy rounded-lg hover:bg-gold/80 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '⏳ wird gespeichert...' : '➕ Transaktion hinzufügen'}
            </button>
          </form>
        </div>
      )}

      {/* Transactions Table */}
      {selectedParticipant && Array.isArray(transactions) && transactions.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold text-navy mb-6">📊 Transaktionsverlauf</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-navy font-semibold">Datum</th>
                  <th className="px-4 py-3 text-left text-navy font-semibold">Art</th>
                  <th className="px-4 py-3 text-left text-navy font-semibold">Beschreibung</th>
                  <th className="px-4 py-3 text-right text-navy font-semibold">Betrag</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(trans => (
                  <tr key={trans.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">
                      {new Date(trans.created_at).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        trans.type === 'spending'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {trans.type === 'spending' ? '💸 Ausgabe' : '💰 Einzahlung'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{trans.description || '-'}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${
                      trans.type === 'spending' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {trans.type === 'spending' ? '-' : '+'}€{parseFloat(trans.amount || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedParticipant && (!Array.isArray(transactions) || transactions.length === 0) && (
        <div className="card text-center py-12">
          <p className="text-slate-600">Noch keine Transaktionen vorhanden</p>
        </div>
      )}
    </div>
  )
}
