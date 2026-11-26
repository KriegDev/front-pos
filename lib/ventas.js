import {
  actualizarOrden,
  buscarPagoPorOrden,
  crearMovimiento,
  crearOrden,
  obtenerOrden,
  siguienteNumeroOrden,
} from "./api";

/*
 * Registro de una venta completa.
 *
 * Antes todo esto se hacía en el navegador: se inventaba el id, se armaba la
 * orden, se creaba el pago, se descontaba el stock registro por registro y se
 * anotaban los movimientos de inventario. Con el backend real eso ya no
 * corresponde, y además era peligroso: el backend también descuenta el stock
 * al crear la orden, así que el stock se habría descontado DOS veces.
 *
 * Ahora el navegador solo envía los productos y la cantidad. El backend:
 *   - toma el precio de su propio catálogo (no del navegador),
 *   - calcula el total,
 *   - registra la salida de inventario,
 *   - procesa el pago,
 *   - y guarda la orden.
 */

export async function registrarVenta({
  items,
  idCliente = null,
  idMetodoPago,
  // Datos de entrega: el backend todavía no guarda dirección ni comuna, se
  // reciben igual para no romper las pantallas que los envían.
  entrega = null,
  direccion = null,
  region = null,
  comuna = null,
  estadoInicial = "PENDIENTE_PAGO",
}) {
  if (!items || items.length === 0) {
    throw new Error("El carrito está vacío.");
  }
  if (!idMetodoPago) {
    throw new Error("Debes elegir un método de pago.");
  }

  const numeroOrden = await siguienteNumeroOrden();

  const orden = {
    numeroOrden,
    idCliente: idCliente ? Number(idCliente) : null,
    status: estadoInicial,
    idMetodoPago: Number(idMetodoPago),
    detalles: items.map((item) => ({
      idProducto: Number(item.id),
      cantidad: Number(item.cantidad),
    })),
  };

  const creada = await crearOrden(orden);

  // El pago lo crea el backend; se busca para devolverlo a la pantalla.
  const pago = await buscarPagoPorOrden(creada.id).catch(() => null);

  return { orden: creada, pago };
}

/** Pasa una orden a PAGADO. */
export async function marcarOrdenPagada(ordenId) {
  const orden = await obtenerOrden(ordenId);
  if (orden.status === "PAGADO" || orden.status === "FINALIZADO") {
    return orden;
  }
  return actualizarOrden(orden.id, { status: "PAGADO" });
}

/** Anula una orden y devuelve el stock de cada producto vendido. */
export async function cancelarOrden(ordenId) {
  const orden = await obtenerOrden(ordenId);
  if (orden.status === "CANCELADO") return orden;

  for (const detalle of orden.detalles || []) {
    // Una "Entrada" al inventario devuelve la cantidad al stock.
    await crearMovimiento({
      idProducto: Number(detalle.idProducto),
      tipoMovimiento: "Entrada",
      monto: Number(detalle.cantidad),
    });
  }

  return actualizarOrden(orden.id, { status: "CANCELADO" });
}

export async function cambiarEstadoOrden(ordenId, nuevoEstado) {
  if (nuevoEstado === "CANCELADO") {
    return cancelarOrden(ordenId);
  }
  if (nuevoEstado === "PAGADO") {
    return marcarOrdenPagada(ordenId);
  }
  if (nuevoEstado === "FINALIZADO") {
    await marcarOrdenPagada(ordenId);
    return actualizarOrden(ordenId, { status: "FINALIZADO" });
  }
  return actualizarOrden(ordenId, { status: nuevoEstado });
}
