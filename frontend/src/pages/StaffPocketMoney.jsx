import { useCamp } from '../context/CampContext'
import { useState, useEffect } from 'react'
import api from '../utils/api'
import StaffLayout from '../components/StaffLayout'
import PocketMoneyManagement from '../components/PocketMoneyManagement'

export default function StaffPocketMoney({ onLogout }) {
  const { campId } = useCamp()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await api.get(`/finances/statistics/?camp_id=${campId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setStats(response.data)
    } catch (err) {
      setError('Fehler beim Laden der Daten')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <StaffLayout onLogout={onLogout}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-3">⏳</div>
            <p className="text-slate-600">Taschengeld-Daten werden geladen...</p>
          </div>
        </div>
      </StaffLayout>
    )
  }

  return (
    <StaffLayout onLogout={onLogout}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-blue-600 mb-2">💰 Taschengeld</h2>
          <p className="text-slate-600">Verwalten Sie Taschengeld und Transaktionen</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
            <p className="font-semibold">Fehler</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <p className="text-sm text-slate-600 font-medium">Gesamt Transaktionen</p>
              <p className="text-3xl font-bold text-blue-600">{stats.total_transactions || 0}</p>
            </div>
            <div className="card">
              <p className="text-sm text-slate-600 font-medium">Netto Balance</p>
              <p className={`text-3xl font-bold ${stats.net_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                € {parseFloat(stats.net_balance || 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Pocket Money Management */}
        <PocketMoneyManagement campId={campId} />
      </div>
    </StaffLayout>
  )
}
