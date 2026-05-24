import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function StaffLayout({ children, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'))
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    onLogout()
    navigate('/login')
  }

  const menuItems = [
    { id: 'overview', label: '📊 Übersicht', path: '/staff/overview' },
    { id: 'participants', label: '👥 Teilnehmer', path: '/staff/participants' },
    { id: 'check-in', label: '✓ Check-In', path: '/staff/check-in' },
    { id: 'activities', label: '🎯 Aktivitäten', path: '/staff/activities' },
    { id: 'pocket-money', label: '💰 Taschengeld', path: '/staff/pocket-money' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`bg-blue-600 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 border-b border-blue-700">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 hover:bg-blue-700 p-2 rounded-lg transition-colors"
          >
            <span className="text-3xl">👨‍💼</span>
            {sidebarOpen && <span className="font-bold text-lg">BULA2026 MA</span>}
          </button>
        </div>

        <nav className="p-3 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 whitespace-nowrap ${
                isActive(item.path)
                  ? 'bg-yellow-400 text-blue-700 font-semibold'
                  : 'hover:bg-blue-700 text-blue-100'
              }`}
              title={!sidebarOpen ? item.label : ''}
            >
              <span className="text-lg flex-shrink-0">{item.label.split(' ')[0]}</span>
              {sidebarOpen && <span className="flex-1">{item.label.split(' ').slice(1).join(' ')}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-blue-700">
          {sidebarOpen && (
            <div className="text-sm mb-3 bg-blue-700 p-2 rounded">
              <p className="font-semibold text-yellow-300">{user.vorname} {user.nachname}</p>
              <p className="text-blue-200 text-xs">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
          >
            {sidebarOpen ? 'Abmelden' : '🚪'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">BULA2026 Mitarbeiter Panel</h1>
            <p className="text-sm text-slate-600">Lagerbetreuung & Management</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
