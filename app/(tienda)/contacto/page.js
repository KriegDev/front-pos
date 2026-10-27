import Link from "next/link";
import FormularioContacto from "@/components/FormularioContacto";

export const metadata = {
  title: "Contacto",
  description:
    "Contacta a El Rincón de la Tía Ceci en Av. Sur 700, Maipú.",
};

export default function ContactoPage() {
  return (
    <div className="container py-4 py-lg-5">
      <h1 className="titulo-seccion">Contacto</h1>
      <p className="subtitulo-seccion mb-4">
        ¿Tienes una consulta, un pedido especial o quieres saber si tenemos un
        producto? Escríbenos.
      </p>

      <div className="row g-4">
        <div className="col-12 col-lg-5">
          <div className="card card-body shadow-sm h-100">
            <h2 className="h5 titulo-seccion">Datos de la tienda</h2>
            <p className="mb-2">
              <i className="bi bi-geo-alt me-2 text-marca" aria-hidden="true" />
              <strong>Av. Sur 700, Maipú</strong>
            </p>
            <p className="mb-2">
              <i
                className="bi bi-telephone me-2 text-marca"
                aria-hidden="true"
              />
              (2) 2933 1313
            </p>
            <p className="text-muted texto-pequeno">
              También puedes visitarnos directamente en el local. Estamos en el
              corazón del barrio, en Avenida Sur.
            </p>

            <div className="ratio ratio-4x3 ratio-mapa mt-auto">
              <iframe
                title="Mapa de ubicación de El Rincón de la Tía Ceci"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3326.2313710438266!2d-70.7661195!3d-33.5213696!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662dd270acf0a87%3A0x7f171ef7d6c5984a!2sEl%20Rinc%C3%B3n%20de%20la%20Tia%20Ceci!5e0!3m2!1ses!2scl!4v1788582733766!5m2!1ses!2scl"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="card card-body shadow-sm">
            <h2 className="h5 titulo-seccion mb-3">Envíanos un mensaje</h2>
            <FormularioContacto />
            <p className="texto-pequeno text-muted mt-3 mb-0">
              Este formulario es una demostración: valida los datos y muestra
              un mensaje de éxito, pero no envía correos reales.
            </p>
          </div>

          <div className="mt-3">
            <Link className="btn btn-outline-marca" href="/puntos">
              Conoce Puntos Tía Ceci
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
