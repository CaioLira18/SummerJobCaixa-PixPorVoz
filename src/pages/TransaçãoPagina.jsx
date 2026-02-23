import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export const TransaçãoPagina = () => {
  const [pixKey, setPixKey] = useState('')
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="transacao-container">
      <div className="transacao-content">
        <h1 className="page-title">Área Pix</h1>

        <div className="pix-input-section">
          <div className="input-header">
            <span>Como será seu Pix?</span>
            <button className="colar-button">Colar</button>
          </div>

          <input
            type="text"
            className="pix-input"
            placeholder="Digite a chave Pix"
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
          />
          <p className="input-hint">CPF/CNPJ, Celular, E-mail, Aleatória ou Código</p>
        </div>

        <div className="pix-options">
          <button className="pix-option-card">
            <div className="option-icon">
              <i class="fa-brands fa-pix"></i>
            </div>
            <span className="option-text">Pix Agência e<br />Conta</span>
          </button>

          <button className="pix-option-card">
            <div className="option-icon">
              <i class="fa-solid fa-copy"></i>
            </div>
            <span className="option-text">Pix Copia e<br />Cola</span>
          </button>

          <button className="pix-option-card">
            <div className="option-icon">
              <i class="fa-solid fa-qrcode"></i>
            </div>
            <span className="option-text">Ler QR Code</span>
          </button>

          <Link className='pix-option-card' to={'/loadingConfigurationPage'} >
            <span className='novoCard'>Novo</span>
            <div className="option-icon">
              <i class="fa-solid fa-qrcode"></i>
            </div>
            <span className="option-text">Pix por Voz</span>
          </Link>
        </div>

        <Link to={'/chat'}>
          <button className="pix-por-voz">
            <div className="voz-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="white" strokeWidth="2" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" strokeWidth="2" />
                <line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            <div className="voz-text">
              <h3>Pix por Voz</h3>
              <p>Faça transferências usando sua voz</p>
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" />
            </svg>
          </button>
        </Link>

        <div className="menu-list">
          <button className="menu-item">
            <div className="menu-item-left">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="#0066CC" strokeWidth="2" />
              </svg>
              <span>Favoritos e Recentes</span>
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="#999" strokeWidth="2" />
            </svg>
          </button>

          <button className="menu-item">
            <div className="menu-item-left">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#0066CC" strokeWidth="2" />
                <path d="M12 6v6l4 2" stroke="#0066CC" strokeWidth="2" />
              </svg>
              <span>Minhas Chaves Pix</span>
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="#999" strokeWidth="2" />
            </svg>
          </button>
        </div>

        <div className="outras-opcoes">
          <h3>Outras opções</h3>

          <button className="menu-item">
            <span>Gerar QR Code</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="#999" strokeWidth="2" />
            </svg>
          </button>

          <button className="menu-item">
            <span>Extrato e Devoluções</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="#999" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}