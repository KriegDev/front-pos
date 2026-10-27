import Link from "next/link";
import { notFound } from "next/navigation";
import { articulos } from "@/data/blog";

export function generateStaticParams() {
  return articulos.map((articulo) => ({ id: String(articulo.id) }));
}

export default async function BlogDetallePage({ params }) {
  const { id } = await params;
  const articulo = articulos.find(
    (elemento) => Number(elemento.id) === Number(id)
  );

  if (!articulo) notFound();

  return (
    <div className="container py-4 py-lg-5">
      <nav aria-label="breadcrumb" className="migas mb-3">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <Link href="/">Inicio</Link>
          </li>
          <li className="breadcrumb-item">
            <Link href="/blog">Blog</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {articulo.titulo}
          </li>
        </ol>
      </nav>

      <article className="row justify-content-center">
        <div className="col-12 col-lg-9">
          <img
            src={articulo.imagen}
            alt={articulo.titulo}
            className="img-fluid rounded-4 shadow-sm mb-4"
          />
          <h1 className="titulo-seccion">{articulo.titulo}</h1>
          <p className="lead text-muted">{articulo.resumen}</p>

          {articulo.contenido.map((parrafo) => (
            <p key={parrafo.slice(0, 40)}>{parrafo}</p>
          ))}

          <div className="d-flex gap-2 mt-4">
            <Link className="btn btn-marca" href="/blog">
              Volver al blog
            </Link>
            <Link className="btn btn-outline-marca" href="/productos">
              Ver productos
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
