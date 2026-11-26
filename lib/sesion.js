import { ROLES } from "./constantes";

export const EVENTO_SESION = "sesion-actualizada";
export const CLAVE_SESION = "sesion";

function esNavegador() {
  return typeof window !== "undefined";
}

export function obtenerSesion() {
  if (!esNavegador()) return null;
  try {
    const datos = JSON.parse(window.localStorage.getItem(CLAVE_SESION) || "null");
    if (!datos || !datos.nombreUsuario || !datos.rol) return null;
    return datos;
  } catch {
    return null;
  }
}

export function guardarSesion(usuario) {
  if (!esNavegador()) return null;
  const sesion = {
    id: usuario.id ?? null,
    nombreUsuario: usuario.nombreUsuario,
    rol: usuario.rol,
    idCliente: usuario.idCliente ?? null,
    // Token JWT que entrega el backend al iniciar sesión. Se guarda junto con
    // la sesión para que siga funcionando aunque se recargue la página.
    token: usuario.token ?? null,
  };
  window.localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  window.dispatchEvent(new Event(EVENTO_SESION));
  return sesion;
}

/** Devuelve solo el token JWT de la sesión actual, o null si no hay. */
export function obtenerToken() {
  const sesion = obtenerSesion();
  return sesion?.token || null;
}

export function cerrarSesion() {
  if (!esNavegador()) return;
  window.localStorage.removeItem(CLAVE_SESION);
  window.dispatchEvent(new Event(EVENTO_SESION));
}

export function esAdministrador(sesion) {
  return sesion?.rol === ROLES.ADMIN;
}

export function esVendedor(sesion) {
  return sesion?.rol === ROLES.VENDEDOR;
}

export function puedeEntrarAlAdmin(sesion) {
  return esAdministrador(sesion) || esVendedor(sesion);
}

export function rutaInicioPorRol(sesion) {
  return puedeEntrarAlAdmin(sesion) ? "/admin" : "/";
}
