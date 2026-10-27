"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Boton from "@/components/Boton";
import Cargando from "@/components/Cargando";
import EstadoBadge from "@/components/EstadoBadge";
import Mensaje from "@/components/Mensaje";
import {
  buscarPagoPorOrden,
  listarClientes,
  listarMetodosPago,
  listarProductos,
  mensajeDeError,
  obtenerOrden,
} from "@/lib/api";
import {
  detalleConProducto,
  metodoPagoNombre,
  nombreCliente,
  runCliente,
} from "@/lib/datos";
import { formatearFecha, formatearFechaHora, formatearMoneda } from "@/lib/formato";
import { ESTADOS_ORDEN } from "@/lib/constantes";
import { etiquetaEstado } from "@/lib/estados";
import { obtenerSesion } from "@/lib/sesion";
import { cambiarEstadoOrden } from "@/lib/ventas";

export default function AdminOrdenDetallePage() {
  const params = useParams();
  const id = params?.id;
  const [orden, setOrden] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [metodo, setMetodo] = useState("");
  const [productos, setProductos] = useState([]);
  const [pago, setPago] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setCargando(true);
        const [datosOrden, clientes, metodos, listaProductos, datosPago] =
          await Promise.all([
            obtenerOrden(id),
            listarClientes(),
            listarMetodosPago(),
            listarProductos(),
            buscarPagoPorOrden(id),
          ]);
        if (!activo) return;
        setOrden(datosOrden);
        setNuevoEstado(datosOrden.status);
        setCliente(
          clientes.find(
            (registro) => Number(registro.id) === Number(datosOrden.idCliente)
          ) || null
        );
        setMetodo(metodoPagoNombre(metodos, datosOrden.idMetodoPago));
        setProductos(listaProductos);
        setPago(datosPago);
        setSesion(obtenerSesion());
      } catch (problema) {
        if (activo) setError(mensajeDeError(problema));
      } finally {
        if (activo) setCargando(false);
      }
    }

    if (id) cargar();
    return () => {
      activo = false;
    };
  }, [id]);

  async function guardarEstado() {
    if (!orden || nuevoEstado === orden.status) return;
    if (
      nuevoEstado === "CANCELADO" &&
      !window.confirm(
        "Al cancelar la orden se devolverá el stock de los productos. ¿Continuar?"
      )
    ) {
      return;
    }

    try {
      setGuardando(true);
      setError("");
      await cambiarEstadoOrden(orden.id, nuevoEstado);
      const actualizada = await obtenerOrden(orden.id);
      setOrden(actualizada);
      setNuevoEstado(actualizada.status);
      const pagoActualizado = await buscarPagoPorOrden(orden.id);
      setPago(pagoActualizado);
      setAviso("Estado de la orden actualizado.");
    } catch (problema) {
      setError(problema.message || "No se pudo actualizar el estado.");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <div className="container py-5">
        <Cargando texto="Cargando orden..." />
      </div>
    );
  }

  if (error && !orden) {
    return (
      <div>
        <Mensaje tipo="error">{error}</Mensaje>
        <Link className="btn btn-marca" href="/admin/ordenes">
          Volver a órdenes
        </Link>
      </div>
    );
  }

  const esAdmin = sesion?.rol === "Administrador";
  const detalles = (orden.detalles || []).map((detalle) =>
    detalleConProducto(detalle, productos)
  );

  return (
    <div>
      <nav aria-label="breadcrumb" className="migas mb-3">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <Link href="/admin/ordenes">Órdenes</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            #{orden.numeroOrden}
          </li>
        </ol>
      </nav>

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 className="titulo-seccion mb-1">Orden #{orden.numeroOrden}</h1>
          <p className="text-muted mb-0">
            Registrada el {formatearFecha(orden.fechaVenta)}.
          </p>
        </div>
        <EstadoBadge estado={orden.status} />
      </div>

      {error ? <Mensaje tipo="error" onCerrar={() => setError("")}>{error}</Mensaje> : null}
      {aviso ? <Mensaje tipo="exito" onCerrar={() => setAviso("")}>{aviso}</Mensaje> : null}

      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-7">
          <div className="card card-body shadow-sm h-100">
            <h2 className="h5 titulo-seccion mb-3">Datos de la orden</h2>
            <div className="row g-2">
              <div className="col-12 col-md-6">
                <p className="mb-1">
                  <strong>Cliente:</strong> {nombreCliente(cliente)}
                </p>
                <p className="mb-1">
                  <strong>RUN:</strong> {runCliente(cliente)}
                </p>
                <p className="mb-0">
                  <strong>Medio de pago:</strong> {metodo}
                </p>
              </div>
              <div className="col-12 col-md-6">
                <p className="mb-1">
                  <strong>Entrega:</strong>{" "}
                  {orden.entrega === "DOMICILIO"
                    ? "Despacho a domicilio"
                    : "Retiro en tienda"}
                </p>
                {orden.entrega === "DOMICILIO" ? (
                  <p className="mb-0">
                    <strong>Dirección:</strong> {orden.direccion},{" "}
                    {orden.comuna}, {orden.region}
                  </p>
                ) : (
                  <p className="mb-0">
                    <strong>Retiro:</strong> Av. Sur 700, Maipú
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card card-body shadow-sm h-100">
            <h2 className="h5 titulo-seccion mb-3">Pago</h2>
            {pago ? (
              <>
                <p className="mb-1">
                  <strong>Estado:</strong>{" "}
                  <span className="badge text-bg-secondary">{pago.estado}</span>
                </p>
                <p className="mb-1">
                  <strong>Monto:</strong> {formatearMoneda(pago.monto)}
                </p>
                <p className="mb-0">
                  <strong>Fecha de pago:</strong>{" "}
                  {formatearFechaHora(pago.fechaPago)}
                </p>
              </>
            ) : (
              <p className="text-muted mb-0">No hay un pago registrado.</p>
            )}
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h2 className="h5 titulo-seccion mb-3">Productos</h2>
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Cantidad</th>
                  <th>Precio unitario</th>
                  <th className="text-end">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((detalle) => (
                  <tr key={detalle.id}>
                    <td>{detalle.nombre}</td>
                    <td>{detalle.sku}</td>
                    <td>{detalle.cantidad}</td>
                    <td>{formatearMoneda(detalle.precioUnitario)}</td>
                    <td className="text-end">
                      {formatearMoneda(
                        Number(detalle.cantidad) *
                          Number(detalle.precioUnitario)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan="4" className="text-end">
                    Total de la orden
                  </th>
                  <th className="text-end">
                    {formatearMoneda(orden.montoTotal)}
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <div className="card card-body shadow-sm">
        <h2 className="h5 titulo-seccion mb-3">Cambiar estado</h2>
        {esAdmin ? (
          <div className="row g-2 align-items-end">
            <div className="col-12 col-md-5">
              <label className="form-label" htmlFor="ordenNuevoEstado">
                Nuevo estado
              </label>
              <select
                id="ordenNuevoEstado"
                className="form-select"
                value={nuevoEstado}
                onChange={(evento) => setNuevoEstado(evento.target.value)}
                disabled={orden.status === "CANCELADO"}
              >
                {ESTADOS_ORDEN.map((item) => (
                  <option key={item} value={item}>
                    {etiquetaEstado(item)}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-4">
              <Boton
                variante="marca"
                onClick={guardarEstado}
                disabled={
                  guardando ||
                  orden.status === "CANCELADO" ||
                  nuevoEstado === orden.status
                }
              >
                {guardando ? "Guardando..." : "Guardar estado"}
              </Boton>
            </div>
          </div>
        ) : (
          <p className="text-muted mb-0">
            Solo el administrador puede cambiar el estado de una orden.
          </p>
        )}
        {orden.status === "CANCELADO" ? (
          <p className="texto-pequeno text-muted mt-2 mb-0">
            Esta orden está cancelada y el stock ya fue devuelto.
          </p>
        ) : null}
      </div>
    </div>
  );
}
