"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormularioCategoria from "@/components/FormularioCategoria";
import Mensaje from "@/components/Mensaje";
import {
  crearCategoria,
  listarCategorias,
  siguienteId,
} from "@/lib/api";

export default function NuevaCategoriaPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function guardar(datos) {
    const categorias = await listarCategorias();
    const repetida = categorias.some(
      (categoria) =>
        categoria.nombre.toLowerCase() === datos.nombre.toLowerCase()
    );
    if (repetida) {
      throw new Error("Ya existe una categoría con ese nombre.");
    }
    await crearCategoria({ id: siguienteId(categorias), nombre: datos.nombre });
    router.push("/admin/categorias");
  }

  return (
    <div>
      <nav aria-label="breadcrumb" className="migas mb-3">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <Link href="/admin/categorias">Categorías</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Nueva categoría
          </li>
        </ol>
      </nav>

      <h1 className="titulo-seccion">Nueva categoría</h1>
      <p className="text-muted mb-4">Crea una categoría para agrupar productos.</p>

      {error ? <Mensaje tipo="error">{error}</Mensaje> : null}

      <div className="card card-body shadow-sm">
        <FormularioCategoria onGuardar={guardar} esNueva />
      </div>
    </div>
  );
}
