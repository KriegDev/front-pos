"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Cargando from "@/components/Cargando";
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
import { formatearFecha, formatearMoneda } from "@/lib/formato";
import { marcarOrdenPagada } from "@/lib/ventas";

export default function CompraOkPage() {
  const [orden, setOrden] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [metodo, setMetodo] = useState("");
  const [productos, setProductos] = useState([]);
  const [pago, setPago] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setCargando(true);
        const parametros = new URLSearchParams(window.location.search);
        const id = parametros.get("orden");
        if (!id) throw new Error("No se encontró el número de la orden.");

        await marcarOrdenPagada(id);

        const [datosOrden, clientes, metodosPago, listaProductos, datosPago] =
          await Promise.all([
            obtenerOrden(id),
            listarClientes(),
            listarMetodosPago(),
            listarProductos(),
            buscarPagoPorOrden(id),
          ]);

        if (!activo) return;
        setOrden(datosOrden);
        setCliente(
          clientes.find(
            (registro) => Number(registro.id) === Number(datosOrden.idCliente)
          ) || null
        );
        setMetodo(metodoPagoNombre(metodosPago, datosOrden.idMetodoPago));
        setProductos(listaProductos);
        setPago(datosPago);
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

  if (cargando) {
    return (
      <div className="container py-5">
        <Cargando texto="Confirmando tu compra..." />
      </div>
    );
  }

  if (error || !orden) {
    return (
      <div className="container py-5">
        <Mensaje tipo="error">
          {error || "No pudimos encontrar la orden."}
        </Mensaje>
        <Link className="btn btn-marca" href="/productos">
          Volver a productos
        </Link>
      </div>
    );
  }

  const detalles = (orden.detalles || []).map((detalle) =>
    detalleConProducto(detalle, productos)
  );

  return (
    <div className="container py-4 py-lg-5">
      <div className="card shadow-sm border-0">
        <div className="card-body p-4 p-lg-5">
          <div className="text-center mb-4">
            <i
              className="bi bi-check-circle-fill text-success display-4"
              aria-hidden="true"
            />
            <h1 className="titulo-seccion mt-3">¡Compra realizada!</h1>
            <p className="text-muted mb-0">
              Gracias por comprar en El Rincón de la Tía Ceci. Tu orden quedó
              registrada.
            </p>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-12 col-md-4">
              <div className="border rounded-3 p-3 h-100">
                <p className="texto-pequeno text-muted mb-1">Número de orden</p>
                <p className="h5 mb-0">#{orden.numeroOrden}</p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="border rounded-3 p-3 h-100">
                <p className="texto-pequeno text-muted mb-1">Fecha</p>
                <p className="h5 mb-0">{formatearFecha(orden.fechaVenta)}</p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="border rounded-3 p-3 h-100">
                <p className="texto-pequeno text-muted mb-1">Total pagado</p>
                <p className="h5 mb-0 text-marca">
                  {formatearMoneda(orden.montoTotal)}
                </p>
              </div>
            </div>
          </div>

          <div className="row g-3 mb-4">
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
              {pago ? (
                <p className="mb-0 mt-1">
                  <strong>Estado del pago:</strong>{" "}
                  <span className="badge text-bg-success">{pago.estado}</span>
                </p>
              ) : null}
            </div>
          </div>

          <h2 className="h5 titulo-seccion">Detalle de la compra</h2>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-light">
                <tr>
                  <th scope="col">Producto</th>
                  <th scope="col">Cantidad</th>
                  <th scope="col">Precio</th>
                  <th scope="col" className="text-end">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((detalle) => (
                  <tr key={detalle.id}>
                    <td>
                      {detalle.nombre}
                      <span className="texto-pequeno text-muted d-block">
                        SKU: {detalle.sku}
                      </span>
                    </td>
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
                  <th colSpan="3" className="text-end">
                    Total
                  </th>
                  <th className="text-end">
                    {formatearMoneda(orden.montoTotal)}
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="d-flex flex-wrap gap-2 mt-4">
            <Link className="btn btn-marca" href="/productos">
              Seguir comprando
            </Link>
            <Link className="btn btn-outline-marca" href="/">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
