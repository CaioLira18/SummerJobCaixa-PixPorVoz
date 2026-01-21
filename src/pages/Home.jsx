import React from 'react'
import { Amount } from '../components/Amount'

export const Home = ({ isVisible }) => {
  return (
    <div>
      <div className="homeContainer">
        <div className="homeBox">
          <div className="homeAmountContainer">
            <Amount isVisible={isVisible} />
          </div>
          <div className="homeOptionsContainer">
            <div className="homeOptionsBox">
              <i class="fa-solid fa-hand-holding-dollar"></i>
              <span>Pagar Emprestado</span>
            </div>
            <div className="homeOptionsBox">
              <i class="fa-solid fa-barcode"></i>
              <span>Pagar Conta</span>
            </div>
            <div className="homeOptionsBox">
              <i class="fa-brands fa-pix"></i>
              <span>Fazer Pix</span>
            </div>
          </div>
          <div className="homeServicos">
            <span>Serviços</span>
          </div>
        </div>
      </div>
    </div>
  )
}
