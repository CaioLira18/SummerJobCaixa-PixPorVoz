import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/PixComprovante.css";

const PixComprovante = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // attempt to read transaction info from navigation state
  const {
    valor,
    destinatario,
    cpf,
    instituicao,
    transactionId,
    authCode,
    date,
  } = location.state || {};

  const formatDateTime = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    const datePart = d.toLocaleDateString('pt-BR');
    const timePart = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${datePart} - ${timePart}`;
  };

  const receipt = {
    amount: valor ? `R$ ${valor}` : "R$ 0,00",
    dateTime: formatDateTime(date),
    recipient: destinatario || "--",
    cpf: cpf || "***.***.***-**",
    instituicao: instituicao || "--",
    transactionId: transactionId || "--",
    authCode: authCode || "--",
  };

  return (
    <div className="comprovanteWrapper">
      <div className="comprovanteContainer">
      <div className="comprovanteHeader">
        <button className="iconBtn" onClick={() => navigate("/")}>✕</button>
        <div className="comprovanteTitle">
          <small>CAIXA ASSISTENTE</small>
          <h3>Comprovante PIX</h3>
        </div>
        <button className="iconBtn">
          <i className="fa-solid fa-gear"></i>
        </button>
      </div>

      <div className="receiptCard">
        <div className="field">
          <span className="label">Valor</span>
          <span className="value">{receipt.amount}</span>
        </div>
        <div className="field">
          <span className="label">Data</span>
          <span className="value">{receipt.dateTime}</span>
        </div>
        <div className="field">
          <span className="label">Para</span>
          <span className="value">{receipt.recipient}</span>
        </div>
        <div className="field">
          <span className="label">CPF</span>
          <span className="value">{receipt.cpf}</span>
        </div>
        <div className="field">
          <span className="label">Instituição</span>
          <span className="value">{receipt.instituicao}</span>
        </div>
        <div className="field">
          <span className="label">ID da transação</span>
          <span className="value">{receipt.transactionId}</span>
        </div>
        <div className="field">
          <span className="label">Autenticação</span>
          <span className="value">{receipt.authCode}</span>
        </div>
      </div>

      <div className="comprovanteButtons">
        <button className="btnDark">🔗 Compartilhar comprovante</button>
        <button
          className="btnLight"
          onClick={() => navigate("/start")}
        >
          Novo Pix por voz
        </button>
      </div>
    </div>
    </div>
  );
};

export default PixComprovante;