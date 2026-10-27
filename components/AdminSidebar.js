"use client";

import Link from "next/link";
import { ROLES } from "@/lib/constantes";

const ENLACES = [
  { href: "/admin", etiqueta: "Dashboard", icono: "bi-house-door" },
  { href: "/admin/ventas", etiqueta: "Nueva venta", icono: "bi-cart-plus" },
  { href: "/admin/ordenes", etiqueta: "Órdenes", icono: "bi-receipt" },
  {
    href: "/admin/productos",
    etiqueta: "Productos",
    icono: "bi-box-seam",
    soloAdmin: true,
  },
  {
    href: "/admin/categorias",
    etiqueta: "Categorías",
    icono: "bi-tags",
    soloAdmin: true,
  },
  { href: "/admin/clientes", etiqueta: "Clientes", icono: "bi-people" },
  {
    href: "/admin/usuarios",
    etiqueta: "Usuarios",
    icono: "bi-person-gear",
    soloAdmin: true,
  },
  {
    href: "/admin/reportes",
    etiqueta: "Reportes",
    icono: "bi-graph-up",
    soloAdmin: true,
  },
  { href: "/admin/perfil", etiqueta: "Perfil", icono: "bi-person-circle" },
];

function estaActivo(pathname, href) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebar({ rol, pathname, onSalir }) {
  const enlaces = ENLACES.filter(
    (enlace) => !enlace.soloAdmin || rol === ROLES.ADMIN
  );

  return (
    <div className="d-flex flex-column h-100">
      <Link
        href="/admin"
        className="d-flex align-items-center gap-2 text-decoration-none mb-4 px-2"
        data-bs-dismiss="offcanvas"
      >
        <img
          src="/imagenes/logo.png"
          alt="Logo Tía Ceci"
          width="44"
          height="44"
          className="logo-navbar"
        />
        <span>
          <span className="d-block fw-bold text-white">Tía Ceci</span>
          <span className="d-block texto-pequeno text-white-50">
            Panel administrativo
          </span>
        </span>
      </Link>

      <ul className="nav flex-column mb-3">
        {enlaces.map((enlace) => (
          <li className="nav-item" key={enlace.href}>
            <Link
              href={enlace.href}
              className={`nav-link ${
                estaActivo(pathname, enlace.href) ? "activo" : ""
              }`}
              data-bs-dismiss="offcanvas"
            >
              <i className={`bi ${enlace.icono}`} aria-hidden="true" />
              {enlace.etiqueta}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <hr className="border-light opacity-25" />
        <Link
          href="/"
          className="nav-link"
          data-bs-dismiss="offcanvas"
        >
          <i className="bi bi-shop" aria-hidden="true" />
          Ver tienda
        </Link>
        <button
          type="button"
          className="nav-link w-100 text-start border-0 bg-transparent"
          onClick={onSalir}
        >
          <i className="bi bi-box-arrow-right" aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
