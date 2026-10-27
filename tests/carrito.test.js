import {
  agregarAlCarrito,
  calcularSubtotal,
  calcularTotal,
  cambiarCantidad,
  contarItems,
  obtenerCarrito,
  quitarDelCarrito,
  vaciarCarrito,
} from "@/lib/carrito";

const producto = {
  id: 1,
  nombre: "Arroz Tucapel",
  sku: "AT102G1",
  precioBase: 1900,
  precioOferta: 1710,
  stock: 10,
  imagen: "/imagenes/producto-sin-foto.png",
};

describe("Carrito de compras", () => {
  beforeEach(() => {
    vaciarCarrito();
  });

  it("agrega un producto usando el precio de oferta", () => {
    agregarAlCarrito(producto, 1);
    const items = obtenerCarrito();

    expect(items.length).toBe(1);
    expect(items[0].precio).toBe(1710);
    expect(items[0].cantidad).toBe(1);
  });

  it("suma cantidades si el producto ya existe", () => {
    agregarAlCarrito(producto, 1);
    agregarAlCarrito(producto, 1);

    const items = obtenerCarrito();
    expect(items.length).toBe(1);
    expect(items[0].cantidad).toBe(2);
  });

  it("calcula el total exacto sin redondear", () => {
    agregarAlCarrito(producto, 2);
    const items = obtenerCarrito();

    expect(calcularTotal(items)).toBe(3420);
    expect(calcularSubtotal(items[0])).toBe(3420);
  });

  it("no permite superar el stock disponible", () => {
    agregarAlCarrito(producto, 1);
    cambiarCantidad(producto.id, 99);

    const items = obtenerCarrito();
    expect(items[0].cantidad).toBe(10);
    expect(calcularTotal(items)).toBe(17100);
  });

  it("mantiene la cantidad mínima en uno", () => {
    agregarAlCarrito(producto, 1);
    cambiarCantidad(producto.id, 0);

    const items = obtenerCarrito();
    expect(items[0].cantidad).toBe(1);
  });

  it("quita un producto del carrito", () => {
    agregarAlCarrito(producto, 1);
    quitarDelCarrito(producto.id);

    expect(obtenerCarrito().length).toBe(0);
  });

  it("cuenta el total de unidades", () => {
    agregarAlCarrito(producto, 3);
    const items = obtenerCarrito();

    expect(contarItems(items)).toBe(3);
  });

  it("vacía el carrito", () => {
    agregarAlCarrito(producto, 2);
    vaciarCarrito();

    expect(obtenerCarrito()).toEqual([]);
  });
});
