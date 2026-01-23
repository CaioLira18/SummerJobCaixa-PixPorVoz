import React, { useState } from 'react'

export const Terminal = () => {
  const [falado, setFalado] = useState("");
  const [agente, setAgente] = useState("Aguardando comando...");

  const iniciarEscuta = async () => {
    setAgente("Ouvindo...");
    try {
      const response = await fetch('http://127.0.0.1:8000/ouvir');
      const data = await response.json();

      setFalado(data.texto_falado || "...");
      setAgente(data.resposta);
    } catch (error) {
      setAgente("Erro ao conectar com o servidor.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <h2 style={{ color: 'white', marginBottom: '15px' }}>Assistente Pix Voice</h2>

      <button className="btn-falar" onClick={iniciarEscuta}>
        🎙️ FALAR AGORA
      </button>

      <div className="terminal-container">
        <div className="terminal-content">
          <div className="terminal-line">
            <span className="user-text">{falado || "..."}</span>
          </div>
        </div>
      </div>
      <div className="terminal-line">
        <span className="agent-text">{agente}</span>
      </div>
    </div>
  )
}