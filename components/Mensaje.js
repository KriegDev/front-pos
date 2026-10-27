"use client";

const TIPOS = {
  exito: "alert-success",
  error: "alert-danger",
  aviso: "alert-warning",
  info: "alert-info",
};

export default function Mensaje({ tipo = "info", children, onCerrar }) {
  if (!children) return null;
  return (
    <div
      className={`alert ${TIPOS[tipo] || TIPOS.info} alert-dismissible fade show`}
      role="alert"
    >
      {children}
      {onCerrar ? (
        <button
          type="button"
          className="btn-close"
          aria-label="Cerrar"
          onClick={onCerrar}
        />
      ) : null}
    </div>
  );
}
