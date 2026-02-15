import axios from "axios";
import React, { useState } from "react";

const AuthPage = () => {
  const API_URL = "http://localhost:8080/api";

  // Estados de Controle
  const [isLogin, setIsLogin] = useState(true); // Alterna entre Login e Registro
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [biometria, setBiometria] = useState(true);

  // Estados dos Campos
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");

  const handleAuth = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    const endpoint = isLogin ? "/auth/login" : "/users";

    // Certifique-se que o saldo aqui é enviado como número ou compatível com o DTO
    const payload = isLogin
      ? { email, password }
      : {
        name: name,      // Verifique se no DTO não é 'nome'
        email: email,
        cpf: cpf,
        password: password,
        saldo: 1000      // Enviando como número
      };

    try {
      // Adicione /api se não estiver no Proxy do Vite/React
      const response = await axios.post(`${API_URL}${endpoint}`, payload);

      if (response.data) {
        if (isLogin) {
          localStorage.setItem("user", JSON.stringify(response.data));
          setSuccess("Login realizado!");
          setTimeout(() => window.location.href = "/", 1000);
        } else {
          setSuccess("Conta criada com sucesso!");
          // Pequeno delay para o usuário ler a mensagem antes de trocar para o login
          setTimeout(() => {
            setIsLogin(true);
            setSuccess("");
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Erro detalhado:", error.response?.data);
      setError(error.response?.data?.message || "Erro ao registrar. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  const background = "https://res.cloudinary.com/dthgw4q5d/image/upload/v1771106356/mulher_nvzqry.png";

  return (
    <div className="login-container" style={{ backgroundImage: `url(${background})` }}>
      <div className="overlay"></div>

      <div className="top-content">
        <img
          className="logo"
          src="https://res.cloudinary.com/dthgw4q5d/image/upload/v1771106593/Caixa_Econ%C3%B4mica_Federal_logo.svg_y6z4gs.png"
          alt="Logo Caixa"
        />
      </div>

      <div className="login-card">
        <h2 className="card-title">
          {isLogin ? "Acesse sua conta" : "Crie sua conta"}
        </h2>

        {/* Campos exclusivos de Registro */}
        {!isLogin && (
          <>
            <div className="input-group">
              <label>Nome Completo</label>
              <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Seu nome" />
            </div>
            <div className="input-group">
              <label>CPF</label>
              <input value={cpf} onChange={(e) => setCpf(e.target.value)} type="text" placeholder="000.000.000-00" />
            </div>
          </>
        )}

        {/* Campos Comuns */}
        <div className="input-group">
          <label>{isLogin ? "CPF ou Email" : "E-mail"}</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="text" placeholder="Digite aqui" />
        </div>

        <div className="input-group">
          <label>Senha</label>
          <div className="password-wrapper">
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="toggle-password" onClick={() => setMostrarSenha(!mostrarSenha)}>
              {mostrarSenha ? "Ocultar" : "Mostrar"}
            </span>
          </div>
        </div>

        {error && <p className="message error">{error}</p>}
        {success && <p className="message success">{success}</p>}

        <button className="login-button" onClick={handleAuth} disabled={loading}>
          {loading ? "Processando..." : isLogin ? "LOGIN" : "CADASTRAR"}
        </button>

        {isLogin && (
          <div className="biometria">
            <span>Acessar com biometria</span>
            <div className={`toggle ${biometria ? "active" : ""}`} onClick={() => setBiometria(!biometria)}>
              <div className="circle"></div>
            </div>
          </div>
        )}

        <button className="link-button" onClick={() => {
          setIsLogin(!isLogin);
          setError("");
          setSuccess("");
        }}>
          {isLogin ? "Não tem conta? Registre-se" : "Já tem conta? Faça Login"}
        </button>

      </div>
    </div>
  );
};

export default AuthPage;