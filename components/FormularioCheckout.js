"use client";

import { useEffect, useMemo, useState } from "react";
import Boton from "./Boton";
import Mensaje from "./Mensaje";
import ResumenCarrito from "./ResumenCarrito";
import { comunas, regiones } from "@/data/zonas";
import { ENTREGAS } from "@/lib/constantes";
import { formatearMoneda } from "@/lib/formato";
import {
  separarRun,
  validarCorreo,
  validarRun,
  validarTelefono,
  validarTexto,
} from "@/lib/validaciones";

const REGION_INICIAL = 1000;
const COMUNA_INICIAL = 1018;

export default function FormularioCheckout({
  items,
  total,
  cliente,
  metodosPago = [],
  onConfirmar,
  procesando = false,
}) {
  const [form, setForm] = useState({
    pnombre: "",
    snombre: "",
    appaterno: "",
    apmaterno: "",
    run: "",
    correo: "",
    telefono: "",
    entrega: ENTREGAS.DOMICILIO,
    direccion: "",
    region: REGION_INICIAL,
    comuna: COMUNA_INICIAL,
    idMetodoPago: metodosPago[0]?.id || "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!cliente) return;
    setForm((actual) => ({
      ...actual,
      pnombre: cliente.pnombre || "",
      snombre: cliente.snombre || "",
      appaterno: cliente.appaterno || "",
      apmaterno: cliente.apmaterno || "",
      run: `${cliente.run}-${cliente.dvrun}`,
      correo: cliente.correo || "",
      telefono: cliente.telefono || "",
    }));
  }, [cliente]);

  useEffect(() => {
    if (!form.idMetodoPago && metodosPago.length > 0) {
      setForm((actual) => ({ ...actual, idMetodoPago: metodosPago[0].id }));
    }
  }, [metodosPago, form.idMetodoPago]);

  const comunasFiltradas = useMemo(
    () =>
      comunas.filter(
        (comuna) => Number(comuna.id_region) === Number(form.region)
      ),
    [form.region]
  );

  function cambiar(evento) {
    const { name, value } = evento.target;
    if (name === "region") {
      const nuevaRegion = Number(value);
      const primeraComuna = comunas.find(
        (comuna) => Number(comuna.id_region) === nuevaRegion
      );
      setForm((actual) => ({
        ...actual,
        region: nuevaRegion,
        comuna: primeraComuna ? primeraComuna.id : "",
      }));
      return;
    }
    setForm((actual) => ({ ...actual, [name]: value }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    setError("");

    if (!validarTexto(form.pnombre)) {
      setError("El primer nombre no es válido.");
      return;
    }
    if (!validarTexto(form.appaterno)) {
      setError("El apellido paterno no es válido.");
      return;
    }
    if (!validarRun(form.run)) {
      setError("El RUN no es válido. Escríbelo con guion, por ejemplo 12345678-9.");
      return;
    }
    if (!validarCorreo(form.correo)) {
      setError("El correo no es válido.");
      return;
    }
    if (!validarTelefono(form.telefono)) {
      setError("El teléfono debe tener entre 8 y 9 dígitos.");
      return;
    }
    if (form.entrega === ENTREGAS.DOMICILIO && !form.direccion.trim()) {
      setError("Para despacho a domicilio debes indicar la dirección.");
      return;
    }
    if (!form.idMetodoPago) {
      setError("Selecciona un medio de pago.");
      return;
    }

    const { run, dvrun } = separarRun(form.run);
    const region = regiones.find(
      (item) => Number(item.id) === Number(form.region)
    );
    const comuna = comunas.find(
      (item) => Number(item.id) === Number(form.comuna)
    );

    try {
      await onConfirmar({
        pnombre: form.pnombre.trim(),
        snombre: form.snombre.trim(),
        appaterno: form.appaterno.trim(),
        apmaterno: form.apmaterno.trim(),
        run,
        dvrun,
        correo: form.correo.trim(),
        telefono: Number(String(form.telefono).replace(/\D/g, "")),
        entrega: form.entrega,
        direccion:
          form.entrega === ENTREGAS.DOMICILIO ? form.direccion.trim() : null,
        region: form.entrega === ENTREGAS.DOMICILIO ? region?.nombre : null,
        comuna: form.entrega === ENTREGAS.DOMICILIO ? comuna?.nombre : null,
        regionId: form.region,
        comunaId: form.comuna,
        idMetodoPago: Number(form.idMetodoPago),
      });
    } catch (problema) {
      setError(problema.message || "No se pudo completar la compra.");
    }
  }

  if (!items || items.length === 0) {
    return (
      <div className="alert alert-warning">
        Tu carrito está vacío. Agrega productos antes de pagar.
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate>
      {error ? <Mensaje tipo="error">{error}</Mensaje> : null}

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card card-body shadow-sm mb-4">
            <h2 className="h5 titulo-seccion mb-3">
              <span className="paso-compra me-2">1</span>
              Datos de contacto
            </h2>

            {cliente ? (
              <p className="texto-pequeno text-muted">
                Datos precargados desde tu cuenta. Puedes editarlos para esta
                compra.
              </p>
            ) : (
              <p className="texto-pequeno text-muted">
                Estás comprando como invitado. Si inicias sesión, tus datos se
                cargan automáticamente.
              </p>
            )}

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="checkoutPnombre">
                  Primer nombre
                </label>
                <input
                  id="checkoutPnombre"
                  name="pnombre"
                  className="form-control"
                  value={form.pnombre}
                  onChange={cambiar}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="checkoutSnombre">
                  Segundo nombre
                </label>
                <input
                  id="checkoutSnombre"
                  name="snombre"
                  className="form-control"
                  value={form.snombre}
                  onChange={cambiar}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="checkoutAppaterno">
                  Apellido paterno
                </label>
                <input
                  id="checkoutAppaterno"
                  name="appaterno"
                  className="form-control"
                  value={form.appaterno}
                  onChange={cambiar}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="checkoutApmaterno">
                  Apellido materno
                </label>
                <input
                  id="checkoutApmaterno"
                  name="apmaterno"
                  className="form-control"
                  value={form.apmaterno}
                  onChange={cambiar}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label" htmlFor="checkoutRun">
                  RUN
                </label>
                <input
                  id="checkoutRun"
                  name="run"
                  className="form-control"
                  value={form.run}
                  onChange={cambiar}
                  placeholder="12345678-9"
                  required
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label" htmlFor="checkoutCorreo">
                  Correo
                </label>
                <input
                  id="checkoutCorreo"
                  name="correo"
                  type="email"
                  className="form-control"
                  value={form.correo}
                  onChange={cambiar}
                  required
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label" htmlFor="checkoutTelefono">
                  Teléfono
                </label>
                <input
                  id="checkoutTelefono"
                  name="telefono"
                  className="form-control"
                  value={form.telefono}
                  onChange={cambiar}
                  required
                />
              </div>
            </div>
          </div>

          <div className="card card-body shadow-sm mb-4">
            <h2 className="h5 titulo-seccion mb-3">
              <span className="paso-compra me-2">2</span>
              Entrega
            </h2>

            <div className="mb-3">
              <label className="form-label" htmlFor="checkoutEntrega">
                ¿Cómo quieres recibir tu compra?
              </label>
              <select
                id="checkoutEntrega"
                name="entrega"
                className="form-select"
                value={form.entrega}
                onChange={cambiar}
              >
                <option value={ENTREGAS.DOMICILIO}>
                  Despacho a domicilio (sin costo)
                </option>
                <option value={ENTREGAS.RETIRO}>
                  Retiro en tienda (sin costo)
                </option>
              </select>
            </div>

            {form.entrega === ENTREGAS.DOMICILIO ? (
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label" htmlFor="checkoutDireccion">
                    Dirección
                  </label>
                  <input
                    id="checkoutDireccion"
                    name="direccion"
                    className="form-control"
                    value={form.direccion}
                    onChange={cambiar}
                    placeholder="Calle, número, departamento"
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="checkoutRegion">
                    Región
                  </label>
                  <select
                    id="checkoutRegion"
                    name="region"
                    className="form-select"
                    value={form.region}
                    onChange={cambiar}
                  >
                    {regiones.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="checkoutComuna">
                    Comuna
                  </label>
                  <select
                    id="checkoutComuna"
                    name="comuna"
                    className="form-select"
                    value={form.comuna}
                    onChange={cambiar}
                  >
                    {comunasFiltradas.map((comuna) => (
                      <option key={comuna.id} value={comuna.id}>
                        {comuna.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="alert alert-info mb-0">
                <i className="bi bi-shop me-2" aria-hidden="true" />
                Retiras en <strong>Av. Sur 700, Maipú</strong>. Te avisaremos
                cuando tu pedido esté listo.
              </div>
            )}
          </div>

          <div className="card card-body shadow-sm">
            <h2 className="h5 titulo-seccion mb-3">
              <span className="paso-compra me-2">3</span>
              Medio de pago
            </h2>

            <label className="form-label" htmlFor="checkoutPago">
              Selecciona cómo pagar
            </label>
            <select
              id="checkoutPago"
              name="idMetodoPago"
              className="form-select"
              value={form.idMetodoPago}
              onChange={cambiar}
              required
            >
              {metodosPago.map((metodo) => (
                <option key={metodo.id} value={metodo.id}>
                  {metodo.nombre === "CREDITO"
                    ? "Tarjeta de crédito"
                    : metodo.nombre === "DEBITO"
                      ? "Tarjeta de débito"
                      : metodo.nombre === "EFECTIVO"
                        ? "Efectivo"
                        : "Pago en línea (Flow)"}
                </option>
              ))}
            </select>

            <p className="texto-pequeno text-muted mt-2 mb-0">
              Esta compra es una simulación académica: no se cobrará dinero
              real.
            </p>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="carrito-resumen p-3 p-lg-4 sticky-lg-top" style={{ top: "90px" }}>
            <h2 className="h5 titulo-seccion mb-3">Resumen de tu compra</h2>
            <ResumenCarrito items={items} total={total} compacto />

            <div className="d-flex justify-content-between mt-2 texto-pequeno">
              <span>Envío</span>
              <span>{form.entrega === ENTREGAS.DOMICILIO ? "Gratis" : "Retiro"}</span>
            </div>

            <hr />

            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="fw-semibold">Total a pagar</span>
              <span className="carrito-total">{formatearMoneda(total)}</span>
            </div>

            <Boton
              type="submit"
              variante="marca"
              className="w-100"
              disabled={procesando}
            >
              {procesando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Procesando...
                </>
              ) : (
                "Confirmar compra"
              )}
            </Boton>

            <p className="texto-pequeno text-muted mt-3 mb-0">
              Al confirmar se creará la orden, se descontará el stock y se
              registrará el pago simulado.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
