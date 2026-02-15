import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home' 
import { AppLayout } from './components/AppLayout' 
import { LoadingPage } from './components/LoadingPage' 
import { Terminal } from './pages/Terminal'
import Chat from './pages/Chat'
import { Footer } from './components/Footer'
import { TransaçãoPagina } from './pages/TransaçãoPagina'
import PixConfigurationLoading from './pages/PixConfigurationLoading'
import AuthPage from './pages/AuthPage'
function App() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div>
      <Routes>
        <Route element={<AppLayout isVisible={isVisible} setIsVisible={setIsVisible} />}>
          <Route path="/" element={<Home isVisible={isVisible} />} />
          <Route path="/terminal" element={<Terminal />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/loading" element={<LoadingPage />} />
          <Route path="/areaPix" element={<TransaçãoPagina />} />
        </Route>
        <Route path="/loadingConfigurationPage" element={<PixConfigurationLoading />} />
        <Route path="/login" element={<AuthPage />} />
      </Routes>
    </div>
  )
}

export default App