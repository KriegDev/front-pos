"use client";

import { useEffect, useMemo, useState } from "react";
import TarjetaProducto from "./TarjetaProducto";
import { precioEfectivo } from "@/lib/datos";

export default function ListaProductos({
  productos,
  categorias = [],
  onAgregar,
  textoInicial = "",
  categoriaInicial = "",
  ocultarFiltroCategoria = false,
  titulo,
}) {
  const [busqueda, setBusqueda] = useState(textoInicial);
  const [categoria, setCategoria] = useState(String(categoriaInicial || ""));
  const [orden, setOrden] = useState("nombre");

  useEffect(() => {
    setBusqueda(textoInicial);
  }, [textoInicial]);

  useEffect(() => {
    setCategoria(String(categoriaInicial || ""));
  }, [categoriaInicial]);

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return productos.filter((producto) => {
      const coincideTexto =
        !texto ||
        [producto.nombre, producto.sku, producto.descripcion]
          .filter(Boolean)
          .some((valor) => String(valor).toLowerCase().includes(texto));
      const coincideCategoria =
        !categoria ||
        Number(producto.categoria?.id) === Number(categoria);
      return coincideTexto && coincideCategoria;
    });
  }, [productos, busqueda, categoria]);

  const ordenados = useMemo(() => {
    const copia = [...filtrados];
    if (orden === "precio-asc") {
      copia.sort((a, b) => precioEfectivo(a) - precioEfectivo(b));
    } else if (orden === "precio-desc") {
      copia.sort((a, b) => precioEfectivo(b) - precioEfectivo(a));
    } else {
      copia.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
    return copia;
  }, [filtrados, orden]);

  return (
    <section>
      {titulo ? <h2 className="h4 titulo-seccion mb-3">{titulo}</h2> : null}

      <div className="card card-body mb-4 shadow-sm">
        <div className="row g-2 align-items-end">
          <div className={ocultarFiltroCategoria ? "col-12 col-md-8" : "col-12 col-md-5"}>
            <label className="form-label" htmlFor="buscarProducto">
              Buscar
            </label>
            <input
              id="buscarProducto"
              className="form-control"
              type="search"
              placeholder="Nombre, SKU o descripción"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
            />
          </div>

          {!ocultarFiltroCategoria ? (
            <div className="col-6 col-md-3">
              <label className="form-label" htmlFor="filtrarCategoria">
                Categoría
              </label>
              <select
                id="filtrarCategoria"
                className="form-select"
                value={categoria}
                onChange={(evento) => setCategoria(evento.target.value)}
              >
                <option value="">Todas</option>
                {categorias.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className={ocultarFiltroCategoria ? "col-12 col-md-4" : "col-6 col-md-4"}>
            <label className="form-label" htmlFor="ordenarProductos">
              Ordenar
            </label>
            <select
              id="ordenarProductos"
              className="form-select"
              value={orden}
              onChange={(evento) => setOrden(evento.target.value)}
            >
              <option value="nombre">Nombre (A-Z)</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
            </select>
          </div>
        </div>
      </div>

      <p className="text-muted texto-pequeno">
        Mostrando {ordenados.length} de {productos.length} productos.
      </p>

      {ordenados.length === 0 ? (
        <div className="alert alert-warning">
          No se encontraron productos con esos filtros.
        </div>
      ) : (
        <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4">
          {ordenados.map((producto) => (
            <div className="col" key={producto.id}>
              <TarjetaProducto producto={producto} onAgregar={onAgregar} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
