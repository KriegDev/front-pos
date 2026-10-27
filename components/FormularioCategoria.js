"use client";

import { useState } from "react";
import Boton from "./Boton";
import Mensaje from "./Mensaje";

export default function FormularioCategoria({
  categoriaInicial = null,
  onGuardar,
  esNueva = false,
}) {
  const [nombre, setNombre] = useState(categoriaInicial?.nombre || "");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    setError("");

    if (nombre.trim().length < 3) {
      setError("El nombre debe tener al menos 3 caracteres.");
      return;
    }

    try {
      setEnviando(true);
      await onGuardar({ nombre: nombre.trim() });
    } catch (problema) {
      setError(problema.message || "No se pudo guardar la categoría.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} noValidate>
      {error ? <Mensaje tipo="error">{error}</Mensaje> : null}

      <div className="mb-3">
        <label className="form-label" htmlFor="categoriaNombre">
          Nombre de la categoría
        </label>
        <input
          id="categoriaNombre"
          name="nombre"
          className="form-control"
          value={nombre}
          onChange={(evento) => setNombre(evento.target.value)}
          required
        />
      </div>

      <Boton type="submit" variante="marca" disabled={enviando}>
        {enviando
          ? "Guardando..."
          : esNueva
            ? "Crear categoría"
            : "Guardar cambios"}
      </Boton>
    </form>
  );
}
