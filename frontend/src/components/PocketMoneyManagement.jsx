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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadParticipants()
  }, [])

  const loadParticipants = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await api.get(`/participants/?camp_id=${campId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setParticipants(response.data || [])
    } catch (err) {
      setError('Fehler beim Laden der Teilnehmer')
    }
  }

  const loadAccount = async (participantId) => {
    try {
      const token = localStorage.getItem('token')
      const accountRes = await api.get(`/pocket-money/accounts/${participantId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setAccount(accountRes.data)

      const transRes = await api.get(`/pocket-money/accounts/${accountRes.data.id}/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setTransactions(transRes.data.transactions || [])
    } catch (err) {
      console.error('Error loading account:', err)
    }
  }

  const handleSelectParticipant = (participantId) => {
    const participant = participants.find(p => p.id === participantId)
    setSelectedParticipant(participant)
    loadAccount(participantId)
  }

  const addTransaction = async (e) => {
    e.preventDefault()
    if (!selectedParticipant || !amount) {
      setError('Bitte füllen Sie alle Felder aus')
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      await api.post('/pocket-money/transactions', {
        participant_id: selectedParticipant.id,
        type: type,
        amount: parseFloat(amount),
        description: description
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      await loadAccount(selectedParticipant.id)
      setAmount('')
      setDescription('')
      setSuccess('Transaktion erfolgreich!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Hinzufügen')
    } finally {
      setLoading(false)
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Participant Selection */}
        <div className="card">
          <h3 className="text-lg font-bold text-navy mb-4">👤 Teilnehmer</h3>
          <select
            value={selectedParticipant?.id || ''}
            onChange={(e) => handleSelectParticipant(parseInt(e.target.value))}
            className="input-field mb-4"
          >
            <option value="">-- Bitte wählen --</option>
            {participants.map(p => (
              <option key={p.id} value={p.id}>
                TN {p.id}
              </option>
            ))}
          </select>

          {selectedParticipant && account && (
            <div className="bg-gold/10 border border-gold/20 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Kontostand</p>
              <p className="text-3xl font-bold text-navy">€{account.balance?.toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-2">TN {selectedParticipant.id}</p>
            </div>
          )}
        </div>

        {/* Add Transaction */}
        {selectedParticipant && (
          <div className="card">
            <h3 className="text-lg font-bold text-navy mb-4">💰 Transaktion</h3>
            <form onSubmit={addTransaction} className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Art</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="spending">Ausgabe</option>
                  <option value="deposit">Einzahlung</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Betrag (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="input-field text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Beschreibung</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="z.B. Eis, Getränk..."
                  className="input-field text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-sm"
              >
                {loading ? '⏳...' : '➕ Hinzufügen'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      {selectedParticipant && transactions.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold text-navy mb-4">📊 Transaktionsverlauf</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2 text-left text-navy font-semibold">Datum</th>
                  <th className="px-3 py-2 text-left text-navy font-semibold">Art</th>
                  <th className="px-3 py-2 text-left text-navy font-semibold">Beschreibung</th>
                  <th className="px-3 py-2 text-right text-navy font-semibold">Betrag</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(trans => (
                  <tr key={trans.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-700">
                      {new Date(trans.created_at).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        trans.type === 'spending'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {trans.type === 'spending' ? '📤 Ausgabe' : '📥 Einzahlung'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-700">{trans.description || '-'}</td>
                    <td className={`px-3 py-2 text-right font-semibold ${
                      trans.type === 'spending' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {trans.type === 'spending' ? '-' : '+'}€{trans.amount?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedParticipant && transactions.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-slate-600">Noch keine Transaktionen</p>
        </div>
      )}
    </div>
  )
}
