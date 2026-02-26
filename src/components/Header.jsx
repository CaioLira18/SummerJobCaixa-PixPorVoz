import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const Header = ({isVisible, setIsVisible}) => {

    const navigate = useNavigate();

    function openVisible() {
        setVisible(true)
    }

    function closeVisible() {
        setVisible(false)
    }

    function logout() {
        localStorage.removeItem('user');
        navigate('/login')
    }

    return (
        <div>
            <div className="headerContainer">
                <div className="headerBox">
                    <div className="accountBox">
                        <div className="headerlogo">
                            <img src="https://res.cloudinary.com/dthgw4q5d/image/upload/v1768928987/PikPng.com_caixa-png_4667744_idyhi0.png" alt="" />
                        </div>
                        <div className="accountInformations">
                            <span>Poupanca</span>
                            <span>Ag. 0917 CP.750802081-3</span>
                        </div>
                    </div>
                    <div className="headerIcons">
                        <i className="fa-solid fa-bell"></i>
                        <i
                            className={`fa-solid ${isVisible ? 'fa-eye-slash' : 'fa-eye'}`}
                            onClick={() => setIsVisible(!isVisible)}
                            style={{ cursor: 'pointer' }}
                        ></i>
                        <i onClick={logout} class="fa-solid fa-arrow-right-from-bracket"></i>
                    </div>
                </div>
            </div>
        </div>
    )
}
