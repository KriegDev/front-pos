# Documento de integración

**Proyecto:** El Rincón de la Tía Ceci — tienda online y punto de venta
**Asignatura:** DSY1104 Desarrollo Fullstack II — Evaluación Parcial N° 3
**Integrantes:** Carolina Nataly Hermosilla Baeza · Pedro Felipe Toledo Jaramillo

---

## 1. Objetivo

El frontend de la tienda funcionaba hasta la Evaluación 2 con una **API falsa**
(`json-server`, puerto 4000) alimentada por un archivo `db.json`. Esta entrega
reemplaza esa simulación por el **backend real de microservicios VentaRápida**,
que corre localmente, y agrega autenticación con roles y gestión de sesión en el
frontend.

El resultado es que la tienda y el panel administrativo leen y escriben los
datos reales guardados en MySQL.

---

## 2. Arquitectura general

```
  Navegador
  http://localhost:3000
        |
        |  fetch() con "Authorization: Bearer <token>"
        v
  +--------------------+
  |  Frontend Next.js  |   app/(tienda)  -  app/admin
  |  lib/api.js        |   <- capa adaptadora
  +---------+----------+
            |  HTTP JSON  ->  http://localhost:4425/api/v1/...
            v
  +--------------------+
  |   API GATEWAY      |   puerto 4425
  |  - CORS            |   - AuthenticationFilter (JWT + roles)
  |  - Enrutamiento    |   - Swagger centralizado
  +---------+----------+
            |
   +--------+--------+----------+----------+---------+
   v                 v          v          v         v
 auth 4428      catalogo     cliente   inventario  ventas   ... hasta 10 servicios
                4419         4420      4421        4422
   +--------+--------+----------+----------+---------+
            v
        MySQL 8.3 (10 bases bd_*)
```

El navegador **nunca** habla directamente con los microservicios: siempre pasa
por el gateway. Así el control de acceso y el CORS quedan en un solo lugar.

### Microservicios y puertos

| Servicio | Puerto | Responsabilidad |
|---|---|---|
| `api-gateway` | 4425 | Entrada única, CORS, validación de token y roles |
| `service-auth` | 4428 | Registro, login, JWT y administración de usuarios |
| `service-catalogo` | 4419 | Productos y categorías |
| `service-cliente` | 4420 | Clientes |
| `service-inventario` | 4421 | Stock y movimientos |
| `service-ventas` | 4422 | Órdenes y detalles |
| `service-pagos` | 4423 | Medios de pago y pagos |
| `service-facturacion` | 4426 | Facturas |
| `service_proveedores` | 4427 | Proveedores y órdenes de compra |
| `service-reportes` | 4429 | Reportes consolidados |
| `service-notificacion` | 4430 | Notificaciones |

---

## 3. Cómo se levanta el sistema

### 3.1 Base de datos

```powershell
F:\wamp64\bin\mysql\mysql8.3.0\bin\mysqld.exe --defaults-file="F:\wamp64\bin\mysql\mysql8.3.0\my.ini" --console
```

Las 10 bases se crean importando el script del repositorio del backend:

```powershell
mysql -u root --host=127.0.0.1 --port=3306 --default-character-set=utf8mb4 < 127_0_0_1.sql
```

### 3.2 Backend completo

El repositorio trae un script que compila y lanza los 11 servicios de una vez:

```powershell
cd ventarapida-backend
.\iniciar-servicios.ps1
```

Los registros de cada servicio quedan en `ventarapida-backend\logs\`.

### 3.3 Frontend

```powershell
cd front_pos
npm install
npm run dev
```

- Tienda: <http://localhost:3000>
- Swagger del gateway: <http://localhost:4425/swagger-ui.html>

---

## 4. Autenticación con JWT

### 4.1 Flujo del login

1. El usuario escribe su nombre y contraseña en `/iniciar-sesion`.
2. El frontend llama `POST /api/v1/auth/login` con
   `{ "nombreUsuario": "...", "contrasena": "..." }`.
3. `service-auth` busca al usuario en `bd_usuario.usuario`, compara la
   contraseña con BCrypt (`passwordEncoder.matches`) y, si coincide, firma un
   token con JJWT (HS256, vigencia 2 horas).
4. El endpoint responde **el token en texto plano**, no un JSON.
5. El frontend decodifica el contenido del token y arma la sesión:

```json
{
  "sub": "servicios",
  "rol": ["Administrador"],
  "iat": 1795492130,
  "exp": 1795499330
}
```

### 4.2 Lo que se corrigió en el backend

El backend ya emitía tokens, pero `AuthService` llamaba
`jwtService.generarToken(username, List.of())`, es decir, **siempre con la lista
de roles vacía**. Además la entidad `Usuario` no tenía relación con `Rol`, por
lo que no había forma de saber el rol de nadie. Se agregó:

- `Usuario.rol` (`@ManyToOne` hacia `rol`, columna `id_rol`).
- `RolRepository` para buscar el rol por nombre.
- En `AuthService.login`, el rol real del usuario se envía dentro del token.
- Tres roles en la base: `Administrador`, `Vendedor`, `Cliente`.

### 4.3 Usuarios de prueba

| Usuario | Contraseña | Rol | Cómo se creó |
|---|---|---|---|
| `servicios` | `Servicios123` | Administrador | Viene en la base original; se le asignó el rol |
| `vendedor` | `vendedor123` | Vendedor | Se creó desde el endpoint de registro para demostrar la restricción por roles |
| `evidencia` | (original) | Cliente | Viene en la base original; se le asignó el rol |

> La contraseña debe tener entre 8 y 15 caracteres (regla del backend). Por eso
> `vendedor` usa `vendedor123` y ya no `123`.

---

## 5. Autorización por roles

El `AuthenticationFilter` del gateway valida la firma y la expiración del token
y, después, revisa el rol que viene en el claim `rol` contra una política por
ruta.

| Recurso | Sin sesión | Cliente | Vendedor | Administrador |
|---|:---:|:---:|:---:|:---:|
| `GET /productos`, `/categorias`, `/metodos-pago`, `/stock` | Sí | Sí | Sí | Sí |
| `POST/PUT/DELETE /productos`, `/categorias` | No | No | No | Sí |
| `POST /ordenes`, `PATCH /ordenes/{id}` | No | Sí | Sí | Sí |
| `/pago/**` | No | Sí | Sí | Sí |
| `/clientes/**` | No | No | Sí | Sí |
| `/stock/**` (escritura), `/movimiento-inventario/**` | No | No | Sí | Sí |
| `/facturas/**`, `/reportes/**`, `/proveedores/**`, `/notificaciones/**` | No | No | No | Sí |
| `/auth/usuarios/**` | No | No | No | Sí |
| `/auth/login`, `/auth/registrar` | Sí | Sí | Sí | Sí |

Las lecturas del catálogo son públicas porque la tienda debe poder mostrarse a
un visitante que todavía no tiene cuenta.

Errores que devuelve el gateway:

- **401** – falta el token, está mal escrito, la firma no coincide o expiró.
- **403** – el token es válido pero el rol no alcanza para esa acción.

---

## 6. Gestión de sesión en el frontend

`lib/sesion.js` guarda la sesión completa en `localStorage` bajo la clave
`sesion`:

```json
{
  "id": null,
  "nombreUsuario": "servicios",
  "rol": "Administrador",
  "idCliente": null,
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

- `obtenerSesion()` devuelve la sesión o `null` si no existe o está incompleta.
- `obtenerToken()` devuelve solo el token, que `lib/api.js` agrega como
  cabecera `Authorization: Bearer <token>` en cada petición.
- `guardarSesion()` guarda y avisa con el evento `sesion-actualizada`.
- `cerrarSesion()` borra la clave y avisa del cambio.

**Persistencia:** como la sesión y el token viven en `localStorage`, al recargar
la página o cerrar el navegador el usuario sigue dentro. Se verificó
recargando `/admin` después del login: la ruta y el rol se conservan.

**Protección del panel:** `components/AdminShell.js` revisa la sesión al montar.
Si no hay sesión o el rol no es Administrador ni Vendedor, redirige a
`/iniciar-sesion`. Si hay sesión pero el rol es Vendedor y la ruta es de
administrador, redirige a `/admin`.

---

## 7. Restricciones de acceso en el frontend

Las restricciones se aplican en dos capas, a propósito: el frontend esconde lo
que no corresponde y el backend lo impide aunque alguien escriba la URL a mano.

| Dónde | Qué hace |
|---|---|
| `components/AdminSidebar.js` | Muestra u oculta las opciones del menú según el rol |
| `components/AdminShell.js` | Bloquea `/admin/productos`, `/admin/categorias`, `/admin/usuarios`, `/admin/reportes` y las ediciones de clientes para el rol Vendedor |
| `lib/sesion.js` | `puedeEntrarAlAdmin()`, `esAdministrador()`, `rutaInicioPorRol()` |
| `lib/api.js` | Traduce los 401 y 403 del backend a mensajes claros |
| `AuthenticationFilter` (backend) | Rechaza con 403 aunque el request no venga del frontend |

Ejemplo concreto: si un **Vendedor** entra a `http://localhost:3000/admin/productos`,
la aplicación lo devuelve a `/admin`; y si intenta `POST /api/v1/productos` con
su token válido, el gateway responde **403**.

---

## 8. Flujo de datos

### 8.1 Catálogo

`GET /api/v1/productos` → el adaptador agrega los campos que la tienda necesita
(precio de oferta e imagen) → las tarjetas de `/productos` los muestran.

### 8.2 Registrar una venta

Este flujo fue el cambio más importante. Antes el navegador hacía toda la
operación: inventaba el id de la orden, creaba el pago, descontaba el stock
registro por registro y anotaba los movimientos. Con el backend real eso
**descontaba el stock dos veces**, porque `service-ventas` ya lo hace al crear
la orden.

Ahora:

```
Usuario           Frontend                     Gateway + backend
   |                  |                              |
   | pulsa "Cobrar"   |                              |
   |----------------->|                              |
   |                  | POST /api/v1/ordenes         |
   |                  |----------------------------->| service-ventas
   |                  | { numeroOrden, idCliente,    |   |- pide el precio a catalogo
   |                  |   idMetodoPago,              |   |- registra Salida en inventario
   |                  |   detalles:[{idProducto,     |   |- llama a pagos /procesar
   |                  |   cantidad}] }               |   |- guarda la orden
   |                  |<-----------------------------|
   |                  | { id, numeroOrden,           |
   |                  |   montoTotal, status }       |
   |<-----------------|                              |
```

El precio lo toma el backend de su propio catálogo: el navegador no puede
"inventar" un precio más bajo.

### 8.3 Anular una orden

`cancelarOrden()` registra un movimiento de **Entrada** por cada producto
vendido (lo que devuelve el stock) y luego cambia la orden a `CANCELADO` con
`PATCH /api/v1/ordenes/{id}`.

---

## 9. Capa adaptadora del frontend

El backend y el frontend nombran distinto algunos campos. En vez de tocar las 30
pantallas, `lib/api.js` traduce en un solo lugar:

| Backend | Frontend | Dónde se traduce |
|---|---|---|
| `pNombre`, `sNombre`, `apPaterno`, `apMaterno` | `pnombre`, `snombre`, `appaterno`, `apmaterno` | `mapCliente()` |
| `metodoPago: { id, nombre }` | `idMetodoPago` | `mapPago()` |
| `movimiento.stock.idProducto` | `idProducto` | `mapMovimiento()` |
| (no existe) | `precioOferta` | `mapProducto()`: 10 % sobre `precioBase` |
| (no existe) | `imagen` | `mapProducto()`: `/imagenes/producto-sin-foto.png` |
| `usuario.rol.nombre` | `rol` (texto) | `mapUsuario()` |

El precio de oferta se calcula como `(precioBase * 9) / 10` para no redondear
nunca un monto.

### Endpoints que el adaptador usa

| Función del frontend | Endpoint real |
|---|---|
| `listarCategorias` / `crearCategoria` / … | `GET POST PUT DELETE /categorias` |
| `listarProductos` / `obtenerProducto` / … | `GET POST PUT DELETE /productos` |
| `listarClientes` / `crearCliente` | `GET /clientes`, `POST /clientes` |
| `actualizarCliente` | `PATCH /clientes/actualizar-datos-contacto/{id}` + `PATCH /clientes/actualizar-status/{id}` |
| `listarUsuarios` / `crearUsuario` / `actualizarUsuario` | `GET POST PUT /auth/usuarios` |
| `listarStock` / `crearStock` / `actualizarStock` / `eliminarStock` | `GET POST PUT DELETE /stock` |
| `listarOrdenes` / `crearOrden` | `GET /ordenes`, `POST /ordenes` |
| `actualizarOrden` | `PATCH /ordenes/{id}` |
| `listarPagos` | `GET /pago` |
| `listarMetodosPago` | `GET /metodos-pago` |
| `listarMovimientos` / `crearMovimiento` | `GET /movimiento-inventario`, `POST /movimiento-inventario/nuevo/{idProducto}` |

---

## 10. Cambios realizados en el backend

| # | Archivo / zona | Cambio | Motivo |
|---|---|---|---|
| 1 | `api-gateway/application.yml` | `allowedOrigins` a `http://localhost:3000,http://localhost:4425` | Solo aceptaba su propia dirección; el navegador de la tienda era rechazado |
| 2 | `api-gateway/application.yml` | `default-filters: DedupeResponseHeader=Access-Control-Allow-Origin …` | Cada microservicio responde con `@CrossOrigin("*")` y el gateway también: el navegador recibía `http://localhost:3000, *` y **rechazaba toda respuesta** |
| 3 | `AuthenticationFilter.java` | Reescrito: rutas públicas, validación de token y **verificación de roles** | Antes solo miraba firma y expiración, nunca el rol |
| 4 | `api-gateway` ruta `auth-service` | Se le agregó el filtro | `/api/v1/auth/**` estaba sin filtro: cualquiera podía listar usuarios |
| 5 | `Usuario.java` | Campo `rol` (`@ManyToOne`) | La entidad `Rol` existía pero no estaba conectada a nadie |
| 6 | `AuthService.java` | Envía los roles reales al token | Enviaba `List.of()` (vacío) |
| 7 | `RolRepository.java` | Nuevo | No había forma de consultar los roles |
| 8 | `UsuarioController.java` + `UsuarioRequest` + `UsuarioDTO` | Nuevo: listar, crear y modificar usuarios **sin exponer la contraseña** | El panel necesita administrar usuarios y roles |
| 9 | `StockController.java` + `InventarioService` + `StockRepository` | Nuevo CRUD de stock | El panel crea y borra stock al crear o borrar un producto |
| 10 | `InventarioService.nuevoMovimiento` | Busca el stock con `findFirstByIdProducto` | Buscaba por `findById(idProducto)`, asumiendo que el id del stock era igual al del producto; se rompía al crear productos nuevos |
| 11 | `OrdenController` + `VentaService` | Nuevo `PATCH /ordenes/{id}` | No había forma de pasar una orden a PAGADO o CANCELADO |
| 12 | `VentaService.procesarVenta` | Aplica el 10 % de descuento y respeta el estado pedido | Antes cobraba `precioBase` aunque la pantalla mostrara el precio con oferta, y forzaba `PENDIENTE_PAGO`, así que una venta cobrada en el mesón quedaba pendiente y no sumaba en el total recaudado |
| 13 | `api-gateway` | Se copió el wrapper de Maven (`.mvn`, `mvnw`, `mvnw.cmd`) | Al gateway le faltaban; no se podía compilar solo con el repositorio |
| 14 | `service-ventas/.../config/WebClientConfig.java` | Movido a `para revisar/` | Definía el mismo bean `webClientBuilder` que `WebConfig` y **el servicio no arrancaba** |
| 15 | `components/AdminSidebar.js` + `AdminShell.js` | Se quitó `data-bs-dismiss="offcanvas"` de los enlaces y el menú se cierra por código | El mismo menú se dibuja dentro del offcanvas (celular) y como columna fija (escritorio). En la columna no hay offcanvas y Bootstrap lanzaba un error que **cancelaba la navegación**: los enlaces del menú no hacían nada |

---

## 11. Problemas encontrados y cómo se resolvieron

| Síntoma | Causa | Solución |
|---|---|---|
| `service-ventas` no arrancaba (`BeanDefinitionOverrideException`) | Dos clases definían el bean `webClientBuilder` | Se conservó la que agrega el token de servicio y la otra se movió a `para revisar/` |
| El gateway no compilaba | Le faltaban los archivos del wrapper de Maven | Se copiaron desde otro servicio |
| Toda petición del navegador fallaba con "blocked by CORS policy: … contains multiple values 'http://localhost:3000, *'" | Cabecera `Access-Control-Allow-Origin` duplicada (gateway + microservicio) | `DedupeResponseHeader` en el gateway |
| La tienda no cargaba productos sin sesión | El catálogo estaba detrás del filtro de autenticación | Las lecturas del catálogo quedaron públicas |
| Una venta descontaba el stock dos veces | El frontend descontaba y el backend también | La venta se delega completa a `POST /ordenes` |
| `Cannot access 'API_URL' before initialization` en las pruebas | `process.env` no existe en el paquete de Karma | Se comprueba `typeof process !== "undefined"` |
| `/api/v1/auth/usuarios` respondía sin token | La ruta `auth-service` del gateway no tenía el filtro | Se le agregó el filtro y se limitó a Administrador |

---

## 12. Verificación realizada

### 12.1 Pruebas unitarias del frontend

```
npm run test:jsdom      → 33 SUCCESS / 0 fallidas
```

Se actualizaron las pruebas de `tests/api.test.js` para que verifiquen la
dirección del gateway (`http://localhost:4425/api/v1/productos`) en lugar de
`json-server`.

### 12.2 Autorización en el gateway (9/9)

| Caso | Esperado | Obtenido |
|---|---|---|
| `GET /productos` sin token | 200 | 200 (OK) |
| `GET /categorias` sin token | 200 | 200 (OK) |
| `GET /clientes` sin token | 401 | 401 (OK) |
| `GET /clientes` con Vendedor | 200 | 200 (OK) |
| `POST /productos` con Vendedor | 403 | 403 (OK) |
| `GET /facturas` con Vendedor | 403 | 403 (OK) |
| `GET /facturas` con Administrador | 200 | 200 (OK) |
| `GET /auth/usuarios` con Vendedor | 403 | 403 (OK) |
| `GET /clientes` con token inválido | 401 | 401 (OK) |

### 12.3 Integración en el navegador (12/12)

Con el frontend corriendo y el backend arriba:

1. La portada muestra los productos del backend.
2. El catálogo carga sin haber iniciado sesión.
3. El login del administrador llega a `/admin`.
4. La sesión guarda el rol que viene en el token.
5. La sesión guarda el JWT.
6. El panel muestra datos reales del backend.
7. La sesión sobrevive a recargar la página.
8. El vendedor puede entrar al panel.
9. Al vendedor se le niega `/admin/productos`.
10. Credenciales incorrectas no dejan entrar.
11. Se muestra el mensaje de error de credenciales.
12. El panel muestra las últimas órdenes reales.

### 12.4 Venta completa de punta a punta

| Antes | Después |
|---|---|
| Órdenes: 8 | Órdenes: 9 (nueva `#20271`) |
| Stock del producto 1: 398 | Stock: 396 |
| Total de la orden | `$3.800` = 2 × `$1.900` (precio tomado del catálogo del backend) |

El stock bajó **exactamente** la cantidad vendida, lo que confirma que ya no se
descuenta dos veces. Esta venta de prueba se borró después junto con su pago,
su movimiento y se devolvió el stock, para dejar la base como estaba.

---

## 13. Limitaciones conocidas

1. **Datos de entrega:** el backend no guarda dirección, región ni comuna. El
   formulario los pide y se usan para confirmar la compra, pero no quedan
   guardados en la orden.
2. **Relación usuario–cliente:** el backend no tiene el campo `idCliente` en
   `Usuario`; la sesión guarda `idCliente` a nivel de navegador.
3. **Imágenes de productos:** el backend no maneja imágenes; se usa una imagen
   genérica. Los archivos de `public/imagenes` existen pero no están asociados a
   ningún producto.
4. **Precio de oferta:** el catálogo guarda un único `precioBase`; no existe un
   campo de oferta en la base. La regla del 10 % la aplica el **backend** al
   calcular la venta (`VentaService.procesarVenta`, con aritmética entera para no
   redondear) y el frontend la replica solo para mostrar el precio. Así el monto
   que se ve en pantalla es el que se cobra.
5. **Estado del pago:** existe `DELETE /pago/{id}` para anular, pero no un
   `PATCH` para marcarlo pagado; el estado del pago lo maneja el backend al
   procesarlo.
6. **CORS en los microservicios:** varios conservan `@CrossOrigin("*")`. No se
   quitaron para no tocar 15 archivos; el gateway deduplica y es el único punto
   que ve el navegador.
7. **`json-server` (`npm run mock`) ya no se usa.** El script sigue en
   `package.json` pero la aplicación no lo consulta.

---

## 14. Conclusión

La integración quedó funcionando de punta a punta: la tienda pública lee el
catálogo real sin sesión, el login valida contra la base de datos y entrega un
JWT que lleva el rol, el panel restringe las secciones por rol en el frontend y
el gateway las vuelve a restringir del lado del servidor, y una venta completa
(monto, stock, pago y orden) la resuelve el backend. Las 33 pruebas unitarias y
las 12 verificaciones de navegador pasan.
