# El Rincón de la Tía Ceci — Tienda online y punto de venta

Proyecto de la **Evaluación Parcial N° 3 (40%)** de DSY1104 — Desarrollo Fullstack II.

La Evaluación 2 dejó la tienda funcionando con una **API simulada**
(`json-server`). En esta entrega el frontend quedó conectado al **backend real
de microservicios VentaRápida**, que corre de forma local, e incorpora
autenticación con **JWT**, **roles** y **gestión de sesión** en el frontend.

## Tecnologías

- Next.js 16.4.3 (App Router)
- React 19.3.0
- JavaScript en toda la aplicación
- Bootstrap 5.3.8 + Bootstrap Icons 1.13.2
- Jasmine 5 + Karma 6 + React Testing Library
- Babel + Webpack para las pruebas

El frontend consume el backend **VentaRápida** (Spring Boot + MySQL), que vive en
su propio repositorio: <https://github.com/KriegDev/ventarapida-hermosilla-toledo-001d>

## Requisitos

- Node.js 20.9 o superior y npm.
- **Java 21 o superior** y el wrapper `mvnw` (viene incluido en el backend).
- **MySQL 8** (o MariaDB) corriendo en el puerto 3306 con usuario `root`.
- Chrome instalado para `npm test` (opcional: `npm run test:jsdom` no lo
  necesita).

## Puesta en marcha

Hacen falta **tres cosas corriendo**. En este orden:

### 1. Base de datos

```powershell
F:\wamp64\bin\mysql\mysql8.3.0\bin\mysqld.exe --defaults-file="F:\wamp64\bin\mysql\mysql8.3.0\my.ini" --console
```

La primera vez hay que crear las 10 bases importando el script del repositorio
del backend:

```powershell
mysql -u root --host=127.0.0.1 --port=3306 --default-character-set=utf8mb4 < 127_0_0_1.sql
```

### 2. Backend (11 microservicios)

```powershell
cd ventarapida-backend
.\iniciar-servicios.ps1
```

Levanta los servicios en los puertos 4419 a 4430 y el API Gateway en el 4425.
Los registros quedan en `ventarapida-backend\logs\`.

### 3. Frontend

```bash
npm install
npm run dev
```

- Tienda: <http://localhost:3000>
- Panel: <http://localhost:3000/admin>
- Swagger del gateway: <http://localhost:4425/swagger-ui.html>

Para producción:

```bash
npm run build
npm run start
```

## Credenciales de prueba

Los usuarios viven en la base de datos del backend (`bd_usuario`).

| Usuario | Contraseña | Rol |
| --- | --- | --- |
| `servicios` | `Servicios123` | Administrador |
| `vendedor` | `vendedor123` | Vendedor |
| `evidencia` | (la original) | Cliente |

Las cuentas de cliente también se crean desde `/crear-cuenta`.

> El backend exige contraseñas de **8 a 15 caracteres** y las guarda cifradas con
> BCrypt.

Si el backend corre en otra dirección, se cambia sin tocar código creando un
`.env.local` con:

```
NEXT_PUBLIC_API_URL=http://otra-maquina:4425/api/v1
```

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo de Next.js. |
| `npm run build` | Compilación de producción. |
| `npm run start` | Servidor de producción. |
| `npm run lint` | Revisión con ESLint. |
| `npm test` | Jasmine + Karma con ChromeHeadless. |
| `npm run test:jsdom` | Jasmine + Karma con jsdom, sin Chrome. |
| `npm run test:watch` | Karma en modo interactivo. |
| `npm run docs` | Genera los PDF de la documentación (incluye las capturas). |
| `npm run seed` | Regenera `db.json` (legado de la Evaluación 2). |
| `npm run mock` | Levanta `json-server` en el puerto 4000 (legado; ya no se usa). |

## Rutas principales

Tienda: `/`, `/productos`, `/productos/[id]`, `/categorias`,
`/categorias/[id]`, `/ofertas`, `/carrito`, `/comprar`, `/comprar/ok`,
`/comprar/error`, `/nosotros`, `/blog`, `/blog/[id]`, `/contacto`, `/puntos`,
`/iniciar-sesion`, `/crear-cuenta`.

Admin: `/admin`, `/admin/ventas`, `/admin/productos`, `/admin/categorias`,
`/admin/ordenes`, `/admin/usuarios`, `/admin/clientes`, `/admin/reportes`,
`/admin/perfil`.

## Estructura

```text
app/
  (tienda)/        Tienda pública
  admin/           Panel administrativo
components/        Componentes reutilizables
data/              Datos del blog y zonas de despacho
docs/              Documentación, capturas y PDF
lib/
  api.js           Capa adaptadora hacia el API Gateway
  sesion.js        Sesión y token JWT en localStorage
  ventas.js        Registro de ventas (delegado al backend)
  validaciones.js  RUN, correo y contraseñas
  formato.js       Formatos de fecha y dinero
  datos.js         Cálculos sobre productos, clientes y órdenes
scripts/           Generación de PDF
tests/             Pruebas Jasmine + Karma
```

## Datos

Los productos, categorías, clientes, órdenes, pagos y usuarios ya **no** están en
el frontend: se piden al backend y se guardan en MySQL. El precio de la venta lo
calcula el backend con su propio catálogo.

## Autenticación y permisos

- El login se valida en el backend (`POST /api/v1/auth/login`), que devuelve un
  **JWT** con el rol del usuario.
- El token se guarda junto con la sesión en `localStorage`, así que la sesión
  **sobrevive a recargar la página**.
- El panel esconde las secciones que no corresponden al rol, y el **API Gateway
  vuelve a rechazarlas** del lado del servidor (401 sin token, 403 sin permiso).

El detalle completo está en [`docs/Documento-Integracion.md`](docs/Documento-Integracion.md).

## Pruebas

```bash
npm run test:jsdom
```

Resultado esperado: **33 pruebas exitosas, 0 fallidas**.

## Documentos

- [`docs/Manual-Usuario.md`](docs/Manual-Usuario.md) y su PDF, con pantallazos.
- [`docs/Documento-Integracion.md`](docs/Documento-Integracion.md) y su PDF.
- `docs/ERS-v2.md` y `docs/Cobertura-Testing.md` (documentos de la Evaluación 2).

## Limitaciones

- El backend no guarda datos de entrega (dirección, región, comuna) ni imágenes
  de producto.
- El backend no tiene concepto de "oferta": el 10 % se calcula en el frontend.
- El estado del pago lo maneja el backend al procesarlo; no hay un `PATCH` para
  cambiarlo a mano.
- `json-server` (`npm run mock`) quedó como legado de la Evaluación 2 y la
  aplicación ya no lo consulta.

## Autoría

Carolina Nataly Hermosilla Baeza · Pedro Felipe Toledo Jaramillo
DSY1104 — Evaluación Parcial N° 3 (40%) — 2026
