"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Boton from "@/components/Boton";
import Cargando from "@/components/Cargando";
import Mensaje from "@/components/Mensaje";
import {
  actualizarUsuario,
  mensajeDeError,
  obtenerCliente,
  obtenerUsuario,
} from "@/lib/api";
import { nombreCliente, runCliente } from "@/lib/datos";
import { ROLES } from "@/lib/constantes";
import { obtenerSesion } from "@/lib/sesion";
import { validarPassword } from "@/lib/validaciones";

export default function AdminPerfilPage() {
  const [usuario, setUsuario] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [form, setForm] = useState({
    actual: "",
    nueva: "",
    repetir: "",
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setCargando(true);
        const sesion = obtenerSesion();
        if (!sesion) return;
        const datosUsuario = await obtenerUsuario(sesion.id);
        if (!activo) return;
        setUsuario(datosUsuario);
        if (datosUsuario.idCliente) {
          try {
            const datosCliente = await obtenerCliente(datosUsuario.idCliente);
            if (activo) setCliente(datosCliente);
          } catch {
            if (activo) setCliente(null);
          }
        }
      } catch (problema) {
        if (activo) setError(mensajeDeError(problema));
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, []);

  function cambiar(evento) {
    const { name, value } = evento.target;
    setForm((actual) => ({ ...actual, [name]: value }));
  }

  async function cambiarContrasena(evento) {
    evento.preventDefault();
    setError("");
    setAviso("");

    if (!usuario) return;
    if (form.actual !== usuario.contrasena) {
      setError("La contraseña actual no es correcta.");
      return;
    }
    if (!validarPassword(form.nueva)) {
      setError("La nueva contraseña debe tener al menos 3 caracteres.");
      return;
    }
    if (form.nueva !== form.repetir) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }

    try {
      setGuardando(true);
      const actualizado = await actualizarUsuario(usuario.id, {
        ...usuario,
        contrasena: form.nueva,
      });
      setUsuario(actualizado);
      setForm({ actual: "", nueva: "", repetir: "" });
      setAviso("Contraseña actualizada correctamente.");
    } catch (problema) {
      setError(problema.message || "No se pudo actualizar la contraseña.");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <div className="container py-5">
        <Cargando texto="Cargando perfil..." />
      </div>
    );
  }

  if (!usuario) {
    return <Mensaje tipo="error">No se pudo cargar el perfil.</Mensaje>;
  }

  return (
    <div>
      <h1 className="titulo-seccion mb-1">Mi perfil</h1>
      <p className="text-muted mb-4">
        Revisa tus datos de acceso y cambia tu contraseña.
      </p>

      {error ? <Mensaje tipo="error" onCerrar={() => setError("")}>{error}</Mensaje> : null}
      {aviso ? <Mensaje tipo="exito" onCerrar={() => setAviso("")}>{aviso}</Mensaje> : null}

      <div className="row g-4">
        <div className="col-12 col-lg-5">
          <div className="card card-body shadow-sm h-100">
            <h2 className="h5 titulo-seccion mb-3">Datos de la cuenta</h2>
            <p className="mb-1">
              <strong>Usuario:</strong> {usuario.nombreUsuario}
            </p>
            <p className="mb-1">
              <strong>Rol:</strong>{" "}
              <span
                className={`badge ${
                  usuario.rol === ROLES.ADMIN
                    ? "text-bg-danger"
                    : usuario.rol === ROLES.VENDEDOR
                      ? "text-bg-primary"
                      : "text-bg-secondary"
                }`}
              >
                {usuario.rol}
              </span>
            </p>
            <p className="mb-1">
              <strong>Estado:</strong>{" "}
              <span
                className={`badge ${
                  usuario.activo ? "text-bg-success" : "text-bg-secondary"
                }`}
              >
                {usuario.activo ? "Activo" : "Inactivo"}
              </span>
            </p>

            <hr />

            {cliente ? (
              <>
                <h3 className="h6">Cliente asociado</h3>
                <p className="mb-1">{nombreCliente(cliente)}</p>
                <p className="mb-1">RUN: {runCliente(cliente)}</p>
                <p className="mb-1">Correo: {cliente.correo}</p>
                <p className="mb-0">Teléfono: {cliente.telefono}</p>
              </>
            ) : (
              <p className="text-muted mb-0">
                Esta cuenta no tiene un cliente asociado. Es una cuenta interna
                de la tienda.
              </p>
            )}

            <div className="mt-4">
              <Link className="btn btn-outline-marca" href="/">
                Ir a la tienda
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="card card-body shadow-sm">
            <h2 className="h5 titulo-seccion mb-3">Cambiar contraseña</h2>
            <form onSubmit={cambiarContrasena} noValidate>
              <div className="mb-3">
                <label className="form-label" htmlFor="perfilActual">
                  Contraseña actual
                </label>
                <input
                  id="perfilActual"
                  name="actual"
                  type="password"
                  className="form-control"
                  value={form.actual}
                  onChange={cambiar}
                  required
                />
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="perfilNueva">
                    Nueva contraseña
                  </label>
                  <input
                    id="perfilNueva"
                    name="nueva"
                    type="password"
                    className="form-control"
                    value={form.nueva}
                    onChange={cambiar}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="perfilRepetir">
                    Repetir nueva contraseña
                  </label>
                  <input
                    id="perfilRepetir"
                    name="repetir"
                    type="password"
                    className="form-control"
                    value={form.repetir}
                    onChange={cambiar}
                    required
                  />
                </div>
              </div>

              <Boton
                type="submit"
                variante="marca"
                className="mt-4"
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Actualizar contraseña"}
              </Boton>
            </form>

            <p className="texto-pequeno text-muted mt-3 mb-0">
              Las contraseñas se guardan en el JSON local como parte de la
              simulación. No uses una contraseña real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
