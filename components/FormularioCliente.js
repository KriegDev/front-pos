"use client";

import { useState } from "react";
import Boton from "./Boton";
import Mensaje from "./Mensaje";
import {
  separarRun,
  validarCorreo,
  validarRun,
  validarTelefono,
  validarTexto,
} from "@/lib/validaciones";

export default function FormularioCliente({
  clienteInicial = null,
  onGuardar,
  esNuevo = false,
}) {
  const [form, setForm] = useState({
    run: clienteInicial
      ? `${clienteInicial.run}-${clienteInicial.dvrun}`
      : "",
    pnombre: clienteInicial?.pnombre || "",
    snombre: clienteInicial?.snombre || "",
    appaterno: clienteInicial?.appaterno || "",
    apmaterno: clienteInicial?.apmaterno || "",
    correo: clienteInicial?.correo || "",
    telefono: clienteInicial?.telefono || "",
    activo: clienteInicial?.activo ?? true,
  });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  function cambiar(evento) {
    const { name, value, type, checked } = evento.target;
    setForm((actual) => ({
      ...actual,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    setError("");

    if (!validarRun(form.run)) {
      setError("El RUN no es válido. Escríbelo con guion, por ejemplo 12345678-9.");
      return;
    }
    if (!validarTexto(form.pnombre)) {
      setError("El primer nombre no es válido.");
      return;
    }
    if (!validarTexto(form.appaterno)) {
      setError("El apellido paterno no es válido.");
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

    const { run, dvrun } = separarRun(form.run);

    try {
      setEnviando(true);
      await onGuardar({
        run,
        dvrun,
        pnombre: form.pnombre.trim(),
        snombre: form.snombre.trim(),
        appaterno: form.appaterno.trim(),
        apmaterno: form.apmaterno.trim(),
        correo: form.correo.trim(),
        telefono: Number(String(form.telefono).replace(/\D/g, "")),
        activo: Boolean(form.activo),
      });
    } catch (problema) {
      setError(problema.message || "No se pudo guardar el cliente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} noValidate>
      {error ? <Mensaje tipo="error">{error}</Mensaje> : null}

      <div className="row g-3">
        <div className="col-12 col-md-4">
          <label className="form-label" htmlFor="clienteRun">
            RUN
          </label>
          <input
            id="clienteRun"
            name="run"
            className="form-control"
            value={form.run}
            onChange={cambiar}
            placeholder="12345678-9"
            readOnly={!esNuevo}
            required
          />
        </div>

        <div className="col-12 col-md-4">
          <label className="form-label" htmlFor="clientePnombre">
            Primer nombre
          </label>
          <input
            id="clientePnombre"
            name="pnombre"
            className="form-control"
            value={form.pnombre}
            onChange={cambiar}
            required
          />
        </div>

        <div className="col-12 col-md-4">
          <label className="form-label" htmlFor="clienteSnombre">
            Segundo nombre
          </label>
          <input
            id="clienteSnombre"
            name="snombre"
            className="form-control"
            value={form.snombre}
            onChange={cambiar}
          />
        </div>

        <div className="col-12 col-md-4">
          <label className="form-label" htmlFor="clienteAppaterno">
            Apellido paterno
          </label>
          <input
            id="clienteAppaterno"
            name="appaterno"
            className="form-control"
            value={form.appaterno}
            onChange={cambiar}
            required
          />
        </div>

        <div className="col-12 col-md-4">
          <label className="form-label" htmlFor="clienteApmaterno">
            Apellido materno
          </label>
          <input
            id="clienteApmaterno"
            name="apmaterno"
            className="form-control"
            value={form.apmaterno}
            onChange={cambiar}
          />
        </div>

        <div className="col-12 col-md-4">
          <label className="form-label" htmlFor="clienteTelefono">
            Teléfono
          </label>
          <input
            id="clienteTelefono"
            name="telefono"
            className="form-control"
            value={form.telefono}
            onChange={cambiar}
            placeholder="912345678"
            required
          />
        </div>

        <div className="col-12 col-md-8">
          <label className="form-label" htmlFor="clienteCorreo">
            Correo
          </label>
          <input
            id="clienteCorreo"
            name="correo"
            type="email"
            className="form-control"
            value={form.correo}
            onChange={cambiar}
            required
          />
        </div>

        <div className="col-12 col-md-4 d-flex align-items-end">
          <div className="form-check mb-2">
            <input
              id="clienteActivo"
              name="activo"
              type="checkbox"
              className="form-check-input"
              checked={form.activo}
              onChange={cambiar}
            />
            <label className="form-check-label" htmlFor="clienteActivo">
              Cliente activo
            </label>
          </div>
        </div>
      </div>

      <div className="d-flex gap-2 mt-4">
        <Boton type="submit" variante="marca" disabled={enviando}>
          {enviando
            ? "Guardando..."
            : esNuevo
              ? "Crear cliente"
              : "Guardar cambios"}
        </Boton>
      </div>
    </form>
  );
}
