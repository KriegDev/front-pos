import Link from "next/link";

export const metadata = {
  title: "Nosotros",
  description:
    "Conoce la historia de El Rincón de la Tía Ceci, el minimarket de barrio en Maipú.",
};

export default function NosotrosPage() {
  return (
    <div className="container py-4 py-lg-5">
      <div className="row align-items-center g-4 mb-5">
        <div className="col-12 col-lg-6">
          <img
            src="/imagenes/rincon.jpg"
            alt="Fachada de El Rincón de la Tía Ceci"
            className="img-fluid rounded-4 shadow"
          />
        </div>
        <div className="col-12 col-lg-6">
          <span className="hero-etiqueta mb-3">Nuestra historia</span>
          <h1 className="titulo-seccion">Un almacén con nombre de barrio</h1>
          <p>
            El minimarket nació como una forma de ayudar a nuestros vecinos,
            ofreciendo siempre la mejor calidad a precios asequibles. Nuestro
            proyecto siempre fue ser parte de la comunidad y así lo hemos ido
            logrando de a poco, participando en proyectos sociales orientados a
            ser un punto de ayuda para nuestros vecinos en tiempos difíciles.
          </p>
          <p>
            Nuestra meta es seguir atendiendo con la mejor disposición y dar un
            servicio de calidad, como los vecinos de Avenida Sur y sus
            alrededores lo merecen.
          </p>
          <Link className="btn btn-marca" href="/contacto">
            Visítanos o escríbenos
          </Link>
        </div>
      </div>

      <section className="seccion-crema rounded-4 p-4 p-lg-5 mb-5">
        <h2 className="titulo-seccion text-center mb-4">Lo que nos importa</h2>
        <div className="row g-4">
          <div className="col-12 col-md-4">
            <div className="card card-body h-100 text-center">
              <i
                className="bi bi-emoji-smile display-6 text-marca"
                aria-hidden="true"
              />
              <h3 className="h5 mt-2">Atención cercana</h3>
              <p className="texto-pequeno text-muted mb-0">
                Conocemos a nuestros vecinos y atendemos con la misma
                disposición de siempre.
              </p>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card card-body h-100 text-center">
              <i
                className="bi bi-basket display-6 text-marca"
                aria-hidden="true"
              />
              <h3 className="h5 mt-2">Calidad y precio justo</h3>
              <p className="texto-pequeno text-muted mb-0">
                Buscamos ofrecer productos de calidad a precios asequibles para
                el día a día.
              </p>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card card-body h-100 text-center">
              <i
                className="bi bi-people display-6 text-marca"
                aria-hidden="true"
              />
              <h3 className="h5 mt-2">Comunidad</h3>
              <p className="texto-pequeno text-muted mb-0">
                Participamos en proyectos sociales y apoyamos a nuestros
                vecinos cuando más lo necesitan.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="row g-4 align-items-center">
        <div className="col-12 col-lg-7">
          <h2 className="titulo-seccion">Visítanos en Maipú</h2>
          <p className="mb-2">
            <i className="bi bi-geo-alt me-2 text-marca" aria-hidden="true" />
            <strong>Av. Sur 700, Maipú</strong>
          </p>
          <p className="mb-2">
            <i className="bi bi-telephone me-2 text-marca" aria-hidden="true" />
            (2) 2933 1313
          </p>
          <p className="text-muted">
            También puedes revisar nuestros productos y ofertas en línea, y
            retirar tu compra en la tienda.
          </p>
          <Link className="btn btn-outline-marca" href="/productos">
            Ver catálogo
          </Link>
        </div>
        <div className="col-12 col-lg-5">
          <div className="ratio ratio-4x3 ratio-mapa shadow-sm">
            <iframe
              title="Ubicación de El Rincón de la Tía Ceci"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3326.2313710438266!2d-70.7661195!3d-33.5213696!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662dd270acf0a87%3A0x7f171ef7d6c5984a!2sEl%20Rinc%C3%B3n%20de%20la%20Tia%20Ceci!5e0!3m2!1ses!2scl!4v1788582733766!5m2!1ses!2scl"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </div>
  );
}
