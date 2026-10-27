import Link from "next/link";
import {
  DIRECCION_TIENDA,
  NOMBRE_TIENDA,
  TELEFONO_TIENDA,
} from "@/lib/constantes";

export default function Footer() {
  return (
    <footer className="footer-marca mt-auto py-4">
      <div className="container">
        <div className="row g-4">
          <div className="col-12 col-md-5">
            <h2 className="h5 fw-bold">{NOMBRE_TIENDA}</h2>
            <p className="mb-2 texto-pequeno">
              Tu almacén de barrio en Maipú. Abarrotes, bebidas, limpieza,
              lácteos y frutas y verduras con atención cercana.
            </p>
            <p className="mb-1 texto-pequeno">
              <i className="bi bi-geo-alt me-2" aria-hidden="true" />
              {DIRECCION_TIENDA}
            </p>
            <p className="mb-0 texto-pequeno">
              <i className="bi bi-telephone me-2" aria-hidden="true" />
              {TELEFONO_TIENDA}
            </p>
          </div>

          <div className="col-6 col-md-3">
            <h2 className="h6 fw-bold text-uppercase">Tienda</h2>
            <ul className="list-unstyled texto-pequeno mb-0">
              <li className="mb-1">
                <Link href="/productos">Productos</Link>
              </li>
              <li className="mb-1">
                <Link href="/categorias">Categorías</Link>
              </li>
              <li className="mb-1">
                <Link href="/ofertas">Ofertas</Link>
              </li>
              <li className="mb-1">
                <Link href="/puntos">Puntos Tía Ceci</Link>
              </li>
            </ul>
          </div>

          <div className="col-6 col-md-4">
            <h2 className="h6 fw-bold text-uppercase">Ayuda</h2>
            <ul className="list-unstyled texto-pequeno mb-0">
              <li className="mb-1">
                <Link href="/nosotros">Nosotros</Link>
              </li>
              <li className="mb-1">
                <Link href="/blog">Blog</Link>
              </li>
              <li className="mb-1">
                <Link href="/contacto">Contacto</Link>
              </li>
              <li className="mb-1">
                <Link href="/iniciar-sesion">Iniciar sesión</Link>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-light opacity-25 my-4" />
        <p className="text-center texto-pequeno mb-0">
          © {new Date().getFullYear()} KC. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
