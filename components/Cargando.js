export default function Cargando({ texto = "Cargando..." }) {
  return (
    <div className="text-center py-5" role="status">
      <div className="spinner-border text-marca" aria-hidden="true" />
      <p className="mt-3 text-muted mb-0">{texto}</p>
    </div>
  );
}
