import axios from "axios";
import React, { useState } from "react";

const AuthPage = () => {
  const API_URL = "https://summerjobcaixa-pixporvoz-production.up.railway.app/api";

  {/**
    Estados para controle de fluxo, mensagens e campos do formulário
    */}
  const [isLogin, setIsLogin] = useState(true); // Controla se estamos no modo Login ou Registro
  const [loading, setLoading] = useState(false); // Controla o estado de carregamento durante a requisição
  const [error, setError] = useState(""); // Armazena mensagens de erro para exibir ao usuário
  const [success, setSuccess] = useState(""); // Armazena mensagens de sucesso para exibir ao usuário
  const [mostrarSenha, setMostrarSenha] = useState(false); // Controla a visibilidade da senha
  const [biometria, setBiometria] = useState(true); // Controla o estado da opção de biometria (ativo/inativo)

  {/**
  * Campos de Formulário
    */}
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");

  const handleAuth = async () => {
    setLoading(true); // Inicia o estado de carregamento
    setError(""); // Limpa mensagens de erro anteriores
    setSuccess(""); // Limpa mensagens de sucesso anteriores

    const endpoint = isLogin ? "/auth/login" : "/users"; // Define o endpoint com base no modo (Login ou Registro)

    {/**
      se for login, o payload contém apenas email e senha. 
      Se for registro, inclui nome, email, cpf, senha e saldo inicial.
      */}
    const payload = isLogin
      ? { email, password }
      : {
        name: name,
        email: email,
        cpf: cpf,
        password: password,
        saldo: 1000 // Saldo inicial para novos usuários
      };

    try {
      const response = await axios.post(`${API_URL}${endpoint}`, payload); // Faz a requisição para o endpoint correto com o payload adequado

      {/**
        trata a resposta da API. Se for login, armazena os dados do usuário no localStorage e exibe uma mensagem de sucesso.
        Se for registro, exibe uma mensagem de sucesso e, após um breve atraso, 
        muda para o modo de login para que o usuário possa acessar sua nova conta.
        */}
      if (response.data) {
        if (isLogin) {
          localStorage.setItem("user", JSON.stringify(response.data)); // Armazena os dados do usuário no localStorage para manter a sessão
          setSuccess("Login realizado!"); // Exibe mensagem de sucesso
          setTimeout(() => window.location.href = "/", 1000); // Redireciona para a página principal após um breve atraso
        } else {
          setSuccess("Conta criada com sucesso!"); // Exibe mensagem de sucesso para registro
          setTimeout(() => { // Após um breve atraso, muda para o modo de login para que o usuário possa acessar sua nova conta
            setIsLogin(true); // Muda para o modo de login
            setSuccess(""); // Limpa a mensagem de sucesso para evitar confusão
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Erro detalhado:", error.response?.data); // Log detalhado do erro para facilitar a depuração
      setError(error.response?.data?.message || "Erro ao registrar. Verifique os dados."); // Exibe a mensagem de erro retornada pela API ou uma mensagem genérica
    } finally {
      setLoading(false);
    }
  };

  const background = "https://res.cloudinary.com/dthgw4q5d/image/upload/v1771106356/mulher_nvzqry.png"; // Imagem de fundo para a página de autenticação

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

        {/**
         * Exibe mensagens de erro ou sucesso com estilos distintos para cada tipo de mensagem.
         */}
        {error && <p className="message error">{error}</p>}
        {success && <p className="message success">{success}</p>}

        {/**
         * Botão de Login/Cadastro que chama a função handleAuth ao ser clicado. 
         * O texto do botão muda dinamicamente com base no modo atual (Login ou Registro) e 
         * é desabilitado durante o processo de autenticação para evitar múltiplos cliques.
         */}
        <button className="login-button" onClick={handleAuth} disabled={loading}>
          {loading ? "Processando..." : isLogin ? "LOGIN" : "CADASTRAR"}
        </button>

          {/**
           * Opção de biometria que só é exibida no modo de Login. 
           * O estado da biometria é controlado por um toggle que altera a classe CSS para indicar se está ativo ou não.
           */}
        {isLogin && (
          <div className="biometria">
            <span>Acessar com biometria</span>
            <div className={`toggle ${biometria ? "active" : ""}`} onClick={() => setBiometria(!biometria)}>
              <div className="circle"></div>
            </div>
          </div>
        )}

        {/**
         * Link para alternar entre os modos de Login e Registro. 
         * Ao clicar, ele limpa as mensagens de erro e 
         * sucesso para evitar confusão ao mudar de modo.
         */}
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