import { useCamp } from '../context/CampContext'
import { useState, useEffect } from 'react'
import api from '../utils/api'
import AdminLayout from '../components/AdminLayout'

export default function AdminReports({ onLogout }) {
  const { campId } = useCamp()
  const [participants, setParticipants] = useState([])
  const [transactions, setTransactions] = useState([])
  const [activities, setActivities] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedReport, setSelectedReport] = useState('participants')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      const partResponse = await api.get(`/participants/?camp_id=${campId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setParticipants(Array.isArray(partResponse.data) ? partResponse.data : [])

      const transResponse = await api.get(`/transactions/?camp_id=${campId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setTransactions(Array.isArray(transResponse.data) ? transResponse.data : [])

      const actResponse = await api.get(`/activities/?camp_id=${campId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setActivities(Array.isArray(actResponse.data) ? actResponse.data : [])

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

  const exportToCSV = (data, filename) => {
    if (data.length === 0) {
      alert('Keine Daten zum Exportieren')
      return
    }

    const headers = Object.keys(data[0])
    const csv = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header]
          const escaped = String(value).replace(/"/g, '""')
          return `"${escaped}"`
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const printReport = (title, html) => {
    const printWindow = window.open('', '', 'height=600,width=800')
    printWindow.document.write(`
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #1e3a8a; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #e2e8f0; padding: 10px; text-align: left; border: 1px solid #cbd5e1; }
          td { padding: 8px; border: 1px solid #cbd5e1; }
          .date { color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p class="date">Erstellt: ${new Date().toLocaleDateString('de-DE')}</p>
        ${html}
      </body>
      </html>
    `)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 250)
  }

  const generateParticipantReport = () => {
    const html = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Vorname</th>
            <th>Nachname</th>
            <th>Geburtstag</th>
            <th>Status</th>
            <th>Zelt</th>
          </tr>
        </thead>
        <tbody>
          ${participants.map(p => `
            <tr>
              <td>${p.id}</td>
              <td>${p.tn_vorname}</td>
              <td>${p.tn_familienname}</td>
              <td>${p.birth_date ? new Date(p.birth_date).toLocaleDateString('de-DE') : '-'}</td>
              <td>${p.status === 'angekommen' ? 'Angekommen' : 'Ausstehend'}</td>
              <td>${p.zelt_name || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
    printReport('Teilnehmerliste', html)
  }

  const generateFinanceReport = () => {
    const html = `
      <div>
        <h2>Finanzübersicht</h2>
        <table>
          <tr>
            <td><strong>Gesamt Einnahmen:</strong></td>
            <td>€ ${parseFloat(stats?.total_income || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td><strong>Gesamt Ausgaben:</strong></td>
            <td>€ ${Math.abs(parseFloat(stats?.total_expenses || 0)).toFixed(2)}</td>
          </tr>
          <tr>
            <td><strong>Netto:</strong></td>
            <td>€ ${parseFloat(stats?.net_balance || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td><strong>Transaktionen:</strong></td>
            <td>${transactions.length}</td>
          </tr>
        </table>

        <h2 style="margin-top: 30px;">Transaktionsdetails</h2>
        <table>
          <thead>
            <tr>
              <th>Datum</th>
              <th>Teilnehmer</th>
              <th>Artikel</th>
              <th>Betrag</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(t => `
              <tr>
                <td>${new Date(t.created_at).toLocaleDateString('de-DE')}</td>
                <td>${t.tn_vorname} ${t.tn_familienname}</td>
                <td>${t.product_name}</td>
                <td>€ ${parseFloat(t.amount).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `
    printReport('Finanzbericht', html)
  }

  const generateActivityReport = () => {
    const html = `
      <table>
        <thead>
          <tr>
            <th>Aktivität</th>
            <th>Kategorie</th>
            <th>Gruppengröße</th>
            <th>Ort</th>
            <th>Beschreibung</th>
          </tr>
        </thead>
        <tbody>
          ${activities.map(a => `
            <tr>
              <td>${a.name}</td>
              <td>${a.category}</td>
              <td>${a.group_size}</td>
              <td>${a.location || '-'}</td>
              <td>${a.description || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
    printReport('Aktivitätenbericht', html)
  }

  if (loading) {
    return (
      <AdminLayout onLogout={onLogout}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-3">⏳</div>
            <p className="text-slate-600">Berichte werden vorbereitet...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-navy mb-2">📊 Berichte & Export</h2>
          <p className="text-slate-600">Erstellen und exportieren Sie umfassende Berichte</p>
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

        {/* Report Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'participants', icon: '👥', title: 'Teilnehmerliste', desc: 'Exportieren Sie alle Teilnehmerdaten' },
            { id: 'finance', icon: '💰', title: 'Finanzbericht', desc: 'Finanz- und Transaktionsübersicht' },
            { id: 'activities', icon: '🎯', title: 'Aktivitätenbericht', desc: 'Übersicht aller Aktivitäten' }
          ].map(report => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedReport === report.id
                  ? 'border-gold bg-gold/10'
                  : 'border-slate-200 hover:border-gold'
              }`}
            >
              <div className="text-3xl mb-2">{report.icon}</div>
              <h3 className="font-bold text-navy">{report.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{report.desc}</p>
            </button>
          ))}
        </div>

        {/* Report Content */}
        <div className="card space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <h3 className="text-xl font-bold text-navy">
              {selectedReport === 'participants' && '👥 Teilnehmerliste'}
              {selectedReport === 'finance' && '💰 Finanzbericht'}
              {selectedReport === 'activities' && '🎯 Aktivitätenbericht'}
            </h3>
            <div className="flex gap-2">
              {selectedReport === 'participants' && (
                <>
                  <button
                    onClick={() => generateParticipantReport()}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm"
                  >
                    🖨️ Drucken
                  </button>
                  <button
                    onClick={() => exportToCSV(participants, 'teilnehmer')}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium text-sm"
                  >
                    📥 CSV Export
                  </button>
                </>
              )}
              {selectedReport === 'finance' && (
                <>
                  <button
                    onClick={() => generateFinanceReport()}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm"
                  >
                    🖨️ Drucken
                  </button>
                  <button
                    onClick={() => exportToCSV(transactions, 'transaktionen')}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium text-sm"
                  >
                    📥 CSV Export
                  </button>
                </>
              )}
              {selectedReport === 'activities' && (
                <>
                  <button
                    onClick={() => generateActivityReport()}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm"
                  >
                    🖨️ Drucken
                  </button>
                  <button
                    onClick={() => exportToCSV(activities, 'aktivitaeten')}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium text-sm"
                  >
                    📥 CSV Export
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-slate-50 p-4 rounded-lg max-h-96 overflow-auto">
            {selectedReport === 'participants' && (
              <table className="w-full text-sm">
                <thead className="bg-slate-200">
                  <tr>
                    <th className="px-2 py-1 text-left">ID</th>
                    <th className="px-2 py-1 text-left">Vorname</th>
                    <th className="px-2 py-1 text-left">Nachname</th>
                    <th className="px-2 py-1 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.slice(0, 10).map(p => (
                    <tr key={p.id} className="border-b border-slate-200">
                      <td className="px-2 py-1">{p.id}</td>
                      <td className="px-2 py-1">{p.tn_vorname}</td>
                      <td className="px-2 py-1">{p.tn_familienname}</td>
                      <td className="px-2 py-1">{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {selectedReport === 'finance' && stats && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded">
                    <p className="text-xs text-slate-600">Einnahmen</p>
                    <p className="text-xl font-bold text-green-600">€ {parseFloat(stats.total_income || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-xs text-slate-600">Ausgaben</p>
                    <p className="text-xl font-bold text-red-600">€ {Math.abs(parseFloat(stats.total_expenses || 0)).toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-3 rounded col-span-2">
                    <p className="text-xs text-slate-600">Netto</p>
                    <p className="text-xl font-bold text-navy">€ {parseFloat(stats.net_balance || 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
            {selectedReport === 'activities' && (
              <table className="w-full text-sm">
                <thead className="bg-slate-200">
                  <tr>
                    <th className="px-2 py-1 text-left">Name</th>
                    <th className="px-2 py-1 text-left">Kategorie</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.slice(0, 10).map(a => (
                    <tr key={a.id} className="border-b border-slate-200">
                      <td className="px-2 py-1">{a.name}</td>
                      <td className="px-2 py-1">{a.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
