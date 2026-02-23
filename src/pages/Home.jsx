import React, { useEffect, useState } from 'react'
import { Amount } from '../components/Amount'
import { Link, useNavigate } from 'react-router-dom'

export const Home = ({ isVisible }) => {

  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado para controlar se o usuário está autenticado ou não
  const [isAdmin, setIsAdmin] = useState(false); // Estado para controlar se o usuário é admin ou não (pode ser usado para mostrar opções adicionais no futuro)
  const [name, setName] = useState(''); // Estado para armazenar o nome do usuário, que pode ser exibido na interface para uma experiência mais personalizada

  {/**
  Hook do React Router para navegação programática, permitindo redirecionar o usuário
  para outras páginas com base em ações ou condições específicas
  */}
  const navigate = useNavigate();

  {/**
    useEffect para verificar se há um usuário armazenado no localStorage quando o componente é montado.
    Se um usuário for encontrado, ele é parseado e o estado de autenticação é atualizado para refletir que o usuário está logado.
    O nome do usuário também é extraído e armazenado no estado para uso futuro na interface.
    */}
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser); // Tenta parsear os dados do usuário armazenados no localStorage
        setIsAuthenticated(true); // Atualiza o estado para indicar que o usuário está autenticado
        setName(parsedUser.name || ''); // Armazena o nome do usuário no estado para uso futuro na interface
      } catch (err) {
        console.error("Erro ao processar usuário do localStorage", err); // Log detalhado do erro para facilitar a depuração caso o JSON esteja corrompido ou mal formatado
      }
    }
  }, []);


  return (
    <div className="homeContainer">
      <div className="homeBox">
        <div className="homeAmountContainer">
          <Amount isVisible={isVisible} /> {/* Componente para exibir o saldo do usuário, recebe a prop isVisible para controlar a visibilidade do valor */}
        </div>

        {/**
         * Opções principais da home, como pagar emprestado, pagar conta e fazer Pix.
         */}
        <div className="homeOptionsContainer">
          <div className="homeOptionsBox disabeled">
            <i className="fa-solid fa-suitcase"></i>
            <span>Pagar emprestado</span>
          </div>
          <div className="homeOptionsBox disabeled">
            <i className="fa-solid fa-barcode"></i>
            <span>Pagar conta</span>
          </div>

          <Link to="/areaPix" className="homeOptionsBox">
            <i className="fa-brands fa-pix"></i>
            <span>Fazer Pix</span>
          </Link>
        </div>

        <div className="homeOptionsContainer">
          <Link to={'/chat'}>
            <button className="pix-por-voz">
              <div className="voz-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="white" strokeWidth="2" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" strokeWidth="2" />
                  <line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="2" />
                </svg>
              </div>
              <div className="voz-text">
                <h3>Pix por Voz</h3>
                <p>Faça transferências usando sua voz</p>
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" />
              </svg>
            </button>
          </Link>
        </div>

        <div className="homeServicosHeader">
          <span>Serviços</span>
          <span className='showAll'>Mostrar Todos</span>
        </div>

        <div className="homeServicosGrid">
          <div className="homeServicoCard disabeled">
            <div className="iconCircle"><i className="fa-solid fa-house-user"></i></div>
            <span>Minha conta</span>
          </div>
          <div className="homeServicoCard disabeled">
            <div className="iconCircle"><i className="fa-solid fa-chart-line"></i></div>
            <span>Investimentos</span>
          </div>
          <div className="homeServicoCard disabeled">
            <div className="iconCircle"><i className="fa-solid fa-house"></i></div>
            <span>Habitação</span>
          </div>
          <div className="homeServicoCard disabeled">
            <div className="iconCircle"><i className="fa-solid fa-credit-card"></i></div>
            <span>Cartão de crédito</span>
          </div>
          <div className="homeServicoCard disabeled">
            <div className="iconCircle"><i className="fa-solid fa-dollar-sign"></i></div>
            <span>Empréstimos</span>
          </div>
          <Link to="/contacts">
            <div className="homeServicoCard">
              <div className="iconCircle"><i class="fa-solid fa-star"></i></div>
              <span>Seus Favoritos</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home;