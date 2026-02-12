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
                        <h4>R$ {!isVisible ? '100,00' : '****'}</h4>
                    </div>
                </div>
                <div className="openFinance">
                    <div className="homeIcon">
                        <i class="fa-solid fa-building-columns"></i>
                    </div>
                    <span>0,00 em outros bancos</span>
                    <div className="angle">
                        <i class="fa-solid fa-angle-right"></i>
                    </div>
                </div>
            </div>
        </div>
    )
}
