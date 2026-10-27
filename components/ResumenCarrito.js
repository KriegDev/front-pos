import { calcularSubtotal, calcularTotal } from "@/lib/carrito";
import { formatearMoneda } from "@/lib/formato";

export default function ResumenCarrito({ items, total, compacto = false }) {
  if (!items || items.length === 0) {
    return <p className="text-muted mb-0">Tu carrito está vacío.</p>;
  }

  const totalCalculado = total ?? calcularTotal(items);

  return (
    <div>
      <ul className="list-group list-group-flush">
        {items.map((item) => (
          <li
            className="list-group-item px-0 d-flex justify-content-between align-items-start gap-2"
            key={item.id}
          >
            <div>
              <p className="mb-0 fw-semibold">{item.nombre}</p>
              <p className="mb-0 texto-pequeno text-muted">
                {item.cantidad} × {formatearMoneda(item.precio)}
              </p>
            </div>
            <span className="fw-semibold">
              {formatearMoneda(calcularSubtotal(item))}
            </span>
          </li>
        ))}
      </ul>

      <div className="d-flex justify-content-between mt-3">
        <span className="fw-semibold">
          {compacto ? "Total" : "Total del carrito"}
        </span>
        <span className="carrito-total">{formatearMoneda(totalCalculado)}</span>
      </div>
    </div>
  );
}
