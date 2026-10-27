import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import FormularioProducto from "@/components/FormularioProducto";

const categorias = [
  { id: 1, nombre: "Abarrotes" },
  { id: 2, nombre: "Bebidas" },
];

describe("FormularioProducto", () => {
  it("envía los datos del producto al guardar", async () => {
    const alGuardar = jasmine
      .createSpy("alGuardar")
      .and.returnValue(Promise.resolve());

    render(
      <FormularioProducto
        categorias={categorias}
        onGuardar={alGuardar}
        esNuevo
      />
    );

    fireEvent.change(screen.getByLabelText("SKU"), {
      target: { value: "AT102G1" },
    });
    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Arroz Tucapel" },
    });
    fireEvent.change(screen.getByLabelText("Descripción"), {
      target: { value: "Arroz Tucapel 1 kg, grado 1" },
    });
    fireEvent.change(screen.getByLabelText("Precio base"), {
      target: { value: "1900" },
    });
    fireEvent.change(screen.getByLabelText("Precio de oferta"), {
      target: { value: "1710" },
    });
    fireEvent.change(screen.getByLabelText("Categoría"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText("Stock actual"), {
      target: { value: "20" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Crear producto" }));

    await waitFor(() => expect(alGuardar).toHaveBeenCalledTimes(1));
    const datos = alGuardar.calls.mostRecent().args[0];
    expect(datos.nombre).toBe("Arroz Tucapel");
    expect(datos.precioBase).toBe(1900);
    expect(datos.precioOferta).toBe(1710);
    expect(datos.stock).toBe(20);
    expect(datos.categoria.id).toBe(1);
  });

  it("muestra un error cuando faltan datos obligatorios", () => {
    const alGuardar = jasmine.createSpy("alGuardar");

    render(
      <FormularioProducto
        categorias={categorias}
        onGuardar={alGuardar}
        esNuevo
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Crear producto" }));

    expect(screen.getByText("El SKU es obligatorio.")).toBeTruthy();
    expect(alGuardar).not.toHaveBeenCalled();
  });

  it("rechaza un precio de oferta mayor o igual al precio base", () => {
    const alGuardar = jasmine.createSpy("alGuardar");

    render(
      <FormularioProducto
        categorias={categorias}
        onGuardar={alGuardar}
        esNuevo
      />
    );

    fireEvent.change(screen.getByLabelText("SKU"), {
      target: { value: "AT102G1" },
    });
    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Arroz Tucapel" },
    });
    fireEvent.change(screen.getByLabelText("Descripción"), {
      target: { value: "Arroz Tucapel 1 kg, grado 1" },
    });
    fireEvent.change(screen.getByLabelText("Precio base"), {
      target: { value: "1900" },
    });
    fireEvent.change(screen.getByLabelText("Precio de oferta"), {
      target: { value: "2000" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Crear producto" }));

    expect(
      screen.getByText(
        "El precio de oferta debe ser menor que el precio base."
      )
    ).toBeTruthy();
    expect(alGuardar).not.toHaveBeenCalled();
  });
});
