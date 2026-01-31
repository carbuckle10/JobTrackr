import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ApplicationsPage from './pages/ApplicationsPage'
import NetworkPage from './pages/NetworkPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<ApplicationsPage />} />
        <Route path="network" element={<NetworkPage />} />
      </Route>
    </Routes>
  )
}

export default App
