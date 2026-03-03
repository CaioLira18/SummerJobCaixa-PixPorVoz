import React from 'react'
import { Link } from 'react-router-dom'

export const Footer = () => {
  return (
    <nav className="bottomNav">
      <div className="bottomNavItem active">
        <i className="fa-solid fa-house"></i>
        <a href="/"><span>Início</span></a>
      </div>
      <div className="bottomNavItem off">
        <i className="fa-solid fa-file-lines"></i>
        <span>Extrato</span>
      </div>
      <Link to={'/areaPix'}>
        <div className="bottomNavItem">
          <i class="fa-brands fa-pix"></i>
          <span>Pix</span>
        </div>
      </Link>
      <div className="bottomNavItem off">
        <i className="fa-solid fa-bars"></i>
        <span>Menu</span>
      </div>
    </nav>
  )
}