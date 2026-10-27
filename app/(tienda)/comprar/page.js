"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cargando from "@/components/Cargando";
import FormularioCheckout from "@/components/FormularioCheckout";
import Mensaje from "@/components/Mensaje";
import {
  actualizarCliente,
  crearCliente,
  listarClientes,
  listarMetodosPago,
  mensajeDeError,
  obtenerCliente,
  siguienteId,
} from "@/lib/api";
import {
  calcularTotal,
  obtenerCarrito,
  vaciarCarrito,
} from "@/lib/carrito";
import { obtenerSesion } from "@/lib/sesion";
import { registrarVenta } from "@/lib/ventas";

export default function ComprarPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [metodosPago, setMetodosPago] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setCargando(true);
        const carrito = obtenerCarrito();
        if (activo) setItems(carrito);

        const metodos = await listarMetodosPago();
        if (activo) {
          setMetodosPago(
            (metodos || []).filter((metodo) => metodo.activo !== false)
          );
        }

        const sesion = obtenerSesion();
        if (sesion?.idCliente) {
          try {
            const datosCliente = await obtenerCliente(sesion.idCliente);
            if (activo) setCliente(datosCliente);
          } catch {
            if (activo) setCliente(null);
          }
        }
      } catch (problema) {
        if (activo) setError(mensajeDeError(problema));
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, []);

  async function confirmar(datos) {
    setProcesando(true);
    setError("");

    try {
      let idCliente = cliente?.id || null;

      if (cliente && cliente.activo === false) {
        throw new Error(
          "Tu cuenta de cliente está inactiva. Comunícate con la tienda para reactivarla."
        );
      }

      if (idCliente) {
        const actualizado = await actualizarCliente(cliente.id, {
          ...cliente,
          pnombre: datos.pnombre,
          snombre: datos.snombre,
          appaterno: datos.appaterno,
          apmaterno: datos.apmaterno,
          correo: datos.correo,
          telefono: datos.telefono,
        });
        idCliente = actualizado.id;
      } else {
        const clientes = await listarClientes();
        const existente = clientes.find(
          (registro) => Number(registro.run) === Number(datos.run)
        );

        if (existente) {
          if (!existente.activo) {
            throw new Error(
              "El cliente está inactivo. Comunícate con la tienda para reactivar la cuenta."
            );
          }
          const actualizado = await actualizarCliente(existente.id, {
            ...existente,
            pnombre: datos.pnombre,
            snombre: datos.snombre,
            appaterno: datos.appaterno,
            apmaterno: datos.apmaterno,
            correo: datos.correo,
            telefono: datos.telefono,
          });
          idCliente = actualizado.id;
        } else {
          const nuevo = await crearCliente({
            id: siguienteId(clientes),
            run: datos.run,
            dvrun: datos.dvrun,
            pnombre: datos.pnombre,
            snombre: datos.snombre,
            appaterno: datos.appaterno,
            apmaterno: datos.apmaterno,
            correo: datos.correo,
            telefono: datos.telefono,
            activo: true,
          });
          idCliente = nuevo.id;
        }
      }

      const { orden } = await registrarVenta({
        items,
        idCliente,
        idMetodoPago: datos.idMetodoPago,
        entrega: datos.entrega,
        direccion: datos.direccion,
        region: datos.region,
        comuna: datos.comuna,
        estadoInicial: "PENDIENTE_PAGO",
      });

      vaciarCarrito();
      router.push(`/comprar/ok?orden=${orden.id}`);
    } catch (problema) {
      const texto = String(problema.message || "");
      if (texto.toLowerCase().includes("stock")) {
        router.push("/comprar/error?motivo=stock");
      } else {
        setError(texto || "No se pudo completar la compra.");
      }
    } finally {
      setProcesando(false);
    }
  }

  const total = calcularTotal(items);

  return (
    <div className="container py-4 py-lg-5">
      <h1 className="titulo-seccion">Finalizar compra</h1>
      <p className="subtitulo-seccion mb-4">
        Completa tus datos, elige la entrega y confirma el pago.
      </p>

      {error ? (
        <Mensaje tipo="error" onCerrar={() => setError("")}>
          {error}
        </Mensaje>
      ) : null}

      {cargando ? (
        <Cargando texto="Preparando tu compra..." />
      ) : items.length === 0 ? (
        <div className="card card-body text-center py-5">
          <h2 className="h4">No hay productos en el carrito</h2>
          <p className="text-muted">
            Agrega productos antes de pasar al pago.
          </p>
          <div>
            <Link className="btn btn-marca" href="/productos">
              Ver productos
            </Link>
          </div>
        </div>
      ) : metodosPago.length === 0 ? (
        <Mensaje tipo="error">
          No hay medios de pago disponibles. Revisa que json-server esté
          ejecutándose con <code>npm run mock</code>.
        </Mensaje>
      ) : (
        <FormularioCheckout
          items={items}
          total={total}
          cliente={cliente}
          metodosPago={metodosPago}
          onConfirmar={confirmar}
          procesando={procesando}
        />
      )}
    </div>
  );
}
