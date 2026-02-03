import React, { useState, useRef } from "react";

export const Terminal = () => {
  const [falado, setFalado] = useState("");
  const [agente, setAgente] = useState("Aguardando comando...");
  const [ouvindo, setOuvindo] = useState(false);

  const recognitionRef = useRef(null);

  const iniciarEscuta = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setAgente("Reconhecimento de voz não suportado neste navegador.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setOuvindo(true);
      setAgente("Ouvindo...");
      setFalado("");
    };

    recognition.onresult = async (event) => {
      const texto = event.results[0][0].transcript;
      setFalado(texto);
      setAgente("Processando...");

      try {
        const response = await fetch("http://127.0.0.1:8000/ouvir", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ texto }),
        });

        const data = await response.json();
        setAgente(data.resposta);
      } catch (err) {
        setAgente("Erro ao comunicar com o servidor.");
      }
    };

    recognition.onerror = () => {
      setOuvindo(false);
      setAgente("Erro no reconhecimento de voz.");
    };

    recognition.onend = () => {
      setOuvindo(false);
    };

    recognition.start();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 20 }}>
      <h2 style={{ color: "white", marginBottom: 15 }}>Assistente Pix Voice</h2>

      <button className="btn-falar" onClick={iniciarEscuta} disabled={ouvindo}>
        🎙️ {ouvindo ? "OUVINDO..." : "FALAR AGORA"}
      </button>

      <div className="terminal-container">
        <div className="terminal-content">
          <div className="terminal-line">
            <span className="user-text">{falado || "..."}</span>
          </div>
        </div>
      </div>

      <div className="terminal-line">
        <span className="agent-text" aria-live="polite">
          {agente}
        </span>
      </div>
    </div>
  );
};
