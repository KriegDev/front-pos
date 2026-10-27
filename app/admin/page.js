"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Cargando from "@/components/Cargando";
import EstadoBadge from "@/components/EstadoBadge";
import Mensaje from "@/components/Mensaje";
import TarjetaResumen from "@/components/TarjetaResumen";
import {
  listarClientes,
  listarMetodosPago,
  listarOrdenes,
  listarProductos,
  listarStock,
  mensajeDeError,
} from "@/lib/api";
import {
  clientePorId,
  metodoPagoNombre,
  nombreCliente,
  ordenarOrdenes,
  stockCritico,
  totalRecaudado,
} from "@/lib/datos";
import { formatearFecha, formatearMoneda } from "@/lib/formato";
import { obtenerSesion } from "@/lib/sesion";

export default function AdminDashboardPage() {
  const [ordenes, setOrdenes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [stock, setStock] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [sesion, setSesion] = useState(null);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setCargando(true);
        setError("");
        const [listaOrdenes, listaProductos, listaStock, listaClientes, metodos] =
          await Promise.all([
            listarOrdenes(),
            listarProductos(),
            listarStock(),
            listarClientes(),
            listarMetodosPago(),
          ]);
        if (!activo) return;
        setOrdenes(listaOrdenes);
        setProductos(listaProductos);
        setStock(listaStock);
        setClientes(listaClientes);
        setMetodosPago(metodos);
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

  const criticos = stockCritico(stock);
  const ultimas = ordenarOrdenes(ordenes).slice(0, 5);
  const productosCriticos = criticos
    .map((registro) => {
      const producto = productos.find(
        (item) => Number(item.id) === Number(registro.idProducto)
      );
      return {
        ...registro,
        nombre: producto ? producto.nombre : `Producto ${registro.idProducto}`,
      };
    })
    .slice(0, 6);

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-4">
        <div>
          <h1 className="titulo-seccion mb-1">Dashboard</h1>
          <p className="text-muted mb-0">
            Bienvenid@, {sesion?.rol || "Usuario"}. Este es el resumen de la
            tienda.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link className="btn btn-marca" href="/admin/ventas">
            <i className="bi bi-cart-plus me-1" aria-hidden="true" />
            Nueva venta
          </Link>
          {sesion?.rol === "Administrador" ? (
            <Link className="btn btn-outline-marca" href="/admin/reportes">
              Ver reportes
            </Link>
          ) : null}
        </div>
      </div>

      {error ? <Mensaje tipo="error">{error}</Mensaje> : null}

      {cargando ? (
        <Cargando texto="Cargando dashboard..." />
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <TarjetaResumen
                icono="bi-cash-coin"
                titulo="Total recaudado"
                valor={formatearMoneda(totalRecaudado(ordenes))}
                detalle="Órdenes pagadas y finalizadas"
                clase="tarjeta-roja"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <TarjetaResumen
                icono="bi-receipt"
                titulo="Órdenes"
                valor={ordenes.length}
                detalle="Registradas en total"
                clase="tarjeta-azul"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <TarjetaResumen
                icono="bi-box-seam"
                titulo="Productos"
                valor={productos.length}
                detalle="En el catálogo"
                clase="tarjeta-verde"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <TarjetaResumen
                icono="bi-exclamation-triangle"
                titulo="Stock crítico"
                valor={criticos.length}
                detalle="Productos en o bajo el mínimo"
                clase="tarjeta-amarilla"
              />
            </div>
          </div>

          <div className="row g-4">
            <div className="col-12 col-xl-7">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h5 titulo-seccion mb-0">Últimas órdenes</h2>
                    <Link className="btn btn-sm btn-outline-marca" href="/admin/ordenes">
                      Ver todas
                    </Link>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle tabla-admin mb-0">
                      <thead>
                        <tr>
                          <th>N°</th>
                          <th>Fecha</th>
                          <th>Cliente</th>
                          <th>Pago</th>
                          <th>Total</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ultimas.map((orden) => (
                          <tr key={orden.id}>
                            <td>
                              <Link href={`/admin/ordenes/${orden.id}`}>
                                #{orden.numeroOrden}
                              </Link>
                            </td>
                            <td>{formatearFecha(orden.fechaVenta)}</td>
                            <td>
                              {nombreCliente(
                                clientePorId(clientes, orden.idCliente)
                              )}
                            </td>
                            <td>
                              {metodoPagoNombre(
                                metodosPago,
                                orden.idMetodoPago
                              )}
                            </td>
                            <td>{formatearMoneda(orden.montoTotal)}</td>
                            <td>
                              <EstadoBadge estado={orden.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {ultimas.length === 0 ? (
                    <p className="text-muted mb-0">
                      Todavía no hay órdenes registradas.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="col-12 col-xl-5">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h5 titulo-seccion mb-0">Stock crítico</h2>
                    {sesion?.rol === "Administrador" ? (
                      <Link
                        className="btn btn-sm btn-outline-marca"
                        href="/admin/productos"
                      >
                        Gestionar
                      </Link>
                    ) : null}
                  </div>

                  {productosCriticos.length === 0 ? (
                    <div className="alert alert-success mb-0">
                      No hay productos en stock crítico.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle tabla-admin mb-0">
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th>Actual</th>
                            <th>Mínimo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productosCriticos.map((registro) => (
                            <tr key={registro.id}>
                              <td>{registro.nombre}</td>
                              <td>
                                <span className="badge text-bg-danger">
                                  {registro.cantidad}
                                </span>
                              </td>
                              <td>{registro.stockMinimo}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
