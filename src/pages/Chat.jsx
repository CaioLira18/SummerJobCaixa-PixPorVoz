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
    const awaitingConfirmRef = useRef(false); // ref para evitar stale closure no onresult

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
    // VOZ — ativa automaticamente após o bot parar de falar
    // =========================
    const iniciarEscuta = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.lang = "pt-BR";
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcricao = event.results[0][0].transcript.trim().toLowerCase();

            // Se estiver aguardando confirmação, interpreta sim/não
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
                    // Não entendeu — pede para repetir e volta a escutar
                    adicionarMensagem(transcricao, "user");
                    const msgDuvida = "Não entendi. Diga 'sim' para confirmar ou 'não' para cancelar.";
                    adicionarMensagem(msgDuvida, "bot");
                    tocarAudioTexto(msgDuvida);
                }
            } else {
                // Fluxo normal de comando Pix
                processarMensagem(transcricao);
            }
        };

        recognition.onerror = (e) => {
            console.warn("Erro no reconhecimento de voz:", e.error);
        };

        recognition.start();
    };

    // Toca áudio do backend e, ao terminar, ativa o microfone automaticamente
    const tocarAudioBackend = (audioUrl, onEndCallback) => {
        const audio = new Audio(`http://127.0.0.1:8000${audioUrl}`);
        audio.playbackRate = voiceSpeedRef.current;
        audio.onended = () => {
            if (onEndCallback) onEndCallback();
            else iniciarEscuta();
        };
        audio.play();
    };

    // Síntese de voz local (fallback quando não há áudio do backend)
    const tocarAudioTexto = (texto, onEndCallback) => {
        const synth = window.speechSynthesis;
        if (!synth) {
            if (onEndCallback) onEndCallback();
            else iniciarEscuta();
            return;
        }
        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = "pt-BR";
        utterance.rate = voiceSpeedRef.current;
        utterance.onend = () => {
            if (onEndCallback) onEndCallback();
            else iniciarEscuta();
        };
        synth.speak(utterance);
    };

    // =========================
    // PROCESSAR RESPOSTA DA API
    // =========================
    const tratarRespostaApi = (data) => {
        adicionarMensagem(data.resposta, "bot");

        if (data.status === "CONFIRM") {
            setPendingPix({ valor: data.valor, destinatario: data.destinatario });
            setAwaitingConfirm(true);
            awaitingConfirmRef.current = true;
        }

        // Toca o áudio — ao terminar ativa microfone automaticamente (exceto durante autenticação)
        if (data.audio_url) {
            tocarAudioBackend(data.audio_url);
        } else {
            tocarAudioTexto(data.resposta);
        }
    };

    // =========================
    // CONFIRMAÇÃO POR VOZ
    // =========================
    const confirmarPix = (transcricao) => {
        setAwaitingConfirm(false);
        awaitingConfirmRef.current = false;
        adicionarMensagem(transcricao, "user");
        const msgAuth = `Perfeito! Iniciando autenticação via ${authMethod}...`;
        adicionarMensagem(msgAuth, "bot");
        tocarAudioTexto(msgAuth, () => {
            // Após falar, abre autenticação — NÃO volta a escutar
            setAwaitingAuth(true);
        });
    };

    const cancelarPix = (transcricao) => {
        setAwaitingConfirm(false);
        awaitingConfirmRef.current = false;
        setPendingPix(null);
        adicionarMensagem(transcricao, "user");
        const msgCancel = "Tudo bem! Cancelei. Pode me dizer o valor e o destinatário novamente.";
        adicionarMensagem(msgCancel, "bot");
        tocarAudioTexto(msgCancel); // ao terminar → escuta novo comando
    };

    // =========================
    // PROCESSAR MENSAGEM
    // =========================
    const processarMensagem = async (texto) => {
        adicionarMensagem(texto, "user");
        setLoading(true);

        try {
            let historicoAtual = [];
            setMessages(prev => { historicoAtual = prev; return prev; });

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
            tratarRespostaApi(data);

        } catch (err) {
            console.error("Erro IA", err);
            adicionarMensagem("Erro ao processar comando.", "bot");
            iniciarEscuta();
        } finally {
            setLoading(false);
        }
    };

    const processarMensagemComFavoritos = async (texto, favoritos) => {
        adicionarMensagem(texto, "user");
        setLoading(true);

        try {
            let historicoAtual = [];
            setMessages(prev => { historicoAtual = prev; return prev; });

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
            tratarRespostaApi(data);

        } catch (err) {
            console.error("Erro IA", err);
            adicionarMensagem("Erro ao processar comando.", "bot");
            iniciarEscuta();
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

    // =========================
    // INICIALIZAÇÃO
    // =========================
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

    // =========================
    // RENDER
    // =========================
    return (
        <div>
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

            {/* AUTENTICAÇÃO DINÂMICA */}
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
                                    <div className="fingerprintIcon">
                                        <i className="fa-solid fa-fingerprint"></i>
                                    </div>
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