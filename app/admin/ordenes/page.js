"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Cargando from "@/components/Cargando";
import EstadoBadge from "@/components/EstadoBadge";
import Mensaje from "@/components/Mensaje";
import {
  listarClientes,
  listarMetodosPago,
  listarOrdenes,
  mensajeDeError,
} from "@/lib/api";
import {
  clientePorId,
  metodoPagoNombre,
  nombreCliente,
  ordenarOrdenes,
} from "@/lib/datos";
import { formatearFecha, formatearMoneda } from "@/lib/formato";
import { ESTADOS_ORDEN } from "@/lib/constantes";
import { etiquetaEstado } from "@/lib/estados";

export default function AdminOrdenesPage() {
  const [ordenes, setOrdenes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [estado, setEstado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setCargando(true);
        const [listaOrdenes, listaClientes, metodos] = await Promise.all([
          listarOrdenes(),
          listarClientes(),
          listarMetodosPago(),
        ]);
        if (!activo) return;
        setOrdenes(ordenarOrdenes(listaOrdenes));
        setClientes(listaClientes);
        setMetodosPago(metodos);
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

  const filtradas = estado
    ? ordenes.filter((orden) => orden.status === estado)
    : ordenes;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-4">
        <div>
          <h1 className="titulo-seccion mb-1">Órdenes</h1>
          <p className="text-muted mb-0">
            Revisa las ventas registradas y su estado de pago.
          </p>
        </div>
        <Link className="btn btn-outline-marca" href="/admin/ventas">
          Ir a Nueva venta
        </Link>
      </div>

      {error ? <Mensaje tipo="error">{error}</Mensaje> : null}

      <div className="card card-body shadow-sm mb-3">
        <label className="form-label" htmlFor="filtroEstadoOrden">
          Filtrar por estado
        </label>
        <select
          id="filtroEstadoOrden"
          className="form-select"
          value={estado}
          onChange={(evento) => setEstado(evento.target.value)}
        >
          <option value="">Todos los estados</option>
          {ESTADOS_ORDEN.map((item) => (
            <option key={item} value={item}>
              {etiquetaEstado(item)}
            </option>
          ))}
        </select>
      </div>

      {cargando ? (
        <Cargando texto="Cargando órdenes..." />
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle tabla-admin mb-0">
              <thead>
                <tr>
                  <th>N° orden</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Medio de pago</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((orden) => (
                  <tr key={orden.id}>
                    <td className="fw-semibold">#{orden.numeroOrden}</td>
                    <td>{formatearFecha(orden.fechaVenta)}</td>
                    <td>{nombreCliente(clientePorId(clientes, orden.idCliente))}</td>
                    <td>{metodoPagoNombre(metodosPago, orden.idMetodoPago)}</td>
                    <td>{formatearMoneda(orden.montoTotal)}</td>
                    <td>
                      <EstadoBadge estado={orden.status} />
                    </td>
                    <td className="text-end">
                      <Link
                        className="btn btn-sm btn-outline-marca"
                        href={`/admin/ordenes/${orden.id}`}
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!cargando && filtradas.length === 0 ? (
        <div className="alert alert-info mt-3">
          No hay órdenes con ese estado.
        </div>
      ) : null}
    </div>
  );
}
