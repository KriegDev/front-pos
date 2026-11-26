# POS-Tia-Ceci-For-Dummies

**Cómo el frontend se conecta con la API de VentaRápida, explicado desde cero**
Proyecto: El Rincón de la Tía Ceci · DSY1104 Desarrollo Fullstack II
Carolina Nataly Hermosilla Baeza · Pedro Felipe Toledo Jaramillo

---

## 1. Para qué sirve este documento

Este documento explica **una sola cosa**: cómo la página web (el *frontend*) le
pide datos al servidor (el *backend*) y cómo se muestran.

Está escrito para alguien que está en primero de informática y que todavía no ha
conectado nunca un frontend con una API. No hace falta saber Spring Boot ni
bases de datos para entenderlo.

Al terminar vas a poder responder tres preguntas:

1. **¿Dónde** se hace la conexión con la API?
2. **¿Cuál es el código exacto** que la hace?
3. **¿Qué tengo que tocar** si la API cambia y aparece un endpoint nuevo?

---

## 2. Las palabras raras, en una tabla

| Palabra | Qué significa, en simple |
|---|---|
| Frontend | La parte que se ve en el navegador. Acá es Next.js. |
| Backend | El programa del servidor que tiene los datos. Acá son 11 microservicios. |
| API | La "ventanilla" del backend: una lista de direcciones para pedirle cosas. |
| Endpoint | Cada dirección de esa ventanilla. Ejemplo: `/productos`. |
| REST | Una forma ordenada de nombrar endpoints usando GET, POST, PUT y DELETE. |
| GET / POST / PUT / DELETE | Leer / crear / reemplazar / borrar. |
| JSON | El formato de texto con que viajan los datos. Parece un objeto de JavaScript. |
| `fetch` | La función del navegador que hace la petición HTTP. |
| Puerto | El "número de puerta" de un programa. El frontend usa 3000; el gateway, 4425. |
| Token / JWT | Un texto firmado que dice quién eres y qué rol tienes. Se manda en cada petición. |

---

## 3. Antes de tocar código: levantar todo

Haz **doble clic** en `arrancar-todo.cmd`, en la carpeta del proyecto. El script
levanta la base de datos, los 11 microservicios y el frontend, y te avisa cuando
todo está listo.

| Qué | Dirección |
|---|---|
| Tienda | http://localhost:3000 |
| Panel | http://localhost:3000/admin |
| Swagger (la lista de endpoints) | http://localhost:4425/swagger-ui.html |

Usuarios de prueba: `servicios` / `Servicios123` (Administrador) y
`vendedor` / `vendedor123` (Vendedor).

> Si algo no responde, el mensaje en pantalla casi siempre dice qué falta. El
> detalle técnico queda en `ventarapida-backend\logs\`.

---

## 4. El mapa: quién hace qué

| Quiero tocar... | Voy a este archivo |
|---|---|
| La dirección del backend | `lib/constantes.js` |
| **Las llamadas a la API** | **`lib/api.js`** |
| Guardar y leer la sesión y el token | `lib/sesion.js` |
| El registro de una venta completa | `lib/ventas.js` |
| Una pantalla | `app/...` |
| El menú del panel | `components/AdminSidebar.js` |

---

## 5. LA CONEXIÓN CON LA API

Esta es la parte importante del documento. Léela completa.

### 5.1 La idea, en una frase

> Todas las pantallas del proyecto le piden los datos a **un solo archivo**:
> `lib/api.js`. Ninguna pantalla habla con el servidor por su cuenta.

Eso se decidió así por una razón práctica: el backend nombra algunos campos
distinto a como los usa la interfaz. Si cada pantalla hablara directo con la API,
habría que arreglar 29 archivos cada vez que cambie algo. Con un solo archivo,
se arregla en un solo lugar.

### 5.2 El archivo exacto

La conexión vive en **`lib/api.js`**, en la carpeta `lib` del proyecto.

Dentro de ese archivo hay dos funciones que hacen las peticiones de verdad:

- `pedir()` — para las respuestas en JSON (casi todas).
- `pedirTexto()` — para las que devuelven texto plano (solo el login).

Y después hay una función corta por cada endpoint: `listarProductos`,
`crearOrden`, `listarClientes`, etc.

### 5.3 El código exacto, línea por línea

Esta es la función `pedir()`, tal como está en `lib/api.js` (línea 28):

```
async function pedir(ruta, opciones = {}) {
  const { headers, ...resto } = opciones;
  const token = tokenActual();

  const respuesta = await fetch(`${API_URL}${ruta}`, {
    cache: "no-store",
    ...resto,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
  });

  if (respuesta.status === 401) {
    throw new Error("Tu sesión expiró o no has iniciado sesión. Vuelve a entrar.");
  }
  if (respuesta.status === 403) {
    throw new Error("No tienes permiso para realizar esta acción.");
  }
  if (!respuesta.ok) {
    let detalle = `Error ${respuesta.status}`;
    try {
      const cuerpo = await respuesta.json();
      detalle = cuerpo.mensaje || cuerpo.message || detalle;
    } catch {
      // El backend no siempre responde JSON en los errores.
    }
    throw new Error(detalle);
  }

  if (respuesta.status === 204) return null;
  const texto = await respuesta.text();
  return texto ? JSON.parse(texto) : null;
}
```

Qué hace cada parte:

- **`ruta`** es lo que se le agrega a la dirección base. Si le pasas
  `"/productos"`, la petición va a `http://localhost:4425/api/v1/productos`.
- **`opciones`** son cosas extra: el método (`POST`), el cuerpo (`body`), etc.
- **`tokenActual()`** devuelve el token guardado de la sesión, o `undefined` si
  nadie ha iniciado sesión.
- **`fetch`** es la función del navegador que hace la petición HTTP.
- **`headers`** son las etiquetas de la petición. Ahí va el `Authorization:
  Bearer <token>`, que es como el backend sabe quién eres.
- Los **`if` de 401 y 403** traducen los errores del servidor a frases que
  entiende un usuario: 401 es "no estás dentro" y 403 es "estás dentro pero no
  tienes permiso".
- **`204`** significa "salió bien y no devuelvo nada"; por eso devuelve `null`.
- Al final convierte el texto JSON en un objeto de JavaScript.

### 5.4 ¿De dónde sale la dirección del backend?

De `lib/constantes.js`, línea 18:

```
export const API_URL = URL_DEL_ENTORNO || "http://localhost:4425/api/v1";
```

Esa es la única dirección del proyecto. El puerto **4425** es el *API Gateway*,
que es la puerta de entrada a los 11 microservicios.

Para no tener que editar código, arriba de esa línea se lee una variable de
entorno. Si creas un archivo `.env.local` en la raíz del proyecto con:

```
NEXT_PUBLIC_API_URL=http://otra-maquina:4425/api/v1
```

la aplicación usa esa dirección sin tocar ni una línea de `api.js`.

### 5.5 ¿De dónde sale el token?

De `lib/sesion.js`. Cuando alguien inicia sesión, la respuesta trae un token que
se guarda en el navegador, en `localStorage`, bajo la clave `sesion`.

```
{ "nombreUsuario": "servicios", "rol": "Administrador", "token": "eyJhbGci..." }
```

`tokenActual()` en `api.js` no es más que un atajo para leer ese campo. Por eso,
si no has iniciado sesión, no se envía la cabecera `Authorization` y el backend
responde 401 en las rutas protegidas.

### 5.6 Cómo lo usa una pantalla

Las pantallas nunca usan `fetch`. Usan las funciones de `api.js`. Por ejemplo,
`listarProductos()` (línea 272) es solo esto:

```
export async function listarProductos() {
  const productos = (await pedir("/productos")) || [];
  return productos.map(mapProducto);
}
```

Y una pantalla lo llama así (esto es un patrón que se repite en todo el
proyecto):

```
const [productos, setProductos] = useState([]);

useEffect(() => {
  listarProductos()
    .then(setProductos)
    .catch((problema) => setError(mensajeDeError(problema)));
}, []);
```

En palabras simples: al abrir la pantalla, se pide la lista, se guarda en el
estado y se dibuja. Si algo falla, se muestra el mensaje.

### 5.7 El caso raro del login

El login es el único endpoint que **no devuelve JSON**: devuelve el token como
texto pelado. Por eso existe `pedirTexto()`: si usáramos `pedir()`, al intentar
convertir a JSON reventaría.

`iniciarSesionBackend()` (línea 211) lo usa y después lee el contenido del token
para sacar el nombre y el rol. Ese token son tres bloques separados por puntos;
el del medio, decodificado, es un JSON como este:

```
{ "sub": "servicios", "rol": ["Administrador"], "iat": 1795..., "exp": 1795... }
```

### 5.8 Los traductores: por qué existen

El backend y la interfaz no usan los mismos nombres. En vez de tocar las 29
pantallas, `api.js` traduce:

| El backend dice | La pantalla espera | Quién traduce |
|---|---|---|
| `pNombre`, `apPaterno` | `pnombre`, `appaterno` | `mapCliente()` |
| `metodoPago: { id }` | `idMetodoPago` | `mapPago()` |
| `stock.idProducto` | `idProducto` | `mapMovimiento()` |
| `precioBase` (sin oferta) | `precioOferta` | `mapProducto()` |
| `usuario.rol.nombre` | `rol` (texto) | `mapUsuario()` |

Ejemplo real, `mapProducto()` (línea 115): agrega el precio con descuento
calculándolo como `(precioBase * 9) / 10`. Se hace con números enteros a
propósito, para no redondear nunca un monto de dinero.

---

## 6. RECETA: agregar un endpoint nuevo

Este es el caso que más te va a pasar: el backend agregó algo y hay que usarlo
desde la pantalla.

**Supongamos** que el backend ahora tiene un endpoint nuevo:

```
POST /api/v1/productos/{id}/descuento
Cuerpo: { "porcentaje": 15 }
Respuesta: el producto actualizado
```

### Paso 1. Pruébalo primero en Swagger

Abre http://localhost:4425/swagger-ui.html, busca **Servicio Catálogo**, ubica
el endpoint y usa *Try it out*. Nunca escribas una función para un endpoint que
no has visto funcionar.

Anota tres cosas: la **ruta exacta**, el **método** (GET, POST...) y la
**forma de la respuesta**.

### Paso 2. Escribe la función en `lib/api.js`

Búscala sección `Productos` (alrededor de la línea 268) y agrega:

```
export async function aplicarDescuento(id, porcentaje) {
  return mapProducto(
    await pedir(`/productos/${id}/descuento`, {
      method: "POST",
      body: JSON.stringify({ porcentaje }),
    })
  );
}
```

Fíjate en las cuatro cosas que siempre se repiten:

- La ruta va entre **backticks** (`` ` ``) si lleva un valor variable, y ese
  valor se escribe `${id}`.
- El método va en `method`.
- El cuerpo va en `body`, **siempre** con `JSON.stringify(...)`.
- Si la respuesta es un producto, se envuelve en `mapProducto(...)` para que
  llegue con el formato que espera la pantalla.

### Paso 3. Verifica que quede exportada

La función debe empezar con la palabra `export`. Si te la olvidas, la pantalla
no la va a encontrar y verás un error del tipo *"is not a function"*.

### Paso 4. Úsala en la pantalla

En el archivo de la pantalla, primero se importa:

```
import { aplicarDescuento } from "@/lib/api";
```

Y se llama cuando el usuario hace algo:

```
async function descontar() {
  try {
    const actualizado = await aplicarDescuento(producto.id, 15);
    setProducto(actualizado);
  } catch (problema) {
    setError(mensajeDeError(problema));
  }
}
```

### Paso 5. Compruébalo

1. Abre la pantalla en el navegador.
2. Presiona **F12** y ve a la pestaña **Network** (Red).
3. Filtra por `Fetch/XHR`.
4. Haz la acción y mira la petición: debe aparecer con el método `POST` y la
   ruta correcta.
5. Revisa que la respuesta traiga lo que esperabas.

### Paso 6. Si no funciona, revisa en este orden

1. ¿La ruta existe? Pruébala en Swagger.
2. ¿Escribiste bien el método? Un GET donde va POST da 405.
3. ¿Mandaste el `body` con `JSON.stringify`? Si no, el backend no lo entiende.
4. ¿Devuelve 401? Falta el token: no has iniciado sesión o expiró.
5. ¿Devuelve 403? Tu rol no tiene permiso para ese endpoint.
6. ¿Devuelve 400? Los datos van mal: revisa el mensaje que devuelve el backend.

### Y si el endpoint devuelve campos nuevos

Si la respuesta trae un campo que la pantalla no conoce, agrégalo en el
traductor que corresponda (`mapProducto`, `mapCliente`, ...). Así la pantalla lo
recibe con el nombre que ya usa.

---

## 7. RECETA: cambiar la dirección del backend

Si mañana el backend corre en otro computador o en otro puerto, **no se toca el
código**. Se crea un archivo `.env.local` en la raíz del proyecto con:

```
NEXT_PUBLIC_API_URL=http://192.168.1.50:4425/api/v1
```

Se guarda, se reinicia el frontend y listo. El prefijo `NEXT_PUBLIC_` es
obligatorio para que Next.js se lo pase al navegador.

---

## 8. Los cuatro errores que vas a ver

| Lo que dice la pantalla | Qué pasó | Qué hacer |
|---|---|---|
| "No se pudo conectar con la API" | El backend está apagado | Ejecutar `arrancar-todo.cmd` |
| "Tu sesión expiró o no has iniciado sesión" | Falta el token o venció (dura 2 horas) | Volver a iniciar sesión |
| "No tienes permiso para esta acción" | El rol no alcanza para ese endpoint | Entrar con un usuario Administrador |
| "Error 400" con un mensaje | Los datos enviados están mal | Leer el mensaje y corregir el formulario |

Si en la consola del navegador (F12) ves un error de **CORS**, significa que el
backend no permite peticiones desde la dirección del frontend. En este proyecto
ya está resuelto en el API Gateway: acepta `http://localhost:3000`.

---

## 9. Cómo mirar las peticiones sin adivinar

Esta es la herramienta que más vas a usar:

1. Abre el proyecto en el navegador.
2. Presiona **F12**.
3. Ve a la pestaña **Network** (o **Red**).
4. Filtra por **Fetch/XHR**: eso muestra solo las llamadas a la API.
5. Recarga la página o haz la acción.
6. Haz clic en una petición y revisa:
   - **Headers**: la ruta, el método y si llevó `Authorization`.
   - **Payload**: qué datos se enviaron.
   - **Response**: qué respondió el servidor.
   - **Status**: 200 está bien; 401, 403, 400 o 500 son problemas.

Con eso puedes ver exactamente qué está pidiendo el frontend, sin suponer nada.

---

## 10. Chuleta para llevar

```
Dirección base ............ lib/constantes.js  ->  API_URL
Hacer una petición ........ lib/api.js         ->  pedir(ruta, opciones)
Login (texto plano) ....... lib/api.js         ->  pedirTexto(ruta, opciones)
Token de la sesión ........ lib/sesion.js      ->  obtenerToken()
Traducir datos ............ lib/api.js         ->  mapProducto, mapCliente, ...
Agregar un endpoint ....... lib/api.js         ->  nueva función con export
Usar en una pantalla ...... import { funcion } from "@/lib/api"
Cambiar de servidor ....... .env.local         ->  NEXT_PUBLIC_API_URL=...
Ver qué pasa .............. F12 -> Network -> Fetch/XHR
```

Regla de oro: **si algo tiene que ver con la API, se toca en `lib/api.js`. Si
algo tiene que ver con la sesión, se toca en `lib/sesion.js`. El resto de los
archivos solo muestra datos.**
