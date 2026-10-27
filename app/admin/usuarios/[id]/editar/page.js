"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cargando from "@/components/Cargando";
import FormularioUsuario from "@/components/FormularioUsuario";
import Mensaje from "@/components/Mensaje";
import {
  actualizarUsuario,
  listarClientes,
  listarUsuarios,
  mensajeDeError,
  obtenerUsuario,
} from "@/lib/api";
import { guardarSesion, obtenerSesion } from "@/lib/sesion";

export default function EditarUsuarioPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [usuario, setUsuario] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setCargando(true);
        const [datosUsuario, listaClientes] = await Promise.all([
          obtenerUsuario(id),
          listarClientes(),
        ]);
        if (!activo) return;
        setUsuario(datosUsuario);
        setClientes(listaClientes);
        setSesion(obtenerSesion());
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
    const usuarios = await listarUsuarios();
    const repetido = usuarios.some(
      (item) =>
        Number(item.id) !== Number(usuario.id) &&
        String(item.nombreUsuario).toLowerCase() ===
          datos.nombreUsuario.toLowerCase()
    );
    if (repetido) {
      throw new Error("Ese nombre de usuario ya está en uso.");
    }

    const esMiUsuario = Number(usuario.id) === Number(sesion?.id);
    if (esMiUsuario && datos.rol !== usuario.rol) {
      throw new Error("No puedes cambiar tu propio rol.");
    }
    if (esMiUsuario && !datos.activo) {
      throw new Error("No puedes desactivar tu propio usuario.");
    }

    const actualizado = await actualizarUsuario(usuario.id, {
      ...usuario,
      nombreUsuario: datos.nombreUsuario,
      contrasena: datos.contrasena || usuario.contrasena,
      rol: datos.rol,
      idCliente: datos.idCliente,
      activo: datos.activo,
    });

    if (esMiUsuario) {
      guardarSesion(actualizado);
    }

    router.push("/admin/usuarios");
  }

  if (cargando) {
    return (
      <div className="container py-5">
        <Cargando texto="Cargando usuario..." />
      </div>
    );
  }

  if (error && !usuario) {
    return (
      <div>
        <Mensaje tipo="error">{error}</Mensaje>
        <Link className="btn btn-marca" href="/admin/usuarios">
          Volver a usuarios
        </Link>
      </div>
    );
  }

  return (
    <div>
      <nav aria-label="breadcrumb" className="migas mb-3">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <Link href="/admin/usuarios">Usuarios</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Editar usuario
          </li>
        </ol>
      </nav>

      <h1 className="titulo-seccion">Editar usuario</h1>
      <p className="text-muted mb-4">{usuario.nombreUsuario}</p>

      {error ? <Mensaje tipo="error" onCerrar={() => setError("")}>{error}</Mensaje> : null}

      <div className="card card-body shadow-sm">
        <FormularioUsuario
          usuarioInicial={usuario}
          clientes={clientes}
          onGuardar={guardar}
        />

        <hr className="my-4" />
        <div className="d-flex justify-content-between">
          <Link className="btn btn-outline-marca" href="/admin/usuarios">
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  );
}
