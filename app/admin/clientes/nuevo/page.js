"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormularioCliente from "@/components/FormularioCliente";
import Mensaje from "@/components/Mensaje";
import {
  crearCliente,
  listarClientes,
  siguienteId,
} from "@/lib/api";

export default function NuevoClientePage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function guardar(datos) {
    const clientes = await listarClientes();
    const repetido = clientes.some(
      (cliente) => Number(cliente.run) === Number(datos.run)
    );
    if (repetido) {
      throw new Error("Ya existe un cliente con ese RUN.");
    }
    await crearCliente({ id: siguienteId(clientes), ...datos });
    router.push("/admin/clientes");
  }

  return (
    <div>
      <nav aria-label="breadcrumb" className="migas mb-3">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <Link href="/admin/clientes">Clientes</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Nuevo cliente
          </li>
        </ol>
      </nav>

      <h1 className="titulo-seccion">Nuevo cliente</h1>
      <p className="text-muted mb-4">
        Registra los datos de un cliente sin crear una cuenta de acceso.
      </p>

      {error ? <Mensaje tipo="error">{error}</Mensaje> : null}

      <div className="card card-body shadow-sm">
        <FormularioCliente onGuardar={guardar} esNuevo />
      </div>
    </div>
  );
}
