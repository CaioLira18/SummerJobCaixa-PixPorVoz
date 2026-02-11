import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (location.state?.historicoInicial) {
            const msgsIniciais = location.state.historicoInicial.map(m => ({
                ...m,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            setMessages(msgsIniciais);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    useEffect(scrollToBottom, [messages, loading]);

    const adicionarMensagem = (texto, remetente) => {
        setMessages(prev => [...prev, {
            text: texto,
            sender: remetente,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
    };

    const iniciarVoz = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return alert("Navegador não suportado");

        const recognition = new SpeechRecognition();
        recognition.lang = "pt-BR";

        recognition.onstart = () => setLoading(true);

        recognition.onresult = async (event) => {
            const transcricao = event.results[0][0].transcript;
            
            // 1. Adiciona a mensagem do usuário na tela primeiro
            const novaMensagemUsuario = { text: transcricao, sender: 'user' };
            adicionarMensagem(transcricao, 'user');

            setLoading(true);

            try {
                // 2. Envia o histórico ATUAL para o servidor
                const res = await fetch("http://127.0.0.1:8000/ouvir", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        texto: transcricao,
                        historico: messages // <--- Aqui passamos a memória do chat
                    }),
                });
                
                const data = await res.json();
                adicionarMensagem(data.resposta, 'bot');
            } catch (err) {
                adicionarMensagem("Erro ao conectar com o servidor.", 'bot');
            } finally {
                setLoading(false);
            }
        };

        recognition.onend = () => {};
        recognition.start();
    };

    return (
        /* O JSX permanece o mesmo da sua versão original */
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
                            <div className="messageContent" style={{ minWidth: '80px', display: 'flex', justifyContent: 'center' }}>
                                <div className="loading"><span></span><span></span><span></span></div>
                            </div>
                            <div className="userProfile"><i className="fa-solid fa-robot"></i></div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="inputBarContainer">
                <div className="microphoneButton" onClick={iniciarVoz}>
                    <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-microphone'}`}></i>
                </div>
            </div>
        </div>
    );
};

export default Chat;