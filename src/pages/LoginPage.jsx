import axios from "axios";
import React, { useState } from "react";

const LoginPage = () => {
  const API_URL = "http://localhost:8080/api"
  const [biometria, setBiometria] = useState(true);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClickLogin = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    console.log("Iniciando tentativa de login para:", email); // DEBUG

    try {
      // Importante: verifique se 'axios' está importado no topo do arquivo
      const response = await axios.post(
        `${API_URL}/auth/login`,
        { email, password },
      );

      console.log("Resposta do servidor:", response.data); // DEBUG

      if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
        setSuccess("Login realizado com sucesso!");
        // setIsAuthenticated(true); // Garanta que esta função exista no seu contexto
      }
    } catch (error) {
      // LOG DETALHADO NO CONSOLE
      console.error("ERRO COMPLETO:", error);

      if (error.response) {
        // O servidor respondeu com um status fora de 2xx
        console.error("Dados do erro:", error.response.data);
        console.error("Status do erro:", error.response.status);
        setError(error.response.data || "Credenciais inválidas");
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta (CORS ou Servidor Offline)
        console.error("Nenhuma resposta recebida. Verifique o CORS e se o backend está rodando na porta 8080.");
        setError("Erro de conexão: O servidor não respondeu.");
      } else {
        setError("Erro na configuração da requisição.");
      }
    } finally {
      setLoading(false);
    }
  };

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
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="text" placeholder="Digite seu CPF ou email" />
        </div>

        {/* INPUT SENHA */}
        <div className="input-group">
          <label>Senha</label>
          <div className="password-wrapper">
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="toggle-password"
              onClick={() => setMostrarSenha(!mostrarSenha)}
            >
              {mostrarSenha ? "Ocultar" : "Mostrar"}
            </span>
          </div>
        </div>

        {error && <p className="message error">{error}</p>}
        {success && <p className="message success">{success}</p>}

        {/* BOTÃO ENTRAR */}
        <button className="login-button" onClick={handleClickLogin} disabled={loading}>
          {loading ? "Carregando..." : "LOGIN"}
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
