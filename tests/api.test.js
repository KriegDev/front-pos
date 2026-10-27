import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  listarProductos,
  mensajeDeError,
  siguienteId,
} from "@/lib/api";

function respuesta(cuerpo, opciones = {}) {
  const { ok = true, status = 200 } = opciones;
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(cuerpo),
    text: () =>
      Promise.resolve(cuerpo === undefined ? "" : JSON.stringify(cuerpo)),
  });
}

describe("Módulo de API simulada", () => {
  let fetchSpy;

  beforeEach(() => {
    fetchSpy = spyOn(window, "fetch");
  });

  it("lista los productos desde json-server", async () => {
    fetchSpy.and.returnValue(respuesta([{ id: 1, nombre: "Arroz Tucapel" }]));

    const productos = await listarProductos();

    expect(productos.length).toBe(1);
    expect(productos[0].nombre).toBe("Arroz Tucapel");
    const [url, opciones] = fetchSpy.calls.mostRecent().args;
    expect(url).toBe("http://localhost:4000/productos");
    expect(opciones.cache).toBe("no-store");
  });

  it("crea un producto con POST y envía el cuerpo JSON", async () => {
    fetchSpy.and.returnValue(respuesta({ id: 6, nombre: "Nuevo" }));

    const producto = await crearProducto({ nombre: "Nuevo", precioBase: 1000 });

    expect(producto.id).toBe(6);
    const [url, opciones] = fetchSpy.calls.mostRecent().args;
    expect(url).toBe("http://localhost:4000/productos");
    expect(opciones.method).toBe("POST");
    expect(JSON.parse(opciones.body).nombre).toBe("Nuevo");
  });

  it("actualiza un producto con PUT", async () => {
    fetchSpy.and.returnValue(respuesta({ id: 1, nombre: "Actualizado" }));

    await actualizarProducto(1, { nombre: "Actualizado" });

    const [url, opciones] = fetchSpy.calls.mostRecent().args;
    expect(url).toBe("http://localhost:4000/productos/1");
    expect(opciones.method).toBe("PUT");
  });

  it("elimina un producto con DELETE", async () => {
    fetchSpy.and.returnValue(respuesta({}));

    await eliminarProducto(1);

    const [url, opciones] = fetchSpy.calls.mostRecent().args;
    expect(url).toBe("http://localhost:4000/productos/1");
    expect(opciones.method).toBe("DELETE");
  });

  it("lanza un error cuando la API responde con error", async () => {
    fetchSpy.and.returnValue(
      respuesta({ message: "Producto no encontrado" }, { ok: false, status: 404 })
    );

    await expectAsync(listarProductos()).toBeRejectedWithError(
      "Producto no encontrado"
    );
  });

  it("calcula el siguiente id de una colección", () => {
    expect(siguienteId([{ id: 1 }, { id: 7 }, { id: 3 }])).toBe(8);
    expect(siguienteId([])).toBe(1);
  });

  it("entrega un mensaje amigable cuando no hay conexión", () => {
    const error = new TypeError("Failed to fetch");
    expect(mensajeDeError(error)).toContain("npm run mock");
  });
});
