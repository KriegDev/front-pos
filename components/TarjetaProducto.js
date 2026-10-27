"use client";

import Link from "next/link";
import Boton from "./Boton";
import {
  formatearMoneda,
  porcentajeDescuento,
} from "@/lib/formato";
import { precioEfectivo, tieneOferta } from "@/lib/datos";

export default function TarjetaProducto({
  producto,
  onAgregar,
  mostrarEnlace = true,
  mostrarBoton = true,
}) {
  const oferta = tieneOferta(producto);
  const precio = precioEfectivo(producto);
  const descuento = porcentajeDescuento(
    producto.precioBase,
    producto.precioOferta
  );
  const stock = Number(producto.stock) || 0;

  return (
    <div className="card card-producto h-100">
      {mostrarEnlace ? (
        <Link
          href={`/productos/${producto.id}`}
          className="enlace-sin-estilo"
          aria-label={`Ver ${producto.nombre}`}
        >
          <img
            src={producto.imagen || "/imagenes/producto-sin-foto.png"}
            alt={producto.nombre}
            className="producto-imagen"
            loading="lazy"
          />
        </Link>
      ) : (
        <img
          src={producto.imagen || "/imagenes/producto-sin-foto.png"}
          alt={producto.nombre}
          className="producto-imagen"
          loading="lazy"
        />
      )}

      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
          <span className="badge text-bg-secondary">
            {producto.categoria?.nombre || "Sin categoría"}
          </span>
          {oferta ? (
            <span className="badge badge-oferta">-{descuento}%</span>
          ) : null}
        </div>

        {mostrarEnlace ? (
          <Link href={`/productos/${producto.id}`} className="enlace-sin-estilo">
            <h3 className="h6 producto-nombre mb-1">{producto.nombre}</h3>
          </Link>
        ) : (
          <h3 className="h6 producto-nombre mb-1">{producto.nombre}</h3>
        )}

        <p className="texto-pequeno text-muted flex-grow-1 mb-2">
          {producto.descripcion}
        </p>

        <div className="mb-2">
          {oferta ? (
            <div className="precio-anterior">
              {formatearMoneda(producto.precioBase)}
            </div>
          ) : null}
          <div className={oferta ? "precio-oferta" : "precio-normal"}>
            {formatearMoneda(precio)}
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center gap-2">
          <span
            className={`badge badge-stock ${
              stock > 0 ? "text-bg-success" : "text-bg-danger"
            }`}
          >
            {stock > 0 ? `Stock: ${stock}` : "Sin stock"}
          </span>

          {mostrarBoton && onAgregar ? (
            <Boton
              variante="marca"
              className="btn-sm"
              onClick={() => onAgregar(producto)}
              disabled={stock <= 0}
              aria-label={`Agregar ${producto.nombre} al carrito`}
            >
              Agregar
            </Boton>
          ) : null}
        </div>
      </div>
    </div>
  );
}
