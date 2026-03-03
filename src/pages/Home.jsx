import React, { useEffect, useState } from 'react'
import { Amount } from '../components/Amount'
import { Link } from 'react-router-dom'
import { Header } from '../components/Header';

export const Home = () => {
  // 1. Criamos o estado aqui no pai (Home)
  const [isVisible, setIsVisible] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setName(parsedUser.name || '');
      } catch (err) {
        console.error("Erro ao processar usuário do localStorage", err);
      }
    }
  }, []);

  return (
    <div className="homeContainer">
      {/* 2. Passamos o estado e a função de mudar o estado para o Header */}
      <Header isVisible={isVisible} setIsVisible={setIsVisible} />

      <div className="homeBox">
        <div className="homeAmountContainer">
          {/* 3. Passamos o mesmo estado isVisible para o Amount */}
          <Amount isVisible={isVisible} /> 
        </div>

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
          <Link to="/contacts">
            <div className="homeServicoCard">
              <div className="iconCircle"><i className="fa-solid fa-star"></i></div>
              <span>Seus Favoritos</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home;