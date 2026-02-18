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
          <div className="homeServicoCard disabeled">
            <div className="iconCircle"><i className="fa-solid fa-dollar-sign"></i></div>
            <span>Trazer meus dados de outro banco</span>
          </div>
          <Link to="/contacts">
            <div className="homeServicoCard">
              <div className="iconCircle"><i className="fa-solid fa-dollar-sign"></i></div>
              <span>Seus Contatos</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home;