// src/components/Header.jsx
import React, { useState } from "react";
import LogoUPG from '../assets/LogoUPG.png';

// Ya no recibe onOpenModal para la navegación del header
export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm relative z-20"> {/* Añadido relative y z-20 */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Al hacer clic en el logo, abre la página de inicio en una nueva pestaña */}
          <a
            href="https://upgop.edu.mx/" // URL directa
            target="_blank" // Abre en una nueva pestaña
            rel="noopener noreferrer" // Mejora la seguridad al abrir nuevas pestañas
            className="cursor-pointer"
            aria-label="Inicio Universidad Politécnica Gómez Palacio"
          >
            <img src={LogoUPG.src} alt="Logo UPGP" className="h-16 w-auto" />
          </a>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-black leading-tight">
              Universidad Politécnica<br />Gómez Palacio
            </h1>
          </div>
        </div>

        {/* Botón de menú para móviles */}
        <div className="md:hidden flex items-center">
          <button
            onClick={toggleMobileMenu}
            className="text-[#1c3e7c] text-3xl focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <i className={isMobileMenuOpen ? "bi bi-x-lg" : "bi bi-list"}></i> {/* Icono de cruz cuando abierto */}
          </button>
        </div>

        {/* Navegación para escritorio */}
        <nav className="hidden md:flex gap-6 text-[#1c3e7c] font-medium items-center">
          {/* Enlace "Inicio" que abrirá la página en una nueva pestaña */}
          <a
            href="https://upgop.edu.mx/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-center gap-1 cursor-pointer"
          >
            <i className="bi bi-house-door-fill"></i> Inicio
          </a>
          {/* Enlace "Nosotros" que abrirá la página en una nueva pestaña */}
          <a
            href="https://upgop.edu.mx/ingenieria-en-tecnologias-de-la-informacion/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-center gap-1 cursor-pointer"
          >
            <i className="bi bi-people-fill"></i> Nosotros
          </a>
          {/* Enlace "Contacto" que abrirá la página en una nueva pestaña */}
          <a
            href="https://upgop.edu.mx/bolsa-de-trabajo/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-center gap-1 cursor-pointer"
          >
            <i className="bi bi-envelope-fill"></i> Contacto
          </a>
        </nav>

        {/* Menú móvil (se muestra condicionalmente) */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-md py-4 flex flex-col items-center gap-4 border-t border-gray-200">
            <a
              href="https://upgop.edu.mx/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={toggleMobileMenu}
              className="text-[#1c3e7c] font-medium hover:underline flex items-center gap-1 px-4 py-2 w-full justify-center">
              <i className="bi bi-house-door-fill"></i> Inicio
            </a>
            <a
              href="https://upgop.edu.mx/ingenieria-en-tecnologias-de-la-informacion/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={toggleMobileMenu}
              className="text-[#1c3e7c] font-medium hover:underline flex items-center gap-1 px-4 py-2 w-full justify-center"
            >
              <i className="bi bi-people-fill"></i> Nosotros
            </a>
            <a
              href="https://upgop.edu.mx/bolsa-de-trabajo/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={toggleMobileMenu}
              className="text-[#1c3e7c] font-medium hover:underline flex items-center gap-1 px-4 py-2 w-full justify-center"
            >
              <i className="bi bi-envelope-fill"></i> Contacto
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
