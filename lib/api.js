import { API_URL } from "./constantes";
import { obtenerToken } from "./sesion";

/*
 * Capa de acceso a datos.
 *
 * Antes hablaba con `json-server` (la API falsa en el puerto 4000). Ahora habla
 * con el API Gateway de VentaRápida, que es el backend real de microservicios.
 *
 * Tres cosas que hace este archivo:
 *   1. agrega el token JWT a cada petición;
 *   2. traduce las direcciones (`/productos` -> `/productos` del gateway) y
 *      los nombres de campos, porque el backend no usa los mismos;
 *   3. entrega a las pantallas los datos con la forma que ya esperaban, para
 *      no tener que tocar las 30 pantallas una por una.
 */

const IMAGEN_POR_DEFECTO = "/imagenes/producto-sin-foto.png";

/* ---------------------------------------------------------------------------
   Núcleo de las peticiones
   --------------------------------------------------------------------------- */

function tokenActual() {
  return obtenerToken();
}

async function pedir(ruta, opciones = {}) {
  const { headers, ...resto } = opciones;
  const token = tokenActual();

  const respuesta = await fetch(`${API_URL}${ruta}`, {
    cache: "no-store",
    ...resto,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
  });

  if (respuesta.status === 401) {
    throw new Error("Tu sesión expiró o no has iniciado sesión. Vuelve a entrar.");
  }
  if (respuesta.status === 403) {
    throw new Error("No tienes permiso para realizar esta acción.");
  }
  if (!respuesta.ok) {
    let detalle = `Error ${respuesta.status}`;
    try {
      const cuerpo = await respuesta.json();
      detalle = cuerpo.mensaje || cuerpo.message || detalle;
    } catch {
      // El backend no siempre responde JSON en los errores.
    }
    throw new Error(detalle);
  }

  if (respuesta.status === 204) return null;
  const texto = await respuesta.text();
  return texto ? JSON.parse(texto) : null;
}

/**
 * Petición que devuelve texto plano.
 * El endpoint de login del backend responde el token "pelado", sin JSON.
 */
async function pedirTexto(ruta, opciones = {}) {
  const { headers, ...resto } = opciones;
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    cache: "no-store",
    ...resto,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
  });

  const texto = await respuesta.text();

  if (!respuesta.ok) {
    throw new Error(texto || `Error ${respuesta.status}`);
  }
  return texto;
}

export function mensajeDeError(error) {
  if (!error) return "Ocurrió un error inesperado.";
  if (error instanceof TypeError || error.name === "TypeError") {
    return "No se pudo conectar con la API. Revisa que el backend esté corriendo en el puerto 4425.";
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

/* ---------------------------------------------------------------------------
   Traducciones de datos (el backend nombra distinto que el frontend)
   --------------------------------------------------------------------------- */

/**
 * Producto del backend -> producto que esperan las pantallas.
 *
 * El backend no guarda imagen ni precio de oferta. La oferta es el 10% que ya
 * definía `data/seed.js`; se calcula como (precio * 9) / 10 para no redondear
 * nunca el monto.
 */
function mapProducto(producto) {
  if (!producto) return null;
  const precioBase = Number(producto.precioBase ?? 0);
  return {
    ...producto,
    precioBase,
    precioOferta: (precioBase * 9) / 10,
    imagen: producto.imagen || IMAGEN_POR_DEFECTO,
  };
}

/** Cliente del backend -> cliente que espera el frontend (nombres en minúscula). */
function mapCliente(cliente) {
  if (!cliente) return null;
  return {
    id: cliente.id,
    run: cliente.run,
    dvrun: cliente.dvrun,
    pnombre: cliente.pNombre ?? cliente.pnombre ?? "",
    snombre: cliente.sNombre ?? cliente.snombre ?? "",
    appaterno: cliente.apPaterno ?? cliente.appaterno ?? "",
    apmaterno: cliente.apMaterno ?? cliente.apmaterno ?? "",
    correo: cliente.correo ?? "",
    telefono: cliente.telefono ?? "",
    activo: cliente.activo !== false,
  };
}

/** Cliente del frontend -> cliente que espera el backend. */
function aClienteBackend(datos) {
  return {
    run: datos.run,
    dvrun: datos.dvrun,
    pNombre: datos.pnombre,
    sNombre: datos.snombre,
    apPaterno: datos.appaterno,
    apMaterno: datos.apmaterno,
    correo: datos.correo,
    telefono: datos.telefono,
    activo: datos.activo !== false,
  };
}

/** Pago del backend -> pago que espera el frontend. */
function mapPago(pago) {
  if (!pago) return null;
  return {
    ...pago,
    idMetodoPago: pago.metodoPago ? pago.metodoPago.id : pago.idMetodoPago ?? null,
  };
}

/** Movimiento del backend -> movimiento que espera el frontend. */
function mapMovimiento(movimiento) {
  if (!movimiento) return null;
  return {
    id: movimiento.id,
    idProducto: movimiento.stock ? movimiento.stock.idProducto : movimiento.idProducto,
    tipoMovimiento: movimiento.tipoMovimiento,
    monto: movimiento.monto,
    fechaMovimiento: movimiento.fechaMovimiento,
  };
}

/** Usuario del backend -> usuario que espera el frontend. */
function mapUsuario(usuario) {
  if (!usuario) return null;
  return {
    id: usuario.id,
    nombreUsuario: usuario.nombreUsuario,
    rol: usuario.rol ? usuario.rol.nombre ?? usuario.rol : usuario.rol,
    activo: usuario.activo !== false,
  };
}

/* ---------------------------------------------------------------------------
   Autenticación
   --------------------------------------------------------------------------- */

/** Lee el contenido (payload) de un JWT sin librerías externas. */
export function leerToken(token) {
  try {
    const partes = String(token).split(".");
    if (partes.length < 2) return null;
    let base64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) base64 += "=";
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/**
 * Inicia sesión contra el backend.
 * Devuelve { token, nombreUsuario, rol } o lanza un error con el motivo.
 */
export async function iniciarSesionBackend(nombreUsuario, contrasena) {
  const token = await pedirTexto("/auth/login", {
    method: "POST",
    body: JSON.stringify({ nombreUsuario, contrasena }),
  });

  const limpio = String(token).trim().replace(/^"|"$/g, "");
  const datos = leerToken(limpio);

  if (!datos) {
    throw new Error("El servidor no devolvió un token válido.");
  }

  const roles = Array.isArray(datos.rol) ? datos.rol : datos.rol ? [datos.rol] : [];

  return {
    token: limpio,
    nombreUsuario: datos.sub || nombreUsuario,
    rol: roles[0] || "Cliente",
  };
}

/** Registra una cuenta nueva (lo usa /crear-cuenta y el panel de usuarios). */
export function registrarCuenta(datos) {
  return pedirTexto("/auth/registrar", {
    method: "POST",
    body: JSON.stringify({
      nombreUsuario: datos.nombreUsuario,
      contrasena: datos.contrasena,
    }),
  });
}

/* ---------------------------------------------------------------------------
   Categorías
   --------------------------------------------------------------------------- */

export async function listarCategorias() {
  return (await pedir("/categorias")) || [];
}

export function obtenerCategoria(id) {
  return pedir(`/categorias/${id}`);
}

export function crearCategoria(datos) {
  return pedir("/categorias", { method: "POST", body: JSON.stringify(datos) });
}

export function actualizarCategoria(id, datos) {
  return pedir(`/categorias/${id}`, { method: "PUT", body: JSON.stringify(datos) });
}

export function eliminarCategoria(id) {
  return pedir(`/categorias/${id}`, { method: "DELETE" });
}

/* ---------------------------------------------------------------------------
   Productos
   --------------------------------------------------------------------------- */

export async function listarProductos() {
  const productos = (await pedir("/productos")) || [];
  return productos.map(mapProducto);
}

export async function obtenerProducto(id) {
  return mapProducto(await pedir(`/productos/${id}`));
}

export async function crearProducto(datos) {
  return mapProducto(
    await pedir("/productos", { method: "POST", body: JSON.stringify(datos) })
  );
}

export async function actualizarProducto(id, datos) {
  return mapProducto(
    await pedir(`/productos/${id}`, { method: "PUT", body: JSON.stringify(datos) })
  );
}

export function eliminarProducto(id) {
  return pedir(`/productos/${id}`, { method: "DELETE" });
}

/* ---------------------------------------------------------------------------
   Clientes
   --------------------------------------------------------------------------- */

export async function listarClientes() {
  const clientes = (await pedir("/clientes")) || [];
  return clientes.map(mapCliente);
}

export async function obtenerCliente(id) {
  return mapCliente(await pedir(`/clientes/${id}`));
}

export async function crearCliente(datos) {
  return mapCliente(
    await pedir("/clientes", {
      method: "POST",
      body: JSON.stringify(aClienteBackend(datos)),
    })
  );
}

/**
 * El backend no tiene PUT de cliente: tiene dos PATCH separados, uno para los
 * datos de contacto y otro para el estado. Según lo que cambió, se llama a uno
 * u otro.
 */
export async function actualizarCliente(id, datos) {
  await pedir(`/clientes/actualizar-datos-contacto/${id}`, {
    method: "PATCH",
    body: JSON.stringify(aClienteBackend(datos)),
  });

  if (datos.activo !== undefined) {
    await pedir(`/clientes/actualizar-status/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ activo: datos.activo }),
    });
  }

  return mapCliente(await pedir(`/clientes/${id}`));
}

export async function buscarClientePorRun(run) {
  try {
    return mapCliente(await pedir(`/clientes/run/${run}`));
  } catch {
    return null;
  }
}

/* ---------------------------------------------------------------------------
   Usuarios
   --------------------------------------------------------------------------- */

export async function listarUsuarios() {
  const usuarios = (await pedir("/auth/usuarios")) || [];
  return usuarios.map(mapUsuario);
}

export async function obtenerUsuario(id) {
  return mapUsuario(await pedir(`/auth/usuarios/${id}`));
}

export async function crearUsuario(datos) {
  return mapUsuario(
    await pedir("/auth/usuarios", { method: "POST", body: JSON.stringify(datos) })
  );
}

export async function actualizarUsuario(id, datos) {
  return mapUsuario(
    await pedir(`/auth/usuarios/${id}`, {
      method: "PUT",
      body: JSON.stringify(datos),
    })
  );
}

/** Busca un usuario por nombre. Se resuelve sobre la lista (el backend no tiene esa ruta). */
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

/* ---------------------------------------------------------------------------
   Stock
   --------------------------------------------------------------------------- */

export async function listarStock() {
  return (await pedir("/stock")) || [];
}

export function obtenerStock(id) {
  return pedir(`/stock/${id}`);
}

export function crearStock(datos) {
  return pedir("/stock", { method: "POST", body: JSON.stringify(datos) });
}

export function actualizarStock(id, datos) {
  return pedir(`/stock/${id}`, { method: "PUT", body: JSON.stringify(datos) });
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

/* ---------------------------------------------------------------------------
   Órdenes
   --------------------------------------------------------------------------- */

export async function listarOrdenes() {
  return (await pedir("/ordenes")) || [];
}

export function obtenerOrden(id) {
  return pedir(`/ordenes/${id}`);
}

/**
 * Crea una orden. El backend calcula el total con el precio de su catálogo,
 * descuenta el stock y procesa el pago; por eso solo se le envían los
 * productos y las cantidades.
 */
export function crearOrden(datos) {
  return pedir("/ordenes", { method: "POST", body: JSON.stringify(datos) });
}

/**
 * El backend no tiene un endpoint para cambiar el estado de una orden, así que
 * se resuelve como una nueva venta; ver lib/ventas.js para el detalle.
 */
export function actualizarOrden(id, cambios) {
  return pedir(`/ordenes/${id}`, { method: "PATCH", body: JSON.stringify(cambios) });
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

/* ---------------------------------------------------------------------------
   Pagos
   --------------------------------------------------------------------------- */

export async function listarPagos() {
  const pagos = (await pedir("/pago")) || [];
  return pagos.map(mapPago);
}

export function crearPago(datos) {
  return pedir("/pago/procesar", { method: "POST", body: JSON.stringify(datos) });
}

export function actualizarPago(id, cambios) {
  return pedir(`/pago/${id}`, { method: "PATCH", body: JSON.stringify(cambios) });
}

export async function buscarPagoPorOrden(idOrden) {
  const pagos = await listarPagos();
  return pagos.find((pago) => Number(pago.idOrden) === Number(idOrden)) || null;
}

/* ---------------------------------------------------------------------------
   Medios de pago
   --------------------------------------------------------------------------- */

export async function listarMetodosPago() {
  return (await pedir("/metodos-pago")) || [];
}

/* ---------------------------------------------------------------------------
   Movimientos de inventario
   --------------------------------------------------------------------------- */

export async function listarMovimientos() {
  const movimientos = (await pedir("/movimiento-inventario")) || [];
  return movimientos.map(mapMovimiento);
}

/**
 * El backend recibe el producto en la dirección y el movimiento en el cuerpo.
 * "Salida" descuenta stock y "Entrada" lo suma.
 */
export function crearMovimiento(datos) {
  return pedir(`/movimiento-inventario/nuevo/${datos.idProducto}`, {
    method: "POST",
    body: JSON.stringify({
      tipoMovimiento: datos.tipoMovimiento,
      monto: datos.monto,
    }),
  });
}
