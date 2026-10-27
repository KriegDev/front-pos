"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Cargando from "@/components/Cargando";
import Mensaje from "@/components/Mensaje";
import {
  listarCategorias,
  listarProductos,
  mensajeDeError,
} from "@/lib/api";
import { ICONOS_CATEGORIA } from "@/lib/constantes";

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setCargando(true);
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

  return (
    <div className="container py-4 py-lg-5">
      <h1 className="titulo-seccion">Categorías</h1>
      <p className="subtitulo-seccion mb-4">
        Explora los productos por categoría y encuentra lo que buscas.
      </p>

      {error ? <Mensaje tipo="error">{error}</Mensaje> : null}

      {cargando ? (
        <Cargando texto="Cargando categorías..." />
      ) : (
        <div className="row g-4 row-cols-1 row-cols-sm-2 row-cols-lg-3">
          {categorias.map((categoria) => {
            const cantidad = productos.filter(
              (producto) =>
                Number(producto.categoria?.id) === Number(categoria.id)
            ).length;
            return (
              <div className="col" key={categoria.id}>
                <div className="categoria-card card-body h-100 d-flex flex-column">
                  <i
                    className={`bi ${
                      ICONOS_CATEGORIA[categoria.nombre] || "bi-shop"
                    } categoria-icono`}
                    aria-hidden="true"
                  />
                  <h2 className="h5 mt-2">{categoria.nombre}</h2>
                  <p className="text-muted texto-pequeno flex-grow-1">
                    {cantidad} producto{cantidad === 1 ? "" : "s"} disponible
                    {cantidad === 1 ? "" : "s"}.
                  </p>
                  <Link
                    className="btn btn-outline-marca align-self-start"
                    href={`/categorias/${categoria.id}`}
                  >
                    Ver productos
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
