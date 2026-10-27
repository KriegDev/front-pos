export const ETIQUETAS_ESTADO = {
  PENDIENTE_PAGO: "Pendiente de pago",
  PAGADO: "Pagado",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
  "Pago Rechazado": "Pago rechazado",
  Pendiente: "Pendiente",
  ANULADO: "Anulado",
};

export const CLASES_ESTADO = {
  PENDIENTE_PAGO: "text-bg-warning",
  PAGADO: "text-bg-success",
  FINALIZADO: "text-bg-primary",
  CANCELADO: "text-bg-danger",
  "Pago Rechazado": "text-bg-danger",
  Pendiente: "text-bg-warning",
  ANULADO: "text-bg-secondary",
};

export function etiquetaEstado(estado) {
  return ETIQUETAS_ESTADO[estado] || estado || "Sin estado";
}

export function claseEstado(estado) {
  return CLASES_ESTADO[estado] || "text-bg-secondary";
}
