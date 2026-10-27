"use client";

import { useState } from "react";
import Boton from "./Boton";
import Mensaje from "./Mensaje";
import { ROLES } from "@/lib/constantes";
import { validarNombreUsuario, validarPassword } from "@/lib/validaciones";

export default function FormularioUsuario({
  usuarioInicial = null,
  clientes = [],
  onGuardar,
  esNuevo = false,
}) {
  const [form, setForm] = useState({
    nombreUsuario: usuarioInicial?.nombreUsuario || "",
    contrasena: "",
    rol: usuarioInicial?.rol || ROLES.VENDEDOR,
    idCliente: usuarioInicial?.idCliente || "",
    activo: usuarioInicial?.activo ?? true,
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

    if (!validarNombreUsuario(form.nombreUsuario)) {
      setError(
        "El usuario debe tener entre 3 y 15 caracteres y solo letras, números, punto, guion o guion bajo."
      );
      return;
    }
    if (esNuevo && !validarPassword(form.contrasena)) {
      setError("La contraseña debe tener al menos 3 caracteres.");
      return;
    }
    if (!esNuevo && form.contrasena && !validarPassword(form.contrasena)) {
      setError("La nueva contraseña debe tener al menos 3 caracteres.");
      return;
    }
    if (form.rol === ROLES.CLIENTE && !form.idCliente) {
      setError("Si el rol es Cliente, debes asociar un cliente.");
      return;
    }

    try {
      setEnviando(true);
      await onGuardar({
        nombreUsuario: form.nombreUsuario.trim(),
        contrasena: form.contrasena,
        rol: form.rol,
        idCliente: form.idCliente ? Number(form.idCliente) : null,
        activo: Boolean(form.activo),
      });
    } catch (problema) {
      setError(problema.message || "No se pudo guardar el usuario.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} noValidate>
      {error ? <Mensaje tipo="error">{error}</Mensaje> : null}

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor="usuarioNombre">
            Nombre de usuario
          </label>
          <input
            id="usuarioNombre"
            name="nombreUsuario"
            className="form-control"
            value={form.nombreUsuario}
            onChange={cambiar}
            required
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor="usuarioPassword">
            Contraseña
          </label>
          <input
            id="usuarioPassword"
            name="contrasena"
            type="password"
            className="form-control"
            value={form.contrasena}
            onChange={cambiar}
            placeholder={
              esNuevo ? "Mínimo 3 caracteres" : "Dejar en blanco para mantener"
            }
            required={esNuevo}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor="usuarioRol">
            Rol
          </label>
          <select
            id="usuarioRol"
            name="rol"
            className="form-select"
            value={form.rol}
            onChange={cambiar}
          >
            <option value={ROLES.ADMIN}>Administrador</option>
            <option value={ROLES.VENDEDOR}>Vendedor</option>
            <option value={ROLES.CLIENTE}>Cliente</option>
          </select>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor="usuarioCliente">
            Cliente asociado
          </label>
          <select
            id="usuarioCliente"
            name="idCliente"
            className="form-select"
            value={form.idCliente}
            onChange={cambiar}
          >
            <option value="">Sin cliente asociado</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.run}-{cliente.dvrun} · {cliente.pnombre}{" "}
                {cliente.appaterno}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12">
          <div className="form-check">
            <input
              id="usuarioActivo"
              name="activo"
              type="checkbox"
              className="form-check-input"
              checked={form.activo}
              onChange={cambiar}
            />
            <label className="form-check-label" htmlFor="usuarioActivo">
              Usuario activo
            </label>
          </div>
        </div>
      </div>

      <div className="d-flex gap-2 mt-4">
        <Boton type="submit" variante="marca" disabled={enviando}>
          {enviando
            ? "Guardando..."
            : esNuevo
              ? "Crear usuario"
              : "Guardar cambios"}
        </Boton>
      </div>
    </form>
  );
}
