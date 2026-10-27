import { ETIQUETAS_METODO_PAGO } from "./constantes";

export function unirProductos(productos, stock) {
  return productos.map((producto) => {
    const registro = stock.find(
      (item) => Number(item.idProducto) === Number(producto.id)
    );
    return {
      ...producto,
      stock: registro ? Number(registro.cantidad) : 0,
      stockMinimo: registro ? Number(registro.stockMinimo) : 0,
      idStock: registro ? registro.id : null,
    };
  });
}

export function nombreCliente(cliente) {
  if (!cliente) return "Cliente no registrado";
  return [
    cliente.pnombre,
    cliente.snombre,
    cliente.appaterno,
    cliente.apmaterno,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

export function runCliente(cliente) {
  if (!cliente) return "—";
  return `${cliente.run}-${cliente.dvrun}`;
}

export function clientePorId(clientes, idCliente) {
  return (
    clientes.find((cliente) => Number(cliente.id) === Number(idCliente)) || null
  );
}

export function metodoPagoNombre(metodosPago, idMetodoPago) {
  const metodo = metodosPago.find(
    (item) => Number(item.id) === Number(idMetodoPago)
  );
  if (!metodo) return "Sin método de pago";
  return ETIQUETAS_METODO_PAGO[metodo.nombre] || metodo.nombre;
}

export function esVentaPagada(orden) {
  return orden.status === "PAGADO" || orden.status === "FINALIZADO";
}

export function totalRecaudado(ordenes) {
  return ordenes
    .filter(esVentaPagada)
    .reduce((total, orden) => total + Number(orden.montoTotal || 0), 0);
}

export function ordenarOrdenes(ordenes) {
  return [...ordenes].sort((a, b) => {
    const fechaA = `${a.fechaVenta || ""} ${String(a.numeroOrden || 0).padStart(
      10,
      "0"
    )}`;
    const fechaB = `${b.fechaVenta || ""} ${String(b.numeroOrden || 0).padStart(
      10,
      "0"
    )}`;
    return fechaB.localeCompare(fechaA);
  });
}

export function stockCritico(stock) {
  return stock.filter(
    (registro) => Number(registro.cantidad) <= Number(registro.stockMinimo)
  );
}

export function tieneOferta(producto) {
  return (
    producto.precioOferta !== null &&
    producto.precioOferta !== undefined &&
    Number(producto.precioOferta) < Number(producto.precioBase)
  );
}

export function precioEfectivo(producto) {
  return Number(
    tieneOferta(producto) ? producto.precioOferta : producto.precioBase
  );
}

export function detalleConProducto(detalle, productos) {
  const producto = productos.find(
    (item) => Number(item.id) === Number(detalle.idProducto)
  );
  return {
    ...detalle,
    nombre: producto ? producto.nombre : `Producto ${detalle.idProducto}`,
    sku: producto ? producto.sku : "—",
  };
}

export function resumenVentasPorDia(ordenes) {
  const mapa = new Map();
  ordenes.filter(esVentaPagada).forEach((orden) => {
    const fecha = orden.fechaVenta || "Sin fecha";
    const actual = mapa.get(fecha) || { fecha, ordenes: 0, total: 0 };
    actual.ordenes += 1;
    actual.total += Number(orden.montoTotal || 0);
    mapa.set(fecha, actual);
  });
  return [...mapa.values()].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export function productosMasVendidos(ordenes, productos, limite = 5) {
  const mapa = new Map();
  ordenes.filter(esVentaPagada).forEach((orden) => {
    (orden.detalles || []).forEach((detalle) => {
      const producto = productos.find(
        (item) => Number(item.id) === Number(detalle.idProducto)
      );
      const actual = mapa.get(detalle.idProducto) || {
        idProducto: detalle.idProducto,
        nombre: producto ? producto.nombre : `Producto ${detalle.idProducto}`,
        cantidad: 0,
        total: 0,
      };
      actual.cantidad += Number(detalle.cantidad || 0);
      actual.total +=
        Number(detalle.cantidad || 0) * Number(detalle.precioUnitario || 0);
      mapa.set(detalle.idProducto, actual);
    });
  });
  return [...mapa.values()]
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, limite);
}
