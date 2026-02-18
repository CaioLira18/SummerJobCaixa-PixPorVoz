import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ContactPage = () => {
  const [cpf, setCpf] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [contactObjects, setContactObjects] = useState([]); // Armazena os usuários completos
  const navigate = useNavigate();

  // 1. Carrega os dados detalhados dos contatos ao iniciar
  useEffect(() => {
    const loadContacts = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.contactIds && storedUser.contactIds.length > 0) {
        try {
          // Fazemos um Promise.all para buscar os dados de cada ID na lista
          const details = await Promise.all(
            storedUser.contactIds.map(id =>
              fetch(`http://localhost:8080/api/users/${id}`).then(res => res.json())
            )
          );
          setContactObjects(details);
        } catch (error) {
          console.error("Erro ao carregar detalhes dos contatos", error);
        }
      }
    };
    loadContacts();
  }, []);

  const handleSearch = async () => {
    if (!cpf) {
      setMessage('Por favor, digite um CPF.');
      return;
    }
    setLoading(true);
    setMessage('');
    setFoundUser(null);

    try {
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

  const handleAddContact = async () => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const currentContactIds = storedUser.contactIds || [];

    if (currentContactIds.includes(foundUser.id)) {
      alert("Este contato já está na sua lista.");
      return;
    }

    const updatedContactIds = [...currentContactIds, foundUser.id];
    const updatedData = { ...storedUser, contactIds: updatedContactIds };

    try {
      const response = await fetch(`http://localhost:8080/api/users/${storedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(updatedData));
        // Adiciona o objeto completo ao estado para atualizar a lista na tela na hora
        setContactObjects([...contactObjects, foundUser]);
        setFoundUser(null);
        setCpf('');
        alert('Contato adicionado!');
      }
    } catch (error) {
      alert('Erro na requisição.');
    }
  };

  return (
    <div className="homeContainer">
      <div className="homeServicosHeader">
        <span>Contatos</span>
        <span className='showAll' onClick={() => navigate(-1)}>Voltar</span>
      </div>

      <div className="homeAmountContainer contactSearchContainer">
        <div className="searchBox">
          <label>Adicionar novo contato por CPF</label>
          <input
            className="searchInput"
            type="text"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="000.000.000-00"
          />
          <button className="btnSearch" onClick={handleSearch} disabled={loading}>
            {loading ? 'Buscando...' : 'Pesquisar'}
          </button>
        </div>
        {message && <p className="errorMessage">{message}</p>}
      </div>

      {/* Resultado da Busca */}
      {foundUser && (
        <div className="resultContainer homeOptionsContainer">
          <div className="contactResultCard">
            <div className="userInfo">
              <div className="iconCircle"><i className="fa-solid fa-user"></i></div>
              <div className="details">
                <span className="userName">{foundUser.name}</span>
                <span className="userCpf">{foundUser.cpf}</span>
              </div>
            </div>
            <button className="btnAddContact" onClick={handleAddContact}>
              <i className="fa-solid fa-user-plus"></i>
            </button>
          </div>
        </div>
      )}

      {/* Lista de Contatos Salvos */}
      <div className="listContacts" style={{ padding: '16px' }}>
        <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#00599A' }}>Seus Contatos</span>
        <div className="contactsGrid" style={{ marginTop: '12px' }}>
          {contactObjects.length === 0 ? (
            <p className="noContactsMessage">Nenhum contato na lista.</p>
          ) : (
            contactObjects.map((contact) => (
              <div key={contact.id} className="contactCard">
                <div className="userInfo">
                  <div className="iconCircle"><i className="fa-solid fa-user"></i></div>
                  <div className="details">
                    <span className="userName">{contact.name}</span>
                    <span className="userCpf">{contact.cpf}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};