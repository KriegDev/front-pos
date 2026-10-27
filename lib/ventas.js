import {
  actualizarOrden,
  actualizarPago,
  actualizarStock,
  crearMovimiento,
  crearOrden,
  crearPago,
  listarMovimientos,
  listarOrdenes,
  listarPagos,
  listarStock,
  obtenerOrden,
  siguienteId,
} from "./api";
import { fechaHoraAhoraISO, fechaHoyISO } from "./formato";

/*
 * Registra una venta completa: orden, pago, descuento de stock y movimiento
 * de inventario. Se usa tanto en el checkout público como en el POS del admin.
 */
export async function registrarVenta({
  items,
  idCliente = null,
  idMetodoPago,
  entrega = null,
  direccion = null,
  region = null,
  comuna = null,
  estadoInicial = "PENDIENTE_PAGO",
}) {
  if (!items || items.length === 0) {
    throw new Error("El carrito está vacío.");
  }

  const stock = await listarStock();
  const detalles = [];
  const cambiosStock = [];
  let total = 0;

  for (const item of items) {
    const registro = stock.find(
      (elemento) => Number(elemento.idProducto) === Number(item.id)
    );
    const cantidad = Number(item.cantidad);

    if (!registro) {
      throw new Error(`No hay stock registrado para ${item.nombre}.`);
    }
    if (cantidad <= 0) {
      throw new Error(`La cantidad de ${item.nombre} no es válida.`);
    }
    if (Number(registro.cantidad) < cantidad) {
      throw new Error(
        `Stock insuficiente para ${item.nombre}. Disponible: ${registro.cantidad}.`
      );
    }

    const precio = Number(item.precio);
    total += precio * cantidad;
    detalles.push({
      id: detalles.length + 1,
      idProducto: Number(item.id),
      cantidad,
      precioUnitario: precio,
    });
    cambiosStock.push({ registro, cantidad });
  }

  const ordenes = await listarOrdenes();
  const id = siguienteId(ordenes);
  const numeroOrden =
    ordenes.reduce(
      (mayor, orden) => Math.max(mayor, Number(orden.numeroOrden) || 0),
      0
    ) + 1;

  const orden = {
    id,
    numeroOrden,
    idCliente: idCliente ? Number(idCliente) : null,
    status: estadoInicial,
    montoTotal: total,
    fechaVenta: fechaHoyISO(),
    idMetodoPago: Number(idMetodoPago),
    entrega,
    direccion,
    region,
    comuna,
    stockDevuelto: false,
    detalles,
  };

  const ordenCreada = await crearOrden(orden);

  const pagos = await listarPagos();
  const pago = {
    id: siguienteId(pagos),
    idOrden: ordenCreada.id ?? id,
    monto: total,
    estado: estadoInicial === "PAGADO" ? "PAGADO" : "PENDIENTE",
    estadoFlow: estadoInicial === "PAGADO" ? "N/A" : "PENDIENTE_FLOW",
    fechaCreacion: fechaHoraAhoraISO(),
    fechaPago: estadoInicial === "PAGADO" ? fechaHoraAhoraISO() : null,
    idMetodoPago: Number(idMetodoPago),
  };
  await crearPago(pago);

  for (const cambio of cambiosStock) {
    await actualizarStock(cambio.registro.id, {
      ...cambio.registro,
      cantidad: Number(cambio.registro.cantidad) - cambio.cantidad,
    });
  }

  const movimientos = await listarMovimientos();
  let idMovimiento = siguienteId(movimientos);
  for (const detalle of detalles) {
    await crearMovimiento({
      id: idMovimiento++,
      idProducto: detalle.idProducto,
      tipoMovimiento: "Salida",
      monto: detalle.cantidad,
      fechaMovimiento: fechaHoraAhoraISO(),
    });
  }

  return { orden: ordenCreada, pago };
}

export async function marcarOrdenPagada(ordenId) {
  const orden = await obtenerOrden(ordenId);
  if (orden.status === "PAGADO" || orden.status === "FINALIZADO") {
    return orden;
  }

  const actualizada = await actualizarOrden(orden.id, { status: "PAGADO" });
  const pagos = await listarPagos();
  const pago = pagos.find(
    (elemento) => Number(elemento.idOrden) === Number(orden.id)
  );
  if (pago) {
    await actualizarPago(pago.id, {
      estado: "PAGADO",
      estadoFlow: "N/A",
      fechaPago: fechaHoraAhoraISO(),
    });
  }
  return actualizada;
}

export async function cancelarOrden(ordenId) {
  const orden = await obtenerOrden(ordenId);
  if (orden.status === "CANCELADO") return orden;

  if (!orden.stockDevuelto) {
    const stock = await listarStock();
    const movimientos = await listarMovimientos();
    let idMovimiento = siguienteId(movimientos);

    for (const detalle of orden.detalles || []) {
      const registro = stock.find(
        (elemento) =>
          Number(elemento.idProducto) === Number(detalle.idProducto)
      );
      if (registro) {
        await actualizarStock(registro.id, {
          ...registro,
          cantidad: Number(registro.cantidad) + Number(detalle.cantidad),
        });
        await crearMovimiento({
          id: idMovimiento++,
          idProducto: Number(detalle.idProducto),
          tipoMovimiento: "Entrada",
          monto: Number(detalle.cantidad),
          fechaMovimiento: fechaHoraAhoraISO(),
        });
      }
    }
  }

  const actualizada = await actualizarOrden(orden.id, {
    status: "CANCELADO",
    stockDevuelto: true,
  });

  const pagos = await listarPagos();
  const pago = pagos.find(
    (elemento) => Number(elemento.idOrden) === Number(orden.id)
  );
  if (pago) {
    await actualizarPago(pago.id, { estado: "ANULADO", estadoFlow: "ANULADO" });
  }

  return actualizada;
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
