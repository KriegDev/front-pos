"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cargando from "@/components/Cargando";
import FormularioCategoria from "@/components/FormularioCategoria";
import Mensaje from "@/components/Mensaje";
import {
  actualizarCategoria,
  eliminarCategoria,
  listarCategorias,
  listarProductos,
  mensajeDeError,
  obtenerCategoria,
} from "@/lib/api";

export default function EditarCategoriaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [categoria, setCategoria] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setCargando(true);
        const datos = await obtenerCategoria(id);
        if (activo) setCategoria(datos);
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

  async function guardar(datos) {
    const categorias = await listarCategorias();
    const repetida = categorias.some(
      (item) =>
        Number(item.id) !== Number(categoria.id) &&
        item.nombre.toLowerCase() === datos.nombre.toLowerCase()
    );
    if (repetida) {
      throw new Error("Ya existe otra categoría con ese nombre.");
    }
    await actualizarCategoria(categoria.id, {
      ...categoria,
      nombre: datos.nombre,
    });
    router.push("/admin/categorias");
  }

  async function eliminar() {
    const productos = await listarProductos();
    const cantidad = productos.filter(
      (producto) => Number(producto.categoria?.id) === Number(categoria.id)
    ).length;
    if (cantidad > 0) {
      setError(
        `No puedes eliminar la categoría porque tiene ${cantidad} producto(s) asociado(s).`
      );
      return;
    }
    const confirmado = window.confirm(
      `¿Eliminar la categoría "${categoria.nombre}"?`
    );
    if (!confirmado) return;

    try {
      await eliminarCategoria(categoria.id);
      router.push("/admin/categorias");
    } catch (problema) {
      setError(problema.message || "No se pudo eliminar la categoría.");
    }
  }

  if (cargando) {
    return (
      <div className="container py-5">
        <Cargando texto="Cargando categoría..." />
      </div>
    );
  }

  if (error && !categoria) {
    return (
      <div>
        <Mensaje tipo="error">{error}</Mensaje>
        <Link className="btn btn-marca" href="/admin/categorias">
          Volver a categorías
        </Link>
      </div>
    );
  }

  return (
    <div>
      <nav aria-label="breadcrumb" className="migas mb-3">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <Link href="/admin/categorias">Categorías</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Editar categoría
          </li>
        </ol>
      </nav>

      <h1 className="titulo-seccion">Editar categoría</h1>
      <p className="text-muted mb-4">{categoria.nombre}</p>

      {error ? <Mensaje tipo="error" onCerrar={() => setError("")}>{error}</Mensaje> : null}

      <div className="card card-body shadow-sm">
        <FormularioCategoria categoriaInicial={categoria} onGuardar={guardar} />

        <hr className="my-4" />

        <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
          <Link className="btn btn-outline-marca" href="/admin/categorias">
            Cancelar
          </Link>
          <button type="button" className="btn btn-outline-danger" onClick={eliminar}>
            <i className="bi bi-trash me-1" aria-hidden="true" />
            Eliminar categoría
          </button>
        </div>
      </div>
    </div>
  );
}
