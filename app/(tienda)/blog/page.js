import Link from "next/link";
import { articulos } from "@/data/blog";

export const metadata = {
  title: "Blog",
  description:
    "Historias y reflexiones sobre los almacenes de barrio y el comercio local.",
};

export default function BlogPage() {
  return (
    <div className="container py-4 py-lg-5">
      <h1 className="titulo-seccion">Blog Tía Ceci</h1>
      <p className="subtitulo-seccion mb-4">
        Historias del barrio, del almacén y de la vida cotidiana.
      </p>

      <div className="row g-4">
        {articulos.map((articulo) => (
          <div className="col-12 col-md-6 col-lg-4" key={articulo.id}>
            <article className="card card-producto h-100">
              <img
                src={articulo.imagen}
                alt={articulo.titulo}
                className="imagen-destacada"
                loading="lazy"
              />
              <div className="card-body d-flex flex-column">
                <h2 className="h5">{articulo.titulo}</h2>
                <p className="text-muted texto-pequeno flex-grow-1">
                  {articulo.resumen}
                </p>
                <Link
                  className="btn btn-outline-marca align-self-start"
                  href={`/blog/${articulo.id}`}
                >
                  Leer artículo
                </Link>
              </div>
            </article>
          </div>
        ))}
      </div>
    </div>
  );
}
