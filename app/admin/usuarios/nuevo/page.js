"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cargando from "@/components/Cargando";
import FormularioUsuario from "@/components/FormularioUsuario";
import Mensaje from "@/components/Mensaje";
import {
  crearUsuario,
  listarClientes,
  listarUsuarios,
  mensajeDeError,
  siguienteId,
} from "@/lib/api";

export default function NuevoUsuarioPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setCargando(true);
        const lista = await listarClientes();
        if (activo) setClientes(lista);
      } catch (problema) {
        if (activo) setError(mensajeDeError(problema));
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, []);

  async function guardar(datos) {
    const usuarios = await listarUsuarios();
    const repetido = usuarios.some(
      (usuario) =>
        String(usuario.nombreUsuario).toLowerCase() ===
        datos.nombreUsuario.toLowerCase()
    );
    if (repetido) {
      throw new Error("Ese nombre de usuario ya está en uso.");
    }

    await crearUsuario({
      id: siguienteId(usuarios),
      nombreUsuario: datos.nombreUsuario,
      contrasena: datos.contrasena,
      rol: datos.rol,
      idCliente: datos.idCliente,
      activo: datos.activo,
    });
    router.push("/admin/usuarios");
  }

  return (
    <div>
      <nav aria-label="breadcrumb" className="migas mb-3">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <Link href="/admin/usuarios">Usuarios</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Nuevo usuario
          </li>
        </ol>
      </nav>

      <h1 className="titulo-seccion">Nuevo usuario</h1>
      <p className="text-muted mb-4">
        Crea una cuenta de administrador, vendedor o cliente.
      </p>

      {error ? <Mensaje tipo="error">{error}</Mensaje> : null}

      <div className="card card-body shadow-sm">
        {cargando ? (
          <Cargando texto="Cargando clientes..." />
        ) : (
          <FormularioUsuario
            clientes={clientes}
            onGuardar={guardar}
            esNuevo
          />
        )}
      </div>
    </div>
  );
}
