import React, { useState } from 'react'

export const Header = ({isVisible, setIsVisible}) => {

    function openVisible() {
        setVisible(true)
    }

    function closeVisible() {
        setVisible(false)
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
                    </div>
                </div>
            </div>
        </div>
    )
}
