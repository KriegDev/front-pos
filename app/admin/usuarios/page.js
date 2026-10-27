"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Cargando from "@/components/Cargando";
import Mensaje from "@/components/Mensaje";
import {
  actualizarUsuario,
  listarClientes,
  listarUsuarios,
  mensajeDeError,
} from "@/lib/api";
import { clientePorId, nombreCliente, runCliente } from "@/lib/datos";
import { obtenerSesion } from "@/lib/sesion";
import { ROLES } from "@/lib/constantes";

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setCargando(true);
        const [listaUsuarios, listaClientes] = await Promise.all([
          listarUsuarios(),
          listarClientes(),
        ]);
        if (!activo) return;
        setUsuarios(listaUsuarios);
        setClientes(listaClientes);
        setSesion(obtenerSesion());
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

  async function alternarActivo(usuario) {
    setError("");
    setAviso("");

    if (Number(usuario.id) === Number(sesion?.id)) {
      setError("No puedes desactivar tu propio usuario.");
      return;
    }

    try {
      const actualizado = await actualizarUsuario(usuario.id, {
        ...usuario,
        activo: !usuario.activo,
      });
      setUsuarios((actuales) =>
        actuales.map((item) =>
          Number(item.id) === Number(actualizado.id) ? actualizado : item
        )
      );
      setAviso(
        `Usuario "${usuario.nombreUsuario}" ${
          actualizado.activo ? "activado" : "desactivado"
        }.`
      );
    } catch (problema) {
      setError(problema.message || "No se pudo cambiar el estado del usuario.");
    }
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-4">
        <div>
          <h1 className="titulo-seccion mb-1">Usuarios</h1>
          <p className="text-muted mb-0">
            Administra las cuentas de acceso al sistema.
          </p>
        </div>
        <Link className="btn btn-marca" href="/admin/usuarios/nuevo">
          <i className="bi bi-plus-lg me-1" aria-hidden="true" />
          Nuevo usuario
        </Link>
      </div>

      {error ? <Mensaje tipo="error" onCerrar={() => setError("")}>{error}</Mensaje> : null}
      {aviso ? <Mensaje tipo="exito" onCerrar={() => setAviso("")}>{aviso}</Mensaje> : null}

      {cargando ? (
        <Cargando texto="Cargando usuarios..." />
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle tabla-admin mb-0">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Cliente asociado</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => {
                  const cliente = clientePorId(clientes, usuario.idCliente);
                  return (
                    <tr key={usuario.id}>
                      <td className="fw-semibold">{usuario.nombreUsuario}</td>
                      <td>
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
                      </td>
                      <td>
                        {cliente ? (
                          <>
                            {nombreCliente(cliente)}
                            <span className="d-block texto-pequeno text-muted">
                              {runCliente(cliente)}
                            </span>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            usuario.activo
                              ? "text-bg-success"
                              : "text-bg-secondary"
                          }`}
                        >
                          {usuario.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="text-end text-nowrap">
                        <Link
                          className="btn btn-sm btn-outline-marca me-1"
                          href={`/admin/usuarios/${usuario.id}/editar`}
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          className={`btn btn-sm ${
                            usuario.activo
                              ? "btn-outline-danger"
                              : "btn-outline-success"
                          }`}
                          onClick={() => alternarActivo(usuario)}
                          disabled={Number(usuario.id) === Number(sesion?.id)}
                        >
                          {usuario.activo ? "Desactivar" : "Activar"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
