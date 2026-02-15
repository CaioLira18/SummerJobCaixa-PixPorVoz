import React, { useEffect, useState } from 'react';

export const Amount = ({ isVisible }) => {
    const [saldo, setSaldo] = useState(0);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setSaldo(parsedUser.saldo || 0);
            } catch (err) {
                console.error("Erro ao processar usuário do localStorage", err);
            }
        }
    }, []);

    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(valor);
    };

    return (
        <div className="amountContainer">
            <div className="amountBox">
                <div className="amount">
                    <span>Saldo Atual</span>
                    <h4>{isVisible ? formatarMoeda(saldo) : 'R$ ••••••'}</h4>
                </div>
            </div>
            <div className="openFinance">
                <div className="homeIcon">
                    <i className="fa-solid fa-building-columns"></i>
                </div>
                <span>R$ 0,00 em outros bancos</span>
                <div className="angle">
                    <i className="fa-solid fa-angle-right"></i>
                </div>
            </div>
        </div>
    );
};