"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Boton from "@/components/Boton";
import Cargando from "@/components/Cargando";
import Mensaje from "@/components/Mensaje";
import TarjetaProducto from "@/components/TarjetaProducto";
import {
  listarCategorias,
  listarClientes,
  listarMetodosPago,
  listarProductos,
  listarStock,
  mensajeDeError,
} from "@/lib/api";
import { formatearMoneda } from "@/lib/formato";
import { nombreCliente, precioEfectivo, runCliente, unirProductos } from "@/lib/datos";
import { registrarVenta } from "@/lib/ventas";
import { separarRun } from "@/lib/validaciones";

export default function AdminVentasPage() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [items, setItems] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("");
  const [clienteRun, setClienteRun] = useState("");
  const [cliente, setCliente] = useState(null);
  const [mensajeCliente, setMensajeCliente] = useState("");
  const [idMetodoPago, setIdMetodoPago] = useState("");
  const [cargando, setCargando] = useState(true);
  const [cobrando, setCobrando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setCargando(true);
        setError("");
        const [listaProductos, stock, listaCategorias, listaClientes, metodos] =
          await Promise.all([
            listarProductos(),
            listarStock(),
            listarCategorias(),
            listarClientes(),
            listarMetodosPago(),
          ]);
        if (!activo) return;
        setProductos(unirProductos(listaProductos, stock));
        setCategorias(listaCategorias);
        setClientes(listaClientes);
        const activos = (metodos || []).filter(
          (metodo) => metodo.activo !== false
        );
        setMetodosPago(activos);
        setIdMetodoPago(activos[0]?.id || "");
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

  async function refrescarCatalogo() {
    try {
      const [listaProductos, stock] = await Promise.all([
        listarProductos(),
        listarStock(),
      ]);
      setProductos(unirProductos(listaProductos, stock));
    } catch {
      // Si falla, se mantiene el catálogo anterior.
    }
  }

  function agregar(producto) {
    setItems((actuales) => {
      const existente = actuales.find(
        (item) => Number(item.id) === Number(producto.id)
      );
      if (existente) {
        return actuales.map((item) =>
          Number(item.id) === Number(producto.id)
            ? {
                ...item,
                cantidad: Math.min(
                  Number(item.cantidad) + 1,
                  Number(producto.stock)
                ),
              }
            : item
        );
      }
      if (Number(producto.stock) <= 0) return actuales;
      return [
        ...actuales,
        {
          id: Number(producto.id),
          nombre: producto.nombre,
          precio: precioEfectivo(producto),
          stock: Number(producto.stock),
          cantidad: 1,
          imagen: producto.imagen,
        },
      ];
    });
    setExito("");
  }

  function cambiarCantidad(id, cantidad) {
    setItems((actuales) =>
      actuales.map((item) =>
        Number(item.id) === Number(id)
          ? {
              ...item,
              cantidad: Math.max(
                1,
                Math.min(Number(cantidad) || 1, Number(item.stock))
              ),
            }
          : item
      )
    );
  }

  function quitar(id) {
    setItems((actuales) =>
      actuales.filter((item) => Number(item.id) !== Number(id))
    );
  }

  function buscarCliente() {
    setMensajeCliente("");
    const { run } = separarRun(clienteRun);
    if (!run) {
      setCliente(null);
      setMensajeCliente("Escribe un RUN válido para buscar.");
      return;
    }
    const encontrado = clientes.find(
      (registro) => Number(registro.run) === Number(run)
    );
    if (!encontrado) {
      setCliente(null);
      setMensajeCliente("No encontramos ese RUN. La venta quedará como invitado.");
      return;
    }
    if (!encontrado.activo) {
      setCliente(null);
      setMensajeCliente("El cliente está inactivo. No se puede usar en la venta.");
      return;
    }
    setCliente(encontrado);
    setMensajeCliente("");
  }

  async function cobrar() {
    setError("");
    setExito("");

    if (items.length === 0) {
      setError("Agrega al menos un producto a la venta.");
      return;
    }
    if (!idMetodoPago) {
      setError("Selecciona un medio de pago.");
      return;
    }

    try {
      setCobrando(true);
      const { orden } = await registrarVenta({
        items,
        idCliente: cliente?.id || null,
        idMetodoPago,
        entrega: "RETIRO",
        estadoInicial: "PAGADO",
      });
      setExito(
        `Venta #${orden.numeroOrden} registrada por ${formatearMoneda(
          orden.montoTotal
        )}.`
      );
      setItems([]);
      setCliente(null);
      setClienteRun("");
      setMensajeCliente("");
      await refrescarCatalogo();
    } catch (problema) {
      setError(problema.message || "No se pudo registrar la venta.");
    } finally {
      setCobrando(false);
    }
  }

  const filtrados = productos.filter((producto) => {
    const texto = busqueda.trim().toLowerCase();
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

  const total = items.reduce(
    (suma, item) => suma + Number(item.precio) * Number(item.cantidad),
    0
  );

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-4">
        <div>
          <h1 className="titulo-seccion mb-1">Nueva venta</h1>
          <p className="text-muted mb-0">
            Punto de venta interno: agrega productos, busca al cliente y cobra.
          </p>
        </div>
        <Link className="btn btn-outline-marca" href="/admin">
          Volver al dashboard
        </Link>
      </div>

      {error ? <Mensaje tipo="error" onCerrar={() => setError("")}>{error}</Mensaje> : null}
      {exito ? <Mensaje tipo="exito" onCerrar={() => setExito("")}>{exito}</Mensaje> : null}

      <div className="row g-4">
        <div className="col-12 col-xl-7">
          <div className="card card-body shadow-sm mb-3">
            <div className="row g-2">
              <div className="col-12 col-md-7">
                <label className="form-label" htmlFor="posBuscar">
                  Buscar producto
                </label>
                <input
                  id="posBuscar"
                  className="form-control"
                  type="search"
                  placeholder="Nombre, SKU o descripción"
                  value={busqueda}
                  onChange={(evento) => setBusqueda(evento.target.value)}
                />
              </div>
              <div className="col-12 col-md-5">
                <label className="form-label" htmlFor="posCategoria">
                  Categoría
                </label>
                <select
                  id="posCategoria"
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
            </div>
          </div>

          {cargando ? (
            <Cargando texto="Cargando catálogo..." />
          ) : filtrados.length === 0 ? (
            <div className="alert alert-warning">
              No hay productos que coincidan con la búsqueda.
            </div>
          ) : (
            <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-xxl-3">
              {filtrados.map((producto) => (
                <div className="col" key={producto.id}>
                  <TarjetaProducto
                    producto={producto}
                    onAgregar={agregar}
                    mostrarEnlace={false}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-12 col-xl-5">
          <div className="card card-body shadow-sm sticky-xl-top" style={{ top: "80px" }}>
            <h2 className="h5 titulo-seccion mb-3">Detalle de la venta</h2>

            <div className="mb-3">
              <label className="form-label" htmlFor="posClienteRun">
                Cliente por RUN
              </label>
              <div className="input-group">
                <input
                  id="posClienteRun"
                  className="form-control"
                  value={clienteRun}
                  onChange={(evento) => setClienteRun(evento.target.value)}
                  placeholder="12345678-9"
                />
                <button
                  type="button"
                  className="btn btn-outline-marca"
                  onClick={buscarCliente}
                >
                  Buscar
                </button>
              </div>
              {mensajeCliente ? (
                <p className="texto-pequeno text-danger mt-1 mb-0">
                  {mensajeCliente}
                </p>
              ) : null}
              <p className="texto-pequeno text-muted mt-1 mb-0">
                {cliente
                  ? `Cliente: ${nombreCliente(cliente)} (${runCliente(cliente)})`
                  : "Venta como cliente invitado."}
              </p>
            </div>

            {items.length === 0 ? (
              <div className="alert alert-info">
                Agrega productos desde el catálogo para comenzar.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cant.</th>
                      <th>Precio</th>
                      <th className="text-end">Subtotal</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.nombre}</td>
                        <td>
                          <div className="d-flex align-items-center gap-1">
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-cantidad"
                              onClick={() =>
                                cambiarCantidad(item.id, item.cantidad - 1)
                              }
                              disabled={Number(item.cantidad) <= 1}
                            >
                              −
                            </button>
                            <span className="px-1">{item.cantidad}</span>
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-cantidad"
                              onClick={() =>
                                cambiarCantidad(item.id, item.cantidad + 1)
                              }
                              disabled={Number(item.cantidad) >= Number(item.stock)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td>{formatearMoneda(item.precio)}</td>
                        <td className="text-end">
                          {formatearMoneda(
                            Number(item.precio) * Number(item.cantidad)
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => quitar(item.id)}
                            aria-label={`Quitar ${item.nombre}`}
                          >
                            <i className="bi bi-x" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="d-flex justify-content-between align-items-center my-3">
              <span className="fw-semibold">Total</span>
              <span className="carrito-total">{formatearMoneda(total)}</span>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="posMetodoPago">
                Medio de pago
              </label>
              <select
                id="posMetodoPago"
                className="form-select"
                value={idMetodoPago}
                onChange={(evento) => setIdMetodoPago(evento.target.value)}
              >
                {metodosPago.map((metodo) => (
                  <option key={metodo.id} value={metodo.id}>
                    {metodo.nombre === "CREDITO"
                      ? "Tarjeta de crédito"
                      : metodo.nombre === "DEBITO"
                        ? "Tarjeta de débito"
                        : metodo.nombre === "EFECTIVO"
                          ? "Efectivo"
                          : "Pago en línea (Flow)"}
                  </option>
                ))}
              </select>
            </div>

            <Boton
              variante="marca"
              className="w-100"
              onClick={cobrar}
              disabled={cobrando || items.length === 0}
            >
              {cobrando
                ? "Registrando venta..."
                : `Cobrar ${formatearMoneda(total)}`}
            </Boton>

            <p className="texto-pequeno text-muted mt-3 mb-0">
              La venta descuenta stock y crea la orden y el pago en json-server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
