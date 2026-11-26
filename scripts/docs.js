const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const ROJO = "#8d0000";
const ROJO_OSCURO = "#5f0000";
const CREMA = "#f5e8b1";
const TEXTO = "#2b1a1a";
const GRIS = "#6c5b5b";

const DOCUMENTOS = [
  {
    archivo: "POS-Tia-Ceci-For-Dummies",
    titulo: "POS-Tia-Ceci-For-Dummies",
    subtitulo: "Cómo el frontend se conecta con la API, explicado desde cero",
    version: "Versión 1.0",
    materia: "DSY1104 Evaluación 3",
    ponderacion: "40%",
  },
  {
    archivo: "Guia-Evaluacion",
    titulo: "Guía de evaluación",
    subtitulo: "Qué se hizo, dónde encontrarlo y cómo demostrarlo",
    version: "Versión 1.0",
    materia: "DSY1104 Evaluación 3",
    ponderacion: "40%",
  },
  {
    archivo: "ERS-v2",
    titulo: "ERS V2",
    subtitulo: "Tienda online El Rincón de la Tía Ceci",
    version: "Versión 2.0",
  },
  {
    archivo: "Cobertura-Testing",
    titulo: "Cobertura de testing",
    subtitulo: "Tienda online El Rincón de la Tía Ceci",
    version: "Versión 1.0",
  },
  {
    archivo: "Documento-Integracion",
    titulo: "Documento de integración",
    subtitulo: "Frontend Next.js contra el backend de microservicios VentaRápida",
    version: "Versión 1.0",
    materia: "DSY1104 Evaluación 3",
    ponderacion: "40%",
  },
  {
    archivo: "Manual-Usuario",
    titulo: "Manual de usuario",
    subtitulo: "Tienda online y punto de venta El Rincón de la Tía Ceci",
    version: "Versión 1.0",
    materia: "DSY1104 Evaluación 3",
    ponderacion: "40%",
  },
];

/**
 * Helvetica y Courier (las fuentes del PDF) solo pueden dibujar caracteres de
 * Windows-1252. Las flechas y los caracteres de dibujo de caja no están ahí y
 * salían como símbolos raros ("!'"), así que se reemplazan por ASCII.
 */
function limpiarSimbolos(texto) {
  return texto
    .replace(/→/g, "->")
    .replace(/←/g, "<-")
    .replace(/▼/g, "v")
    .replace(/▲/g, "^")
    .replace(/−/g, "-")
    .replace(/≤/g, "<=")
    .replace(/≥/g, ">=")
    .replace(/[┌┐└┘├┤┬┴┼]/g, "+")
    .replace(/[─━]/g, "-")
    .replace(/│/g, "|")
    .trimEnd();
}

function limpiarTexto(texto) {
  return limpiarSimbolos(
    texto
      .replace(/\*\*(.*?)\*\*/g, "$1")
      // Si una negrita queda partida entre dos líneas, la regla anterior no
      // alcanza a cerrarla; esto borra los asteriscos que sobren.
      .replace(/\*\*/g, "")
      // Cursivas de un solo asterisco (*texto*).
      .replace(/\*([^*\n]+)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
      .replace(/^>\s?/, "")
  ).trim();
}

function esSeparadorTabla(celdas) {
  return celdas.every((celda) => /^:?-{3,}:?$/.test(celda.trim()));
}

function leerLineas(archivo) {
  return fs.readFileSync(archivo, "utf8").replace(/\r\n/g, "\n").split("\n");
}

function agregarPortada(doc, documento) {
  const ancho = doc.page.width;
  const alto = doc.page.height;
  // Permite reutilizar el mismo generador para distintas evaluaciones.
  const materia = documento.materia || "DSY1104 Evaluación 2";
  const ponderacion = documento.ponderacion || "30%";
  const fecha = new Date().toLocaleDateString("es-CL");

  doc.rect(0, 0, ancho, 150).fill(ROJO);
  doc
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("ESCUELA DE ADMINISTRACIÓN Y NEGOCIOS", 50, 38, {
      width: ancho - 100,
    });
  doc.fontSize(28).text(documento.titulo, 50, 65, { width: ancho - 100 });
  doc
    .font("Helvetica")
    .fontSize(11)
    .text(`${materia} (${ponderacion})`, 50, 112, { width: ancho - 100 });

  doc
    .fillColor(ROJO_OSCURO)
    .font("Helvetica-Bold")
    .fontSize(20)
    .text(documento.subtitulo, 50, 210, { width: ancho - 100 });

  doc
    .fillColor(TEXTO)
    .font("Helvetica")
    .fontSize(11)
    .moveDown(2)
    .text("Integrantes:", 50, 285)
    .font("Helvetica-Bold")
    .text("Carolina Nataly Hermosilla Baeza", 50, 305)
    .text("Pedro Felipe Toledo Jaramillo", 50, 323);

  doc
    .font("Helvetica")
    .fillColor(TEXTO)
    .text(`Asignatura: ${materia} (${ponderacion})`, 50, 370)
    .text("Sección: completar", 50, 390)
    .text("Docente: completar", 50, 410)
    .text(`Fecha: ${fecha}`, 50, 430)
    .text(documento.version, 50, 450);

  doc.rect(50, alto - 150, ancho - 100, 2).fill(ROJO);
  doc
    .fillColor(GRIS)
    .fontSize(9)
    .text(
      "Documento académico. Proyecto basado en front-pos, el template HTML del Anexo 3 y la API VentaRápida.",
      50,
      alto - 135,
      { width: ancho - 100 }
    );

  doc.addPage();
}

function dibujarTabla(doc, filas, anchoContenido, margen) {
  const filasLimpias = filas
    .map((fila) =>
      fila
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((celda) => limpiarTexto(celda))
    )
    .filter((celdas) => !esSeparadorTabla(celdas));

  if (filasLimpias.length === 0) return;

  const columnas = Math.max(...filasLimpias.map((fila) => fila.length));
  const anchoColumna = anchoContenido / columnas;
  const anchos = Array.from({ length: columnas }, () => anchoColumna);

  doc.font("Helvetica").fontSize(8.5);
  let y = doc.y + 4;

  const alturaDeFila = (celdas) => {
    const alturas = celdas.map((celda, columna) =>
      doc.heightOfString(celda, { width: anchos[columna] - 6 })
    );
    return Math.max(...alturas, 12) + 6;
  };

  // Dibuja una fila en una posición vertical concreta y devuelve su altura.
  const dibujarFila = (celdas, indice, posicion) => {
    const alturaFila = alturaDeFila(celdas);

    if (indice === 0) {
      doc.rect(margen, posicion, anchoContenido, alturaFila).fill("#f1e6c8");
    } else if (indice % 2 === 0) {
      doc.rect(margen, posicion, anchoContenido, alturaFila).fill("#fcf9ef");
    }

    doc.fillColor(TEXTO);
    celdas.forEach((celda, columna) => {
      doc
        .font(indice === 0 ? "Helvetica-Bold" : "Helvetica")
        .fontSize(8.5)
        .fillColor(TEXTO)
        .text(celda, margen + columna * anchoColumna + 3, posicion + 3, {
          width: anchos[columna] - 6,
        });
    });

    doc
      .moveTo(margen, posicion + alturaFila)
      .lineTo(margen + anchoContenido, posicion + alturaFila)
      .strokeColor("#ded3b8")
      .lineWidth(0.5)
      .stroke();

    return alturaFila;
  };

  filasLimpias.forEach((celdas, indice) => {
    if (y + alturaDeFila(celdas) > doc.page.height - 70) {
      doc.addPage();
      y = 50;

      // Si la tabla se parte entre dos páginas, se repite el encabezado en la
      // página nueva para que las columnas sigan teniendo nombre.
      if (indice > 0) {
        y += dibujarFila(filasLimpias[0], 0, y);
      }
    }

    y += dibujarFila(celdas, indice, y);
  });

  doc.y = y + 6;
  doc.x = margen;
}

function agregarContenido(doc, lineas, margen, anchoContenido) {
  let enCodigo = false;
  let tabla = [];

  const vaciarTabla = () => {
    if (tabla.length > 0) {
      dibujarTabla(doc, tabla, anchoContenido, margen);
      tabla = [];
    }
  };

  for (let i = 0; i < lineas.length; i += 1) {
    const lineaOriginal = lineas[i];
    const linea = lineaOriginal.trimEnd();

    if (linea.trim().startsWith("```")) {
      vaciarTabla();
      enCodigo = !enCodigo;
      continue;
    }

    if (enCodigo) {
      if (doc.y > doc.page.height - 80) doc.addPage();
      doc
        .font("Courier")
        .fontSize(8.5)
        .fillColor("#3b2f2f")
        .text(limpiarSimbolos(linea) || " ", margen + 10, doc.y, {
          width: anchoContenido - 20,
        });
      continue;
    }

    if (linea.trim().startsWith("|")) {
      tabla.push(linea);
      continue;
    }
    vaciarTabla();

    if (!linea.trim()) {
      doc.moveDown(0.35);
      continue;
    }

    if (linea.startsWith("---")) {
      if (doc.y > doc.page.height - 80) doc.addPage();
      doc
        .moveTo(margen, doc.y)
        .lineTo(margen + anchoContenido, doc.y)
        .strokeColor("#d8c9a9")
        .lineWidth(1)
        .stroke();
      doc.moveDown(1);
      continue;
    }

    if (linea.startsWith("# ")) {
      if (doc.y > doc.page.height - 130) doc.addPage();
      doc
        .fillColor(ROJO_OSCURO)
        .font("Helvetica-Bold")
        .fontSize(19)
        .text(limpiarTexto(linea.slice(2)), margen, doc.y, {
          width: anchoContenido,
        });
      doc.moveDown(0.7);
      continue;
    }

    if (linea.startsWith("## ")) {
      if (doc.y > doc.page.height - 100) doc.addPage();
      doc
        .fillColor(ROJO)
        .font("Helvetica-Bold")
        .fontSize(14)
        .text(limpiarTexto(linea.slice(3)), margen, doc.y, {
          width: anchoContenido,
        });
      doc.moveDown(0.45);
      continue;
    }

    if (linea.startsWith("### ")) {
      if (doc.y > doc.page.height - 90) doc.addPage();
      doc
        .fillColor(ROJO_OSCURO)
        .font("Helvetica-Bold")
        .fontSize(11.5)
        .text(limpiarTexto(linea.slice(4)), margen, doc.y, {
          width: anchoContenido,
        });
      doc.moveDown(0.35);
      continue;
    }

    // Imagen en Markdown: ![descripción](ruta)
    const imagen = linea.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);
    if (imagen) {
      const [, descripcion, ruta] = imagen;
      // El Markdown vive en docs/, así que GitHub resuelve "capturas/x.png"
      // como docs/capturas/x.png. Aquí se prueban las dos ubicaciones.
      const candidatas = path.isAbsolute(ruta)
        ? [ruta]
        : [
            path.join(__dirname, "..", "docs", ruta.replace(/^\//, "")),
            path.join(__dirname, "..", ruta.replace(/^\//, "")),
          ];
      const absoluta = candidatas.find((c) => fs.existsSync(c));

      if (absoluta) {
        try {
          const img = doc.openImage(absoluta);
          const escala = Math.min(anchoContenido / img.width, 430 / img.height, 1);
          const anchoFinal = img.width * escala;
          const altoFinal = img.height * escala;

          if (doc.y + altoFinal + 30 > doc.page.height - 60) doc.addPage();

          doc.image(absoluta, margen + (anchoContenido - anchoFinal) / 2, doc.y, {
            width: anchoFinal,
            height: altoFinal,
          });
          doc.y += altoFinal + 6;

          if (descripcion) {
            doc
              .fillColor(GRIS)
              .font("Helvetica-Oblique")
              .fontSize(8.5)
              .text(descripcion, margen, doc.y, {
                width: anchoContenido,
                align: "center",
              });
          }
          doc.moveDown(0.7);
        } catch (problema) {
          doc
            .fillColor(GRIS)
            .font("Helvetica")
            .fontSize(9)
            .text(`[no se pudo dibujar la imagen ${ruta}]`, margen, doc.y, {
              width: anchoContenido,
            });
          doc.moveDown(0.3);
        }
      } else {
        doc
          .fillColor(GRIS)
          .font("Helvetica")
          .fontSize(9)
          .text(`[imagen no encontrada: ${ruta}]`, margen, doc.y, {
            width: anchoContenido,
          });
        doc.moveDown(0.3);
      }
      continue;
    }

    if (/^[-*]\s+/.test(linea)) {
      if (doc.y > doc.page.height - 70) doc.addPage();
      doc
        .fillColor(TEXTO)
        .font("Helvetica")
        .fontSize(10)
        .text(`• ${limpiarTexto(linea.replace(/^[-*]\s+/, ""))}`, margen + 12, doc.y, {
          width: anchoContenido - 12,
          lineGap: 1.5,
        });
      doc.moveDown(0.15);
      continue;
    }

    if (/^\d+\.\s+/.test(linea)) {
      if (doc.y > doc.page.height - 70) doc.addPage();
      doc
        .fillColor(TEXTO)
        .font("Helvetica")
        .fontSize(10)
        .text(limpiarTexto(linea), margen + 12, doc.y, {
          width: anchoContenido - 12,
          lineGap: 1.5,
        });
      doc.moveDown(0.15);
      continue;
    }

    if (doc.y > doc.page.height - 80) doc.addPage();
    doc
      .fillColor(TEXTO)
      .font("Helvetica")
      .fontSize(10)
      .text(limpiarTexto(linea), margen, doc.y, {
        width: anchoContenido,
        align: "justify",
        lineGap: 2,
      });
    doc.moveDown(0.3);
  }

  vaciarTabla();
}

function crearPdf(documento) {
  const origen = path.join(__dirname, "..", "docs", `${documento.archivo}.md`);
  const destino = path.join(__dirname, "..", "docs", `${documento.archivo}.pdf`);

  if (!fs.existsSync(origen)) {
    throw new Error(`No existe el documento fuente: ${origen}`);
  }

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    bufferPages: true,
    info: {
      Title: documento.titulo,
      Author: "Carolina Hermosilla · Pedro Toledo",
      Subject: documento.materia || "DSY1104 Evaluación 2",
    },
  });

  const flujo = fs.createWriteStream(destino);
  doc.pipe(flujo);

  const margen = 50;
  const anchoContenido = doc.page.width - margen * 2;

  agregarPortada(doc, documento);
  const lineas = leerLineas(origen);

  // La primera línea del Markdown repite el título de la portada.
  if (lineas[0]?.startsWith("# ")) lineas.shift();

  agregarContenido(doc, lineas, margen, anchoContenido);

  const rango = doc.bufferedPageRange();
  for (let i = rango.start; i < rango.start + rango.count; i += 1) {
    doc.switchToPage(i);
    if (i === 0) continue;

    // El pie va por debajo del margen inferior. Sin esto, pdfkit considera que
    // el texto no cabe y crea una página nueva para escribirlo, que es de donde
    // salían las páginas en blanco al final del documento.
    const margenInferiorOriginal = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(GRIS)
      .text(
        `Documento generado el ${new Date().toLocaleDateString("es-CL")} · Página ${i + 1} de ${rango.count}`,
        margen,
        doc.page.height - 32,
        { width: anchoContenido, align: "center", lineBreak: false }
      );

    doc.page.margins.bottom = margenInferiorOriginal;
  }

  doc.end();

  return new Promise((resolve, reject) => {
    flujo.on("finish", () => resolve(destino));
    flujo.on("error", reject);
  });
}

async function main() {
  for (const documento of DOCUMENTOS) {
    const destino = await crearPdf(documento);
    console.log(`PDF generado: ${destino}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
