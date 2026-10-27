"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const MENSAJES = {
  stock: {
    titulo: "No hay stock suficiente",
    detalle:
      "Alguno de los productos de tu carrito ya no tiene stock disponible. Revisa las cantidades y vuelve a intentarlo.",
  },
  pago: {
    titulo: "No se pudo procesar el pago",
    detalle:
      "El pago simulado fue rechazado. Puedes volver al carrito y elegir otro medio de pago.",
  },
  general: {
    titulo: "No se pudo completar la compra",
    detalle:
      "Ocurrió un problema al registrar la orden. Revisa que la API esté funcionando y vuelve a intentarlo.",
  },
};

export default function CompraErrorPage() {
  const [motivo, setMotivo] = useState("general");

  useEffect(() => {
    const parametros = new URLSearchParams(window.location.search);
    const valor = parametros.get("motivo");
    if (valor && MENSAJES[valor]) setMotivo(valor);
  }, []);

  const mensaje = MENSAJES[motivo] || MENSAJES.general;

  return (
    <div className="container py-5">
      <div className="card shadow-sm border-0">
        <div className="card-body p-4 p-lg-5 text-center">
          <i
            className="bi bi-x-circle-fill text-danger display-4"
            aria-hidden="true"
          />
          <h1 className="titulo-seccion mt-3">{mensaje.titulo}</h1>
          <p className="text-muted">{mensaje.detalle}</p>

          <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
            <Link className="btn btn-marca" href="/carrito">
              Volver al carrito
            </Link>
            <Link className="btn btn-outline-marca" href="/productos">
              Ver productos
            </Link>
            <Link className="btn btn-link" href="/contacto">
              Contactar a la tienda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
