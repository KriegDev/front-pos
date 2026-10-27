export function formatearMoneda(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return "$0";
  return "$" + numero.toLocaleString("es-CL");
}

export function formatearNumero(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return "0";
  return numero.toLocaleString("es-CL");
}

export function formatearFecha(fecha) {
  if (!fecha) return "—";
  const texto = String(fecha);
  const soloFecha = texto.slice(0, 10);
  const partes = soloFecha.split("-");
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return texto;
}

export function formatearFechaHora(fecha) {
  if (!fecha) return "—";
  const texto = String(fecha);
  if (texto.length <= 10) return formatearFecha(texto);
  const fechaObj = new Date(texto);
  if (Number.isNaN(fechaObj.getTime())) return texto;
  return fechaObj.toLocaleString("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function fechaHoyISO() {
  const ahora = new Date();
  const local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function fechaHoraAhoraISO() {
  return new Date().toISOString();
}

export function porcentajeDescuento(precioBase, precioOferta) {
  const base = Number(precioBase);
  const oferta = Number(precioOferta);
  if (!base || !oferta || oferta >= base) return 0;
  return Math.round((1 - oferta / base) * 100);
}
