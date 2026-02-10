import React from 'react';

export const LoadingPage = () => {
  return (
    <div className="loading-screen-container">
      <div className="loading-content">
        {/* Spinner estilizado com as cores da marca */}
        <div className="pix-spinner"></div>
        
        <div className="loading-text-group">
          <h2>Processando seu Pix</h2>
          <p>Aguarde um instante, estamos validando os dados da transação...</p>
        </div>
      </div>
      
      <div className="loading-footer">
        <p>Conexão segura via Pix Voice</p>
      </div>
    </div>
  );
};

export default LoadingPage;