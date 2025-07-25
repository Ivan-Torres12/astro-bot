// src/components/chatbot.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";

const API_SUGERENCIAS = "https://api-node-oyng.onrender.com/sugerencias";
const API_CHAT = "https://api-node-oyng.onrender.com/chat";

// Define las URLs que quieres que se abran en una modal desde el chatbot
const MODAL_URLS = {
  "inicio upgop": "https://upgop.edu.mx/",
  "nosotros upgop": "https://upgop.edu.mx/ingenieria-en-tecnologias-de-la-informacion/",
  "contacto upgop": "https://upgop.edu.mx/bolsa-de-trabajo/",
};

// Recibe la prop onOpenModal
export default function Chatbot({ onOpenModal }) {
  const [pregunta, setPregunta] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [loading, setLoading] = useState(false);
  const [sugerencias, setSugerencias] = useState([]);
  const [nombres, setNombres] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [inputFocus, setInputFocus] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  const textareaRef = useRef(null);
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

  // Effect for auto-resizing textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [pregunta]);

  const filtrarSugerencias = useCallback(() => {
    const t = pregunta.trim();
    if (!t) return [];
    const words = t.split(/\s+/);
    const last = words[words.length - 1].toLowerCase();
    const before = words.length > 1 ? words[words.length - 2].toLowerCase() : "";

    const norm = (s) =>
      s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    let filtered = [];

    // Lógica para sugerir nombres completos (dos palabras)
    if (words.length >= 2) {
      const combo = words.slice(-2).join(" ").toLowerCase();
      const compNombres = nombres.filter((n) => {
        const nn = norm(n);
        if (nn.startsWith(norm(combo))) return true;
        const parts = nn.split(" ");
        return (
          parts.length >= 2 &&
          parts[0].startsWith(norm(before)) &&
          parts[1].startsWith(norm(last))
        );
      });
      if (compNombres.length) filtered = [...filtered, ...compNombres];
    }

    // Sugerencias basadas en la última palabra
    const matchN = nombres.filter((n) => norm(n).includes(norm(last)));
    const matchM = materias.filter((m) => norm(m).includes(norm(last)));

    // Combinar y eliminar duplicados, priorizando nombres/materias exactos o que empiezan con el texto
    const combined = [...filtered, ...matchN, ...matchM];
    const uniqueSuggestions = Array.from(new Set(combined));

    return uniqueSuggestions.slice(0, 6);
  }, [pregunta, nombres, materias]);


  useEffect(() => {
    setSugerencias(filtrarSugerencias());
    setHighlightedIndex(-1);
  }, [filtrarSugerencias]);

  // Updated Function to accurately count unique names or subjects
  const countEntities = (text, entities) => {
    const normText = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    let count = 0;
    // Sort entities by length in descending order to prioritize longer matches
    // This is crucial for multi-word entities (e.g., "Física Cuántica" before "Física")
    const sortedEntities = [...entities].sort((a, b) => b.length - a.length);

    let tempText = normText; // Use a temporary variable to modify the text

    for (const entity of sortedEntities) {
      const normEntity = entity.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      // Check if the normalized entity string is present in the current text
      if (tempText.includes(normEntity)) {
        count++;
        // Replace the found entity with spaces in the tempText
        // This prevents re-counting the same entity or parts of it
        // The regex escape is important if entity names contain special characters
        tempText = tempText.replace(new RegExp(normEntity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), ' ');
      }
    }
    return count;
  };

  const autocompletar = (value) => {
    const currentInput = pregunta.trim();
    const words = currentInput.split(/\s+/);

    // Validate before autocompleting
    const isName = nombres.includes(value);
    const isSubject = materias.includes(value);

    let canAutocomplete = true;
    let message = "";

    // Count existing names/subjects in the current input before adding the new one
    const currentNamesCount = countEntities(currentInput, nombres);
    const currentMateriasCount = countEntities(currentInput, materias);

    if (isName && currentNamesCount >= 1) { // If already one name and trying to add another
        canAutocomplete = false;
        message = "Solo puedes introducir un nombre de alumno.";
    } else if (isSubject && currentMateriasCount >= 1) { // If already one subject and trying to add another
        canAutocomplete = false;
        message = "Solo puedes introducir una materia.";
    }

    if (!canAutocomplete) {
        setValidationMessage(message);
        return;
    } else {
        setValidationMessage(""); // Clear message if valid
    }

    let nuevaPregunta = currentInput;
    // Replace the last word(s) if they match a suggestion
    const lastWord = words.length > 0 ? words[words.length - 1] : "";
    const twoWords = words.length >= 2 ? `${words[words.length - 2]} ${lastWord}` : "";

    const normValue = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const normLastWord = lastWord.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const normTwoWords = twoWords.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    // Check if the suggestion matches the last one or two words for replacement
    if (words.length >= 2 && normValue.startsWith(normTwoWords)) {
        nuevaPregunta = words.slice(0, words.length - 2).join(" ") + (words.length > 2 ? " " : "") + value;
    } else if (words.length >= 1 && normValue.startsWith(normLastWord)) {
        nuevaPregunta = words.slice(0, words.length - 1).join(" ") + (words.length > 1 ? " " : "") + value;
    } else {
        // If no replacement, just append
        nuevaPregunta = currentInput + (currentInput ? " " : "") + value;
    }
    
    // Ensure there's a space after the autocompleted word
    if (!nuevaPregunta.endsWith(" ")) {
        nuevaPregunta += " ";
    }

    setPregunta(nuevaPregunta.replace(/\s+/g, " ").trimStart());
    setSugerencias([]);
    setHighlightedIndex(-1);
    textareaRef.current?.focus();
  };

  const enviar = async () => {
    if (!pregunta.trim()) {
      setRespuesta("Escribe una pregunta primero");
      setValidationMessage("");
      return;
    }

    // Final validation before sending
    const currentInput = pregunta.trim();
    const nameCount = countEntities(currentInput, nombres);
    const materiaCount = countEntities(currentInput, materias);

    let message = "";
    if (nameCount > 1) {
        message = "Por favor, introduce solo un nombre de alumno.";
    }
    if (materiaCount > 1) {
        message = (message ? message + " y " : "") + "Por favor, introduce solo una materia.";
    }

    if (message) {
        setValidationMessage(message);
        return;
    }

    setValidationMessage("");

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
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => (i < sugerencias.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => (i > 0 ? i - 1 : sugerencias.length - 1));
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && sugerencias.length > 0) { // Only autocomplete if there are suggestions and one is highlighted
        e.preventDefault();
        autocompletar(sugerencias[highlightedIndex]);
      } else {
        e.preventDefault();
        enviar();
      }
    } else if (e.key === "Escape") {
      setSugerencias([]);
      setHighlightedIndex(-1);
    }
  };

  // Función para renderizar la respuesta con enlaces para la modal
  const renderRespuestaConEnlaces = (textoRespuesta) => {
    if (!textoRespuesta) return null;

    const partes = [];
    let ultimoIndice = 0;

    for (const [clave, url] of Object.entries(MODAL_URLS)) {
      const lowerTextoRespuesta = textoRespuesta.toLowerCase();
      const lowerClave = clave.toLowerCase();
      let index = lowerTextoRespuesta.indexOf(lowerClave, ultimoIndice);

      while (index !== -1) {
        if (index > ultimoIndice) {
          partes.push(textoRespuesta.substring(ultimoIndice, index));
        }

        partes.push(
          <a
            key={index}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onOpenModal(url); // Llama a la función onOpenModal que viene de AppLayout
            }}
            className="text-[#1c3e7c] hover:underline font-semibold"
          >
            {textoRespuesta.substring(index, index + clave.length)}
          </a>
        );

        ultimoIndice = index + clave.length;
        index = lowerTextoRespuesta.indexOf(lowerClave, ultimoIndice);
      }
    }

    if (ultimoIndice < textoRespuesta.length) {
      partes.push(textoRespuesta.substring(ultimoIndice));
    }

    if (partes.length === 0) {
      return textoRespuesta;
    }

    return partes;
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white/90 shadow-md rounded-xl border border-gray-200 backdrop-blur-md">
      <h1 className="text-3xl font-bold text-[#1c3e7c] mb-6 flex items-center">
        <i className="bi bi-mortarboard-fill text-2xl me-2 text-[#792f2f]"></i>{" "}
        Chatbot de Calificaciones
      </h1>

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={pregunta}
          onChange={(e) => {
            setPregunta(e.target.value);
            setValidationMessage("");
          }}
          onKeyDown={onKeyDown}
          onFocus={() => setInputFocus(true)}
          onBlur={() => !ignoreBlur.current && setInputFocus(false)}
          placeholder="Ej: ¿Qué sacó Ana P en Álgebra? (Solo un alumno y una materia)"
          className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c3e7c] resize-none overflow-hidden min-h-[48px]"
          rows="1"
          autoComplete="off"
        />

        {pregunta.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setPregunta("");
              setValidationMessage("");
            }}
            className="absolute right-3 top-3 text-gray-500 hover:text-red-500"
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
                textareaRef.current?.focus();
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

      {/* Validation Message Display */}
      {validationMessage && (
        <p className="text-red-600 text-sm mt-2">{validationMessage}</p>
      )}

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
        {renderRespuestaConEnlaces(respuesta)}
      </div>
    </div>
  );
}
