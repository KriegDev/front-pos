"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  EVENTO_CARRITO,
  contarItems,
  obtenerCarrito,
} from "@/lib/carrito";
import {
  EVENTO_SESION,
  cerrarSesion,
  obtenerSesion,
  puedeEntrarAlAdmin,
} from "@/lib/sesion";
import { NOMBRE_TIENDA } from "@/lib/constantes";

export default function Navbar() {
  const router = useRouter();
  const [sesion, setSesion] = useState(null);
  const [cantidad, setCantidad] = useState(0);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const actualizar = () => {
      setSesion(obtenerSesion());
      setCantidad(contarItems(obtenerCarrito()));
    };

    actualizar();
    window.addEventListener(EVENTO_CARRITO, actualizar);
    window.addEventListener(EVENTO_SESION, actualizar);
    window.addEventListener("storage", actualizar);

    return () => {
      window.removeEventListener(EVENTO_CARRITO, actualizar);
      window.removeEventListener(EVENTO_SESION, actualizar);
      window.removeEventListener("storage", actualizar);
    };
  }, []);

  function buscar(evento) {
    evento.preventDefault();
    const texto = busqueda.trim();
    router.push(texto ? `/productos?q=${encodeURIComponent(texto)}` : "/productos");
  }

  function salir() {
    cerrarSesion();
    setSesion(null);
    router.push("/");
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-marca sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 py-2" href="/">
          <img
            src="/imagenes/logo.png"
            alt="Logo de El Rincón de la Tía Ceci"
            className="logo-navbar"
            width="52"
            height="52"
          />
          <span className="d-flex flex-column">
            <span className="marca-titulo">{NOMBRE_TIENDA}</span>
            <span className="marca-subtitulo">
              ¡Encuentra de todo y más en tu rincón de siempre!
            </span>
          </span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#menuPrincipal"
          aria-controls="menuPrincipal"
          aria-expanded="false"
          aria-label="Abrir menú"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="menuPrincipal">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" href="/">
                Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/productos">
                Productos
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/categorias">
                Categorías
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/ofertas">
                Ofertas
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/nosotros">
                Nosotros
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/blog">
                Blog
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/contacto">
                Contacto
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold" href="/puntos">
                Puntos Tía Ceci
              </Link>
            </li>
          </ul>

          <form className="d-flex gap-2 my-2 my-lg-0 me-lg-3" onSubmit={buscar}>
            <input
              className="form-control form-control-sm"
              type="search"
              placeholder="Buscar producto o SKU"
              aria-label="Buscar producto"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
            />
            <button className="btn btn-crema btn-sm" type="submit">
              <i className="bi bi-search" aria-hidden="true" />
              <span className="visually-hidden">Buscar</span>
            </button>
          </form>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            {sesion ? (
              <>
                <span className="navbar-text text-white texto-pequeno">
                  Hola, {sesion.nombreUsuario}
                </span>
                {puedeEntrarAlAdmin(sesion) ? (
                  <Link className="btn btn-crema btn-sm" href="/admin">
                    Panel
                  </Link>
                ) : null}
                <button
                  type="button"
                  className="btn btn-outline-light btn-sm"
                  onClick={salir}
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-light btn-sm" href="/iniciar-sesion">
                  Iniciar sesión
                </Link>
                <Link className="btn btn-crema btn-sm" href="/crear-cuenta">
                  Crear cuenta
                </Link>
              </>
            )}

            <Link className="btn btn-crema btn-sm position-relative" href="/carrito">
              <i className="bi bi-cart4 me-1" aria-hidden="true" />
              Carrito
              <span className="badge text-bg-danger ms-1">{cantidad}</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
