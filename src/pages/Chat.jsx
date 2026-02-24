import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [authMethod, setAuthMethod] = useState("biometria");
    const [voiceSpeed, setVoiceSpeed] = useState(1.0);
    const [awaitingAuth, setAwaitingAuth] = useState(false);
    const [pendingPix, setPendingPix] = useState(null);
    const [listFavorites, setListFavorites] = useState([]);

    const location = useLocation();
    const chatEndRef = useRef(null);

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

    // 🔊 Tocar áudio vindo do backend
    const tocarAudioBackend = (audioUrl) => {
        const audio = new Audio(`http://127.0.0.1:8000${audioUrl}`);
        audio.playbackRate = voiceSpeed;
        audio.play();
    };

    // =========================
    // CARREGAR FAVORITOS
    // =========================
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);

            if (parsedUser.contactIds?.length > 0) {
                fetch("http://localhost:8080/api/users/list-by-ids", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(parsedUser.contactIds)
                })
                    .then(res => res.json())
                    .then(data => {
                        setListFavorites(data.map(u => u.name));
                    });
            }
        }
    }, []);

    // =========================
    // RECONHECIMENTO DE VOZ
    // =========================
    const iniciarVoz = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = "pt-BR";

        recognition.onresult = async (event) => {
            const transcricao = event.results[0][0].transcript;

            adicionarMensagem(transcricao, "user");
            setLoading(true);

            try {
                const res = await fetch("http://127.0.0.1:8000/ouvir", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        texto: transcricao,
                        historico: messages,
                        contatos_validos: listFavorites
                    }),
                });

                const data = await res.json();

                adicionarMensagem(data.resposta, "bot");

                // 🔊 Tocar áudio retornado pela API
                if (data.audio_url) {
                    tocarAudioBackend(data.audio_url);
                }

            } catch (err) {
                console.error("Erro IA", err);
                adicionarMensagem("Erro ao processar comando.", "bot");
            } finally {
                setLoading(false);
            }
        };

        recognition.start();
    };

    // =========================
    // AUTENTICAÇÃO SIMULADA
    // =========================
    const autenticar = () => {
        adicionarMensagem(`Autenticando via ${authMethod}...`, "bot");

        setTimeout(() => {
            adicionarMensagem("Pix realizado com sucesso ✅", "bot");
            setAwaitingAuth(false);
            setPendingPix(null);
        }, 2000);
    };

    return (
        <div>

            {/* CONFIGURAÇÃO DENTRO DO CHAT */}
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
                <div className="authBox">
                    <h3>Autenticação necessária</h3>
                    <p>Valor: R$ {pendingPix?.valor}</p>
                    <p>Destinatário: {pendingPix?.destinatario}</p>
                    <button onClick={autenticar}>
                        Autenticar via {authMethod}
                    </button>
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