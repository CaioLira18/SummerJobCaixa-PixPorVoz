import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Terminal = () => {
  const [ouvindo, setOuvindo] = useState(false);
  const navigate = useNavigate();

  const iniciarEscuta = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Navegador não suportado");

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";

    recognition.onstart = () => setOuvindo(true);

    recognition.onresult = async (event) => {
      const texto = event.results[0][0].transcript;

      try {
        const response = await fetch("https://summerjobcaixa-pixporvoz-production-64ac.up.railway.app/ouvir", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texto }),
        });

        const data = await response.json();
        
        // AQUI ESTÁ O SEGREDO: Passar o histórico para a próxima tela
        navigate("/chat", { 
          state: { 
            historicoInicial: [
              { text: texto, sender: 'user' },
              { text: data.resposta, sender: 'bot' }
            ] 
          } 
        });
      } catch (err) {
        console.error("Erro ao processar:", err);
      }
    };

    recognition.onend = () => setOuvindo(false);
    recognition.start();
  };

  return (
    <div className="terminal-container" style={{ textAlign: 'center', marginTop: '50px' }}>
       <button className={`btn-falar ${ouvindo ? 'ativo' : ''}`} onClick={iniciarEscuta}>
          🎙️ {ouvindo ? "OUVINDO..." : "FALAR AGORA"}
       </button>
    </div>
  );
};