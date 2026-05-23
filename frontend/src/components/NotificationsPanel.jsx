import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = async () => {
    try {
      const storedNotifications = localStorage.getItem('notifications')
      const parsed = storedNotifications ? JSON.parse(storedNotifications) : []
      setNotifications(parsed)
      setUnreadCount(parsed.filter(n => !n.read).length)
    } catch (err) {
      console.error('Error loading notifications:', err)
    }
  }

  const markAsRead = (index) => {
    const updated = [...notifications]
    updated[index].read = true
    localStorage.setItem('notifications', JSON.stringify(updated))
    setNotifications(updated)
    setUnreadCount(updated.filter(n => !n.read).length)
  }

  const clearNotification = (index) => {
    const updated = notifications.filter((_, i) => i !== index)
    localStorage.setItem('notifications', JSON.stringify(updated))
    setNotifications(updated)
    setUnreadCount(updated.filter(n => !n.read).length)
  }

  const addTestNotification = () => {
    const newNotif = {
      id: Date.now(),
      title: 'Test-Benachrichtigung',
      message: 'Dies ist eine Test-Benachrichtigung',
      type: 'info',
      read: false,
      timestamp: new Date().toISOString()
    }
    const updated = [newNotif, ...notifications]
    localStorage.setItem('notifications', JSON.stringify(updated))
    setNotifications(updated)
    setUnreadCount(updated.filter(n => !n.read).length)
  }

  const getIcon = (type) => {
    const icons = {
      success: '✓',
      error: '⚠️',
      warning: '⚡',
      info: 'ℹ️',
      default: '📢'
    }
    return icons[type] || icons.default
  }

  const getBgColor = (type) => {
    const colors = {
      success: 'bg-green-50 border-green-200',
      error: 'bg-red-50 border-red-200',
      warning: 'bg-yellow-50 border-yellow-200',
      info: 'bg-blue-50 border-blue-200',
      default: 'bg-slate-50 border-slate-200'
    }
    return colors[type] || colors.default
  }

  const getTextColor = (type) => {
    const colors = {
      success: 'text-green-800',
      error: 'text-red-800',
      warning: 'text-yellow-800',
      info: 'text-blue-800',
      default: 'text-slate-800'
    }
    return colors[type] || colors.default
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-navy">📢 Benachrichtigungen</h3>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {unreadCount}
          </span>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notif, idx) => (
            <div
              key={notif.id}
              className={`border rounded-lg p-4 flex gap-3 ${getBgColor(notif.type)} ${notif.read ? 'opacity-60' : ''}`}
            >
              <div className="text-2xl flex-shrink-0">{getIcon(notif.type)}</div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold ${getTextColor(notif.type)}`}>{notif.title}</h4>
                <p className={`text-sm mt-1 ${getTextColor(notif.type)}`}>{notif.message}</p>
                <p className="text-xs text-slate-500 mt-2">
                  {new Date(notif.timestamp).toLocaleString('de-DE')}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {!notif.read && (
                  <button
                    onClick={() => markAsRead(idx)}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    ✓ Gelesen
                  </button>
                )}
                <button
                  onClick={() => clearNotification(idx)}
                  className="text-xs px-2 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-slate-600">
            <p>Keine Benachrichtigungen</p>
          </div>
        )}
      </div>

      {/* Test Button (for demo) */}
      <button
        onClick={addTestNotification}
        className="text-xs px-3 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
      >
        + Test
      </button>
    </div>
  )
}
