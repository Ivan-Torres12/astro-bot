import React, { useState, useEffect, useRef, useCallback } from "react";

const API_SUGERENCIAS = "https://api-node-oyng.onrender.com/sugerencias";
const API_CHAT = "https://api-node-oyng.onrender.com/chat";

export default function Chatbot() {
  const [pregunta, setPregunta] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [loading, setLoading] = useState(false);
  const [sugerencias, setSugerencias] = useState([]);
  const [nombres, setNombres] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [inputFocus, setInputFocus] = useState(false);

  const inputRef = useRef(null);
  const ignoreBlur = useRef(false);

  useEffect(() => {
    fetch(API_SUGERENCIAS)
      .then((res) => res.json())
      .then((data) => {
        setNombres(data.nombres ?? []);
        setMaterias(data.materias ?? []);
      })
      .catch(() => console.warn("Error cargando sugerencias"));
  }, []);

  const filtrarSugerencias = useCallback(() => {
    const t = pregunta.trim();
    if (!t) return [];
    const words = t.split(/\s+/);
    const last = words[words.length - 1].toLowerCase();
    const before = words.length > 1 ? words[words.length - 2].toLowerCase() : "";

    const norm = (s) =>
      s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    if (words.length >= 2) {
      const combo = words.slice(-2).join(" ").toLowerCase();
      const comp = nombres.filter((n) => {
        const nn = norm(n);
        if (nn.startsWith(norm(combo))) return true;
        const parts = nn.split(" ");
        return (
          parts.length >= 2 &&
          parts[0].startsWith(norm(before)) &&
          parts[1].startsWith(norm(last))
        );
      });
      if (comp.length) return comp.slice(0, 6);
    }

    const matchN = nombres.filter((n) => norm(n).includes(norm(last)));
    const matchM = materias.filter((m) => norm(m).includes(norm(last)));
    return [...matchN, ...matchM].slice(0, 6);
  }, [pregunta, nombres, materias]);

  useEffect(() => {
    setSugerencias(filtrarSugerencias());
    setHighlightedIndex(-1);
  }, [filtrarSugerencias]);

  const autocompletar = (value) => {
    const inputWords = pregunta.trim().split(/\s+/);
    const sugerenciaWords = value.trim().split(/\s+/);

    let count = 0;
    for (let i = 0; i < inputWords.length; i++) {
      const iw = inputWords[inputWords.length - 1 - i]?.toLowerCase();
      const sw = sugerenciaWords[i]?.toLowerCase();
      if (sw?.startsWith(iw)) count++;
      else break;
    }

    const nuevaPregunta =
      [...inputWords.slice(0, inputWords.length - count), value].join(" ") + " ";
    setPregunta(nuevaPregunta);
    setSugerencias([]);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const enviar = async () => {
    if (!pregunta.trim()) {
      setRespuesta("Escribe una pregunta primero");
      return;
    }
    setLoading(true);
    setRespuesta("");
    setSugerencias([]);

    try {
      const res = await fetch(API_CHAT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta }),
      });
      const data = await res.json();
      setRespuesta(data.respuesta ?? "Sin respuesta del servidor.");
    } catch {
      setRespuesta("Error al comunicarse con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (!sugerencias.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => (i < sugerencias.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => (i > 0 ? i - 1 : sugerencias.length - 1));
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0) {
        e.preventDefault();
        autocompletar(sugerencias[highlightedIndex]);
      } else enviar();
    } else if (e.key === "Escape") {
      setSugerencias([]);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white/90 shadow-md rounded-xl border border-gray-200 backdrop-blur-md">
      <h1 className="text-3xl font-bold text-[#1c3e7c] mb-6 flex items-center">
        <i className="bi bi-mortarboard-fill text-2xl me-2 text-[#792f2f]"></i>{" "}
        Chatbot de Calificaciones
      </h1>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setInputFocus(true)}
          onBlur={() => !ignoreBlur.current && setInputFocus(false)}
          placeholder="Ej: ¿Qué sacó Ana P en Álgebra?"
          className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c3e7c]"
          autoComplete="off"
        />

        {pregunta.length > 0 && (
          <button
            type="button"
            onClick={() => setPregunta("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500"
          >
            <i className="bi bi-x-circle-fill text-lg"></i>
          </button>
        )}

        {inputFocus && sugerencias.length > 0 && (
          <ul
            className="absolute w-full mt-1 bg-white border border-gray-300 rounded-md shadow z-10 max-h-48 overflow-y-auto"
            onMouseDown={() => (ignoreBlur.current = true)}
            onMouseUp={() =>
              setTimeout(() => {
                ignoreBlur.current = false;
                inputRef.current?.focus();
              }, 0)
            }
          >
            {sugerencias.map((s, i) => (
              <li
                key={i}
                onClick={() => autocompletar(s)}
                onMouseEnter={() => setHighlightedIndex(i)}
                className={`flex items-center gap-2 px-4 py-2 cursor-pointer ${
                  highlightedIndex === i
                    ? "bg-[#1c3e7c]/10"
                    : "hover:bg-gray-100"
                }`}
              >
                <i
                  className={`bi ${
                    materias.includes(s)
                      ? "bi-book-fill text-green-600"
                      : "bi-person-fill text-[#792f2f]"
                  }`}
                ></i>
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={enviar}
        disabled={loading}
        className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-semibold text-white ${
          loading
            ? "bg-gray-400"
            : "bg-[#1c3e7c] hover:bg-[#162d5c]"
        }`}
      >
        {loading ? (
          <>
            <i className="bi bi-hourglass-split animate-spin"></i> Consultando...
          </>
        ) : (
          <>
            Enviar <i className="bi bi-send-fill"></i>
          </>
        )}
      </button>

      <div
        className={`mt-4 min-h-[3rem] p-4 rounded-md ${
          respuesta.toLowerCase().includes("reprobado")
            ? "bg-[#fdecea] text-[#b71c1c] border border-[#f5c6cb]"
            : respuesta.toLowerCase().includes("aprobado")
            ? "bg-[#e8f5e9] text-[#1b5e20] border border-[#c8e6c9]"
            : "bg-gray-100 text-gray-800 border border-gray-300"
        } transition-colors duration-300`}
      >
        {respuesta}
      </div>
    </div>
  );
}
