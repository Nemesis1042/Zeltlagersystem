import { createContext, useState, useContext } from 'react'

const CampContext = createContext()

export function CampProvider({ children }) {
  const [campId, setCampId] = useState(() => {
    return parseInt(localStorage.getItem('selectedCampId') || '1')
  })

  const updateCampId = (id) => {
    setCampId(parseInt(id))
    localStorage.setItem('selectedCampId', id)
  }

  return (
    <CampContext.Provider value={{ campId, updateCampId }}>
      {children}
    </CampContext.Provider>
  )
}

export function useCamp() {
  const context = useContext(CampContext)
  if (!context) {
    throw new Error('useCamp must be used within CampProvider')
  }
  return context
}
