"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Boton from "@/components/Boton";
import Cargando from "@/components/Cargando";
import Mensaje from "@/components/Mensaje";
import {
  actualizarUsuario,
  buscarUsuario,
  iniciarSesionBackend,
  mensajeDeError,
  obtenerCliente,
} from "@/lib/api";
import { nombreCliente, runCliente } from "@/lib/datos";
import { ROLES } from "@/lib/constantes";
import { obtenerSesion } from "@/lib/sesion";

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

        // El login devuelve el token, no un id numérico del usuario, así que
        // se busca por nombre de usuario.
        const datosUsuario = await buscarUsuario(sesion.nombreUsuario);
        if (!activo) return;

        // Si no aparece (por ejemplo una cuenta recién creada), se muestra lo
        // que ya está guardado en la sesión.
        setUsuario(
          datosUsuario || {
            id: sesion.id,
            nombreUsuario: sesion.nombreUsuario,
            rol: sesion.rol,
          }
        );

        if (datosUsuario?.idCliente) {
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

    // El backend nunca devuelve la contraseña (la guarda cifrada con BCrypt),
    // así que la única forma de comprobar la actual es intentar iniciar sesión
    // con ella.
    try {
      await iniciarSesionBackend(usuario.nombreUsuario, form.actual);
    } catch {
      setError("La contraseña actual no es correcta.");
      return;
    }

    // La misma regla que aplica el backend: entre 8 y 15 caracteres.
    if (!/^.{8,15}$/.test(form.nueva)) {
      setError("La nueva contraseña debe tener entre 8 y 15 caracteres.");
      return;
    }
    if (form.nueva !== form.repetir) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }

    try {
      setGuardando(true);
      const actualizado = await actualizarUsuario(usuario.id, {
        nombreUsuario: usuario.nombreUsuario,
        rol: usuario.rol,
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
              La contraseña se guarda cifrada en la base de datos del backend.
              Para cambiarla se pide la actual.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
