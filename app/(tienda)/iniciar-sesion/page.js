"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Boton from "@/components/Boton";
import Mensaje from "@/components/Mensaje";
import { buscarUsuario, mensajeDeError } from "@/lib/api";
import {
  guardarSesion,
  obtenerSesion,
  rutaInicioPorRol,
} from "@/lib/sesion";

export default function IniciarSesionPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nombreUsuario: "", contrasena: "" });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const sesion = obtenerSesion();
    if (sesion) router.replace(rutaInicioPorRol(sesion));
  }, [router]);

  function cambiar(evento) {
    const { name, value } = evento.target;
    setForm((actual) => ({ ...actual, [name]: value }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    setError("");

    if (!form.nombreUsuario.trim() || !form.contrasena) {
      setError("Escribe tu usuario y contraseña.");
      return;
    }

    try {
      setEnviando(true);
      const usuario = await buscarUsuario(form.nombreUsuario.trim());
      if (!usuario || usuario.contrasena !== form.contrasena) {
        throw new Error("Usuario o contraseña incorrectos.");
      }
      if (usuario.activo === false) {
        throw new Error("Este usuario está desactivado.");
      }

      const sesion = guardarSesion(usuario);
      router.push(rutaInicioPorRol(sesion));
    } catch (problema) {
      setError(
        problema.message === "Usuario o contraseña incorrectos."
          ? problema.message
          : mensajeDeError(problema)
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="container py-5 d-flex justify-content-center">
      <div className="login-card card-body p-4 p-lg-5">
        <div className="text-center mb-4">
          <img
            src="/imagenes/logo.png"
            alt="Logo Tía Ceci"
            width="72"
            height="72"
            className="mb-2"
          />
          <h1 className="h4 titulo-seccion">Iniciar sesión</h1>
          <p className="text-muted texto-pequeno mb-0">
            Entra para revisar tus datos o administrar la tienda.
          </p>
        </div>

        {error ? <Mensaje tipo="error">{error}</Mensaje> : null}

        <form onSubmit={enviar} noValidate>
          <div className="mb-3">
            <label className="form-label" htmlFor="loginUsuario">
              Usuario
            </label>
            <input
              id="loginUsuario"
              name="nombreUsuario"
              className="form-control"
              value={form.nombreUsuario}
              onChange={cambiar}
              autoComplete="username"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="loginContrasena">
              Contraseña
            </label>
            <input
              id="loginContrasena"
              name="contrasena"
              type="password"
              className="form-control"
              value={form.contrasena}
              onChange={cambiar}
              autoComplete="current-password"
              required
            />
          </div>

          <Boton type="submit" variante="marca" className="w-100" disabled={enviando}>
            {enviando ? "Ingresando..." : "Ingresar"}
          </Boton>
        </form>

        <div className="credenciales-demo mt-4">
          <p className="mb-1 fw-semibold">Credenciales de prueba</p>
          <p className="mb-0 texto-pequeno">
            Administrador: <code>admin</code> / <code>12345</code>
            <br />
            Vendedor: <code>vendedor</code> / <code>123</code>
          </p>
        </div>

        <p className="text-center texto-pequeno mt-4 mb-0">
          ¿No tienes cuenta?{" "}
          <Link href="/crear-cuenta">Crea tu cuenta de cliente</Link>
        </p>
      </div>
    </div>
  );
}
