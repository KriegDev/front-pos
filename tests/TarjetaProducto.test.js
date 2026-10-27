import { fireEvent, render, screen } from "@testing-library/react";
import TarjetaProducto from "@/components/TarjetaProducto";

const producto = {
  id: 1,
  sku: "AT102G1",
  nombre: "Arroz Tucapel",
  descripcion: "Arroz Tucapel 1 kg, grado 1",
  precioBase: 1900,
  precioOferta: 1710,
  granel: false,
  stock: 10,
  imagen: "/imagenes/producto-sin-foto.png",
  categoria: { id: 1, nombre: "Abarrotes" },
};

describe("Componente TarjetaProducto", () => {
  it("muestra nombre, categoría, precio de oferta y descuento", () => {
    render(<TarjetaProducto producto={producto} onAgregar={() => {}} />);

    expect(screen.getByText("Arroz Tucapel")).toBeTruthy();
    expect(screen.getByText("Abarrotes")).toBeTruthy();
    expect(screen.getByText("$1.710")).toBeTruthy();
    expect(screen.getByText("$1.900")).toBeTruthy();
    expect(screen.getByText("-10%")).toBeTruthy();
  });

  it("avisa al agregar el producto al carrito", () => {
    const alAgregar = jasmine.createSpy("alAgregar");
    render(<TarjetaProducto producto={producto} onAgregar={alAgregar} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Agregar Arroz Tucapel al carrito",
      })
    );

    expect(alAgregar).toHaveBeenCalledWith(producto);
  });

  it("oculta el botón cuando se usa en modo solo lectura", () => {
    render(
      <TarjetaProducto
        producto={producto}
        onAgregar={() => {}}
        mostrarBoton={false}
      />
    );

    expect(
      screen.queryByRole("button", { name: /Agregar Arroz Tucapel/ })
    ).toBeNull();
  });

  it("deshabilita el botón si no hay stock", () => {
    render(
      <TarjetaProducto
        producto={{ ...producto, stock: 0 }}
        onAgregar={() => {}}
      />
    );

    const boton = screen.getByRole("button", {
      name: "Agregar Arroz Tucapel al carrito",
    });
    expect(boton.disabled).toBeTrue();
    expect(screen.getByText("Sin stock")).toBeTruthy();
  });
});
