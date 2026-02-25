import React from "react";
import { useNavigate } from "react-router-dom";

const PixConcluido = () => {
  const navigate = useNavigate();

  return (
    <div className="pixRealizadoContainer">
      
      <div className="pixHeader">
        <button className="iconBtn" onClick={() => navigate("/")}>✕</button>
        <div className="pixTitle">
          <small>CAIXA ASSISTENTE</small>
          <h3>Pix Realizado</h3>
        </div>
        <button className="iconBtn"><i class="fa-solid fa-gear"></i></button>
      </div>

      <div className="pixCheckArea">
        <div className="checkCircle">
          ✓
        </div>
      </div>

      <div className="pixButtons">
        <button className="btnDark">
          🔗 Compartilhar comprovante
        </button>

        <button 
          className="btnLight"
          onClick={() => navigate("/start")}
        >
          Novo Pix por voz
        </button>
      </div>

    </div>
  );
};

export default PixConcluido;