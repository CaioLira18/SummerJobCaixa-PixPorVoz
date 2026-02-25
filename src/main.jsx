import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './css/AppLayout.css'
import './css/Header.css'
import './css/Home.css'
import './css/Amount.css'
import './css/Terminal.css'
import './css/Chat.css'
import './css/LoadingPage.css'
import './css/Footer.css'
import './css/TransacaoPage.css'
import './css/Login.css'
import './css/ContactPage.css'
import './css/PixConfirmado.css'
import './css/PixConcluido.css'
import './css/VoiceStartPage.css'
import './css/Font.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <StrictMode>
      <App />
    </StrictMode>
  </BrowserRouter>,
)
