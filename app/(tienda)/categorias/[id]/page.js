"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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

export default function CategoriaDetallePage() {
  const params = useParams();
  const id = params?.id;
  const [categoria, setCategoria] = useState(null);
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
        const [categorias, listaProductos, stock] = await Promise.all([
          listarCategorias(),
          listarProductos(),
          listarStock(),
        ]);
        if (!activo) return;
        const encontrada = categorias.find(
          (item) => Number(item.id) === Number(id)
        );
        if (!encontrada) {
          setError("La categoría no existe.");
          setCategoria(null);
          setProductos([]);
          return;
        }
        setCategoria(encontrada);
        setProductos(
          unirProductos(
            listaProductos.filter(
              (producto) =>
                Number(producto.categoria?.id) === Number(encontrada.id)
            ),
            stock
          )
        );
      } catch (problema) {
        if (activo) setError(mensajeDeError(problema));
      } finally {
        if (activo) setCargando(false);
      }
    }

    if (id) cargar();
    return () => {
      activo = false;
    };
  }, [id]);

  function agregar(producto) {
    agregarAlCarrito(producto, 1);
    setAviso(`Agregaste ${producto.nombre} al carrito.`);
  }

  if (cargando) {
    return (
      <div className="container py-5">
        <Cargando texto="Cargando categoría..." />
      </div>
    );
  }

  if (error || !categoria) {
    return (
      <div className="container py-5">
        <Mensaje tipo="error">{error || "Categoría no encontrada."}</Mensaje>
        <Link className="btn btn-marca" href="/categorias">
          Volver a categorías
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4 py-lg-5">
      <nav aria-label="breadcrumb" className="migas mb-3">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <Link href="/">Inicio</Link>
          </li>
          <li className="breadcrumb-item">
            <Link href="/categorias">Categorías</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {categoria.nombre}
          </li>
        </ol>
      </nav>

      {aviso ? (
        <Mensaje tipo="exito" onCerrar={() => setAviso("")}>
          {aviso}
        </Mensaje>
      ) : null}

      <ListaProductos
        titulo={categoria.nombre}
        productos={productos}
        onAgregar={agregar}
        categoriaInicial={categoria.id}
        ocultarFiltroCategoria
      />
    </div>
  );
}
