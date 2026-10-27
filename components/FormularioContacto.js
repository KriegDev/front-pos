"use client";

import { useState } from "react";
import Boton from "./Boton";
import Mensaje from "./Mensaje";
import { validarCorreo, validarTexto } from "@/lib/validaciones";

export default function FormularioContacto() {
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    mensaje: "",
  });
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  function cambiar(evento) {
    const { name, value } = evento.target;
    setForm((actual) => ({ ...actual, [name]: value }));
  }

  function enviar(evento) {
    evento.preventDefault();
    setError("");

    if (!validarTexto(form.nombre)) {
      setError("El nombre no es válido.");
      return;
    }
    if (!validarCorreo(form.correo)) {
      setError("El correo no es válido.");
      return;
    }
    if (form.mensaje.trim().length < 10) {
      setError("El mensaje debe tener al menos 10 caracteres.");
      return;
    }

    setEnviado(true);
    setForm({ nombre: "", correo: "", mensaje: "" });
  }

  return (
    <div>
      {error ? <Mensaje tipo="error">{error}</Mensaje> : null}
      {enviado ? (
        <Mensaje tipo="exito">
          ¡Mensaje enviado! Gracias por escribirnos; te responderemos a la
          brevedad.
        </Mensaje>
      ) : null}

      <form onSubmit={enviar} noValidate>
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="contactoNombre">
              Nombre
            </label>
            <input
              id="contactoNombre"
              name="nombre"
              className="form-control"
              value={form.nombre}
              onChange={cambiar}
              required
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="contactoCorreo">
              Correo
            </label>
            <input
              id="contactoCorreo"
              name="correo"
              type="email"
              className="form-control"
              value={form.correo}
              onChange={cambiar}
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label" htmlFor="contactoMensaje">
              Mensaje
            </label>
            <textarea
              id="contactoMensaje"
              name="mensaje"
              className="form-control"
              rows="4"
              value={form.mensaje}
              onChange={cambiar}
              required
            />
          </div>
        </div>

        <Boton type="submit" variante="marca" className="mt-3">
          Enviar mensaje
        </Boton>
      </form>
    </div>
  );
}
