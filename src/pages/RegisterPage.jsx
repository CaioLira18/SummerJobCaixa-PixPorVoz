import React, { useState } from "react";
import axios from "axios";

const RegisterPage = () => {
  const API_URL = "http://localhost:8080/api";
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClickRegister = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(`${API_URL}/users`, {
        name: nome,
        email: email,
        cpf: cpf,
        password: password,
        saldo: "0.00" // Saldo inicial padrão
      });

      if (response.data) {
        setSuccess("Conta criada com sucesso! Redirecionando...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    } catch (error) {
      console.error("Erro no registro:", error);
      setError(error.response?.data?.message || "Erro ao criar conta. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  const background = "https://res.cloudinary.com/dbtv7m6v0/image/upload/v1727791444/fundo-caixa_t9vcl6.jpg";

  return (
    <div className="login-container" style={{ backgroundImage: `url(${background})` }}>
      <div className="overlay"></div>

      <div className="top-content">
        <img
          src="https://res.cloudinary.com/dbtv7m6v0/image/upload/v1727791404/logo-caixa_vdfp8p.png"
          alt="Logo Caixa"
          className="logo"
        />
      </div>

      <div className="login-card">
        <h2 className="card-title">Crie sua conta</h2>

        <div className="input-group">
          <label>Nome Completo</label>
          <input 
            type="text" 
            placeholder="Digite seu nome" 
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>E-mail</label>
          <input 
            type="email" 
            placeholder="seu@email.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>CPF</label>
          <input 
            type="text" 
            placeholder="000.000.000-00" 
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Senha</label>
          <div className="password-wrapper">
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="Crie uma senha"
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

        <button className="login-button" onClick={handleClickRegister} disabled={loading}>
          {loading ? "Processando..." : "CADASTRAR"}
        </button>

        <button className="link-button" onClick={() => window.location.href = "/login"}>
          Já tenho uma conta? Fazer Login
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;