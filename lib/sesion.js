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
    id: usuario.id,
    nombreUsuario: usuario.nombreUsuario,
    rol: usuario.rol,
    idCliente: usuario.idCliente ?? null,
  };
  window.localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  window.dispatchEvent(new Event(EVENTO_SESION));
  return sesion;
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
