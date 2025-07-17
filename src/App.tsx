import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { Toaster } from './components/ui/toaster'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import CardBuilder from './pages/CardBuilder'
import PublicCard from './pages/PublicCard'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/builder" element={<CardBuilder />} />
          <Route path="/builder/:id" element={<CardBuilder />} />
          <Route path="/card/:id" element={<PublicCard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  )
}

export default App