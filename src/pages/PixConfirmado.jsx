import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PixConfirmado = () => {
  const navigate = useNavigate();

  // Volta automaticamente para o chat após alguns segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/chat");
    }, 4500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="pixSuccessContainer">
      <div className="pixSuccessCircle">
        <i className="fa-solid fa-check"></i>
      </div>

      <h1>CONFIRMADO!</h1>
      <p>Transação concluída</p>
    </div>
  );
};

export default PixConfirmado;