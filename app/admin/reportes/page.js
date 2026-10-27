"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Cargando from "@/components/Cargando";
import Mensaje from "@/components/Mensaje";
import TarjetaResumen from "@/components/TarjetaResumen";
import {
  listarOrdenes,
  listarProductos,
  listarStock,
  mensajeDeError,
} from "@/lib/api";
import {
  esVentaPagada,
  productosMasVendidos,
  resumenVentasPorDia,
  stockCritico,
  totalRecaudado,
} from "@/lib/datos";
import { fechaHoyISO, formatearFecha, formatearMoneda } from "@/lib/formato";

export default function AdminReportesPage() {
  const [ordenes, setOrdenes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [stock, setStock] = useState([]);
  const [periodo, setPeriodo] = useState("todos");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setCargando(true);
        const [listaOrdenes, listaProductos, listaStock] = await Promise.all([
          listarOrdenes(),
          listarProductos(),
          listarStock(),
        ]);
        if (!activo) return;
        setOrdenes(listaOrdenes);
        setProductos(listaProductos);
        setStock(listaStock);
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

  const hoy = fechaHoyISO();
  const filtradas = ordenes.filter((orden) => {
    if (periodo === "todos") return true;
    const fecha = String(orden.fechaVenta || "");
    if (periodo === "mes") return fecha.slice(0, 7) === hoy.slice(0, 7);
    return fecha.slice(0, 4) === hoy.slice(0, 4);
  });

  const pagadas = filtradas.filter(esVentaPagada);
  const criticos = stockCritico(stock);
  const ventasPorDia = resumenVentasPorDia(filtradas);
  const topProductos = productosMasVendidos(filtradas, productos, 5);
  const productosCriticos = criticos.map((registro) => {
    const producto = productos.find(
      (item) => Number(item.id) === Number(registro.idProducto)
    );
    return {
      ...registro,
      nombre: producto ? producto.nombre : `Producto ${registro.idProducto}`,
    };
  });

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-4">
        <div>
          <h1 className="titulo-seccion mb-1">Reportes</h1>
          <p className="text-muted mb-0">
            Resumen de ventas, productos más vendidos y alertas de stock.
          </p>
        </div>
        <div className="d-flex gap-2">
          <label className="visually-hidden" htmlFor="periodoReporte">
            Periodo
          </label>
          <select
            id="periodoReporte"
            className="form-select"
            value={periodo}
            onChange={(evento) => setPeriodo(evento.target.value)}
          >
            <option value="todos">Todo el historial</option>
            <option value="mes">Mes actual</option>
            <option value="anio">Año actual</option>
          </select>
          <Link className="btn btn-outline-marca" href="/admin/ordenes">
            Ver órdenes
          </Link>
        </div>
      </div>

      {error ? <Mensaje tipo="error">{error}</Mensaje> : null}

      {cargando ? (
        <Cargando texto="Calculando reportes..." />
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <TarjetaResumen
                icono="bi-cash-coin"
                titulo="Total recaudado"
                valor={formatearMoneda(totalRecaudado(filtradas))}
                detalle={`${pagadas.length} órdenes pagadas`}
                clase="tarjeta-roja"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <TarjetaResumen
                icono="bi-receipt"
                titulo="Órdenes del periodo"
                valor={filtradas.length}
                detalle={`${ordenes.length} en total`}
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
                detalle="En o bajo el mínimo"
                clase="tarjeta-amarilla"
              />
            </div>
          </div>

          <div className="row g-4">
            <div className="col-12 col-xl-7">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h2 className="h5 titulo-seccion mb-3">Ventas por día</h2>
                  {ventasPorDia.length === 0 ? (
                    <div className="alert alert-info mb-0">
                      No hay ventas pagadas en el periodo seleccionado.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle tabla-admin mb-0">
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Órdenes</th>
                            <th className="text-end">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ventasPorDia.map((fila) => (
                            <tr key={fila.fecha}>
                              <td>{formatearFecha(fila.fecha)}</td>
                              <td>{fila.ordenes}</td>
                              <td className="text-end">
                                {formatearMoneda(fila.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-xl-5">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h2 className="h5 titulo-seccion mb-3">
                    Productos más vendidos
                  </h2>
                  {topProductos.length === 0 ? (
                    <div className="alert alert-info mb-0">
                      Todavía no hay productos vendidos en el periodo.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle tabla-admin mb-0">
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th className="text-end">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topProductos.map((fila) => (
                            <tr key={fila.idProducto}>
                              <td>{fila.nombre}</td>
                              <td>{fila.cantidad}</td>
                              <td className="text-end">
                                {formatearMoneda(fila.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h2 className="h5 titulo-seccion mb-3">
                    Alertas de stock
                  </h2>
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
                            <th>Stock actual</th>
                            <th>Stock mínimo</th>
                            <th>Diferencia</th>
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
                              <td>
                                {Number(registro.cantidad) -
                                  Number(registro.stockMinimo)}
                              </td>
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
