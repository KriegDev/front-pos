import { API_URL } from "./constantes";

async function pedir(ruta, opciones = {}) {
  const { headers, ...resto } = opciones;
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    cache: "no-store",
    ...resto,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
  });

  if (!respuesta.ok) {
    let detalle = `Error ${respuesta.status}`;
    try {
      const cuerpo = await respuesta.json();
      detalle = cuerpo.mensaje || cuerpo.message || detalle;
    } catch {
      // La API no siempre devuelve JSON en los errores.
    }
    throw new Error(detalle);
  }

  if (respuesta.status === 204) return null;
  const texto = await respuesta.text();
  return texto ? JSON.parse(texto) : null;
}

export function mensajeDeError(error) {
  if (!error) return "Ocurrió un error inesperado.";
  if (error instanceof TypeError || error.name === "TypeError") {
    return "No se pudo conectar con la API. Ejecuta `npm run mock` en otra terminal y vuelve a intentarlo.";
  }
  return error.message || "Ocurrió un error inesperado.";
}

export function siguienteId(elementos) {
  return (
    elementos.reduce(
      (mayor, elemento) => Math.max(mayor, Number(elemento.id) || 0),
      0
    ) + 1
  );
}

/* ----------------------------- Categorías ----------------------------- */

export function listarCategorias() {
  return pedir("/categorias");
}

export function obtenerCategoria(id) {
  return pedir(`/categorias/${id}`);
}

export function crearCategoria(datos) {
  return pedir("/categorias", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function actualizarCategoria(id, datos) {
  return pedir(`/categorias/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}

export function eliminarCategoria(id) {
  return pedir(`/categorias/${id}`, { method: "DELETE" });
}

/* ----------------------------- Productos ------------------------------ */

export function listarProductos() {
  return pedir("/productos");
}

export function obtenerProducto(id) {
  return pedir(`/productos/${id}`);
}

export function crearProducto(datos) {
  return pedir("/productos", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function actualizarProducto(id, datos) {
  return pedir(`/productos/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}

export function eliminarProducto(id) {
  return pedir(`/productos/${id}`, { method: "DELETE" });
}

/* ------------------------------ Clientes ------------------------------ */

export function listarClientes() {
  return pedir("/clientes");
}

export function obtenerCliente(id) {
  return pedir(`/clientes/${id}`);
}

export function crearCliente(datos) {
  return pedir("/clientes", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function actualizarCliente(id, datos) {
  return pedir(`/clientes/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}

export async function buscarClientePorRun(run) {
  const clientes = await listarClientes();
  return (
    clientes.find((cliente) => Number(cliente.run) === Number(run)) || null
  );
}

/* ------------------------------ Usuarios ------------------------------ */

export function listarUsuarios() {
  return pedir("/usuarios");
}

export function obtenerUsuario(id) {
  return pedir(`/usuarios/${id}`);
}

export function crearUsuario(datos) {
  return pedir("/usuarios", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function actualizarUsuario(id, datos) {
  return pedir(`/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}

export async function buscarUsuario(nombreUsuario) {
  const usuarios = await listarUsuarios();
  return (
    usuarios.find(
      (usuario) =>
        usuario.nombreUsuario.toLowerCase() ===
        String(nombreUsuario || "").toLowerCase()
    ) || null
  );
}

/* ------------------------------- Stock -------------------------------- */

export function listarStock() {
  return pedir("/stock");
}

export function obtenerStock(id) {
  return pedir(`/stock/${id}`);
}

export function crearStock(datos) {
  return pedir("/stock", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function actualizarStock(id, datos) {
  return pedir(`/stock/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}

export function eliminarStock(id) {
  return pedir(`/stock/${id}`, { method: "DELETE" });
}

export async function buscarStockPorProducto(idProducto) {
  const stock = await listarStock();
  return (
    stock.find(
      (registro) => Number(registro.idProducto) === Number(idProducto)
    ) || null
  );
}

/* ------------------------------ Órdenes ------------------------------- */

export function listarOrdenes() {
  return pedir("/ordenes");
}

export function obtenerOrden(id) {
  return pedir(`/ordenes/${id}`);
}

export function crearOrden(datos) {
  return pedir("/ordenes", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function actualizarOrden(id, cambios) {
  return pedir(`/ordenes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(cambios),
  });
}

export async function siguienteNumeroOrden() {
  const ordenes = await listarOrdenes();
  return (
    ordenes.reduce(
      (mayor, orden) => Math.max(mayor, Number(orden.numeroOrden) || 0),
      0
    ) + 1
  );
}

/* ------------------------------- Pagos -------------------------------- */

export function listarPagos() {
  return pedir("/pagos");
}

export function crearPago(datos) {
  return pedir("/pagos", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function actualizarPago(id, cambios) {
  return pedir(`/pagos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(cambios),
  });
}

export async function buscarPagoPorOrden(idOrden) {
  const pagos = await listarPagos();
  return (
    pagos.find((pago) => Number(pago.idOrden) === Number(idOrden)) || null
  );
}

/* --------------------------- Medios de pago --------------------------- */

export function listarMetodosPago() {
  return pedir("/metodosPago");
}

/* ---------------------------- Movimientos ----------------------------- */

export function listarMovimientos() {
  return pedir("/movimientos");
}

export function crearMovimiento(datos) {
  return pedir("/movimientos", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}
