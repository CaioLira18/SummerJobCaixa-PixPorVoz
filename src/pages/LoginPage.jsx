import React, { useState } from "react";

const LoginPage = () => {
  const [biometria, setBiometria] = useState(true);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const background =
    "https://res.cloudinary.com/dthgw4q5d/image/upload/v1771106356/mulher_nvzqry.png";

  return (
    <div
      className="login-container"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="overlay"></div>

      {/* Parte superior */}
      <div className="top-content">
        <img
          className="logo"
          src="https://res.cloudinary.com/dthgw4q5d/image/upload/v1771106593/Caixa_Econ%C3%B4mica_Federal_logo.svg_y6z4gs.png"
          alt="Logo Caixa"
        />
      </div>

      {/* Card inferior */}
      <div className="login-card">

        <h2 className="card-title">
          Acesse sua conta
        </h2>

        {/* INPUT USUÁRIO */}
        <div className="input-group">
          <label>CPF ou Email</label>
          <input type="text" placeholder="Digite seu CPF ou email" />
        </div>

        {/* INPUT SENHA */}
        <div className="input-group">
          <label>Senha</label>
          <div className="password-wrapper">
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="Digite sua senha"
            />
            <span
              className="toggle-password"
              onClick={() => setMostrarSenha(!mostrarSenha)}
            >
              {mostrarSenha ? "Ocultar" : "Mostrar"}
            </span>
          </div>
        </div>

        {/* BOTÃO ENTRAR */}
        <button className="login-button">
          Entrar
        </button>

        {/* Biometria */}
        <div className="biometria">
          <span>Acessar com biometria</span>
          <div
            className={`toggle ${biometria ? "active" : ""}`}
            onClick={() => setBiometria(!biometria)}
          >
            <div className="circle"></div>
          </div>
        </div>

        <button className="link-button">
          Esqueci minha senha
        </button>

      </div>
    </div>
  );
};

export default LoginPage;
