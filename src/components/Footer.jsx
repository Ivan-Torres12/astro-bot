import React from "react";
import LogoUPG from '../assets/LogoUPG.png';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="https://upgop.edu.mx/" target="_blank" rel="noopener noreferrer">
            <img src={LogoUPG.src} alt="Logo UPGP" className="h-16 w-auto" />
          </a>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-black leading-tight">
              Universidad Politécnica<br />Gómez Palacio
            </h1>
          </div>
        </div>
        <nav className="hidden md:flex gap-6 text-[#1c3e7c] font-medium items-center">
          <a href="https://upgop.edu.mx/" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
            <i className="bi bi-house-door-fill"></i> Inicio
          </a>
          <a href="https://upgop.edu.mx/ingenieria-en-tecnologias-de-la-informacion/" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
            <i className="bi bi-people-fill"></i> Nosotros
          </a>
          <a href="https://upgop.edu.mx/bolsa-de-trabajo/" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
            <i className="bi bi-envelope-fill"></i> Contacto
          </a>
        </nav>
      </div>
    </header>
  );
}
