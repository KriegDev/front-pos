// Dirección del API Gateway de VentaRápida (el backend real de microservicios).
//
// Antes apuntaba a http://localhost:4000, que era la API falsa que levantaba
// `npm run mock` (json-server). Ahora todas las pantallas hablan con el
// backend de verdad.
//
// Si algún día el backend corre en otra máquina o puerto, se cambia sin tocar
// código creando un archivo .env.local con:
//   NEXT_PUBLIC_API_URL=http://otra-maquina:4425/api/v1
//
// Se revisa que "process" exista porque en el paquete de pruebas (Karma) no
// está definido, y sin esa revisión el módulo fallaba al cargarse.
const URL_DEL_ENTORNO =
  typeof process !== "undefined" && process.env
    ? process.env.NEXT_PUBLIC_API_URL
    : undefined;

export const API_URL = URL_DEL_ENTORNO || "http://localhost:4425/api/v1";

export const NOMBRE_TIENDA = "El Rincón de la Tía Ceci";
export const DIRECCION_TIENDA = "Av. Sur 700, Maipú";
export const TELEFONO_TIENDA = "(2) 2933 1313";

export const ROLES = {
  ADMIN: "Administrador",
  VENDEDOR: "Vendedor",
  CLIENTE: "Cliente",
};

export const ESTADOS_ORDEN = [
  "PENDIENTE_PAGO",
  "PAGADO",
  "FINALIZADO",
  "CANCELADO",
];

export const ENTREGAS = {
  DOMICILIO: "DOMICILIO",
  RETIRO: "RETIRO",
};

export const ICONOS_CATEGORIA = {
  Abarrotes: "bi-basket",
  Limpieza: "bi-brush",
  Bebidas: "bi-cup-straw",
  Lacteos: "bi-cup",
  "Frutas y Verduras": "bi-apple",
};

export const ETIQUETAS_METODO_PAGO = {
  CREDITO: "Tarjeta de crédito",
  DEBITO: "Tarjeta de débito",
  EFECTIVO: "Efectivo",
  FLOW: "Pago en línea (Flow)",
};
