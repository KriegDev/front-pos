"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cargando from "@/components/Cargando";
import FormularioProducto from "@/components/FormularioProducto";
import Mensaje from "@/components/Mensaje";
import {
  actualizarProducto,
  actualizarStock,
  crearStock,
  eliminarProducto,
  eliminarStock,
  listarCategorias,
  listarProductos,
  listarStock,
  mensajeDeError,
  obtenerProducto,
  siguienteId,
} from "@/lib/api";

export default function EditarProductoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [producto, setProducto] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setCargando(true);
        const [datosProducto, stock, listaCategorias] = await Promise.all([
          obtenerProducto(id),
          listarStock(),
          listarCategorias(),
        ]);
        if (!activo) return;
        const registro = stock.find(
          (item) => Number(item.idProducto) === Number(datosProducto.id)
        );
        setProducto({
          ...datosProducto,
          stock: registro ? Number(registro.cantidad) : 0,
          stockMinimo: registro ? Number(registro.stockMinimo) : 0,
          idStock: registro ? registro.id : null,
        });
        setCategorias(listaCategorias);
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
    const productos = await listarProductos();
    const skuRepetido = productos.some(
      (item) =>
        Number(item.id) !== Number(producto.id) &&
        String(item.sku).toLowerCase() === datos.sku.toLowerCase()
    );
    if (skuRepetido) {
      throw new Error("Ya existe otro producto con ese SKU.");
    }

    await actualizarProducto(producto.id, {
      ...producto,
      sku: datos.sku,
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      precioBase: datos.precioBase,
      precioOferta: datos.precioOferta,
      granel: datos.granel,
      categoria: datos.categoria,
      imagen: producto.imagen || "/imagenes/producto-sin-foto.png",
    });

    const stock = await listarStock();
    const registro = stock.find(
      (item) => Number(item.idProducto) === Number(producto.id)
    );
    if (registro) {
      await actualizarStock(registro.id, {
        ...registro,
        cantidad: datos.stock,
        stockMinimo: datos.stockMinimo,
      });
    } else {
      await crearStock({
        id: siguienteId(stock),
        idProducto: producto.id,
        cantidad: datos.stock,
        stockMinimo: datos.stockMinimo,
      });
    }

    router.push("/admin/productos");
  }

  async function eliminar() {
    const confirmado = window.confirm(
      `¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    try {
      if (producto.idStock) {
        await eliminarStock(producto.idStock);
      }
      await eliminarProducto(producto.id);
      router.push("/admin/productos");
    } catch (problema) {
      setError(problema.message || "No se pudo eliminar el producto.");
    }
  }

  if (cargando) {
    return (
      <div className="container py-5">
        <Cargando texto="Cargando producto..." />
      </div>
    );
  }

  if (error && !producto) {
    return (
      <div>
        <Mensaje tipo="error">{error}</Mensaje>
        <Link className="btn btn-marca" href="/admin/productos">
          Volver a productos
        </Link>
      </div>
    );
  }

  return (
    <div>
      <nav aria-label="breadcrumb" className="migas mb-3">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <Link href="/admin/productos">Productos</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Editar producto
          </li>
        </ol>
      </nav>

      <h1 className="titulo-seccion">Editar producto</h1>
      <p className="text-muted mb-4">{producto.nombre}</p>

      {error ? <Mensaje tipo="error" onCerrar={() => setError("")}>{error}</Mensaje> : null}

      <div className="card card-body shadow-sm">
        <FormularioProducto
          productoInicial={producto}
          categorias={categorias}
          onGuardar={guardar}
        />

        <hr className="my-4" />

        <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
          <Link className="btn btn-outline-marca" href="/admin/productos">
            Cancelar
          </Link>
          <button type="button" className="btn btn-outline-danger" onClick={eliminar}>
            <i className="bi bi-trash me-1" aria-hidden="true" />
            Eliminar producto
          </button>
        </div>
      </div>
    </div>
  );
}
