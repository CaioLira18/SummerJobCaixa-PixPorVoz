import React from 'react'

export const Chat = () => {

    const rightPosition = true;
    const loading = true;

    return (
        <div>
            <div className="containerChat">
                <div className="containerBox">
                    <div className="messageBox">
                        <div className="userProfile">
                            <i class="fa-solid fa-user"></i>
                        </div>
                        <div className="messageContent">
                            <div className="messageText">Hello, how can I help you today?</div>
                            <div className="messageTime">10:30 AM</div>
                        </div>
                    </div>
                </div>
                {rightPosition && (
                    <div className="containerBox">
                        <div className="messageBox">
                            <div className="messageContent">
                                <div className="messageText">Hello, how can I help you today?</div>
                                <div className="messageTime">10:30 AM</div>
                            </div>
                            <div className="userProfile">
                                <i class="fa-solid fa-robot"></i>
                            </div>
                        </div>
                        {loading && (
                            <div className="userProfile loading">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

    )
}

export default Chat
