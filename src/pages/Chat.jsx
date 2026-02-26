import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from "react-router-dom";

export const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [authMethod, setAuthMethod] = useState("biometria");
    const [voiceSpeed, setVoiceSpeed] = useState(1.0);

    const [awaitingAuth, setAwaitingAuth] = useState(false);
    const [awaitingConfirm, setAwaitingConfirm] = useState(false);
    const [pendingPix, setPendingPix] = useState(null);
    const [listFavorites, setListFavorites] = useState([]);

    const chatEndRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const firstMessageSent = useRef(false);
    const voiceSpeedRef = useRef(voiceSpeed);
    const listFavoritesRef = useRef([]);
    const awaitingConfirmRef = useRef(false);

    useEffect(() => { voiceSpeedRef.current = voiceSpeed; }, [voiceSpeed]);
    useEffect(() => { listFavoritesRef.current = listFavorites; }, [listFavorites]);
    useEffect(() => { awaitingConfirmRef.current = awaitingConfirm; }, [awaitingConfirm]);

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

    // =========================
    // VOZ — RECONHECIMENTO
    // =========================
    const iniciarEscuta = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.lang = "pt-BR";
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcricao = event.results[0][0].transcript.trim().toLowerCase();

            if (awaitingConfirmRef.current) {
                const positivo = ["sim", "confirmar", "confirma", "pode", "vai", "isso", "correto", "certo", "ok", "yes"];
                const negativo = ["não", "nao", "cancela", "cancelar", "errado", "errada", "volta", "no"];

                const ehSim = positivo.some(p => transcricao.includes(p));
                const ehNao = negativo.some(n => transcricao.includes(n));

                if (ehSim) {
                    confirmarPix(transcricao);
                } else if (ehNao) {
                    cancelarPix(transcricao);
                } else {
                    adicionarMensagem(transcricao, "user");
                    const msgDuvida = "Não entendi. Diga 'sim' para confirmar ou 'não' para cancelar.";
                    adicionarMensagem(msgDuvida, "bot");
                    // Sem voz do navegador aqui, apenas volta a ouvir
                    setTimeout(iniciarEscuta, 1500);
                }
            } else {
                processarMensagem(transcricao);
            }
        };

        recognition.onerror = (e) => {
            console.warn("Erro no reconhecimento de voz:", e.error);
        };

        recognition.start();
    };

    // =========================
    // VOZ — SAÍDA (ELEVENLABS APENAS)
    // =========================
    const tocarAudioBackend = (audioUrl, onEndCallback) => {
        const audio = new Audio(`http://127.0.0.1:8000${audioUrl}`);
        audio.playbackRate = voiceSpeedRef.current;
        audio.onended = () => {
            if (onEndCallback) onEndCallback();
            else iniciarEscuta();
        };
        audio.play();
    };

    // Função de fallback silenciada (removeu window.speechSynthesis)
    const tocarAudioTexto = (texto, onEndCallback) => {
        if (onEndCallback) {
            onEndCallback();
        } else {
            // Pequeno delay para simular o tempo de resposta antes de abrir o mic
            setTimeout(iniciarEscuta, 1000);
        }
    };

    const tratarRespostaApi = (data) => {
        adicionarMensagem(data.resposta, "bot");

        if (data.status === "CONFIRM") {
            setPendingPix({ valor: data.valor, destinatario: data.destinatario });
            setAwaitingConfirm(true);
            awaitingConfirmRef.current = true;
        }

        if (data.audio_url) {
            tocarAudioBackend(data.audio_url);
        } else {
            tocarAudioTexto(data.resposta);
        }
    };

    // =========================
    // FLUXOS DE CONFIRMAÇÃO
    // =========================
    const generateTransactionId = () => {
        // 16-character hexadecimal
        return Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
    };

    const generateAuthCode = () => {
        // 8-character alphanumeric
        return Array.from({ length: 8 }, () => Math.random().toString(36)[2].toUpperCase()).join('');
    };

    const confirmarPix = (transcricao) => {
        setAwaitingConfirm(false);
        awaitingConfirmRef.current = false;
        adicionarMensagem(transcricao, "user");

        // enrich pendingPix with additional meta
        const now = new Date();
        setPendingPix(prev => ({
            ...prev,
            date: now.toISOString(),
            cpf: "***.123.456-**",
            instituicao: "Banco X",
            transactionId: `E${generateTransactionId()}`,
            authCode: generateAuthCode(),
        }));

        const msgAuth = `Perfeito! Iniciando autenticação via ${authMethod}...`;
        adicionarMensagem(msgAuth, "bot");

        // Transição visual sem depender de áudio do sistema
        setTimeout(() => {
            setAwaitingAuth(true);
        }, 1200);
    };

    const cancelarPix = (transcricao) => {
        setAwaitingConfirm(false);
        awaitingConfirmRef.current = false;
        setPendingPix(null);
        adicionarMensagem(transcricao, "user");
        const msgCancel = "Tudo bem! Cancelei. Pode me dizer o valor e o destinatário novamente.";
        adicionarMensagem(msgCancel, "bot");
        tocarAudioTexto(msgCancel);
    };

    const processarMensagem = async (texto) => {
        adicionarMensagem(texto, "user");
        setLoading(true);

        try {
            const res = await fetch("http://127.0.0.1:8000/ouvir", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    texto,
                    historico: messages,
                    contatos_validos: listFavoritesRef.current
                }),
            });

            const data = await res.json();
            tratarRespostaApi(data);

        } catch (err) {
            console.error("Erro IA", err);
            adicionarMensagem("Erro ao processar comando.", "bot");
            setTimeout(iniciarEscuta, 1500);
        } finally {
            setLoading(false);
        }
    };

    const processarMensagemComFavoritos = async (texto, favoritos) => {
        adicionarMensagem(texto, "user");
        setLoading(true);

        try {
            const res = await fetch("http://127.0.0.1:8000/ouvir", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    texto,
                    historico: [],
                    contatos_validos: favoritos
                }),
            });

            const data = await res.json();
            tratarRespostaApi(data);

        } catch (err) {
            console.error("Erro IA", err);
            adicionarMensagem("Erro ao processar comando.", "bot");
            setTimeout(iniciarEscuta, 1500);
        } finally {
            setLoading(false);
        }
    };

    const dispararPrimeiraMensagem = (favoritos) => {
        if (location.state?.firstMessage && !firstMessageSent.current) {
            firstMessageSent.current = true;
            processarMensagemComFavoritos(location.state.firstMessage, favoritos);
        }
    };

    useEffect(() => {
        if (location.state?.authMethod) setAuthMethod(location.state.authMethod);

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
                    setListFavorites(nomes);
                    listFavoritesRef.current = nomes;
                    dispararPrimeiraMensagem(nomes);
                })
                .catch(err => {
                    console.error("Erro ao carregar favoritos:", err);
                    dispararPrimeiraMensagem([]);
                });
        } else {
            dispararPrimeiraMensagem([]);
        }
    }, []);

    const autenticar = () => {
        adicionarMensagem(`Autenticando via ${authMethod}...`, "bot");

        setTimeout(() => {
            setAwaitingAuth(false);
            // primeiro exibimos a tela de confirmação e repassamos dados da transação
            navigate("/pixConfirmado", { state: pendingPix });
            // a própria PixConfirmado se encarrega de avançar para o comprovante
        }, 2000);
    };

    return (
        <div>
            <div className="containerChat">
                {messages.map((msg, index) => (
                    <div key={index} className={`containerBox ${msg.sender === 'user' ? 'userAlign' : 'botAlign'}`}>
                        <div className="messageBox">
                            {msg.sender === 'user' && (
                                <div className="userProfile"><i className="fa-solid fa-user"></i></div>
                            )}
                            <div className="messageContent">
                                <div className="messageText">{msg.text}</div>
                                <div className="messageTime">{msg.time}</div>
                            </div>
                            {msg.sender === 'bot' && (
                                <div className="userProfile"><i className="fa-solid fa-robot"></i></div>
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

            {awaitingAuth && (
                <div className="authOverlay">
                    <div className="authContent">
                        <h2 className="authTitle">Confirmar Transferência</h2>
                        <p className="authSubtitle">
                            {authMethod === "biometria" && "Confirme com a impressão digital para realizar a transferência"}
                            {authMethod === "facial" && "Autenticando..."}
                            {authMethod === "senha" && "Confirme com sua senha para realizar a transferência"}
                        </p>

                        {authMethod !== "senha" && (
                            <div className="authMethodsLinks">
                                <span onClick={() => setAuthMethod("facial")}>TROCAR MÉTODO</span>
                                <span style={{ opacity: 0.3 }}>|</span>
                                <span onClick={() => setAuthMethod("senha")}>USAR SENHA</span>
                            </div>
                        )}

                        {authMethod === "biometria" && (
                            <>
                                <div className="biometryCard" style={{ marginTop: '150px' }} onClick={autenticar}>
                                    <div className="fingerprintIcon"><i className="fa-solid fa-fingerprint"></i></div>
                                </div>
                                <p className="authFooterText" style={{ marginTop: '20px' }}>TOQUE PARA CONFIRMAR</p>
                            </>
                        )}

                        {authMethod === "facial" && (
                            <div className="facialScannerBox" onClick={autenticar}>
                                <div className="scannerLine"></div>
                            </div>
                        )}

                        {authMethod === "senha" && (
                            <>
                                <div className="pinDisplay">
                                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="pinDot"></div>)}
                                </div>
                                <div className="numpadContainer">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                        <button key={num} className="numpadBtn" onClick={autenticar}>{num}</button>
                                    ))}
                                    <div></div>
                                    <button className="numpadBtn" onClick={autenticar}>0</button>
                                    <button className="numpadBtn"><i className="fa-solid fa-delete-left"></i></button>
                                </div>
                            </>
                        )}
                    </div>
                    <button className="debugSkipButton" onClick={autenticar}>
                        <i className="fa-solid fa-bug"></i> PULAR AUTENTICAÇÃO (DEBUG)
                    </button>
                </div>
            )}
        </div>
    );
};

export default Chat;