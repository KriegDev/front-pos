export function limpiarEspacios(valor) {
  return String(valor ?? "").trim();
}

export function validarTexto(valor, minimo = 3) {
  const texto = limpiarEspacios(valor);
  return texto.length >= minimo && !/[0-9]/.test(texto);
}

export function validarCorreo(valor) {
  const correo = limpiarEspacios(valor);
  if (correo.length < 5) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

export function validarTelefono(valor) {
  const digitos = String(valor ?? "").replace(/\D/g, "");
  return digitos.length >= 8 && digitos.length <= 9;
}

export function validarPassword(valor) {
  return String(valor ?? "").length >= 3;
}

export function validarNombreUsuario(valor) {
  return /^[a-zA-Z0-9._-]{3,15}$/.test(limpiarEspacios(valor));
}

export function validarEntero(valor, opciones = {}) {
  const { min = 0, max = Number.MAX_SAFE_INTEGER } = opciones;
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= min && numero <= max;
}

export function normalizarRun(runCompleto) {
  return String(runCompleto ?? "")
    .trim()
    .replace(/^0+/, "")
    .replace(/[\s.]/g, "")
    .toUpperCase();
}

export function separarRun(runCompleto) {
  const limpio = normalizarRun(runCompleto);
  const partes = limpio.split("-");
  if (partes.length === 2) {
    return { run: Number(partes[0]), dvrun: partes[1] };
  }
  if (limpio.length >= 2) {
    return {
      run: Number(limpio.slice(0, -1)),
      dvrun: limpio.slice(-1),
    };
  }
  return { run: 0, dvrun: "" };
}

export function calcularDv(run) {
  const digitos = String(run ?? "").replace(/\D/g, "");
  if (!digitos) return "";
  let suma = 0;
  let multiplicador = 2;
  for (let i = digitos.length - 1; i >= 0; i--) {
    suma += Number(digitos[i]) * multiplicador;
    multiplicador = multiplicador < 7 ? multiplicador + 1 : 2;
  }
  const resto = suma % 11;
  const dv = 11 - resto;
  if (dv === 11) return "0";
  if (dv === 10) return "K";
  return String(dv);
}

export function validarRun(runCompleto) {
  const limpio = normalizarRun(runCompleto);
  const coincidencia = /^(\d{1,8})-([0-9K])$/.exec(limpio);
  if (!coincidencia) return false;
  return calcularDv(coincidencia[1]) === coincidencia[2];
}
