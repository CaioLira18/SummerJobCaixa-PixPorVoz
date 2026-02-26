import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PixConfirmado = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Depois de alguns segundos a tela de confirmação deve dar lugar ao comprovante
  useEffect(() => {
    const timer = setTimeout(() => {
      // encaminha o estado recebido (valor/destinatário) para o comprovante
      navigate("/pixComprovante", { state: location.state });
    }, 4500);

    return () => clearTimeout(timer);
  }, [navigate, location.state]);

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