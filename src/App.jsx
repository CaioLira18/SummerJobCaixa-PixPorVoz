import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home' 
import { AppLayout } from './components/AppLayout' 
import { LoadingPage } from './components/LoadingPage' 
import './App.css'
import { Terminal } from './pages/Terminal'
import Chat from './pages/Chat'
import { Footer } from './components/Footer'
import { TransaçãoPagina } from './pages/TransaçãoPagina'
function App() {
  const [isVisible, setIsVisible] = useState(false); // Estado centralizado aqui

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
      </Routes>
    </div>
  )
}

export default App