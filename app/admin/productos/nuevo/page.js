"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cargando from "@/components/Cargando";
import FormularioProducto from "@/components/FormularioProducto";
import Mensaje from "@/components/Mensaje";
import {
  crearProducto,
  crearStock,
  listarCategorias,
  listarProductos,
  listarStock,
  mensajeDeError,
  siguienteId,
} from "@/lib/api";

export default function NuevoProductoPage() {
  const router = useRouter();
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setCargando(true);
        const lista = await listarCategorias();
        if (activo) setCategorias(lista);
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

  async function guardar(datos) {
    const [productos, stock] = await Promise.all([
      listarProductos(),
      listarStock(),
    ]);

    const skuRepetido = productos.some(
      (producto) =>
        String(producto.sku).toLowerCase() === datos.sku.toLowerCase()
    );
    if (skuRepetido) {
      throw new Error("Ya existe un producto con ese SKU.");
    }

    const nuevo = await crearProducto({
      id: siguienteId(productos),
      sku: datos.sku,
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      precioBase: datos.precioBase,
      precioOferta: datos.precioOferta,
      granel: datos.granel,
      categoria: datos.categoria,
      imagen: "/imagenes/producto-sin-foto.png",
    });

    await crearStock({
      id: siguienteId(stock),
      idProducto: nuevo.id,
      cantidad: datos.stock,
      stockMinimo: datos.stockMinimo,
    });

    router.push("/admin/productos");
  }

  return (
    <div>
      <nav aria-label="breadcrumb" className="migas mb-3">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <Link href="/admin/productos">Productos</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Nuevo producto
          </li>
        </ol>
      </nav>

      <h1 className="titulo-seccion">Nuevo producto</h1>
      <p className="text-muted mb-4">
        Completa los datos del producto y su stock inicial.
      </p>

      {error ? <Mensaje tipo="error">{error}</Mensaje> : null}

      <div className="card card-body shadow-sm">
        {cargando ? (
          <Cargando texto="Cargando categorías..." />
        ) : (
          <FormularioProducto
            categorias={categorias}
            onGuardar={guardar}
            esNuevo
          />
        )}
      </div>
    </div>
  );
}
