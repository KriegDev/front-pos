"use client";

const VARIANTES = {
  marca: "btn-marca",
  outline: "btn-outline-marca",
  crema: "btn-crema",
  peligro: "btn-danger",
  secundario: "btn-secondary",
  claro: "btn-light",
  oscuro: "btn-dark",
};

export default function Boton({
  children,
  onClick,
  type = "button",
  variante = "marca",
  className = "",
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      className={`btn ${VARIANTES[variante] || VARIANTES.marca} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
