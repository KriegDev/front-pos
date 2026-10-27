"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Boton from "@/components/Boton";
import Cargando from "@/components/Cargando";
import Mensaje from "@/components/Mensaje";
import {
  listarStock,
  mensajeDeError,
  obtenerProducto,
} from "@/lib/api";
import { agregarAlCarrito } from "@/lib/carrito";
import { formatearMoneda, porcentajeDescuento } from "@/lib/formato";
import { precioEfectivo, tieneOferta } from "@/lib/datos";

export default function DetalleProductoPage() {
  const params = useParams();
  const id = params?.id;
  const [producto, setProducto] = useState(null);
  const [stock, setStock] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setCargando(true);
        setError("");
        const [datosProducto, listaStock] = await Promise.all([
          obtenerProducto(id),
          listarStock(),
        ]);
        if (!activo) return;
        const registro = listaStock.find(
          (item) => Number(item.idProducto) === Number(datosProducto.id)
        );
        setProducto(datosProducto);
        setStock(registro ? Number(registro.cantidad) : 0);
      } catch (problema) {
        if (activo) {
          setError(
            problema?.message?.includes("404")
              ? "El producto no existe o ya no está disponible."
              : mensajeDeError(problema)
          );
        }
      } finally {
        if (activo) setCargando(false);
      }
    }

    if (id) cargar();
    return () => {
      activo = false;
    };
  }, [id]);

  function agregar() {
    if (!producto) return;
    agregarAlCarrito({ ...producto, stock }, cantidad);
    setAviso(`Agregaste ${cantidad} × ${producto.nombre} al carrito.`);
  }

  if (cargando) {
    return (
      <div className="container py-5">
        <Cargando texto="Cargando producto..." />
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="container py-5">
        <Mensaje tipo="error">{error || "Producto no encontrado."}</Mensaje>
        <Link className="btn btn-marca" href="/productos">
          Volver a productos
        </Link>
      </div>
    );
  }

  const oferta = tieneOferta(producto);
  const precio = precioEfectivo(producto);
  const descuento = porcentajeDescuento(
    producto.precioBase,
    producto.precioOferta
  );

  return (
    <div className="container py-4 py-lg-5">
      <nav aria-label="breadcrumb" className="migas mb-3">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <Link href="/">Inicio</Link>
          </li>
          <li className="breadcrumb-item">
            <Link href="/productos">Productos</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {producto.nombre}
          </li>
        </ol>
      </nav>

      {aviso ? (
        <Mensaje tipo="exito" onCerrar={() => setAviso("")}>
          {aviso}{" "}
          <Link href="/carrito" className="alert-link">
            Ir al carrito
          </Link>
        </Mensaje>
      ) : null}

      <div className="row g-4 align-items-start">
        <div className="col-12 col-lg-5">
          <div className="card card-producto p-3">
            <img
              src={producto.imagen || "/imagenes/producto-sin-foto.png"}
              alt={producto.nombre}
              className="img-fluid"
              style={{ maxHeight: "360px", objectFit: "contain" }}
            />
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <span className="badge text-bg-secondary mb-2">
            {producto.categoria?.nombre || "Sin categoría"}
          </span>
          <h1 className="titulo-seccion">{producto.nombre}</h1>
          <p className="text-muted">{producto.descripcion}</p>

          <div className="d-flex align-items-end gap-3 mb-3">
            {oferta ? (
              <div>
                <div className="precio-anterior">
                  {formatearMoneda(producto.precioBase)}
                </div>
                <div className="precio-oferta">{formatearMoneda(precio)}</div>
              </div>
            ) : (
              <div className="precio-normal">{formatearMoneda(precio)}</div>
            )}
            {oferta ? (
              <span className="badge badge-oferta mb-2">-{descuento}%</span>
            ) : null}
          </div>

          <ul className="list-unstyled texto-pequeno text-muted mb-4">
            <li className="mb-1">
              <strong>SKU:</strong> {producto.sku}
            </li>
            <li className="mb-1">
              <strong>Venta:</strong>{" "}
              {producto.granel ? "A granel" : "Unidad cerrada"}
            </li>
            <li>
              <strong>Stock disponible:</strong>{" "}
              {stock > 0 ? `${stock} unidades` : "Sin stock"}
            </li>
          </ul>

          {stock > 0 ? (
            <div className="d-flex flex-wrap align-items-end gap-2">
              <div>
                <label className="form-label" htmlFor="cantidadProducto">
                  Cantidad
                </label>
                <input
                  id="cantidadProducto"
                  type="number"
                  className="form-control"
                  min="1"
                  max={stock}
                  value={cantidad}
                  onChange={(evento) =>
                    setCantidad(
                      Math.max(
                        1,
                        Math.min(Number(evento.target.value) || 1, stock)
                      )
                    )
                  }
                  style={{ maxWidth: "120px" }}
                />
              </div>
              <Boton variante="marca" onClick={agregar}>
                <i className="bi bi-cart-plus me-2" aria-hidden="true" />
                Agregar al carrito
              </Boton>
              <Link className="btn btn-outline-marca" href="/carrito">
                Ver carrito
              </Link>
            </div>
          ) : (
            <div className="alert alert-warning">
              Este producto está sin stock. Vuelve a revisar más tarde.
            </div>
          )}

          <div className="mt-4">
            <Link className="btn btn-link px-0" href="/productos">
              <i className="bi bi-arrow-left me-1" aria-hidden="true" />
              Volver a productos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
