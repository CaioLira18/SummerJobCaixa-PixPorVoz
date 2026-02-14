import React from "react";
import { useNavigate } from "react-router-dom";

const WelcomePage = () => {
  const navigate = useNavigate();

  const background =
    "https://res.cloudinary.com/dthgw4q5d/image/upload/v1771106356/mulher_nvzqry.png";

  return (
    <div
      className="welcome-container"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="content">

        <div className="logo">
          <img
            src="https://res.cloudinary.com/dthgw4q5d/image/upload/v1771106593/Caixa_Econ%C3%B4mica_Federal_logo.svg_y6z4gs.png"
            alt="Caixa Logo"
          />
        </div>

        <h2 className="welcome-text">
          Que bom ter você aqui!
        </h2>

        <div className="buttons">
          <button
            className="card-button"
            onClick={() => navigate("/login")}
          >
            Entrar
          </button>

          <button className="card-button">
            Abrir nova conta
          </button>
        </div>

        <button className="outline-button">
          Cadastrar usuário
        </button>

        <button className="link-button">
          Serviços para você
        </button>

        <div className="version">
          Versão 5.22.1 - P
        </div>

      </div>
    </div>
  );
};

export default WelcomePage;
