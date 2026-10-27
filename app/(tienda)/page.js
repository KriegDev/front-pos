"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Boton from "@/components/Boton";
import Cargando from "@/components/Cargando";
import Mensaje from "@/components/Mensaje";
import TarjetaProducto from "@/components/TarjetaProducto";
import { listarCategorias, listarProductos, listarStock, mensajeDeError } from "@/lib/api";
import { agregarAlCarrito } from "@/lib/carrito";
import {
  DIRECCION_TIENDA,
  ICONOS_CATEGORIA,
  NOMBRE_TIENDA,
  TELEFONO_TIENDA,
} from "@/lib/constantes";
import { tieneOferta, unirProductos } from "@/lib/datos";

const RECIEN_LLEGADOS = [
  {
    titulo: "Gansito Army",
    texto: "Prueba el nuevo Gansito Army, edición limitada.",
    imagen: "/imagenes/gansito.jpg",
  },
  {
    titulo: "Pipeño Casa Grande",
    texto: "Adelanta las fiestas patrias con el mejor pipeño.",
    imagen: "/imagenes/pimeno.webp",
  },
  {
    titulo: "Helado de piña Fruna",
    texto: "¿El mejor aliado de un buen terremoto? El helado de piña.",
    imagen: "/imagenes/helado-pina.webp",
  },
];

export default function InicioPage() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setCargando(true);
        setError("");
        const [listaProductos, listaCategorias, stock] = await Promise.all([
          listarProductos(),
          listarCategorias(),
          listarStock(),
        ]);
        if (!activo) return;
        setProductos(unirProductos(listaProductos, stock));
        setCategorias(listaCategorias);
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

  function agregar(producto) {
    agregarAlCarrito(producto, 1);
    setAviso(`Agregaste ${producto.nombre} al carrito.`);
  }

  const ofertas = productos.filter(tieneOferta).slice(0, 4);

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="hero-etiqueta mb-3">Minimarket de barrio</span>
          <h1 className="mb-3">{NOMBRE_TIENDA}</h1>
          <p className="mb-4">
            ¡Encuentra de todo y más en tu rincón de siempre! Abarrotes,
            bebidas, limpieza, lácteos y frutas y verduras, con la atención
            cercana de tu barrio en Maipú.
          </p>
          <div className="d-flex flex-wrap gap-2">
            <Link className="btn btn-crema btn-lg" href="/productos">
              Ver productos
            </Link>
            <Link className="btn btn-outline-light btn-lg" href="/ofertas">
              Ver ofertas
            </Link>
          </div>
        </div>
      </section>

      <div className="container mt-3">
        {aviso ? (
          <Mensaje tipo="exito" onCerrar={() => setAviso("")}>
            {aviso}{" "}
            <Link href="/carrito" className="alert-link">
              Ir al carrito
            </Link>
          </Mensaje>
        ) : null}
        {error ? (
          <Mensaje tipo="error" onCerrar={() => setError("")}>
            {error}{" "}
            <Boton
              variante="outline"
              className="btn-sm ms-2"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </Boton>
          </Mensaje>
        ) : null}
      </div>

      <section className="py-5">
        <div className="container">
          <h2 className="titulo-seccion mb-1">Categorías</h2>
          <p className="subtitulo-seccion mb-4">
            Encuentra lo que necesitas por tipo de producto.
          </p>

          {cargando ? (
            <Cargando texto="Cargando categorías..." />
          ) : (
            <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-5">
              {categorias.map((categoria) => {
                const cantidad = productos.filter(
                  (producto) =>
                    Number(producto.categoria?.id) === Number(categoria.id)
                ).length;
                return (
                  <div className="col" key={categoria.id}>
                    <Link
                      href={`/categorias/${categoria.id}`}
                      className="enlace-sin-estilo"
                    >
                      <div className="categoria-card card-body text-center h-100">
                        <i
                          className={`bi ${
                            ICONOS_CATEGORIA[categoria.nombre] || "bi-shop"
                          } categoria-icono`}
                          aria-hidden="true"
                        />
                        <h3 className="h6 mt-2 mb-1">{categoria.nombre}</h3>
                        <p className="texto-pequeno text-muted mb-0">
                          {cantidad} producto{cantidad === 1 ? "" : "s"}
                        </p>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-5 seccion-crema">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end gap-2 mb-4">
            <div>
              <h2 className="titulo-seccion mb-1">Ofertas de la semana</h2>
              <p className="subtitulo-seccion mb-0">
                Productos seleccionados con 10% de descuento.
              </p>
            </div>
            <Link className="btn btn-outline-marca" href="/ofertas">
              Ver todas
            </Link>
          </div>

          {cargando ? (
            <Cargando texto="Cargando ofertas..." />
          ) : ofertas.length === 0 ? (
            <div className="alert alert-info mb-0">
              Por ahora no hay ofertas activas.
            </div>
          ) : (
            <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-4">
              {ofertas.map((producto) => (
                <div className="col" key={producto.id}>
                  <TarjetaProducto producto={producto} onAgregar={agregar} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <h2 className="titulo-seccion mb-1">Recién llegados</h2>
          <p className="subtitulo-seccion mb-4">
            Novedades que puedes encontrar en nuestra tienda.
          </p>

          <div className="row g-4">
            {RECIEN_LLEGADOS.map((item) => (
              <div className="col-12 col-md-4" key={item.titulo}>
                <div className="card card-producto h-100">
                  <img
                    src={item.imagen}
                    alt={item.titulo}
                    className="imagen-destacada"
                    loading="lazy"
                  />
                  <div className="card-body">
                    <h3 className="h6">{item.titulo}</h3>
                    <p className="texto-pequeno text-muted mb-0">
                      {item.texto}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="texto-pequeno text-muted mt-3 mb-0">
            Disponibles en tienda. Consulta el precio en el local.
          </p>
        </div>
      </section>

      <section className="py-5 seccion-crema">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-6">
              <img
                src="/imagenes/rincon.jpg"
                alt="Fachada de El Rincón de la Tía Ceci"
                className="img-fluid rounded-4 shadow"
                loading="lazy"
              />
            </div>
            <div className="col-12 col-lg-6">
              <h2 className="titulo-seccion">Nuestra historia</h2>
              <p>
                El minimarket nació como una forma de ayudar a nuestros vecinos,
                ofreciendo siempre la mejor calidad a precios asequibles.
                Nuestro proyecto siempre fue ser parte de la comunidad y así lo
                hemos ido logrando de a poco, participando en proyectos sociales
                orientados a ser un punto de ayuda para nuestros vecinos.
              </p>
              <p className="mb-4">
                Nuestra meta es seguir atendiendo con la mejor disposición y dar
                un servicio de calidad, como los vecinos de Avenida Sur y sus
                alrededores lo merecen.
              </p>
              <Link className="btn btn-marca" href="/nosotros">
                Conoce más de nosotros
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-12 col-lg-5">
              <h2 className="titulo-seccion">Encuéntranos</h2>
              <p className="mb-2">
                <i className="bi bi-geo-alt me-2 text-marca" aria-hidden="true" />
                <strong>{DIRECCION_TIENDA}</strong>
              </p>
              <p className="mb-2">
                <i className="bi bi-telephone me-2 text-marca" aria-hidden="true" />
                {TELEFONO_TIENDA}
              </p>
              <p className="text-muted">
                Ven a visitarnos o escríbenos desde la página de contacto.
              </p>
              <Link className="btn btn-outline-marca" href="/contacto">
                Ir a contacto
              </Link>
            </div>
            <div className="col-12 col-lg-7">
              <div className="ratio ratio-16x9 ratio-mapa shadow-sm">
                <iframe
                  title="Ubicación de El Rincón de la Tía Ceci en Maipú"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3326.2313710438266!2d-70.7661195!3d-33.5213696!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662dd270acf0a87%3A0x7f171ef7d6c5984a!2sEl%20Rinc%C3%B3n%20de%20la%20Tia%20Ceci!5e0!3m2!1ses!2scl!4v1788582733766!5m2!1ses!2scl"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
