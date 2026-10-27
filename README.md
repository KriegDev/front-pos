# El Rincón de la Tía Ceci — Tienda online

Proyecto de la Evaluación 2 (30%) de DSY1104. Transforma el frontend
`front-pos` en una tienda online con Next.js, React, Bootstrap y una API
simulada con `json-server`.

## Tecnologías

- Next.js 16.4.3 (App Router)
- React 19.3.0
- JavaScript en toda la aplicación
- Bootstrap 5.3.8 + Bootstrap Icons 1.13.2
- json-server 0.17.4
- Jasmine 5 + Karma 6 + React Testing Library
- Babel + Webpack para las pruebas

## Requisitos

- Node.js 20.9 o superior.
- npm.
- Chrome instalado para `npm test` (opcional: `npm run test:jsdom` no lo
  necesita).

## Instalación

```bash
npm install
npm run seed
```

`npm run seed` genera `db.json` a partir de `data/seed.js`.

> Si el entorno bloquea la caché global de npm, ejecuta
> `npm install --cache .npm-cache`.

## Ejecución

En una terminal:

```bash
npm run mock
```

En otra terminal:

```bash
npm run dev
```

- Tienda: http://localhost:3000
- API simulada: http://localhost:4000

Para producción:

```bash
npm run build
npm run start
```

## Credenciales de prueba

| Usuario | Contraseña | Rol |
| --- | --- | --- |
| admin | 12345 | Administrador |
| vendedor | 123 | Vendedor |

Las cuentas de cliente se crean desde `/crear-cuenta`.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo de Next.js. |
| `npm run build` | Compilación de producción. |
| `npm run start` | Servidor de producción. |
| `npm run lint` | Revisión con ESLint. |
| `npm run seed` | Regenera `db.json` desde `data/seed.js`. |
| `npm run mock` | Levanta json-server en el puerto 4000. |
| `npm test` | Jasmine + Karma con ChromeHeadless. |
| `npm run test:jsdom` | Jasmine + Karma con jsdom, sin Chrome. |
| `npm run test:watch` | Karma en modo interactivo. |
| `npm run docs` | Genera los PDF del ERS y de cobertura de testing. |

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
data/              Datos semilla, zonas y blog
docs/              ERS V2, cobertura de testing y PDF
lib/               API, carrito, sesión, validaciones y ventas
scripts/           Seed y generación de PDF
tests/             Pruebas Jasmine + Karma
db.json            Base de datos simulada
```

## Datos

Los productos, categorías, clientes, órdenes y medios de pago provienen de la
base de datos del proyecto de API VentaRápida. El catálogo tiene 5 productos y
los precios de oferta son un 10% exacto sobre el precio base.

Si necesitas reiniciar los datos:

```bash
npm run seed
```

`json-server` recarga `db.json` automáticamente.

## Pruebas

```bash
npm run test:jsdom
```

Resultado esperado: **33 pruebas exitosas, 0 fallidas**.

Si Chrome está disponible, usa `npm test` para ejecutar la misma suite con
ChromeHeadless.

## Documentos

- `docs/ERS-v2.md` y `docs/ERS-v2.pdf`
- `docs/Cobertura-Testing.md` y `docs/Cobertura-Testing.pdf`

## Limitaciones

- El login y el pago son simulaciones académicas; no hay JWT ni pasarela real.
- Las contraseñas se guardan en texto plano en `db.json`.
- Los productos sin fotografía usan `producto-sin-foto.png`.
- El envío y el retiro son sin costo.
- No se incluyen los módulos de pagos, facturas, proveedores y notificaciones
  del proyecto original.
- La sección y el docente quedan como “completar” en los documentos.
- Si ChromeHeadless no está disponible en el entorno, usa
  `npm run test:jsdom` para ejecutar la misma suite con Karma y jsdom.

## Autoría

Carolina Nataly Hermosilla Baeza · Pedro Felipe Toledo Jaramillo  
DSY1104 — Evaluación 2 (30%) — 2026
