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
];

function limpiarTexto(texto) {
  return texto
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/^>\s?/, "")
    .trim();
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
    .text("Evaluación 2 (30%) — DSY1104", 50, 112, { width: ancho - 100 });

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
    .text("Asignatura: DSY1104 — Evaluación 2 (30%)", 50, 370)
    .text("Sección: completar", 50, 390)
    .text("Docente: completar", 50, 410)
    .text("Fecha: 26-10-2026", 50, 430)
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

  filasLimpias.forEach((celdas, indice) => {
    const alturas = celdas.map((celda, columna) =>
      doc.heightOfString(celda, { width: anchos[columna] - 6 })
    );
    const alturaFila = Math.max(...alturas, 12) + 6;

    if (y + alturaFila > doc.page.height - 70) {
      doc.addPage();
      y = 50;
    }

    if (indice === 0) {
      doc.rect(margen, y, anchoContenido, alturaFila).fill("#f1e6c8");
    } else if (indice % 2 === 0) {
      doc.rect(margen, y, anchoContenido, alturaFila).fill("#fcf9ef");
    }

    doc.fillColor(TEXTO);
    celdas.forEach((celda, columna) => {
      doc
        .font(indice === 0 ? "Helvetica-Bold" : "Helvetica")
        .fontSize(8.5)
        .fillColor(TEXTO)
        .text(celda, margen + columna * anchoColumna + 3, y + 3, {
          width: anchos[columna] - 6,
        });
    });

    doc
      .moveTo(margen, y + alturaFila)
      .lineTo(margen + anchoContenido, y + alturaFila)
      .strokeColor("#ded3b8")
      .lineWidth(0.5)
      .stroke();

    y += alturaFila;
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
        .text(linea || " ", margen + 10, doc.y, {
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
      Subject: "DSY1104 Evaluación 2",
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
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(GRIS)
      .text(
        `Documento generado el 26-10-2026 · Página ${i + 1} de ${rango.count}`,
        margen,
        doc.page.height - 32,
        { width: anchoContenido, align: "center", lineBreak: false }
      );
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
