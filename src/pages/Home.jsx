import React from 'react'
import { Amount } from '../components/Amount'

export const Home = ({ isVisible }) => {
  return (
    <div className="homeContainer">
      <div className="homeBox">
        <div className="homeAmountContainer">
          <Amount isVisible={isVisible} />
        </div>

        <div className="homeOptionsContainer">
          <div className="homeOptionsBox">
            <i className="fa-solid fa-suitcase"></i>
            <span>Pagar emprestado</span>
          </div>
          <div className="homeOptionsBox">
            <i className="fa-solid fa-barcode"></i>
            <span>Pagar conta</span>
          </div>
          <div className="homeOptionsBox">
            <i class="fa-brands fa-pix"></i>
            <span>Fazer Pix</span>
          </div>
        </div>

        <div className="homeServicosHeader">
          <span>Serviços</span>
          <a href="#">Mostrar todos &rarr;</a>
        </div>

        <div className="homeServicosGrid">
          <div className="homeServicoCard">
            <div className="iconCircle"><i className="fa-solid fa-house-user"></i></div>
            <span>Minha conta</span>
          </div>
          <div className="homeServicoCard">
            <div className="iconCircle"><i className="fa-solid fa-chart-line"></i></div>
            <span>Investimentos</span>
          </div>
          <div className="homeServicoCard">
            <div className="iconCircle"><i className="fa-solid fa-house"></i></div>
            <span>Habitação</span>
          </div>
          <div className="homeServicoCard">
            <div className="iconCircle"><i className="fa-solid fa-credit-card"></i></div>
            <span>Cartão de crédito</span>
          </div>
          <div className="homeServicoCard">
            <div className="iconCircle"><i className="fa-solid fa-dollar-sign"></i></div>
            <span>Empréstimos</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home