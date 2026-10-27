import {
  calcularDv,
  normalizarRun,
  separarRun,
  validarCorreo,
  validarNombreUsuario,
  validarPassword,
  validarRun,
  validarTelefono,
  validarTexto,
} from "@/lib/validaciones";

describe("Validaciones de formularios", () => {
  it("valida RUN chilenos conocidos", () => {
    expect(validarRun("12345678-5")).toBeTrue();
    expect(validarRun("21605460-1")).toBeTrue();
    expect(validarRun("12.345.678-5")).toBeTrue();
  });

  it("rechaza RUN con dígito verificador incorrecto", () => {
    expect(validarRun("12345678-9")).toBeFalse();
    expect(validarRun("sin-guion")).toBeFalse();
  });

  it("calcula el dígito verificador", () => {
    expect(calcularDv(12345678)).toBe("5");
    expect(calcularDv(21605460)).toBe("1");
  });

  it("separa RUN y dígito verificador", () => {
    expect(separarRun("12.345.678-5")).toEqual({ run: 12345678, dvrun: "5" });
    expect(normalizarRun(" 12.345.678-5 ")).toBe("12345678-5");
  });

  it("valida correos electrónicos", () => {
    expect(validarCorreo("cliente@correo.cl")).toBeTrue();
    expect(validarCorreo("cliente-sin-arroba.cl")).toBeFalse();
  });

  it("valida teléfonos de 8 o 9 dígitos", () => {
    expect(validarTelefono("912345678")).toBeTrue();
    expect(validarTelefono("1234")).toBeFalse();
  });

  it("valida textos sin números", () => {
    expect(validarTexto("Carolina")).toBeTrue();
    expect(validarTexto("C4rolina")).toBeFalse();
    expect(validarTexto("ab")).toBeFalse();
  });

  it("valida nombres de usuario y contraseñas", () => {
    expect(validarNombreUsuario("vendedor_1")).toBeTrue();
    expect(validarNombreUsuario("a")).toBeFalse();
    expect(validarPassword("123")).toBeTrue();
    expect(validarPassword("12")).toBeFalse();
  });
});
