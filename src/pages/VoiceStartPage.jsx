import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const VoiceStartPage = () => {
  const navigate = useNavigate();

  // === ESTADOS DE CONFIGURAÇÃO E UI ===
  const [authMethod, setAuthMethod] = useState("facial");
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [listening, setListening] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // === ESTADOS DE FLUXO (PIX e Transcrição) ===
  const [lastUserText, setLastUserText] = useState("");
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);
  const [pendingPix, setPendingPix] = useState(null);
  const [listFavorites, setListFavorites] = useState([]);

  // === ESTADOS DE AUTENTICAÇÃO ===
  const [awaitingAuth, setAwaitingAuth] = useState(false);
  const [pinDigits, setPinDigits] = useState([]);

  // === REFS ===
  const recognitionRef = useRef(null);
  const voiceSpeedRef = useRef(voiceSpeed);
  const awaitingConfirmRef = useRef(false);
  const awaitingAuthRef = useRef(false);
  const listFavoritesRef = useRef([]);

  // Sincronização de Refs
  useEffect(() => { voiceSpeedRef.current = voiceSpeed; }, [voiceSpeed]);
  useEffect(() => { awaitingConfirmRef.current = awaitingConfirm; }, [awaitingConfirm]);
  useEffect(() => { awaitingAuthRef.current = awaitingAuth; }, [awaitingAuth]);
  useEffect(() => { listFavoritesRef.current = listFavorites; }, [listFavorites]);

  // === CARREGAR FAVORITOS AO INICIAR ===
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.contactIds?.length > 0) {
        fetch("http://localhost:8080/api/users/list-by-ids", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsedUser.contactIds),
        })
          .then((res) => res.json())
          .then((data) => {
            const nomes = data.map((u) => u.name);
            setListFavorites(nomes);
          })
          .catch((err) => console.error("Erro favoritos:", err));
      }
    }
  }, []);

  // === CONFIGURAÇÃO WEB SPEECH API ===
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setLastUserText(text);
      setListening(false);
      handleVoiceInput(text.toLowerCase());
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
  }, []);

  // === LÓGICA DE PROCESSAMENTO ===
  const handleVoiceInput = async (text) => {
    if (awaitingAuthRef.current) return;

    if (awaitingConfirmRef.current) {
      const positivo = ["sim", "confirmar", "pode", "isso", "correto", "ok", "vai"];
      const negativo = ["não", "nao", "cancela", "errado", "volta"];

      if (positivo.some((p) => text.includes(p))) {
        iniciarAutenticacao();
      } else if (negativo.some((n) => text.includes(n))) {
        setAwaitingConfirm(false);
        setPendingPix(null);
        tocarAudioTexto("Cancelado. O que deseja fazer?");
      }
    } else {
      processarComIA(text);
    }
  };

  const processarComIA = async (texto) => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/ouvir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto,
          historico: [],
          contatos_validos: listFavoritesRef.current,
        }),
      });

      const data = await res.json();

      if (data.status === "CONFIRM") {
        setPendingPix({ valor: data.valor, destinatario: data.destinatario });
        setAwaitingConfirm(true);
      }

      if (data.audio_url) {
        tocarAudioBackend(data.audio_url);
      } else {
        tocarAudioTexto(data.resposta);
      }
    } catch (err) {
      console.error("Erro IA", err);
    } finally {
      setLoading(false);
    }
  };

  // === FLUXO DE NAVEGAÇÃO ===
  const iniciarAutenticacao = () => {
    setAwaitingConfirm(false);
    const now = new Date();
    setPendingPix((prev) => ({
      ...prev,
      date: now.toISOString(),
      cpf: "***.123.456-**",
      instituicao: "Banco CAIXA",
      transactionId: `E${Math.random().toString(16).slice(2, 18).toUpperCase()}`,
      authCode: Math.random().toString(36).slice(2, 10).toUpperCase(),
    }));
    setTimeout(() => setAwaitingAuth(true), 500);
  };

  const finalizarENavegar = () => {
    setAwaitingAuth(false);
    navigate("/pixConfirmado", { state: pendingPix });
  };

  const handlePinDigit = (digit) => {
    setPinDigits((prev) => {
      const next = [...prev, digit];
      if (next.length >= 6) setTimeout(finalizarENavegar, 300);
      return next.slice(0, 6);
    });
  };

  // === VELOCIDADE DE VOZ ===
  const SPEED_MIN = 0.5;
  const SPEED_MAX = 2.0;
  const SPEED_STEP = 0.25;

  const decreaseSpeed = () =>
    setVoiceSpeed((prev) => Math.max(SPEED_MIN, parseFloat((prev - SPEED_STEP).toFixed(2))));

  const increaseSpeed = () =>
    setVoiceSpeed((prev) => Math.min(SPEED_MAX, parseFloat((prev + SPEED_STEP).toFixed(2))));

  // === ÁUDIO ===
  const tocarAudioBackend = (audioUrl) => {
    const audio = new Audio(`http://127.0.0.1:8000${audioUrl}`);
    audio.playbackRate = voiceSpeedRef.current;
    audio.onended = () => { if (!awaitingConfirmRef.current) startListening(); };
    audio.play();
  };

  const tocarAudioTexto = () => setTimeout(startListening, 2000);

  const startListening = () => {
    if (!recognitionRef.current || listening) return;
    try {
      setListening(true);
      recognitionRef.current.start();
    } catch {
      setListening(false);
    }
  };

  const formatCurrency = (v) =>
    parseFloat(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // Mic icon SVG
  const MicIcon = () => (
    <svg viewBox="0 0 24 24" fill="white" width="52" height="52">
      <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2z" />
    </svg>
  );

  return (
    <div className="voiceStartContainer">
      {/* HEADER */}
      <div className="header">
        <button className="iconBtn closeBtn" onClick={() => navigate(-1)}>✕</button>
        <div className="headerCenter">
          <span className="headerLabel">CAIXA ASSISTENTE</span>
          <span className="headerTitle">
            {loading ? "PROCESSANDO..." : listening ? "OUVINDO..." : "Modo Voz Ativo"}
          </span>
        </div>
        <button className="iconBtn settingsBtn" onClick={() => setSettingsOpen(true)}>⚙</button>
      </div>

      {/* MIC */}
      <div className="micArea">
        <div className="micRingOuter">
          <button
            className={`micButton ${listening ? "listening" : ""} ${loading ? "loading" : ""}`}
            onClick={startListening}
            disabled={loading || awaitingAuth}
          >
            <MicIcon />
          </button>
        </div>
      </div>

      {/* STATUS */}
      <div className="voiceStatusFeedback">
        <p className="userTranscription">
          {lastUserText || "AGUARDANDO COMANDO..."}
        </p>
        {awaitingConfirm && pendingPix && (
          <p className="confirmHint">
            Diga "Sim" para confirmar o PIX de{" "}
            {formatCurrency(pendingPix.valor)} para {pendingPix.destinatario}
          </p>
        )}
      </div>

      {/* ── AUTH OVERLAY ── */}
      {awaitingAuth && (
        <div className="authOverlay">
          <div className="authContent">
            <h2 className="authTitle">Autenticação</h2>
            <p className="authSubtitle">
              Finalize para enviar para {pendingPix?.destinatario}
            </p>

            {authMethod === "biometria" && (
              <div className="biometryCard" onClick={finalizarENavegar}>
                <span role="img" aria-label="fingerprint">🫆</span>
              </div>
            )}

            {authMethod === "facial" && (
              <div className="facialScannerBox" onClick={finalizarENavegar}>
                <div className="scannerLine" />
              </div>
            )}

            {authMethod === "senha" && (
              <div className="numpadContainer">
                <div className="pinDisplay">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className={`pinDot ${pinDigits.length >= i ? "filled" : ""}`}
                    />
                  ))}
                </div>
                <div className="numpadGrid">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => (
                    <button
                      key={n}
                      onClick={() => handlePinDigit(n)}
                      className="numpadBtn"
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button className="debugSkipButton" onClick={finalizarENavegar}>
            ⚡ PULAR AUTENTICAÇÃO
          </button>
        </div>
      )}

      {/* ── SETTINGS OVERLAY ── */}
      {settingsOpen && (
        <div className="overlay">
          <div className="settingsPanel">

            <div className="settingsPanelHeader">
              <span className="settingsPanelTitle">Configurações</span>
              <button className="settingsCloseBtn" onClick={() => setSettingsOpen(false)}>✕</button>
            </div>

            {/* Auth method */}
            <p className="sectionLabel">SEGURANÇA PADRÃO</p>
            <div className="settingsList">
              {[
                { key: "biometria", label: "Biometria" },
                { key: "facial",    label: "Reconhecimento Facial" },
                { key: "senha",     label: "Senha de 6 Dígitos" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setAuthMethod(key)}
                  className={authMethod === key ? "activeOption" : ""}
                >
                  {label}
                  <span className="checkIcon">✓</span>
                </button>
              ))}
            </div>

            {/* Voice speed */}
            <p className="sectionLabel speedSection">VELOCIDADE DA VOZ</p>
            <div className="speedButtons">
              {[
                { key: 0.75, label: "Lenta" },
                { key: 1.0,  label: "Normal" },
                { key: 1.5,  label: "Rápida" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className={`speedBtn ${voiceSpeed === key ? "activeSpeed" : ""}`}
                  onClick={() => setVoiceSpeed(key)}
                >
                  {label}
                </button>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceStartPage;