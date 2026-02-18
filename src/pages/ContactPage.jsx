import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ContactPage = () => {
  const [cpf, setCpf] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [contactObjects, setContactObjects] = useState([]); // Armazena os usuários completos
  const navigate = useNavigate();

  {/**
    useEffect para carregar os detalhes dos contatos salvos no localStorage quando o componente é montado.
    Ele verifica se o usuário armazenado tem uma lista de contactIds e, se tiver, faz requisições para obter os detalhes completos de cada contato.
    Os detalhes dos contatos são então armazenados no estado contactObjects para serem exibidos na interface.
    */}
  useEffect(() => {
    const loadContacts = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user')); // Obtém o usuário armazenado no localStorage e parseia para um objeto JavaScript
      if (storedUser && storedUser.contactIds && storedUser.contactIds.length > 0) { // Verifica se o usuário tem uma lista de contactIds
        try {
          const details = await Promise.all(
            storedUser.contactIds.map(id =>
              fetch(`http://localhost:8080/api/users/${id}`).then(res => res.json()) // Para cada contactId, faz uma requisição para obter os detalhes completos do contato e parseia a resposta como JSON
            )
          );
          setContactObjects(details); // Armazena os detalhes completos dos contatos no estado contactObjects para serem exibidos na interface
        } catch (error) {
          console.error("Erro ao carregar detalhes dos contatos", error); // Log detalhado do erro para facilitar a depuração caso haja problemas na requisição ou no processamento dos dados dos contatos
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
        method: 'PUT', // Requisição PUT para atualizar os dados do usuário com a nova lista de contactIds
        headers: { 'Content-Type': 'application/json' }, // Define o cabeçalho para indicar que o corpo da requisição é JSON
        body: JSON.stringify(updatedData) // Converte os dados atualizados do usuário para uma string JSON para enviar no corpo da requisição
      });

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(updatedData)); // Atualiza os dados do usuário no localStorage com a nova lista de contactIds
        setContactObjects([...contactObjects, foundUser]); // Adiciona o contato encontrado à lista de contatos exibida na interface
        setFoundUser(null); // Limpa o contato encontrado para esconder a seção de resultado da busca
        setCpf(''); // Limpa o campo de CPF para facilitar a adição de novos contatos
        alert('Contato adicionado!'); // Exibe uma mensagem de sucesso para o usuário após adicionar o contato com sucesso
      }
    } catch (error) {
      alert('Erro na requisição.'); // Exibe uma mensagem de erro caso haja problemas na requisição para adicionar o contato
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
          {/**
           * Campo de input para digitar o CPF do contato que se deseja adicionar.
           */}
          <input
            className="searchInput"
            type="text"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="000.000.000-00"
          />
          {/**
           * Botão de pesquisa que chama a função handleSearch ao ser clicado.
           */}
          <button className="btnSearch" onClick={handleSearch} disabled={loading}>
            {loading ? 'Buscando...' : 'Pesquisar'}
          </button>
        </div>
        {message && <p className="errorMessage">{message}</p>}
      </div>

      {/**
       * Se um usuário for encontrado na busca, exibe um cartão com as informações do usuário e um botão para adicionar como contato.
       */}
      {foundUser && (
        <div className="resultContainer homeOptionsContainer">
          <div className="contactResultCard">
            <div className="userInfo">
              <div className="iconCircle"><i className="fa-solid fa-user"></i></div>
              <div className="details">
                <span className="userName">{foundUser.name}</span> {/* Exibe o nome do usuário encontrado na busca */}
                <span className="userCpf">{foundUser.cpf}</span> {/* Exibe o CPF do usuário encontrado na busca */}
              </div>
            </div>
            <button className="btnAddContact" onClick={handleAddContact}> {/* Botão para adicionar o usuário encontrado como contato, chama a função handleAddContact ao ser clicado */}
              <i className="fa-solid fa-user-plus"></i>
            </button>
          </div>
        </div>
      )}

      {/* Lista de Contatos Salvos */}
      <div className="listContacts" style={{ padding: '16px' }}>
        <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#00599A' }}>Seus Contatos</span>
        <div className="contactsGrid" style={{ marginTop: '12px' }}>
          {contactObjects.length === 0 ? ( // Verifica se a lista de contatos está vazia e exibe uma mensagem apropriada
            <p className="noContactsMessage">Nenhum contato na lista.</p>
          ) : (
            contactObjects.map((contact) => ( // Mapeia a lista de objetos de contato para exibir um cartão para cada contato com suas informações
              <div key={contact.id} className="contactCard">
                <div className="userInfo">
                  <div className="iconCircle"><i className="fa-solid fa-user"></i></div>
                  <div className="details">
                    <span className="userName">{contact.name}</span> {/* Exibe o nome do contato no cartão */}
                    <span className="userCpf">{contact.cpf}</span> {/* Exibe o CPF do contato no cartão */}
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