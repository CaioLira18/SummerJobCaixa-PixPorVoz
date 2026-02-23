import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ContactPage = () => {
  const [cpf, setCpf] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [contactObjects, setContactObjects] = useState([]);
  const navigate = useNavigate();

  const loadContacts = async (user) => {
    if (!user?.contactIds || user.contactIds.length === 0) {
      setContactObjects([]);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/users/list-by-ids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user.contactIds)
      });

      if (response.ok) {
        const details = await response.json();
        setContactObjects(details);
      }
    } catch (error) {
      console.error("Erro ao carregar favoritos", error);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    loadContacts(storedUser);
  }, []);

  const handleSearch = async () => {
    if (!cpf) {
      setMessage('Por favor, digite um CPF.');
      return;
    }

    const cleanCpf = cpf.replace(/\D/g, '');
    setLoading(true);
    setMessage('');
    setFoundUser(null);

    try {
      const response = await fetch(`http://localhost:8080/api/users/search/${cleanCpf}`);
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

    if (!storedUser) return;

    if (foundUser.id === storedUser.id) {
      alert("Não pode adicionar-se a si mesmo.");
      return;
    }

    const currentContactIds = storedUser.contactIds || [];

    if (currentContactIds.includes(foundUser.id)) {
      alert("Este contacto já está nos favoritos.");
      return;
    }

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
        const userFromServer = await response.json();

        // 🔥 garante que o localStorage tenha contactIds atualizado
        const updatedUser = {
          ...userFromServer,
          contactIds: updatedData.contactIds
        };

        localStorage.setItem('user', JSON.stringify(updatedUser));

        // 🔥 recarrega a lista completa do backend
        await loadContacts(updatedUser);

        setFoundUser(null);
        setCpf('');
        alert('Contacto adicionado com sucesso!');
      }
    } catch (error) {
      alert('Erro ao guardar contacto.');
    }
  };

  return (
    <div className="homeContainer">
      <div className="homeServicosHeader">
        <span>Favoritos</span>
        <span className='showAll' onClick={() => navigate(-1)}>Voltar</span>
      </div>

      <div className="homeAmountContainer contactSearchContainer">
        <div className="searchBox">
          <label>Adicionar novo contacto por CPF</label>
          <input
            className="searchInput"
            type="text"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="000.000.000-00"
          />
          <button className="btnSearch" onClick={handleSearch} disabled={loading}>
            {loading ? 'A procurar...' : 'Pesquisar'}
          </button>
        </div>
        {message && <p className="errorMessage">{message}</p>}
      </div>

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

      <div className="listContacts" style={{ padding: '16px' }}>
        <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#00599A' }}>
          Os Seus Favoritos
        </span>

        <div className="contactsGrid" style={{ marginTop: '12px' }}>
          {contactObjects.length === 0 ? (
            <p className="noContactsMessage">Nenhum favorito encontrado</p>
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