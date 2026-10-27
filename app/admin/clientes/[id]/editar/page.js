"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cargando from "@/components/Cargando";
import FormularioCliente from "@/components/FormularioCliente";
import Mensaje from "@/components/Mensaje";
import {
  actualizarCliente,
  listarClientes,
  mensajeDeError,
  obtenerCliente,
} from "@/lib/api";
import { nombreCliente, runCliente } from "@/lib/datos";

export default function EditarClientePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [cliente, setCliente] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setCargando(true);
        const datos = await obtenerCliente(id);
        if (activo) setCliente(datos);
      } catch (problema) {
        if (activo) setError(mensajeDeError(problema));
      } finally {
        if (activo) setCargando(false);
      }
    }

    if (id) cargar();
    return () => {
      activo = false;
    };
  }, [id]);

  async function guardar(datos) {
    const clientes = await listarClientes();
    const repetido = clientes.some(
      (item) =>
        Number(item.id) !== Number(cliente.id) &&
        Number(item.run) === Number(datos.run)
    );
    if (repetido) {
      throw new Error("Ya existe otro cliente con ese RUN.");
    }

    await actualizarCliente(cliente.id, {
      ...cliente,
      ...datos,
    });
    router.push("/admin/clientes");
  }

  if (cargando) {
    return (
      <div className="container py-5">
        <Cargando texto="Cargando cliente..." />
      </div>
    );
  }

  if (error && !cliente) {
    return (
      <div>
        <Mensaje tipo="error">{error}</Mensaje>
        <Link className="btn btn-marca" href="/admin/clientes">
          Volver a clientes
        </Link>
      </div>
    );
  }

  return (
    <div>
      <nav aria-label="breadcrumb" className="migas mb-3">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <Link href="/admin/clientes">Clientes</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Editar cliente
          </li>
        </ol>
      </nav>

      <h1 className="titulo-seccion">Editar cliente</h1>
      <p className="text-muted mb-4">
        {nombreCliente(cliente)} · {runCliente(cliente)}
      </p>

      {error ? <Mensaje tipo="error" onCerrar={() => setError("")}>{error}</Mensaje> : null}

      <div className="card card-body shadow-sm">
        <FormularioCliente clienteInicial={cliente} onGuardar={guardar} />

        <hr className="my-4" />
        <div className="d-flex justify-content-between">
          <Link className="btn btn-outline-marca" href="/admin/clientes">
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  );
}
