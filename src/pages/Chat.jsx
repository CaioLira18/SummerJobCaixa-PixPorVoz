import React from 'react'

export const Chat = () => {
    const rightPosition = true;
    const loading = true;

    return (
        <div>
            <div className="containerChat">
                {/* Mensagem do Usuário - Alinhada à Esquerda */}
                <div className="containerBox userAlign">
                    <div className="messageBox">
                        <div className="userProfile">
                            <i className="fa-solid fa-user"></i>
                        </div>
                        <div className="messageContent">
                            <div className="messageText">Bom dia, Gostaria de realizar uma transação de 10 reais para pedro</div>
                            <div className="messageTime">10:30 AM</div>
                        </div>
                    </div>
                </div>

                {/* Mensagens do Bot - Alinhadas à Direita */}
                {rightPosition && (
                    <div className="containerBox botAlign">
                        <div className="messageBox">
                            <div className="messageContent">
                                <div className="messageText">Pix de 10 reais para pedro</div>
                                <div className="messageTime">10:30 AM</div>
                            </div>
                            <div className="userProfile">
                                <i className="fa-solid fa-robot"></i>
                            </div>
                        </div>
                        <div className="messageBox">
                            <div className="messageContent">
                                <div className="messageText">Pix de 10 reais para pedro</div>
                                <div className="messageTime">10:30 AM</div>
                            </div>
                            <div className="userProfile">
                                <i className="fa-solid fa-robot"></i>
                            </div>
                        </div>
                        <div className="messageBox">
                            <div className="messageContent">
                                <div className="messageText">Você confirma essa transação ?</div>
                                <div className="messageTime">Sim / Não</div>
                            </div>
                            <div className="userProfile">
                                <i className="fa-solid fa-robot"></i>
                            </div>
                        </div>
                        {loading && (
                            <div className="loadingWrapper">
                                <div className="userProfile loading">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="inputBarContainer">
                <div className="inputBarBox">
                    <input placeholder='Digite Algo' type="text" />
                    <div className='waveformIcon'>
                        <img src="src/assets/waveform.svg" alt="" />
                    </div>
                </div>
                <div className="microphoneButton">
                    <i className="fa-solid fa-microphone"></i>
                </div>
            </div>

        </div>
    )
}

export default Chat