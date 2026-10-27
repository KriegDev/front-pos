import { fireEvent, render, screen } from "@testing-library/react";
import Boton from "@/components/Boton";

describe("Componente Boton", () => {
  it("renderiza su etiqueta y responde al clic", () => {
    const alHacerClic = jasmine.createSpy("alHacerClic");
    render(<Boton onClick={alHacerClic}>Guardar cambios</Boton>);

    const boton = screen.getByRole("button", { name: "Guardar cambios" });
    fireEvent.click(boton);

    expect(alHacerClic).toHaveBeenCalledTimes(1);
  });

  it("no dispara el evento cuando está deshabilitado", () => {
    const alHacerClic = jasmine.createSpy("alHacerClic");
    render(
      <Boton onClick={alHacerClic} disabled>
        Guardar cambios
      </Boton>
    );

    const boton = screen.getByRole("button", { name: "Guardar cambios" });
    fireEvent.click(boton);

    expect(boton.disabled).toBeTrue();
    expect(alHacerClic).not.toHaveBeenCalled();
  });

  it("permite cambiar la variante visual", () => {
    render(<Boton variante="peligro">Eliminar</Boton>);

    const boton = screen.getByRole("button", { name: "Eliminar" });
    expect(boton.className).toContain("btn-danger");
  });
});
