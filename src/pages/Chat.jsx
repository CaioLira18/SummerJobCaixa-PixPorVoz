import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from "react-router-dom";

export const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [authMethod, setAuthMethod] = useState("biometria");
    const [voiceSpeed, setVoiceSpeed] = useState(1.0);

    const [awaitingAuth, setAwaitingAuth] = useState(false);
    const [pendingPix, setPendingPix] = useState(null);
    const [listFavorites, setListFavorites] = useState([]);

    const chatEndRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Refs para evitar stale closures e double-invoke do StrictMode
    const firstMessageSent = useRef(false);
    const voiceSpeedRef = useRef(voiceSpeed);
    const listFavoritesRef = useRef([]); // sempre atualizado junto com o state

    useEffect(() => {
        voiceSpeedRef.current = voiceSpeed;
    }, [voiceSpeed]);

    // Mantém a ref sincronizada com o state
    useEffect(() => {
        listFavoritesRef.current = listFavorites;
    }, [listFavorites]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, loading]);

    const adicionarMensagem = (texto, remetente) => {
        setMessages(prev => [...prev, {
            text: texto,
            sender: remetente,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
    };

    const tocarAudioBackend = (audioUrl) => {
        const audio = new Audio(`http://127.0.0.1:8000${audioUrl}`);
        audio.playbackRate = voiceSpeedRef.current;
        audio.play();
    };

    // =========================
    // PROCESSAR MENSAGEM (usa listFavoritesRef para evitar stale closure)
    // =========================
    const processarMensagem = async (texto) => {
        adicionarMensagem(texto, "user");
        setLoading(true);

        try {
            let historicoAtual = [];
            setMessages(prev => {
                historicoAtual = prev;
                return prev;
            });

            const res = await fetch("http://127.0.0.1:8000/ouvir", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    texto,
                    historico: historicoAtual,
                    contatos_validos: listFavoritesRef.current
                }),
            });

            const data = await res.json();

            adicionarMensagem(data.resposta, "bot");

            if (data.audio_url) tocarAudioBackend(data.audio_url);

            if (data.status === "REQUIRE_AUTH") {
                setPendingPix({ valor: data.valor, destinatario: data.destinatario });
                setAwaitingAuth(true);
            }

        } catch (err) {
            console.error("Erro IA", err);
            adicionarMensagem("Erro ao processar comando.", "bot");
        } finally {
            setLoading(false);
        }
    };

    // Versão que recebe favoritos explicitamente (para a primeira mensagem)
    const processarMensagemComFavoritos = async (texto, favoritos) => {
        adicionarMensagem(texto, "user");
        setLoading(true);

        try {
            let historicoAtual = [];
            setMessages(prev => {
                historicoAtual = prev;
                return prev;
            });

            const res = await fetch("http://127.0.0.1:8000/ouvir", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    texto,
                    historico: historicoAtual,
                    contatos_validos: favoritos
                }),
            });

            const data = await res.json();

            adicionarMensagem(data.resposta, "bot");

            if (data.audio_url) tocarAudioBackend(data.audio_url);

            if (data.status === "REQUIRE_AUTH") {
                setPendingPix({ valor: data.valor, destinatario: data.destinatario });
                setAwaitingAuth(true);
            }

        } catch (err) {
            console.error("Erro IA", err);
            adicionarMensagem("Erro ao processar comando.", "bot");
        } finally {
            setLoading(false);
        }
    };

    // Chamado após favoritos estarem prontos
    const dispararPrimeiraMensagem = (favoritos) => {
        if (location.state?.firstMessage && !firstMessageSent.current) {
            firstMessageSent.current = true;
            processarMensagemComFavoritos(location.state.firstMessage, favoritos);
        }
    };

    // =========================
    // INICIALIZAÇÃO: carrega favoritos PRIMEIRO, depois dispara a primeira mensagem
    // =========================
    useEffect(() => {
        if (location.state?.authMethod) {
            setAuthMethod(location.state.authMethod);
        }

        if (location.state?.voiceSpeed) {
            const speedMap = { slow: 0.8, normal: 1.0, fast: 1.5 };
            const speed = speedMap[location.state.voiceSpeed] || 1.0;
            setVoiceSpeed(speed);
            voiceSpeedRef.current = speed;
        }

        const storedUser = localStorage.getItem('user');

        if (!storedUser) {
            dispararPrimeiraMensagem([]);
            return;
        }

        const parsedUser = JSON.parse(storedUser);

        if (parsedUser.contactIds?.length > 0) {
            fetch("http://localhost:8080/api/users/list-by-ids", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(parsedUser.contactIds)
            })
                .then(res => res.json())
                .then(data => {
                    const nomes = data.map(u => u.name);
                    // Atualiza state E ref ao mesmo tempo
                    setListFavorites(nomes);
                    listFavoritesRef.current = nomes;
                    dispararPrimeiraMensagem(nomes);
                })
                .catch(err => {
                    console.error("Erro ao carregar favoritos:", err);
                    dispararPrimeiraMensagem([]); // não trava o chat em caso de erro
                });
        } else {
            dispararPrimeiraMensagem([]);
        }
    }, []);

    // =========================
    // VOZ
    // =========================
    const iniciarVoz = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Reconhecimento de voz não suportado.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "pt-BR";

        recognition.onresult = (event) => {
            const transcricao = event.results[0][0].transcript;
            processarMensagem(transcricao);
        };

        recognition.start();
    };

    // =========================
    // AUTENTICAÇÃO
    // =========================
    const autenticar = () => {
        adicionarMensagem(`Autenticando via ${authMethod}...`, "bot");

        setTimeout(() => {
            setAwaitingAuth(false);
            navigate("/pixConfirmado");
            setTimeout(() => navigate("/pixConcluido"), 1500);
        }, 2000);
    };

    return (
        <div>

            {/* CONFIG */}
            <div className="chatConfigBar">
                <select value={authMethod} onChange={(e) => setAuthMethod(e.target.value)}>
                    <option value="biometria">Biometria</option>
                    <option value="voz">Voz</option>
                    <option value="facial">Facial</option>
                </select>

                <select value={voiceSpeed} onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}>
                    <option value={1.0}>Velocidade 1.0x</option>
                    <option value={1.5}>Velocidade 1.5x</option>
                    <option value={2.0}>Velocidade 2.0x</option>
                </select>
            </div>

            {/* CHAT */}
            <div className="containerChat">
                {messages.map((msg, index) => (
                    <div key={index} className={`containerBox ${msg.sender === 'user' ? 'userAlign' : 'botAlign'}`}>
                        <div className="messageBox">
                            {msg.sender === 'user' && (
                                <div className="userProfile">
                                    <i className="fa-solid fa-user"></i>
                                </div>
                            )}

                            <div className="messageContent">
                                <div className="messageText">{msg.text}</div>
                                <div className="messageTime">{msg.time}</div>
                            </div>

                            {msg.sender === 'bot' && (
                                <div className="userProfile">
                                    <i className="fa-solid fa-robot"></i>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="containerBox botAlign">
                        <div className="messageBox">
                            <div className="messageContent">Processando...</div>
                        </div>
                    </div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* AUTENTICAÇÃO */}
            {awaitingAuth && (
                <div className="authOverlay">
                    <div className="authContent">
                        <h2 className="authTitle">Confirmar Transferência</h2>
                        <p className="authSubtitle">
                            Confirme com a impressão digital para realizar a transferência
                        </p>

                        <div className="biometryCard" onClick={autenticar}>
                            <div className="fingerprintIcon">
                                <i className="fa-solid fa-fingerprint"></i>
                            </div>
                        </div>

                        <p className="authFooterText">TOQUE PARA CONFIRMAR</p>
                    </div>
                </div>
            )}

            {/* MICROFONE */}
            <div className="inputBarContainer">
                <div className="microphoneButton" onClick={iniciarVoz}>
                    <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-microphone'}`}></i>
                </div>
            </div>

        </div>
    );
};

export default Chat;