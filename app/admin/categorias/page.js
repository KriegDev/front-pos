"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Cargando from "@/components/Cargando";
import Mensaje from "@/components/Mensaje";
import {
  eliminarCategoria,
  listarCategorias,
  listarProductos,
  mensajeDeError,
} from "@/lib/api";

export default function AdminCategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setCargando(true);
        setError("");
        const [listaCategorias, listaProductos] = await Promise.all([
          listarCategorias(),
          listarProductos(),
        ]);
        if (!activo) return;
        setCategorias(listaCategorias);
        setProductos(listaProductos);
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

  async function eliminar(categoria) {
    const cantidad = productos.filter(
      (producto) => Number(producto.categoria?.id) === Number(categoria.id)
    ).length;
    if (cantidad > 0) {
      setError(
        `No puedes eliminar "${categoria.nombre}" porque tiene ${cantidad} producto(s) asociado(s).`
      );
      return;
    }
    const confirmado = window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`);
    if (!confirmado) return;

    try {
      await eliminarCategoria(categoria.id);
      setCategorias((actuales) =>
        actuales.filter((item) => Number(item.id) !== Number(categoria.id))
      );
      setAviso(`Categoría "${categoria.nombre}" eliminada.`);
    } catch (problema) {
      setError(problema.message || "No se pudo eliminar la categoría.");
    }
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-4">
        <div>
          <h1 className="titulo-seccion mb-1">Categorías</h1>
          <p className="text-muted mb-0">
            Organiza los productos del catálogo por categoría.
          </p>
        </div>
        <Link className="btn btn-marca" href="/admin/categorias/nuevo">
          <i className="bi bi-plus-lg me-1" aria-hidden="true" />
          Nueva categoría
        </Link>
      </div>

      {error ? <Mensaje tipo="error" onCerrar={() => setError("")}>{error}</Mensaje> : null}
      {aviso ? <Mensaje tipo="exito" onCerrar={() => setAviso("")}>{aviso}</Mensaje> : null}

      {cargando ? (
        <Cargando texto="Cargando categorías..." />
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle tabla-admin mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Productos</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((categoria) => {
                  const cantidad = productos.filter(
                    (producto) =>
                      Number(producto.categoria?.id) === Number(categoria.id)
                  ).length;
                  return (
                    <tr key={categoria.id}>
                      <td>{categoria.id}</td>
                      <td className="fw-semibold">{categoria.nombre}</td>
                      <td>{cantidad}</td>
                      <td className="text-end text-nowrap">
                        <Link
                          className="btn btn-sm btn-outline-marca me-1"
                          href={`/admin/categorias/${categoria.id}/editar`}
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => eliminar(categoria)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
