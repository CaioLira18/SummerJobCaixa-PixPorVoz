import React from 'react'

export const PixConfigurationLoading = () => {
  return (
    <div className="pix-container">
      {/* Microphone Icon with Pulse Effect */}
      <div className="microphone-wrapper">
        {/* Outer pulse ring */}
        <div className="pulse-ring"></div>
        
        {/* Inner circle */}
        <div className="microphone-circle">
          {/* Microphone Icon */}
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="microphone-icon"
          >
            <path 
              d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14Z" 
              fill="currentColor"
            />
            <path 
              d="M17 11C17 13.76 14.76 16 12 16C9.24 16 7 13.76 7 11H5C5 14.53 7.61 17.43 11 17.92V21H13V17.92C16.39 17.43 19 14.53 19 11H17Z" 
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h1 className="pix-title">PIX POR VOZ</h1>

      {/* Subtitle */}
      <p className="pix-subtitle">
        Agora você transfere falando os dados. Vamos configurar?
      </p>

      {/* Configure Button */}
      <button className="pix-button">CONFIGURAR</button>
    </div>
  )
}

export default PixConfigurationLoading