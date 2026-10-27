"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Cargando from "@/components/Cargando";
import Mensaje from "@/components/Mensaje";
import {
  eliminarProducto,
  eliminarStock,
  listarCategorias,
  listarProductos,
  listarStock,
  mensajeDeError,
} from "@/lib/api";
import { formatearMoneda } from "@/lib/formato";
import { unirProductos } from "@/lib/datos";

export default function AdminProductosPage() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setCargando(true);
        setError("");
        const [listaProductos, stock, listaCategorias] = await Promise.all([
          listarProductos(),
          listarStock(),
          listarCategorias(),
        ]);
        if (!activo) return;
        setProductos(unirProductos(listaProductos, stock));
        setCategorias(listaCategorias);
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

  async function eliminar(producto) {
    const confirmado = window.confirm(
      `¿Eliminar "${producto.nombre}"? También se eliminará su registro de stock.`
    );
    if (!confirmado) return;

    try {
      if (producto.idStock) {
        await eliminarStock(producto.idStock);
      }
      await eliminarProducto(producto.id);
      setProductos((actuales) =>
        actuales.filter((item) => Number(item.id) !== Number(producto.id))
      );
      setAviso(`Producto "${producto.nombre}" eliminado.`);
    } catch (problema) {
      setError(problema.message || "No se pudo eliminar el producto.");
    }
  }

  const filtrados = productos.filter((producto) => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return true;
    return [producto.nombre, producto.sku, producto.categoria?.nombre]
      .filter(Boolean)
      .some((valor) => String(valor).toLowerCase().includes(texto));
  });

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-4">
        <div>
          <h1 className="titulo-seccion mb-1">Productos</h1>
          <p className="text-muted mb-0">
            Administra el catálogo, los precios y el stock.
          </p>
        </div>
        <Link className="btn btn-marca" href="/admin/productos/nuevo">
          <i className="bi bi-plus-lg me-1" aria-hidden="true" />
          Nuevo producto
        </Link>
      </div>

      {error ? <Mensaje tipo="error" onCerrar={() => setError("")}>{error}</Mensaje> : null}
      {aviso ? <Mensaje tipo="exito" onCerrar={() => setAviso("")}>{aviso}</Mensaje> : null}

      <div className="card card-body shadow-sm mb-3">
        <label className="form-label" htmlFor="adminBuscarProducto">
          Buscar producto
        </label>
        <input
          id="adminBuscarProducto"
          className="form-control"
          type="search"
          placeholder="Nombre, SKU o categoría"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
        />
      </div>

      {cargando ? (
        <Cargando texto="Cargando productos..." />
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle tabla-admin mb-0">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>SKU</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Oferta</th>
                  <th>Stock</th>
                  <th>Mínimo</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((producto) => (
                  <tr key={producto.id}>
                    <td>
                      <img
                        src={producto.imagen || "/imagenes/producto-sin-foto.png"}
                        alt={producto.nombre}
                        className="img-miniatura"
                      />
                    </td>
                    <td>{producto.sku}</td>
                    <td>
                      <span className="fw-semibold">{producto.nombre}</span>
                      <span className="d-block texto-pequeno text-muted">
                        {producto.granel ? "Granel" : "Unidad"}
                      </span>
                    </td>
                    <td>{producto.categoria?.nombre || "—"}</td>
                    <td>{formatearMoneda(producto.precioBase)}</td>
                    <td>
                      {producto.precioOferta ? (
                        <span className="text-marca fw-semibold">
                          {formatearMoneda(producto.precioOferta)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          Number(producto.stock) <= Number(producto.stockMinimo)
                            ? "text-bg-danger"
                            : "text-bg-success"
                        }`}
                      >
                        {producto.stock}
                      </span>
                    </td>
                    <td>{producto.stockMinimo}</td>
                    <td className="text-end text-nowrap">
                      <Link
                        className="btn btn-sm btn-outline-marca me-1"
                        href={`/admin/productos/${producto.id}/editar`}
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => eliminar(producto)}
                      >
                        Eliminar
                      </button>
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
          No se encontraron productos. Crea el primero con el botón “Nuevo
          producto”.
        </div>
      ) : null}

      <p className="texto-pequeno text-muted mt-3 mb-0">
        Categorías registradas: {categorias.length}.
      </p>
    </div>
  );
}
