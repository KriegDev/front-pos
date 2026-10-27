export const EVENTO_CARRITO = "carrito-actualizado";
export const CLAVE_CARRITO = "carrito";

function esNavegador() {
  return typeof window !== "undefined";
}

export function obtenerCarrito() {
  if (!esNavegador()) return [];
  try {
    const datos = JSON.parse(window.localStorage.getItem(CLAVE_CARRITO) || "[]");
    if (!Array.isArray(datos)) return [];
    return datos
      .filter((item) => item && item.id !== undefined)
      .map((item) => ({
        ...item,
        id: Number(item.id),
        precio: Number(item.precio),
        cantidad: Number(item.cantidad),
        stock: Number(item.stock),
      }));
  } catch {
    return [];
  }
}

export function guardarCarrito(items) {
  if (!esNavegador()) return items;
  window.localStorage.setItem(CLAVE_CARRITO, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENTO_CARRITO));
  return items;
}

export function agregarAlCarrito(producto, cantidad = 1) {
  const items = obtenerCarrito();
  const stock = Number(producto.stock) || 0;
  const precio = Number(
    producto.precioOferta !== null && producto.precioOferta !== undefined
      ? producto.precioOferta
      : producto.precioBase
  );
  const existente = items.find((item) => item.id === Number(producto.id));

  if (existente) {
    existente.cantidad = Math.min(
      Number(existente.cantidad) + Number(cantidad),
      stock
    );
    existente.precio = precio;
    existente.stock = stock;
  } else if (stock > 0) {
    items.push({
      id: Number(producto.id),
      nombre: producto.nombre,
      sku: producto.sku,
      precio,
      imagen: producto.imagen || "/imagenes/producto-sin-foto.png",
      stock,
      cantidad: Math.min(Number(cantidad), stock),
    });
  }

  return guardarCarrito(items);
}

export function cambiarCantidad(id, cantidad) {
  const items = obtenerCarrito();
  const item = items.find((elemento) => elemento.id === Number(id));
  if (!item) return items;

  const maximo = Number(item.stock) || Number(cantidad) || 1;
  item.cantidad = Math.max(1, Math.min(Number(cantidad) || 1, maximo));
  return guardarCarrito(items);
}

export function quitarDelCarrito(id) {
  const items = obtenerCarrito().filter(
    (item) => item.id !== Number(id)
  );
  return guardarCarrito(items);
}

export function vaciarCarrito() {
  return guardarCarrito([]);
}

export function calcularSubtotal(item) {
  return Number(item.precio) * Number(item.cantidad);
}

export function calcularTotal(items) {
  return items.reduce(
    (total, item) => total + calcularSubtotal(item),
    0
  );
}

export function contarItems(items) {
  return items.reduce(
    (total, item) => total + Number(item.cantidad || 0),
    0
  );
}
