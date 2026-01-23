import React from 'react'

export const Amount = (
    {isVisible}
) => {
    return (
        <div>
            <div className="amountContainer">
                <div className="amountBox">
                    <div className="amount">
                        <span>Saldo Atual</span>
                        <h4>R$ {!isVisible ? 100 : '****'}</h4>
                    </div>
                    <div className="iconAngle">
                        <i class="fa-solid fa-angle-right"></i>
                    </div>
                </div>
                <div className="openFinance">
                    <img src="https://res.cloudinary.com/dthgw4q5d/image/upload/v1768933937/simbolo-monocromatico-azulcaixa_nr88za.png" alt="" />
                    <span>Conecte outras contas via Open Finance</span>
                </div>
            </div>
        </div>
    )
}
