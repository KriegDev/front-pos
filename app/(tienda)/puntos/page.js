"use client";

import Link from "next/link";
import FormularioPuntos from "@/components/FormularioPuntos";
import {
  actualizarCliente,
  crearCliente,
  listarClientes,
  siguienteId,
} from "@/lib/api";
import { separarRun } from "@/lib/validaciones";

export default function PuntosPage() {
  async function registrar(datos) {
    const { run, dvrun } = separarRun(datos.run);
    const clientes = await listarClientes();
    const existente = clientes.find(
      (cliente) => Number(cliente.run) === Number(run)
    );

    if (existente) {
      if (!existente.activo) {
        throw new Error(
          "El cliente está inactivo. Comunícate con la tienda para reactivarlo."
        );
      }
      await actualizarCliente(existente.id, {
        ...existente,
        pnombre: datos.pnombre,
        snombre: datos.snombre,
        appaterno: datos.appaterno,
        apmaterno: datos.apmaterno,
        correo: datos.correo,
        telefono: Number(String(datos.telefono).replace(/\D/g, "")),
      });
      return "Ya estabas en Puntos Tía Ceci. Actualizamos tus datos de contacto.";
    }

    await crearCliente({
      id: siguienteId(clientes),
      run,
      dvrun,
      pnombre: datos.pnombre,
      snombre: datos.snombre,
      appaterno: datos.appaterno,
      apmaterno: datos.apmaterno,
      correo: datos.correo,
      telefono: Number(String(datos.telefono).replace(/\D/g, "")),
      activo: true,
    });

    return "¡Ya eres parte de Puntos Tía Ceci! Tus datos quedaron registrados.";
  }

  return (
    <div className="container py-4 py-lg-5">
      <div className="p-4 p-lg-5 rounded-4 seccion-crema mb-4">
        <span className="hero-etiqueta mb-3">Programa de fidelidad</span>
        <h1 className="titulo-seccion">
          ¡Súmate a Puntos Tía Ceci y ahorra aún más!
        </h1>
        <p className="mb-0">
          Registra tus datos una vez y úsalos en tus compras. Muy pronto podrás
          canjear tus puntos por beneficios en la tienda.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-5">
          <div className="card card-body shadow-sm h-100">
            <h2 className="h5 titulo-seccion">¿Cómo funciona?</h2>
            <ul className="list-unstyled mb-0">
              <li className="d-flex gap-2 mb-3">
                <i className="bi bi-1-circle-fill text-marca" aria-hidden="true" />
                <span>Registra tus datos personales y tu RUN.</span>
              </li>
              <li className="d-flex gap-2 mb-3">
                <i className="bi bi-2-circle-fill text-marca" aria-hidden="true" />
                <span>Compra en la tienda y acumula puntos.</span>
              </li>
              <li className="d-flex gap-2">
                <i className="bi bi-3-circle-fill text-marca" aria-hidden="true" />
                <span>Canjea tus puntos por beneficios y ofertas.</span>
              </li>
            </ul>

            <hr />

            <p className="texto-pequeno text-muted mb-3">
              Este registro es una simulación académica. No se envían correos ni
              se acumulan puntos reales.
            </p>
            <Link className="btn btn-outline-marca align-self-start" href="/contacto">
              ¿Tienes dudas? Contáctanos
            </Link>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="card card-body shadow-sm">
            <h2 className="h5 titulo-seccion mb-3">Ingresa tus datos</h2>
            <FormularioPuntos onRegistrar={registrar} />
          </div>
        </div>
      </div>
    </div>
  );
}
