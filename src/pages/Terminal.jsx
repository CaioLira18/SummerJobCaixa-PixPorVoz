import React, { useState } from 'react'

export const Terminal = () => {
  const [falado, setFalado] = useState("");
  const [agente, setAgente] = useState("Aguardando comando...");

  // Terminal.jsx
  const iniciarEscuta = async () => {
    setAgente("Ouvindo...");
    try {
      const response = await fetch('http://127.0.0.1:8000/voice', {
        method: 'POST', // Match the backend change
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: "Quero fazer um pix de 50 reais para o Carlos" }), // Send the actual text here
      });

      const data = await response.json();
      // Note: ensure the keys match what brain.py returns (message vs resposta)
      setAgente(data.message || data.resposta);
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