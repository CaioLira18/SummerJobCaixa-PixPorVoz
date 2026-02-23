import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const chatEndRef = useRef(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado para controlar se o usuário está autenticado ou não
    const [name, setName] = useState(''); // Estado para armazenar o nome do usuário, que pode ser exibido na interface para uma experiência mais personalizada
    const [listFavorites, setListFavorites] = useState([]); // Estado para armazenar o nome do usuário, que pode ser exibido na interface para uma experiência mais personalizada


    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser); // Tenta parsear os dados do usuário armazenados no localStorage
                setIsAuthenticated(true); // Atualiza o estado para indicar que o usuário está autenticado
                setName(parsedUser.name || ''); // Armazena o nome do usuário no estado para uso futuro na interface
            } catch (err) {
                console.error("Erro ao processar usuário do localStorage", err); // Log detalhado do erro para facilitar a depuração caso o JSON esteja corrompido ou mal formatado
            }
        }
    }, []);

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

    // 1. Carregar nomes dos contatos do banco Java ao iniciar
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            // Busca detalhes dos contatos usando os IDs do usuário
            if (parsedUser.contactIds && parsedUser.contactIds.length > 0) {
                fetch("http://localhost:8080/api/users/list-by-ids", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(parsedUser.contactIds)
                })
                    .then(res => res.json())
                    .then(data => {
                        const nomes = data.map(u => u.name);
                        setListFavorites(nomes);
                    })
                    .catch(err => console.error("Erro ao carregar contatos do Java", err));
            }
        }
    }, []);

    const iniciarVoz = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = "pt-BR";

        recognition.onresult = async (event) => {
            const transcricao = event.results[0][0].transcript;
            setMessages(prev => [...prev, { text: transcricao, sender: 'user', time: new Date().toLocaleTimeString() }]);
            setLoading(true);

            try {
                const res = await fetch("http://127.0.0.1:8000/ouvir", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        texto: transcricao,
                        historico: messages,
                        contatos_validos: listFavorites // Envia nomes para o Python validar
                    }),
                });
                const data = await res.json();
                setMessages(prev => [...prev, { text: data.resposta, sender: 'bot', time: new Date().toLocaleTimeString() }]);
            } catch (err) {
                console.error("Erro na conexão IA", err);
            } finally {
                setLoading(false);
            }
        };
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