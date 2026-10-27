"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Cargando from "@/components/Cargando";
import ListaProductos from "@/components/ListaProductos";
import Mensaje from "@/components/Mensaje";
import {
  listarCategorias,
  listarProductos,
  listarStock,
  mensajeDeError,
} from "@/lib/api";
import { agregarAlCarrito } from "@/lib/carrito";
import { unirProductos } from "@/lib/datos";

function ContenidoProductos() {
  const searchParams = useSearchParams();
  const textoInicial = searchParams.get("q") || "";
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setCargando(true);
        setError("");
        const [listaProductos, listaCategorias, stock] = await Promise.all([
          listarProductos(),
          listarCategorias(),
          listarStock(),
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

  function agregar(producto) {
    agregarAlCarrito(producto, 1);
    setAviso(`Agregaste ${producto.nombre} al carrito.`);
  }

  return (
    <div className="container py-4 py-lg-5">
      <div className="mb-4">
        <h1 className="titulo-seccion">Productos</h1>
        <p className="subtitulo-seccion mb-0">
          Revisa nuestro catálogo, busca por nombre o SKU y filtra por categoría.
        </p>
      </div>

      {aviso ? (
        <Mensaje tipo="exito" onCerrar={() => setAviso("")}>
          {aviso}
        </Mensaje>
      ) : null}
      {error ? (
        <Mensaje tipo="error" onCerrar={() => setError("")}>
          {error}
        </Mensaje>
      ) : null}

      {cargando ? (
        <Cargando texto="Cargando productos..." />
      ) : (
        <ListaProductos
          productos={productos}
          categorias={categorias}
          onAgregar={agregar}
          textoInicial={textoInicial}
        />
      )}
    </div>
  );
}

export default function ProductosPage() {
  return (
    <Suspense fallback={<div className="container py-5"><Cargando texto="Cargando productos..." /></div>}>
      <ContenidoProductos />
    </Suspense>
  );
}
