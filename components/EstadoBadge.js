import { claseEstado, etiquetaEstado } from "@/lib/estados";

export default function EstadoBadge({ estado }) {
  return (
    <span className={`badge badge-estado ${claseEstado(estado)}`}>
      {etiquetaEstado(estado)}
    </span>
  );
}
