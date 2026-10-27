const fs = require("fs");
const path = require("path");
const datos = require("../data/seed");

const destino = path.join(__dirname, "..", "db.json");

fs.writeFileSync(destino, JSON.stringify(datos, null, 2) + "\n", "utf8");

console.log("db.json generado correctamente.");
console.log(`Ruta: ${destino}`);
console.log(
  `Contenido: ${datos.productos.length} productos, ${datos.categorias.length} categorías, ${datos.ordenes.length} órdenes.`
);
