import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const VoiceStartPage = () => {
  const navigate = useNavigate();

  const [authMethod, setAuthMethod] = useState("facial");
  const [voiceSpeed, setVoiceSpeed] = useState("normal");
  const [listening, setListening] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [debugStatus, setDebugStatus] = useState(null);

  const recognitionRef = useRef(null);

  // ✅ Cria o reconhecimento apenas UMA vez
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;

      recognition.stop(); // 🔥 garante que pare antes de navegar
      setListening(false);

      navigate("/chat", {
        state: {
          firstMessage: text,
          authMethod,
          voiceSpeed,
        },
      });
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [navigate, authMethod, voiceSpeed]);

  const startListening = () => {
    if (!recognitionRef.current) {
      alert("Reconhecimento de voz não suportado.");
      return;
    }

    if (listening) return; // 🔥 evita múltiplos starts

    try {
      setListening(true);
      recognitionRef.current.start();
    } catch {
      setListening(false);
    }
  };

  const simulateSuccess = () => {
    setDebugStatus("sucesso");
    setSettingsOpen(false);
  };

  return (
    <div className="voiceStartContainer">
      {/* Header */}
      <div className="header">
        <button
          className="iconBtn closeBtn"
          onClick={() => navigate(-1)}
        >
          ✕
        </button>

        <div className="headerCenter">
          <span className="headerLabel">CAIXA ASSISTENTE</span>
          <span className="headerTitle">Modo Voz Ativo</span>

          {debugStatus && (
            <>
              <span className="debugLine">DEBUG: SUCESSO</span>
              <span className="debugLine">DEBUG: AUTH</span>
            </>
          )}
        </div>

        <button
          className="iconBtn settingsBtn"
          onClick={() => setSettingsOpen(true)}
        >
          ⚙
        </button>
      </div>

      {/* Mic area */}
      <div className="micArea">
        <button
          className={`micButton ${listening ? "listening" : ""}`}
          onClick={startListening}
        >
          <svg viewBox="0 0 24 24" fill="white" width="56" height="56">
            <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2z"/>
          </svg>
        </button>
      </div>

      <p className="waitingText">AGUARDANDO COMANDO...</p>

      {/* Listening pill */}
      <div className={`listeningPill ${listening ? "active" : ""}`}>
        <span className="dot" />
        <span>OUVINDO</span>
      </div>

      {/* Page dots */}
      <div className="pageDots">
        <span className="dot-inactive" />
        <span className="dot-inactive" />
        <span className="dot-active" />
      </div>

      {/* Settings overlay */}
      {settingsOpen && (
        <div
          className="overlay"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="settingsPanel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="settingsHeader">
              <span className="settingsTitle">CONFIGURAÇÕES</span>
              <button
                className="iconBtn"
                onClick={() => setSettingsOpen(false)}
              >
                ✕
              </button>
            </div>

            <p className="sectionLabel">SEGURANÇA PADRÃO</p>

            <div className="settingsList">
              {[
                { id: "biometria", label: "Biometria" },
                { id: "facial", label: "Reconhecimento Facial" },
                { id: "senha", label: "Senha de 6 Dígitos" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  className={`settingsOption ${
                    authMethod === opt.id ? "activeOption" : ""
                  }`}
                  onClick={() => setAuthMethod(opt.id)}
                >
                  <span>{opt.label}</span>
                  {authMethod === opt.id && (
                    <span className="checkmark">✓</span>
                  )}
                </button>
              ))}
            </div>

            <p className="sectionLabel">VELOCIDADE DA VOZ</p>

            <div className="speedOptions">
              {[
                { id: "slow", label: "Lenta" },
                { id: "normal", label: "Normal" },
                { id: "fast", label: "Rápida" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  className={`speedBtn ${
                    voiceSpeed === opt.id ? "activeSpeed" : ""
                  }`}
                  onClick={() => setVoiceSpeed(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              className="simulateBtn"
              onClick={simulateSuccess}
            >
              ✏ SIMULAR SUCESSO (TESTE)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceStartPage;