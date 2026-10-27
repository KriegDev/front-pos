/*
 * Datos iniciales de la tienda.
 *
 * Los productos, categorías, clientes, órdenes y medios de pago provienen de
 * la base de datos del proyecto de API VentaRápida. Los precios de oferta son
 * la promoción del 10% definida para esta evaluación. Las imágenes y los datos
 * de entrega son campos propios de este frontend.
 *
 * Este archivo es la fuente de verdad: `npm run seed` genera db.json a partir
 * de aquí. No edites db.json a mano si quieres conservar los datos iniciales.
 */

const categorias = [
  { id: 1, nombre: "Abarrotes" },
  { id: 2, nombre: "Limpieza" },
  { id: 3, nombre: "Bebidas" },
  { id: 4, nombre: "Lacteos" },
  { id: 5, nombre: "Frutas y Verduras" },
];

const productos = [
  {
    id: 1,
    sku: "AT102G1",
    nombre: "Arroz Tucapel",
    descripcion: "Arroz Tucapel 1 kg, grado 1",
    precioBase: 1900,
    precioOferta: 1710,
    granel: false,
    categoria: { id: 1, nombre: "Abarrotes" },
    imagen: "/imagenes/producto-sin-foto.png",
  },
  {
    id: 2,
    sku: "CC1L02G1",
    nombre: "Coca-Cola 2lt",
    descripcion: "Coca-Cola envase desechable 2 litros",
    precioBase: 1570,
    precioOferta: 1413,
    granel: false,
    categoria: { id: 3, nombre: "Bebidas" },
    imagen: "/imagenes/producto-sin-foto.png",
  },
  {
    id: 3,
    sku: "TL77789",
    nombre: "Tallarines",
    descripcion: "Tallarines n°77 Luchetti",
    precioBase: 1490,
    precioOferta: 1341,
    granel: false,
    categoria: { id: 1, nombre: "Abarrotes" },
    imagen: "/imagenes/producto-sin-foto.png",
  },
  {
    id: 4,
    sku: "CC2507789",
    nombre: "Cloro",
    descripcion: "Cloro Clorinda 250 ml",
    precioBase: 1250,
    precioOferta: 1125,
    granel: false,
    categoria: { id: 2, nombre: "Limpieza" },
    imagen: "/imagenes/producto-sin-foto.png",
  },
  {
    id: 5,
    sku: "MGC177789",
    nombre: "Manzana",
    descripcion: "Manzana Fuji Categoría 1",
    precioBase: 1490,
    precioOferta: 1341,
    granel: true,
    categoria: { id: 5, nombre: "Frutas y Verduras" },
    imagen: "/imagenes/producto-sin-foto.png",
  },
];

const stock = [
  { id: 1, idProducto: 1, cantidad: 398, stockMinimo: 5 },
  { id: 2, idProducto: 2, cantidad: 40, stockMinimo: 5 },
  { id: 3, idProducto: 3, cantidad: 39, stockMinimo: 10 },
  { id: 4, idProducto: 4, cantidad: 60, stockMinimo: 10 },
  { id: 5, idProducto: 5, cantidad: 50000, stockMinimo: 500 },
];

const clientes = [
  {
    id: 1,
    run: 21605460,
    dvrun: "1",
    pnombre: "Carolina",
    snombre: "Nataly",
    appaterno: "Hermosilla",
    apmaterno: "Baeza",
    correo: "Carolinafk4@gmail.com",
    telefono: 984258099,
    activo: true,
  },
  {
    id: 2,
    run: 19291897,
    dvrun: "9",
    pnombre: "Pedro",
    snombre: "Felipe",
    appaterno: "Toledo",
    apmaterno: "Jaramillo",
    correo: "soykriegcl@gmail.com",
    telefono: 947875729,
    activo: true,
  },
  {
    id: 3,
    run: 20569878,
    dvrun: "7",
    pnombre: "Valeria",
    snombre: "Antonia",
    appaterno: "Gallardo",
    apmaterno: "Soto",
    correo: "VSoto@correo.com",
    telefono: 958569889,
    activo: true,
  },
  {
    id: 4,
    run: 5998532,
    dvrun: "9",
    pnombre: "Serjio",
    snombre: "Roberto",
    appaterno: "Polhammer",
    apmaterno: "Livingstone",
    correo: "slivingstone@cruzados.cl",
    telefono: 958488448,
    activo: false,
  },
  {
    id: 5,
    run: 15655645,
    dvrun: "9",
    pnombre: "Diego",
    snombre: "Mario",
    appaterno: "Rende",
    apmaterno: "Buonanotte",
    correo: "EleNano@correo.com",
    telefono: 966556655,
    activo: true,
  },
];

/*
 * Usuarios de demostración. Las contraseñas quedan en texto plano porque este
 * proyecto simula la API; no se debe usar así en producción.
 */
const usuarios = [
  {
    id: 1,
    nombreUsuario: "admin",
    contrasena: "12345",
    rol: "Administrador",
    idCliente: null,
    activo: true,
  },
  {
    id: 2,
    nombreUsuario: "vendedor",
    contrasena: "123",
    rol: "Vendedor",
    idCliente: null,
    activo: true,
  },
];

const metodosPago = [
  { id: 1, nombre: "CREDITO", activo: true },
  { id: 2, nombre: "DEBITO", activo: true },
  { id: 3, nombre: "EFECTIVO", activo: true },
  { id: 4, nombre: "FLOW", activo: true },
];

const ordenes = [
  {
    id: 1,
    numeroOrden: 1989,
    idCliente: 1,
    status: "FINALIZADO",
    montoTotal: 25900,
    fechaVenta: "2026-01-24",
    idMetodoPago: 1,
    entrega: null,
    direccion: null,
    region: null,
    comuna: null,
    stockDevuelto: false,
    detalles: [
      { id: 1, idProducto: 1, cantidad: 6, precioUnitario: 750 },
    ],
  },
  {
    id: 2,
    numeroOrden: 2024,
    idCliente: 1,
    status: "PAGADO",
    montoTotal: 3800,
    fechaVenta: "2026-05-12",
    idMetodoPago: 4,
    entrega: null,
    direccion: null,
    region: null,
    comuna: null,
    stockDevuelto: false,
    detalles: [
      { id: 2, idProducto: 1, cantidad: 2, precioUnitario: 1900 },
    ],
  },
  {
    id: 3,
    numeroOrden: 2024,
    idCliente: 1,
    status: "PAGADO",
    montoTotal: 7600,
    fechaVenta: "2026-05-12",
    idMetodoPago: 4,
    entrega: null,
    direccion: null,
    region: null,
    comuna: null,
    stockDevuelto: false,
    detalles: [
      { id: 3, idProducto: 1, cantidad: 4, precioUnitario: 1900 },
    ],
  },
  {
    id: 4,
    numeroOrden: 2025,
    idCliente: 1,
    status: "PENDIENTE_PAGO",
    montoTotal: 7600,
    fechaVenta: "2026-05-12",
    idMetodoPago: 4,
    entrega: null,
    direccion: null,
    region: null,
    comuna: null,
    stockDevuelto: false,
    detalles: [
      { id: 4, idProducto: 1, cantidad: 4, precioUnitario: 1900 },
    ],
  },
  {
    id: 5,
    numeroOrden: 20267,
    idCliente: 3,
    status: "PENDIENTE_PAGO",
    montoTotal: 2980,
    fechaVenta: "2026-06-15",
    idMetodoPago: 1,
    entrega: null,
    direccion: null,
    region: null,
    comuna: null,
    stockDevuelto: false,
    detalles: [
      { id: 5, idProducto: 3, cantidad: 2, precioUnitario: 1490 },
    ],
  },
  {
    id: 6,
    numeroOrden: 20268,
    idCliente: 2,
    status: "PENDIENTE_PAGO",
    montoTotal: 4470,
    fechaVenta: "2026-06-15",
    idMetodoPago: 1,
    entrega: null,
    direccion: null,
    region: null,
    comuna: null,
    stockDevuelto: false,
    detalles: [
      { id: 6, idProducto: 3, cantidad: 3, precioUnitario: 1490 },
    ],
  },
  {
    id: 7,
    numeroOrden: 20269,
    idCliente: 2,
    status: "PENDIENTE_PAGO",
    montoTotal: 4470,
    fechaVenta: "2026-06-15",
    idMetodoPago: 1,
    entrega: null,
    direccion: null,
    region: null,
    comuna: null,
    stockDevuelto: false,
    detalles: [
      { id: 7, idProducto: 3, cantidad: 3, precioUnitario: 1490 },
    ],
  },
  {
    id: 8,
    numeroOrden: 20270,
    idCliente: 2,
    status: "PENDIENTE_PAGO",
    montoTotal: 4470,
    fechaVenta: "2026-06-15",
    idMetodoPago: 1,
    entrega: null,
    direccion: null,
    region: null,
    comuna: null,
    stockDevuelto: false,
    detalles: [
      { id: 8, idProducto: 3, cantidad: 3, precioUnitario: 1490 },
    ],
  },
];

/*
 * Los pagos de la base original apuntaban al número de orden y tenían montos
 * históricos inconsistentes. Para este frontend se normalizan: un pago por
 * orden, apuntando al id de la orden y con el mismo monto de la orden.
 */
const pagos = ordenes.map((orden) => ({
  id: orden.id,
  idOrden: orden.id,
  monto: orden.montoTotal,
  estado:
    orden.status === "PAGADO" || orden.status === "FINALIZADO"
      ? "PAGADO"
      : "PENDIENTE",
  estadoFlow:
    orden.status === "PAGADO" || orden.status === "FINALIZADO"
      ? "N/A"
      : "PENDIENTE_FLOW",
  fechaCreacion: `${orden.fechaVenta}T12:00:00`,
  fechaPago:
    orden.status === "PAGADO" || orden.status === "FINALIZADO"
      ? `${orden.fechaVenta}T12:00:00`
      : null,
  idMetodoPago: orden.idMetodoPago,
}));

const movimientos = [];

module.exports = {
  categorias,
  productos,
  stock,
  clientes,
  usuarios,
  metodosPago,
  ordenes,
  pagos,
  movimientos,
};
