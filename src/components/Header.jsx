import React from "react";
import LogoUPG from '../assets/LogoUPG.png';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={LogoUPG.src} alt="Logo UPGP" className="h-16 w-auto" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-black leading-tight">
              Universidad Politécnica<br />Gómez Palacio
            </h1>
          </div>
        </div>
        <nav className="hidden md:flex gap-6 text-[#1c3e7c] font-medium items-center">
          <a href="#inicio" className="hover:underline flex items-center gap-1">
            <i className="bi bi-house-door-fill"></i> Inicio
          </a>
          <a href="#nosotros" className="hover:underline flex items-center gap-1">
            <i className="bi bi-people-fill"></i> Nosotros
          </a>
          <a href="#contacto" className="hover:underline flex items-center gap-1">
            <i className="bi bi-envelope-fill"></i> Contacto
          </a>
        </nav>
      </div>
    </header>
  );
}
