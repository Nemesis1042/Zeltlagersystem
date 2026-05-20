import { useState, useEffect } from 'react'
import axios from 'axios'

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([])
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newActivity, setNewActivity] = useState({
    name: '',
    description: '',
    group_size: 4,
    location: '',
    category: 'hobbygruppe'
  })
  const [attendance, setAttendance] = useState({})

  const CAMP_ID = 1
  const token = localStorage.getItem('token')

  useEffect(() => {
    loadActivities()
  }, [])

  useEffect(() => {
    if (selectedActivity) {
      loadGroups(selectedActivity.id)
    }
  }, [selectedActivity])

  const loadActivities = async () => {
    try {
      const response = await axios.get(`/api/activities/?camp_id=${CAMP_ID}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setActivities(response.data)
    } catch (err) {
      console.error('Error loading activities:', err)
      setError('Fehler beim Laden der Aktivitäten')
    }
  }

  const loadGroups = async (activityId) => {
    try {
      const response = await axios.get(`/api/activities/${activityId}/groups`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setGroups(response.data)
      initializeAttendance(response.data)
    } catch (err) {
      console.error('Error loading groups:', err)
      setGroups([])
    }
  }

  const initializeAttendance = (groupsData) => {
    const att = {}
    groupsData.forEach(group => {
      group.members.forEach(member => {
        att[member.id] = true
      })
    })
    setAttendance(att)
  }

  const handleAddActivity = async (e) => {
    e.preventDefault()
    if (!newActivity.name.trim()) return

    try {
      await axios.post(`/api/activities/`, newActivity, {
        params: { camp_id: CAMP_ID },
        headers: { 'Authorization': `Bearer ${token}` }
      })

      setMessage('✓ Aktivität erstellt')
      setNewActivity({
        name: '',
        description: '',
        group_size: 4,
        duration_minutes: 60,
        location: ''
      })
      setShowAddForm(false)
      setTimeout(() => setMessage(''), 2000)
      await loadActivities()
    } catch (err) {
      setError('Fehler beim Erstellen der Aktivität')
      setTimeout(() => setError(''), 2000)
    }
  }

  const handleGenerateGroups = async () => {
    if (!selectedActivity) return
    setLoading(true)
    setError('')

    try {
      const response = await axios.post(
        `/api/activities/${selectedActivity.id}/generate-groups`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      )

      setMessage(`✓ ${response.data.num_groups} Gruppen generiert`)
      await loadGroups(selectedActivity.id)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError('Fehler beim Generieren der Gruppen')
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleRecordAttendance = async () => {
    if (!selectedActivity) return
    setLoading(true)

    try {
      const attendanceData = {}
      Object.entries(attendance).forEach(([participantId, attended]) => {
        attendanceData[participantId] = attended
      })

      await axios.post(
        `/api/activities/${selectedActivity.id}/groups/1/attendance`,
        attendanceData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )

      setMessage('✓ Anwesenheit gespeichert')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setError('Fehler beim Speichern der Anwesenheit')
      setTimeout(() => setError(''), 2000)
    } finally {
      setLoading(false)
    }
  }

  const handlePrintList = () => {
    if (!selectedActivity || groups.length === 0) return

    const printWindow = window.open('', '', 'height=600,width=800')
    let printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${selectedActivity.name} - Gruppenlisten</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; color: #0B132B; }
          .activity-info {
            background: #f0f0f0;
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
          }
          .group {
            page-break-inside: avoid;
            border: 1px solid #ccc;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .group h2 { margin: 0 0 10px 0; color: #0B132B; }
          .members { list-style: none; padding: 0; }
          .members li {
            padding: 5px 0;
            border-bottom: 1px solid #eee;
          }
          .members li:last-child { border-bottom: none; }
          @media print {
            body { margin: 10px; }
            .group { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <h1>${selectedActivity.name}</h1>
        <div class="activity-info">
          <p><strong>Kategorie:</strong> ${selectedActivity.category || 'Nicht angegeben'}</p>
          <p><strong>Ort:</strong> ${selectedActivity.location || 'Nicht angegeben'}</p>
          <p><strong>Gruppengröße:</strong> ${selectedActivity.group_size}</p>
          <p><strong>Gedruckt:</strong> ${new Date().toLocaleDateString('de-CH')}</p>
        </div>
    `

    groups.forEach(group => {
      printContent += `
        <div class="group">
          <h2>Gruppe ${group.group_number} (${group.members.length} Personen)</h2>
          <ul class="members">
      `
      group.members.forEach(member => {
        printContent += `
          <li>
            <input type="checkbox" disabled style="margin-right: 8px;">
            ${member.name} (TN #${member.id}) - ${member.zelt}
          </li>
        `
      })
      printContent += `
          </ul>
        </div>
      `
    })

    printContent += `
      </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 250)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">🎯 Aktivitäten & Gruppen-Generator</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Aktivität hinzufügen
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="bg-green-100 text-green-800 p-3 rounded-lg">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Add Activity Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleAddActivity} className="space-y-4">
            <h3 className="font-bold text-lg">Neue Aktivität</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={newActivity.name}
                  onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                  placeholder="z.B. Wanderung, Spiele, Lagerfeuer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Kategorie</label>
                <select
                  value={newActivity.category}
                  onChange={(e) => setNewActivity({ ...newActivity, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="hobbygruppe">Hobbygruppe</option>
                  <option value="sport">Sport</option>
                  <option value="kreativ">Kreativ</option>
                  <option value="gelaendespiel">Geländespiel</option>
                  <option value="sonstiges">Sonstiges</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ort</label>
                <input
                  type="text"
                  value={newActivity.location}
                  onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                  placeholder="z.B. Waldwiese, Sporthalle"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Gruppengröße</label>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={newActivity.group_size}
                  onChange={(e) => setNewActivity({ ...newActivity, group_size: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Beschreibung</label>
              <textarea
                value={newActivity.description}
                onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                placeholder="Aktivitätsbeschreibung..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
              >
                ✓ Erstellen
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activities.map(activity => (
          <div
            key={activity.id}
            onClick={() => setSelectedActivity(activity)}
            className={`p-4 rounded-lg cursor-pointer transition ${
              selectedActivity?.id === activity.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white shadow hover:shadow-md'
            }`}
          >
            <h3 className="font-bold text-lg">{activity.name}</h3>
            <p className={`text-sm mb-2 ${selectedActivity?.id === activity.id ? 'text-blue-100' : 'text-gray-600'}`}>
              {activity.location || 'Ort nicht angegeben'}
            </p>
            <div className={`text-xs space-y-1 ${selectedActivity?.id === activity.id ? 'text-blue-50' : 'text-gray-500'}`}>
              <p>🏷️ {activity.category}</p>
              <p>👥 Gruppen: {activity.group_size}</p>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="col-span-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <p className="text-lg text-gray-600 mb-4">Noch keine Aktivitäten erstellt</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Erste Aktivität hinzufügen
            </button>
          </div>
        )}
      </div>

      {/* Groups Section */}
      {selectedActivity && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Gruppen für: {selectedActivity.name}</h3>
            <div className="space-x-2">
              <button
                onClick={handleGenerateGroups}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? 'Generiere...' : '⚡ Gruppen generieren'}
              </button>
              <button
                onClick={handlePrintList}
                disabled={groups.length === 0}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
              >
                🖨️ Drucken
              </button>
            </div>
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Keine Gruppen vorhanden</p>
              <p className="text-sm">Klicke auf "Gruppen generieren" um zu starten</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map(group => (
                <div key={group.group_id} className="border rounded-lg p-4">
                  <h4 className="font-bold text-lg mb-3 text-blue-600">
                    Gruppe {group.group_number} ({group.members.length})
                  </h4>
                  <div className="space-y-2">
                    {group.members.map(member => (
                      <div key={member.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={attendance[member.id] !== false}
                          onChange={(e) =>
                            setAttendance({
                              ...attendance,
                              [member.id]: e.target.checked
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="flex-1 text-sm">
                          {member.name}
                        </span>
                        <span className="text-xs text-gray-500">{member.zelt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {groups.length > 0 && (
            <button
              onClick={handleRecordAttendance}
              disabled={loading}
              className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-bold"
            >
              ✓ Anwesenheit speichern
            </button>
          )}
        </div>
      )}
    </div>
  )
}
