import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#1c3e7c] text-white mt-10">
      <div className="max-w-7xl mx-auto px-4 py-6 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Universidad Politécnica de Gómez Palacio. Todos los derechos reservados.
        </p>
        <p className="text-xs mt-1">Sitio institucional desarrollado para fines académicos.</p>
      </div>
    </footer>
  );
}
