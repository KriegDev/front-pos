"use client";

import { useState } from "react";
import Boton from "./Boton";
import Mensaje from "./Mensaje";
import {
  validarCorreo,
  validarRun,
  validarTelefono,
  validarTexto,
} from "@/lib/validaciones";

export default function FormularioPuntos({ onRegistrar }) {
  const [form, setForm] = useState({
    pnombre: "",
    snombre: "",
    appaterno: "",
    apmaterno: "",
    run: "",
    correo: "",
    telefono: "",
  });
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [enviando, setEnviando] = useState(false);

  function cambiar(evento) {
    const { name, value } = evento.target;
    setForm((actual) => ({ ...actual, [name]: value }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    setError("");
    setExito("");

    if (!validarTexto(form.pnombre)) {
      setError("El primer nombre no es válido.");
      return;
    }
    if (!validarTexto(form.appaterno)) {
      setError("El apellido paterno no es válido.");
      return;
    }
    if (!validarRun(form.run)) {
      setError("El RUN no es válido. Escríbelo con guion, por ejemplo 12345678-9.");
      return;
    }
    if (!validarCorreo(form.correo)) {
      setError("El correo no es válido.");
      return;
    }
    if (!validarTelefono(form.telefono)) {
      setError("El teléfono debe tener entre 8 y 9 dígitos.");
      return;
    }

    try {
      setEnviando(true);
      const mensaje = await onRegistrar({
        pnombre: form.pnombre.trim(),
        snombre: form.snombre.trim(),
        appaterno: form.appaterno.trim(),
        apmaterno: form.apmaterno.trim(),
        run: form.run,
        correo: form.correo.trim(),
        telefono: form.telefono,
      });
      setExito(mensaje || "¡Ya eres parte de Puntos Tía Ceci!");
    } catch (problema) {
      setError(problema.message || "No se pudo completar el registro.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      {error ? <Mensaje tipo="error">{error}</Mensaje> : null}
      {exito ? <Mensaje tipo="exito">{exito}</Mensaje> : null}

      <form onSubmit={enviar} noValidate>
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="puntosPnombre">
              Primer nombre
            </label>
            <input
              id="puntosPnombre"
              name="pnombre"
              className="form-control"
              value={form.pnombre}
              onChange={cambiar}
              required
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="puntosSnombre">
              Segundo nombre
            </label>
            <input
              id="puntosSnombre"
              name="snombre"
              className="form-control"
              value={form.snombre}
              onChange={cambiar}
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="puntosAppaterno">
              Apellido paterno
            </label>
            <input
              id="puntosAppaterno"
              name="appaterno"
              className="form-control"
              value={form.appaterno}
              onChange={cambiar}
              required
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="puntosApmaterno">
              Apellido materno
            </label>
            <input
              id="puntosApmaterno"
              name="apmaterno"
              className="form-control"
              value={form.apmaterno}
              onChange={cambiar}
            />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="puntosRun">
              RUN
            </label>
            <input
              id="puntosRun"
              name="run"
              className="form-control"
              value={form.run}
              onChange={cambiar}
              placeholder="12345678-9"
              required
            />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="puntosCorreo">
              Correo
            </label>
            <input
              id="puntosCorreo"
              name="correo"
              type="email"
              className="form-control"
              value={form.correo}
              onChange={cambiar}
              required
            />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="puntosTelefono">
              Teléfono
            </label>
            <input
              id="puntosTelefono"
              name="telefono"
              className="form-control"
              value={form.telefono}
              onChange={cambiar}
              placeholder="912345678"
              required
            />
          </div>
        </div>

        <Boton type="submit" variante="marca" className="mt-3" disabled={enviando}>
          {enviando ? "Registrando..." : "¡Unirme!"}
        </Boton>
      </form>
    </div>
  );
}
