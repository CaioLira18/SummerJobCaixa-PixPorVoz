import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home' 
import { AppLayout } from './components/AppLayout' 
import './App.css'
function App() {
  const [isVisible, setIsVisible] = useState(false); // Estado centralizado aqui

  return (
    <div>
      <Routes>
        <Route element={<AppLayout isVisible={isVisible} setIsVisible={setIsVisible} />}>
          <Route path="/" element={<Home isVisible={isVisible} />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App