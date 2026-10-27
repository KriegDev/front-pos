"use client";

import { useState } from "react";
import Boton from "./Boton";
import Mensaje from "./Mensaje";
import { validarEntero } from "@/lib/validaciones";

function estadoInicial(producto, categorias) {
  return {
    sku: producto?.sku || "",
    nombre: producto?.nombre || "",
    descripcion: producto?.descripcion || "",
    precioBase: producto?.precioBase ?? "",
    precioOferta: producto?.precioOferta ?? "",
    idCategoria:
      producto?.categoria?.id ?? (categorias[0] ? categorias[0].id : ""),
    granel: Boolean(producto?.granel),
    stock: producto?.stock ?? 0,
    stockMinimo: producto?.stockMinimo ?? 5,
  };
}

export default function FormularioProducto({
  productoInicial = null,
  categorias = [],
  onGuardar,
  esNuevo = false,
  textoBoton,
}) {
  const [form, setForm] = useState(() =>
    estadoInicial(productoInicial, categorias)
  );
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  function cambiar(evento) {
    const { name, value, type, checked } = evento.target;
    setForm((actual) => ({
      ...actual,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    setError("");

    if (!form.sku.trim()) {
      setError("El SKU es obligatorio.");
      return;
    }
    if (form.nombre.trim().length < 3) {
      setError("El nombre debe tener al menos 3 caracteres.");
      return;
    }
    if (form.descripcion.trim().length < 5) {
      setError("La descripción debe tener al menos 5 caracteres.");
      return;
    }
    if (!validarEntero(form.precioBase, { min: 1 })) {
      setError("El precio base debe ser un número entero mayor que cero.");
      return;
    }
    if (form.precioOferta !== "" && form.precioOferta !== null) {
      if (!validarEntero(form.precioOferta, { min: 1 })) {
        setError("El precio de oferta debe ser un número entero mayor que cero.");
        return;
      }
      if (Number(form.precioOferta) >= Number(form.precioBase)) {
        setError("El precio de oferta debe ser menor que el precio base.");
        return;
      }
    }
    if (!form.idCategoria) {
      setError("Selecciona una categoría.");
      return;
    }
    if (!validarEntero(form.stock, { min: 0 })) {
      setError("El stock actual debe ser un entero mayor o igual a cero.");
      return;
    }
    if (!validarEntero(form.stockMinimo, { min: 0 })) {
      setError("El stock mínimo debe ser un entero mayor o igual a cero.");
      return;
    }

    const datos = {
      sku: form.sku.trim(),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precioBase: Number(form.precioBase),
      precioOferta:
        form.precioOferta === "" || form.precioOferta === null
          ? null
          : Number(form.precioOferta),
      categoria: {
        id: Number(form.idCategoria),
        nombre:
          categorias.find(
            (categoria) => Number(categoria.id) === Number(form.idCategoria)
          )?.nombre || "",
      },
      granel: Boolean(form.granel),
      stock: Number(form.stock),
      stockMinimo: Number(form.stockMinimo),
    };

    try {
      setEnviando(true);
      await onGuardar(datos);
    } catch (problema) {
      setError(problema.message || "No se pudo guardar el producto.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} noValidate>
      {error ? <Mensaje tipo="error">{error}</Mensaje> : null}

      <div className="row g-3">
        <div className="col-12 col-md-4">
          <label className="form-label" htmlFor="productoSku">
            SKU
          </label>
          <input
            id="productoSku"
            name="sku"
            className="form-control"
            value={form.sku}
            onChange={cambiar}
            required
          />
        </div>

        <div className="col-12 col-md-8">
          <label className="form-label" htmlFor="productoNombre">
            Nombre
          </label>
          <input
            id="productoNombre"
            name="nombre"
            className="form-control"
            value={form.nombre}
            onChange={cambiar}
            required
          />
        </div>

        <div className="col-12">
          <label className="form-label" htmlFor="productoDescripcion">
            Descripción
          </label>
          <textarea
            id="productoDescripcion"
            name="descripcion"
            className="form-control"
            rows="2"
            value={form.descripcion}
            onChange={cambiar}
            required
          />
        </div>

        <div className="col-12 col-md-4">
          <label className="form-label" htmlFor="productoPrecio">
            Precio base
          </label>
          <input
            id="productoPrecio"
            name="precioBase"
            type="number"
            min="1"
            step="1"
            className="form-control"
            value={form.precioBase}
            onChange={cambiar}
            required
          />
        </div>

        <div className="col-12 col-md-4">
          <label className="form-label" htmlFor="productoOferta">
            Precio de oferta
          </label>
          <input
            id="productoOferta"
            name="precioOferta"
            type="number"
            min="1"
            step="1"
            className="form-control"
            placeholder="Opcional"
            value={form.precioOferta ?? ""}
            onChange={cambiar}
          />
        </div>

        <div className="col-12 col-md-4">
          <label className="form-label" htmlFor="productoCategoria">
            Categoría
          </label>
          <select
            id="productoCategoria"
            name="idCategoria"
            className="form-select"
            value={form.idCategoria}
            onChange={cambiar}
            required
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="col-6 col-md-3">
          <label className="form-label" htmlFor="productoStock">
            Stock actual
          </label>
          <input
            id="productoStock"
            name="stock"
            type="number"
            min="0"
            step="1"
            className="form-control"
            value={form.stock}
            onChange={cambiar}
            required
          />
        </div>

        <div className="col-6 col-md-3">
          <label className="form-label" htmlFor="productoStockMinimo">
            Stock mínimo
          </label>
          <input
            id="productoStockMinimo"
            name="stockMinimo"
            type="number"
            min="0"
            step="1"
            className="form-control"
            value={form.stockMinimo}
            onChange={cambiar}
            required
          />
        </div>

        <div className="col-12 col-md-6 d-flex align-items-end">
          <div className="form-check mb-2">
            <input
              id="productoGranel"
              name="granel"
              type="checkbox"
              className="form-check-input"
              checked={form.granel}
              onChange={cambiar}
            />
            <label className="form-check-label" htmlFor="productoGranel">
              Se vende a granel
            </label>
          </div>
        </div>
      </div>

      <div className="d-flex gap-2 mt-4">
        <Boton type="submit" variante="marca" disabled={enviando}>
          {enviando
            ? "Guardando..."
            : textoBoton || (esNuevo ? "Crear producto" : "Guardar cambios")}
        </Boton>
      </div>
    </form>
  );
}
