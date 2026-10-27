"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Boton from "@/components/Boton";
import Mensaje from "@/components/Mensaje";
import {
  crearCliente,
  crearUsuario,
  listarClientes,
  listarUsuarios,
  mensajeDeError,
  siguienteId,
} from "@/lib/api";
import { ROLES } from "@/lib/constantes";
import { guardarSesion } from "@/lib/sesion";
import {
  separarRun,
  validarCorreo,
  validarNombreUsuario,
  validarPassword,
  validarRun,
  validarTelefono,
  validarTexto,
} from "@/lib/validaciones";

export default function CrearCuentaPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombreUsuario: "",
    contrasena: "",
    repetir: "",
    pnombre: "",
    snombre: "",
    appaterno: "",
    apmaterno: "",
    run: "",
    correo: "",
    telefono: "",
  });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  function cambiar(evento) {
    const { name, value } = evento.target;
    setForm((actual) => ({ ...actual, [name]: value }));
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
    if (!validarPassword(form.contrasena)) {
      setError("La contraseña debe tener al menos 3 caracteres.");
      return;
    }
    if (form.contrasena !== form.repetir) {
      setError("Las contraseñas no coinciden.");
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
      const usuarios = await listarUsuarios();
      const nombreUsuario = form.nombreUsuario.trim().toLowerCase();
      const repetido = usuarios.some(
        (usuario) =>
          String(usuario.nombreUsuario).toLowerCase() === nombreUsuario
      );
      if (repetido) {
        throw new Error("Ese nombre de usuario ya está en uso.");
      }

      const { run, dvrun } = separarRun(form.run);
      const clientes = await listarClientes();
      let cliente = clientes.find(
        (registro) => Number(registro.run) === Number(run)
      );

      if (cliente) {
        if (!cliente.activo) {
          throw new Error(
            "El cliente está inactivo. Comunícate con la tienda para reactivarlo."
          );
        }
        const yaTieneCuenta = usuarios.some(
          (usuario) => Number(usuario.idCliente) === Number(cliente.id)
        );
        if (yaTieneCuenta) {
          throw new Error("Ese RUN ya tiene una cuenta registrada.");
        }
      } else {
        cliente = await crearCliente({
          id: siguienteId(clientes),
          run,
          dvrun,
          pnombre: form.pnombre.trim(),
          snombre: form.snombre.trim(),
          appaterno: form.appaterno.trim(),
          apmaterno: form.apmaterno.trim(),
          correo: form.correo.trim(),
          telefono: Number(String(form.telefono).replace(/\D/g, "")),
          activo: true,
        });
      }

      const usuario = await crearUsuario({
        id: siguienteId(usuarios),
        nombreUsuario,
        contrasena: form.contrasena,
        rol: ROLES.CLIENTE,
        idCliente: cliente.id,
        activo: true,
      });

      guardarSesion(usuario);
      router.push("/");
    } catch (problema) {
      setError(
        problema.message?.includes("ya está en uso") ||
          problema.message?.includes("ya tiene una cuenta") ||
          problema.message?.includes("inactivo")
          ? problema.message
          : mensajeDeError(problema)
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="container py-4 py-lg-5">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4 p-lg-5">
              <div className="text-center mb-4">
                <h1 className="titulo-seccion">Crear cuenta de cliente</h1>
                <p className="text-muted mb-0">
                  Regístrate para que tus datos se carguen automáticamente en el
                  checkout.
                </p>
              </div>

              {error ? <Mensaje tipo="error">{error}</Mensaje> : null}

              <form onSubmit={enviar} noValidate>
                <h2 className="h6 text-uppercase text-muted mb-3">
                  Datos de acceso
                </h2>
                <div className="row g-3">
                  <div className="col-12 col-md-4">
                    <label className="form-label" htmlFor="registroUsuario">
                      Nombre de usuario
                    </label>
                    <input
                      id="registroUsuario"
                      name="nombreUsuario"
                      className="form-control"
                      value={form.nombreUsuario}
                      onChange={cambiar}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label" htmlFor="registroContrasena">
                      Contraseña
                    </label>
                    <input
                      id="registroContrasena"
                      name="contrasena"
                      type="password"
                      className="form-control"
                      value={form.contrasena}
                      onChange={cambiar}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label" htmlFor="registroRepetir">
                      Repetir contraseña
                    </label>
                    <input
                      id="registroRepetir"
                      name="repetir"
                      type="password"
                      className="form-control"
                      value={form.repetir}
                      onChange={cambiar}
                      required
                    />
                  </div>
                </div>

                <hr className="my-4" />

                <h2 className="h6 text-uppercase text-muted mb-3">
                  Datos personales
                </h2>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="registroPnombre">
                      Primer nombre
                    </label>
                    <input
                      id="registroPnombre"
                      name="pnombre"
                      className="form-control"
                      value={form.pnombre}
                      onChange={cambiar}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="registroSnombre">
                      Segundo nombre
                    </label>
                    <input
                      id="registroSnombre"
                      name="snombre"
                      className="form-control"
                      value={form.snombre}
                      onChange={cambiar}
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="registroAppaterno">
                      Apellido paterno
                    </label>
                    <input
                      id="registroAppaterno"
                      name="appaterno"
                      className="form-control"
                      value={form.appaterno}
                      onChange={cambiar}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="registroApmaterno">
                      Apellido materno
                    </label>
                    <input
                      id="registroApmaterno"
                      name="apmaterno"
                      className="form-control"
                      value={form.apmaterno}
                      onChange={cambiar}
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label" htmlFor="registroRun">
                      RUN
                    </label>
                    <input
                      id="registroRun"
                      name="run"
                      className="form-control"
                      value={form.run}
                      onChange={cambiar}
                      placeholder="12345678-9"
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label" htmlFor="registroCorreo">
                      Correo
                    </label>
                    <input
                      id="registroCorreo"
                      name="correo"
                      type="email"
                      className="form-control"
                      value={form.correo}
                      onChange={cambiar}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label" htmlFor="registroTelefono">
                      Teléfono
                    </label>
                    <input
                      id="registroTelefono"
                      name="telefono"
                      className="form-control"
                      value={form.telefono}
                      onChange={cambiar}
                      placeholder="912345678"
                      required
                    />
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2 align-items-center mt-4">
                  <Boton type="submit" variante="marca" disabled={enviando}>
                    {enviando ? "Creando cuenta..." : "Crear cuenta"}
                  </Boton>
                  <Link className="btn btn-link" href="/iniciar-sesion">
                    Ya tengo cuenta
                  </Link>
                </div>
              </form>

              <p className="texto-pequeno text-muted mt-4 mb-0">
                Demostración académica: las contraseñas se guardan sin
                encriptar en el JSON local. No uses una contraseña real.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
