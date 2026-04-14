import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AuthPage    from './pages/authpage'
import Dashboard   from './pages/Dashboard'
import History     from './pages/History'
import Settings    from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route path="/"          element={<LandingPage />} />
      <Route path="/login"     element={<AuthPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/history"   element={<History />} />
      <Route path="/settings"  element={<Settings />} />
    </Routes>
  )
}