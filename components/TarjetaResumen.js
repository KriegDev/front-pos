export default function TarjetaResumen({
  icono,
  titulo,
  valor,
  detalle,
  clase = "tarjeta-roja",
}) {
  return (
    <div className={`card tarjeta-resumen ${clase} shadow-sm`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <p className="mb-1 text-uppercase small opacity-75">{titulo}</p>
            <p className="valor mb-0">{valor}</p>
            {detalle ? (
              <p className="mb-0 small opacity-75">{detalle}</p>
            ) : null}
          </div>
          <i className={`bi ${icono} icono`} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
