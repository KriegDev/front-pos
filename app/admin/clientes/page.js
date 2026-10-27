"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Cargando from "@/components/Cargando";
import Mensaje from "@/components/Mensaje";
import {
  actualizarCliente,
  listarClientes,
  mensajeDeError,
} from "@/lib/api";
import { nombreCliente, runCliente } from "@/lib/datos";
import { obtenerSesion } from "@/lib/sesion";
import { ROLES } from "@/lib/constantes";

export default function AdminClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setCargando(true);
        const lista = await listarClientes();
        if (activo) {
          setClientes(lista);
          setSesion(obtenerSesion());
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

  async function alternarActivo(cliente) {
    if (sesion?.rol !== ROLES.ADMIN) {
      setError("Solo el administrador puede activar o desactivar clientes.");
      return;
    }
    setError("");
    setAviso("");
    try {
      const actualizado = await actualizarCliente(cliente.id, {
        ...cliente,
        activo: !cliente.activo,
      });
      setClientes((actuales) =>
        actuales.map((item) =>
          Number(item.id) === Number(actualizado.id) ? actualizado : item
        )
      );
      setAviso(
        `Cliente "${nombreCliente(cliente)}" ${
          actualizado.activo ? "activado" : "desactivado"
        }.`
      );
    } catch (problema) {
      setError(problema.message || "No se pudo cambiar el estado del cliente.");
    }
  }

  const filtrados = clientes.filter((cliente) => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return true;
    return [
      cliente.pnombre,
      cliente.snombre,
      cliente.appaterno,
      cliente.apmaterno,
      cliente.correo,
      `${cliente.run}-${cliente.dvrun}`,
      String(cliente.run),
    ]
      .filter(Boolean)
      .some((valor) => String(valor).toLowerCase().includes(texto));
  });

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-4">
        <div>
          <h1 className="titulo-seccion mb-1">Clientes</h1>
          <p className="text-muted mb-0">
            Consulta y actualiza los datos de los clientes.
          </p>
        </div>
        {sesion?.rol === ROLES.ADMIN ? (
          <Link className="btn btn-marca" href="/admin/clientes/nuevo">
            <i className="bi bi-plus-lg me-1" aria-hidden="true" />
            Nuevo cliente
          </Link>
        ) : (
          <span className="badge text-bg-secondary">Solo lectura</span>
        )}
      </div>

      {error ? <Mensaje tipo="error" onCerrar={() => setError("")}>{error}</Mensaje> : null}
      {aviso ? <Mensaje tipo="exito" onCerrar={() => setAviso("")}>{aviso}</Mensaje> : null}

      <div className="card card-body shadow-sm mb-3">
        <label className="form-label" htmlFor="buscarClienteAdmin">
          Buscar cliente
        </label>
        <input
          id="buscarClienteAdmin"
          className="form-control"
          type="search"
          placeholder="RUN, nombre o correo"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
        />
      </div>

      {cargando ? (
        <Cargando texto="Cargando clientes..." />
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle tabla-admin mb-0">
              <thead>
                <tr>
                  <th>RUN</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>{runCliente(cliente)}</td>
                    <td className="fw-semibold">{nombreCliente(cliente)}</td>
                    <td>{cliente.correo}</td>
                    <td>{cliente.telefono}</td>
                    <td>
                      <span
                        className={`badge ${
                          cliente.activo
                            ? "text-bg-success"
                            : "text-bg-secondary"
                        }`}
                      >
                        {cliente.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="text-end text-nowrap">
                      {sesion?.rol === ROLES.ADMIN ? (
                        <>
                          <Link
                            className="btn btn-sm btn-outline-marca me-1"
                            href={`/admin/clientes/${cliente.id}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            type="button"
                            className={`btn btn-sm ${
                              cliente.activo
                                ? "btn-outline-danger"
                                : "btn-outline-success"
                            }`}
                            onClick={() => alternarActivo(cliente)}
                          >
                            {cliente.activo ? "Desactivar" : "Activar"}
                          </button>
                        </>
                      ) : (
                        <span className="texto-pequeno text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!cargando && filtrados.length === 0 ? (
        <div className="alert alert-info mt-3">
          No se encontraron clientes con esa búsqueda.
        </div>
      ) : null}
    </div>
  );
}
