import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ContactPage = () => {
  const [cpf, setCpf] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Função para buscar usuário pelo CPF
  const handleSearch = async () => {
    if (!cpf) {
      setMessage('Por favor, digite um CPF.');
      return;
    }

    setLoading(true);
    setMessage('');
    setFoundUser(null);

    try {
      // endpoint que deve ser implementado no backend
      const response = await fetch(`http://localhost:8080/api/users/search/${cpf}`);

      if (response.ok) {
        const data = await response.json();
        setFoundUser(data);
      } else {
        setMessage('Usuário não encontrado.');
      }
    } catch (error) {
      setMessage('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Função para adicionar o ID do contato à lista do usuário logado
  const handleAddContact = async () => {
    const storedUser = JSON.parse(localStorage.getItem('user'));

    // Evitar duplicados no front-end
    const currentContactIds = storedUser.contactIds || [];
    if (currentContactIds.includes(foundUser.id)) {
      alert("Este contato já está na sua lista.");
      return;
    }

    // Criar o payload para o PUT (UserDTO corrigido)
    const updatedData = {
      ...storedUser,
      contactIds: [...currentContactIds, foundUser.id]
    };

    try {
      const response = await fetch(`http://localhost:8080/api/users/${storedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        // Atualiza o localstorage para manter os dados sincronizados
        localStorage.setItem('user', JSON.stringify(updatedData));
        alert('Contato adicionado com sucesso!');
        navigate(-1); // Volta para a tela anterior
      } else {
        alert('Erro ao atualizar lista de contatos.');
      }
    } catch (error) {
      alert('Erro na requisição.');
    }
  };

  return (
    <div className="homeContainer">
      {/* Header da página de busca */}
      <div className="homeServicosHeader">
        <span>Adicionar Contato</span>
        <span className='showAll' onClick={() => navigate(-1)}>Voltar</span>
      </div>

      {/* Container de Input - Reutilizando estilo do Amount.css */}
      <div className="homeAmountContainer contactSearchContainer">
        <div className="searchBox">
          <label>Informe o CPF do favorecido</label>
          <input
            className="searchInput"
            type="text"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="000.000.000-00"
          />
          <button
            className="btnSearch"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? 'Buscando...' : 'Pesquisar'}
          </button>
        </div>
        {message && <p className="errorMessage">{message}</p>}
      </div>

      {/* Resultado da Busca - Reutilizando estilo do Home.css */}
      {foundUser && (
        <div className="resultContainer homeOptionsContainer">
          <div className="contactResultCard">
            <div className="userInfo">
              <div className="iconCircle">
                <i className="fa-solid fa-user"></i>
              </div>
              <div className="details">
                <span className="userName">{foundUser.name}</span>
                <span className="userCpf">CPF: {foundUser.cpf}</span>
              </div>
            </div>
            <button className="btnAddContact" onClick={handleAddContact}>
              <i className="fa-solid fa-user-plus"></i>
            </button>
          </div>
          <div className="sucessMessage">
            <span>Contato encontrado com sucesso!</span>
          </div>
        </div>
      )}
    </div>
  );
};