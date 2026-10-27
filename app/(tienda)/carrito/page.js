"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Mensaje from "@/components/Mensaje";
import {
  calcularSubtotal,
  calcularTotal,
  cambiarCantidad,
  obtenerCarrito,
  quitarDelCarrito,
  vaciarCarrito,
} from "@/lib/carrito";
import { formatearMoneda } from "@/lib/formato";

export default function CarritoPage() {
  const [items, setItems] = useState([]);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    setItems(obtenerCarrito());
  }, []);

  function actualizarCantidad(id, cantidad) {
    setItems(cambiarCantidad(id, cantidad));
  }

  function quitar(id) {
    setItems(quitarDelCarrito(id));
    setAviso("Producto eliminado del carrito.");
  }

  function vaciar() {
    setItems(vaciarCarrito());
    setAviso("Carrito vaciado.");
  }

  const total = calcularTotal(items);
  const cantidadTotal = items.reduce(
    (suma, item) => suma + Number(item.cantidad || 0),
    0
  );

  return (
    <div className="container py-4 py-lg-5">
      <h1 className="titulo-seccion">Carrito de compras</h1>
      <p className="subtitulo-seccion mb-4">
        Revisa tus productos antes de confirmar la compra.
      </p>

      {aviso ? (
        <Mensaje tipo="info" onCerrar={() => setAviso("")}>
          {aviso}
        </Mensaje>
      ) : null}

      {items.length === 0 ? (
        <div className="card card-body text-center py-5">
          <i className="bi bi-cart-x display-5 text-marca" aria-hidden="true" />
          <h2 className="h4 mt-3">Tu carrito está vacío</h2>
          <p className="text-muted">
            Agrega productos desde el catálogo para comenzar una compra.
          </p>
          <div>
            <Link className="btn btn-marca" href="/productos">
              Ver productos
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="card shadow-sm">
              <div className="table-responsive">
                <table className="table table-hover align-middle tabla-carrito mb-0">
                  <thead className="table-light">
                    <tr>
                      <th scope="col">Producto</th>
                      <th scope="col">Precio</th>
                      <th scope="col">Cantidad</th>
                      <th scope="col">Subtotal</th>
                      <th scope="col" className="text-end">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <img
                              src={
                                item.imagen ||
                                "/imagenes/producto-sin-foto.png"
                              }
                              alt={item.nombre}
                            />
                            <div>
                              <Link
                                className="fw-semibold enlace-sin-estilo"
                                href={`/productos/${item.id}`}
                              >
                                {item.nombre}
                              </Link>
                              <p className="texto-pequeno text-muted mb-0">
                                SKU: {item.sku || "—"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>{formatearMoneda(item.precio)}</td>
                        <td>
                          <div className="d-flex align-items-center gap-1">
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-cantidad"
                              onClick={() =>
                                actualizarCantidad(item.id, item.cantidad - 1)
                              }
                              disabled={Number(item.cantidad) <= 1}
                              aria-label={`Disminuir cantidad de ${item.nombre}`}
                            >
                              −
                            </button>
                            <input
                              type="number"
                              className="form-control form-control-sm text-center"
                              style={{ width: "70px" }}
                              min="1"
                              max={item.stock}
                              value={item.cantidad}
                              onChange={(evento) =>
                                actualizarCantidad(
                                  item.id,
                                  evento.target.value
                                )
                              }
                              aria-label={`Cantidad de ${item.nombre}`}
                            />
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-cantidad"
                              onClick={() =>
                                actualizarCantidad(item.id, item.cantidad + 1)
                              }
                              disabled={
                                Number(item.cantidad) >= Number(item.stock)
                              }
                              aria-label={`Aumentar cantidad de ${item.nombre}`}
                            >
                              +
                            </button>
                          </div>
                          <span className="texto-pequeno text-muted">
                            Máximo {item.stock}
                          </span>
                        </td>
                        <td className="fw-semibold">
                          {formatearMoneda(calcularSubtotal(item))}
                        </td>
                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => quitar(item.id)}
                          >
                            <i
                              className="bi bi-trash"
                              aria-hidden="true"
                            />{" "}
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="d-flex justify-content-between mt-3">
              <Link className="btn btn-outline-marca" href="/productos">
                <i className="bi bi-arrow-left me-1" aria-hidden="true" />
                Seguir comprando
              </Link>
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={vaciar}
              >
                Vaciar carrito
              </button>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="carrito-resumen p-4 sticky-lg-top" style={{ top: "90px" }}>
              <h2 className="h5 titulo-seccion mb-3">Resumen</h2>

              <div className="d-flex justify-content-between mb-2">
                <span>Productos</span>
                <span>{cantidadTotal}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>{formatearMoneda(total)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Envío</span>
                <span>Gratis</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-semibold">Total</span>
                <span className="carrito-total">{formatearMoneda(total)}</span>
              </div>

              <Link className="btn btn-marca w-100" href="/comprar">
                Ir a pagar
              </Link>

              <p className="texto-pequeno text-muted mt-3 mb-0">
                El envío es gratis y también puedes retirar en Av. Sur 700,
                Maipú.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
