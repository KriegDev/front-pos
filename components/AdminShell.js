"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import Boton from "./Boton";
import Cargando from "./Cargando";
import {
  cerrarSesion,
  esAdministrador,
  obtenerSesion,
  puedeEntrarAlAdmin,
} from "@/lib/sesion";

const RUTAS_SOLO_ADMIN = [
  "/admin/productos",
  "/admin/categorias",
  "/admin/usuarios",
  "/admin/reportes",
];

function esSoloAdmin(pathname) {
  if (pathname === "/admin/clientes/nuevo") return true;
  if (/^\/admin\/clientes\/[^/]+\/editar$/.test(pathname)) return true;
  return RUTAS_SOLO_ADMIN.some(
    (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`)
  );
}

export default function AdminShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sesion, setSesion] = useState(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const actual = obtenerSesion();
    if (!actual || !puedeEntrarAlAdmin(actual)) {
      router.replace("/iniciar-sesion");
      return;
    }
    setSesion(actual);
    setVerificando(false);
  }, [router]);

  useEffect(() => {
    if (!sesion) return;
    if (esSoloAdmin(pathname) && !esAdministrador(sesion)) {
      router.replace("/admin");
    }
  }, [pathname, sesion, router]);

  function salir() {
    cerrarSesion();
    router.replace("/");
  }

  if (verificando) {
    return (
      <div className="container py-5">
        <Cargando texto="Verificando sesión..." />
      </div>
    );
  }

  if (!sesion) return null;

  const sinPermiso = esSoloAdmin(pathname) && !esAdministrador(sesion);

  return (
    <div className="admin-shell d-md-flex">
      <aside
        className="admin-sidebar d-none d-md-flex flex-column p-3 flex-shrink-0"
        style={{ width: "260px" }}
      >
        <AdminSidebar rol={sesion.rol} pathname={pathname} onSalir={salir} />
      </aside>

      <div
        className="offcanvas offcanvas-start admin-sidebar"
        tabIndex="-1"
        id="menuAdmin"
        aria-labelledby="menuAdminLabel"
        style={{ width: "280px" }}
      >
        <div className="offcanvas-header">
          <h2 className="offcanvas-title h5" id="menuAdminLabel">
            Menú
          </h2>
          <button
            type="button"
            className="btn-close btn-close-white"
            data-bs-dismiss="offcanvas"
            aria-label="Cerrar"
          />
        </div>
        <div className="offcanvas-body">
          <AdminSidebar rol={sesion.rol} pathname={pathname} onSalir={salir} />
        </div>
      </div>

      <div className="admin-contenido flex-grow-1">
        <header className="admin-topbar sticky-top px-3 py-2 d-flex justify-content-between align-items-center gap-2">
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-marca d-md-none"
              data-bs-toggle="offcanvas"
              data-bs-target="#menuAdmin"
              aria-controls="menuAdmin"
              aria-label="Abrir menú"
            >
              <i className="bi bi-list" aria-hidden="true" />
            </button>
            <span className="fw-semibold">Panel de administración</span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="badge text-bg-dark">{sesion.rol}</span>
            <span className="texto-pequeno d-none d-sm-inline">
              {sesion.nombreUsuario}
            </span>
            <Boton variante="outline" className="btn-sm" onClick={salir}>
              Salir
            </Boton>
          </div>
        </header>

        <main className="p-3 p-lg-4">
          {sinPermiso ? (
            <div className="alert alert-warning">
              No tienes permiso para entrar a esta sección. Volviendo al
              dashboard...
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
