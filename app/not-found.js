import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container py-5 text-center">
      <p className="display-1 fw-bold text-marca mb-0">404</p>
      <h1 className="h3 mt-3">No encontramos esta página</h1>
      <p className="text-muted">
        Puede que el enlace esté mal escrito o que el producto ya no exista.
      </p>
      <Link className="btn btn-marca" href="/">
        Volver al inicio
      </Link>
    </div>
  );
}
