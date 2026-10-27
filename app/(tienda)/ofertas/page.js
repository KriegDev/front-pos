"use client";

import { useEffect, useState } from "react";
import Cargando from "@/components/Cargando";
import Mensaje from "@/components/Mensaje";
import TarjetaProducto from "@/components/TarjetaProducto";
import {
  listarProductos,
  listarStock,
  mensajeDeError,
} from "@/lib/api";
import { agregarAlCarrito } from "@/lib/carrito";
import { tieneOferta, unirProductos } from "@/lib/datos";

export default function OfertasPage() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setCargando(true);
        const [listaProductos, stock] = await Promise.all([
          listarProductos(),
          listarStock(),
        ]);
        if (!activo) return;
        setProductos(
          unirProductos(listaProductos, stock).filter(tieneOferta)
        );
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
      <div className="p-4 p-lg-5 rounded-4 bg-marca text-white mb-4">
        <span className="hero-etiqueta mb-3">Promoción de la semana</span>
        <h1 className="mb-2">Las mejores ofertas de la semana</h1>
        <p className="mb-0">
          Productos seleccionados con un 10% de descuento sobre su precio base.
        </p>
      </div>

      {aviso ? (
        <Mensaje tipo="exito" onCerrar={() => setAviso("")}>
          {aviso}
        </Mensaje>
      ) : null}
      {error ? <Mensaje tipo="error">{error}</Mensaje> : null}

      {cargando ? (
        <Cargando texto="Cargando ofertas..." />
      ) : productos.length === 0 ? (
        <div className="alert alert-info">
          Por ahora no hay ofertas activas. Revisa el catálogo completo.
        </div>
      ) : (
        <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4">
          {productos.map((producto) => (
            <div className="col" key={producto.id}>
              <TarjetaProducto producto={producto} onAgregar={agregar} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
