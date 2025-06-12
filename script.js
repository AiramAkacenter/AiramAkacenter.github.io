const form   = document.getElementById('formulario');
const canvas = document.getElementById('firma');
const signaturePad = new SignaturePad(canvas, { backgroundColor: '#f8fafc' });

document.getElementById('limpiarFirma').onclick = () => signaturePad.clear();

/* ──────────────────────────────────────────────
   BLOQUE “ÁREA FUNCIONAL” (solo ocupados)
   ────────────────────────────────────────────── */
const situacionSelect = document.querySelector('select[name="situacionLaboral"]');
const areaSection     = document.getElementById('areaFuncionalSection');

function toggleAreaFuncional() {
  if (situacionSelect.value === 'ocupado') {
    areaSection.style.display = 'block';
  } else {
    areaSection.style.display = 'none';
    areaSection.querySelectorAll('input').forEach(i => i.checked = false);
  }
}
toggleAreaFuncional();
situacionSelect.addEventListener('change', toggleAreaFuncional);


/* ──────────────────────────────────────────────
   CAMPO LIBRE PARA “OTRA TITULACIÓN” (ZZ)
   ────────────────────────────────────────────── */
document.getElementById('otraTitulacionSelect').addEventListener('change', (e) => {
  const textoLabel = document.getElementById('otraTitulacionTextoLabel');
  if (e.target.value === 'ZZ') {
    textoLabel.style.display = 'block';
  } else {
    textoLabel.style.display = 'none';
    document.getElementById('otraTitulacionTexto').value = '';
  }
});

/* ──────────────────────────────────────────────
   ENVÍO DEL FORMULARIO Y GENERACIÓN DE PDF
   ────────────────────────────────────────────── */
form.onsubmit = async (e) => {
  e.preventDefault();
  const datos = Object.fromEntries(new FormData(form).entries());
  const firmaDataUrl = signaturePad.toDataURL();

  // --- Cargar y preparar el PDF ---
  const plantilla = await fetch('anexo-i.pdf').then(res => res.arrayBuffer());
  const pdfDoc = await PDFLib.PDFDocument.load(plantilla);
  const page  = pdfDoc.getPages()[0];
  const page2 = pdfDoc.getPages()[1];
  const page3 = pdfDoc.getPages()[2];

  const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
  const { height } = page.getSize();

  // --- Ubicar campos en PDF ---
  page.drawText(datos.expediente, { x: 171,   y: height - 193.75, size: 8, font });
  page.drawText(datos.sector,     { x: 422.25,y: height - 193.75, size: 8, font });
  page.drawText(datos.entidad,    { x: 287.25,y: height - 206.5,  size: 8, font });
  page.drawText(datos.grupo + " .- " + datos.accion ,     { x: 279,   y: height - 219,    size: 8, font });

  page.drawText(datos.apellido1,  { x: 153.75,y: height - 250, size: 6, font });
  page.drawText(datos.apellido2,  { x: 246,   y: height - 250, size: 6, font });
  page.drawText(datos.nombre,     { x: 344,   y: height - 250, size: 6, font });

  // Ejemplo de dibujo en page2 (puedes eliminar si no quieres)
  /*for (let k = 1; k < 800; k += 3) {
    for (let j = 1; j < 600; j += 14) {
      page2.drawText(k + "/" + j, {
        x: j,
        y: height - k,
        size: 3,
        font: font
      });
    }
  }*/

  page.drawText(datos.direccion, { x: 141, y: height - 261, size: 6, font });
  page.drawText(datos.localidad, { x: 303, y: height - 261, size: 6, font });
  page.drawText(datos.cp,        { x: 406, y: height - 261, size: 6, font });

  page.drawText(datos.telefono, { x: 128, y: height - 271, size: 6, font });
  page.drawText(datos.email,    { x: 212, y: height - 271, size: 6, font });
  page.drawText(datos.nif,      { x: 445, y: height - 271, size: 6, font });

  page.drawText(datos.ss,         { x: 226, y: height - 283, size: 6, font });
  page.drawText(datos.nacimiento, { x: 178, y: height - 294, size: 6, font });

  // --- Estudios según código ---
  const estudiosMap = {
    '0':  { x: 103, y: height - 335 }, '1':  { x: 103, y: height - 346 },
    '22': { x: 103, y: height - 358 }, '23': { x: 103, y: height - 368 },
    '24': { x: 103, y: height - 380 }, '32': { x: 103, y: height - 391 },
    '33': { x: 103, y: height - 403 }, '34': { x: 103, y: height - 425 },
    '38': { x: 103, y: height - 436 }, '41': { x: 103, y: height - 447 },
    '51': { x: 103, y: height - 459 }, '61': { x: 103, y: height - 480 },
    '62': { x: 103, y: height - 492 }, '71': { x: 103, y: height - 503 },
    '72': { x: 103, y: height - 514 }, '73': { x: 103, y: height - 526 },
    '74': { x: 103, y: height - 537 }, '81': { x: 103, y: height - 548 }
  };
  if (estudiosMap[datos.estudios]) {
    page.drawText('X', { ...estudiosMap[datos.estudios], size: 6, font });
  }

  // --- Grupo de Cotización ---
  const grupoCotizacionMap = {
    '01': { x: 303, y: height - 337 }, '02': { x: 303, y: height - 373 },
    '03': { x: 303, y: height - 385 }, '04': { x: 303, y: height - 398 },
    '05': { x: 303, y: height - 411 }, '06': { x: 303, y: height - 424 },
    '07': { x: 303, y: height - 437 }, '08': { x: 303, y: height - 450 },
    '09': { x: 303, y: height - 462 }, '10': { x: 303, y: height - 475 },
    '11': { x: 303, y: height - 488 }
  };
  if (grupoCotizacionMap[datos.grupoCotizacion]) {
    page.drawText('X', { ...grupoCotizacionMap[datos.grupoCotizacion], size: 6, font });
  }

  // --- Otra Titulación ---
  const otraTitulacionMap = {
    'PR': { x: 103, y: height - 584 }, 'A1': { x: 103, y: height - 595 },
    'A2': { x: 103, y: height - 606 }, 'B1': { x: 103, y: height - 618 },
    'B2': { x: 103, y: height - 630 }, 'C1': { x: 103, y: height - 640 },
    'C2': { x: 103, y: height - 652 }, 'ZZ': { x: 103, y: height - 663 }
  };
  if (otraTitulacionMap[datos.otraTitulacion]) {
    page.drawText('X', { ...otraTitulacionMap[datos.otraTitulacion], size: 6, font });
  }

  console.log("otraTitulacion:", datos.otraTitulacion);
  console.log("otraTitulacionTexto:", datos.otraTitulacionTexto);

  if (datos.otraTitulacion === 'ZZ' && datos.otraTitulacionTexto && datos.otraTitulacionTexto.trim() !== '') {
    page.drawText(datos.otraTitulacionTexto.trim(), {
      x: 193, y: height - 665, size: 6, font
    });
  }

  // --- Categoria Profesional ---
  const CategoriaProfesional = {
    'Di': { x: 106, y: height - 118 },
    'man': { x: 106, y: height - 129 },
    'Tec': { x: 106, y: height - 140 },
    'tra': { x: 106, y: height - 152 },
    'trab': { x: 106, y: height - 163 }
  };
  if (CategoriaProfesional[datos.CATEGORÍA_PROFESIONAL]) {
    page2.drawText('X', { ...CategoriaProfesional[datos.CATEGORÍA_PROFESIONAL], size: 6, font });
  }

const tamanoSeleccionado = document.querySelector('select[name="Tamaño_Empresa"]').value;

const TamañoEmpresa = {
  'inferior10': { x: 183, y: height - 423 },
  '10a49': { x: 248, y: height - 423 },
  '50a99': { x: 307, y: height - 423 },
  '100a249': { x: 367, y: height - 423 },
  '250mas': { x: 437, y: height - 423 }
};

if (TamañoEmpresa[tamanoSeleccionado]) {
  page2.drawText('X', { ...TamañoEmpresa[tamanoSeleccionado], size: 6, font });
}

 const situacion_Laboral = {
    'ocupado': { x: 109, y: height - 321 },
    'desempleado': { x: 109, y: height - 333 },
    'desempleado-larga': { x: 109, y: height - 344 },
    'cuidador': { x: 109, y: height - 355 },
  };
  if (situacion_Laboral[datos.situacionLaboral]) {
    page2.drawText('X', { ...situacion_Laboral[datos.situacionLaboral], size: 6, font });
  }


  
    const Area_Funcional = {
    'DireccionOption': { x: 305, y: height - 118 },
    'AdministracionOption': { x: 305, y: height - 129 },
    'ComercialOption': { x: 305, y: height - 140 },
    'MantenimientoOption': { x: 305, y: height - 152 },
    'ProduccionOption': { x: 305, y: height - 163 }
  };
  if (Area_Funcional[datos.areaFuncional]) {
    page2.drawText('X', { ...Area_Funcional[datos.areaFuncional], size: 6, font });
  }
  


  page2.drawText(datos.entidadTrabajo, { x: 260, y: height - 400, size: 6, font });
  page2.drawText(datos.sectorActividad, { x: 180, y: height - 435, size: 6, font });
  page2.drawText(datos.convenioAplicacion,{ x: 195, y: height - 446, size: 6, font });

  page2.drawText(datos.razonSocial, { x: 153, y: height - 468, size: 6, font });
  page2.drawText(datos.cif, { x: 134, y: height - 480, size: 6, font });
  page2.drawText(datos.domicilioCentro,{ x: 315, y: height - 480, size: 6, font });
  page2.drawText(datos.localidadCentro, { x: 139, y: height - 491, size: 6, font });
  page2.drawText(datos.cpCentro, { x: 369, y: height - 491, size: 6, font });


  // --- Consignar Código (mostrar texto seleccionado sin "X") ---
  if (datos.Consignar_Código && datos.Consignar_Código.trim() !== '') {
    page2.drawText(datos.Consignar_Código, {
      x: 227,       // ajusta la posición horizontal
      y: height - 323, // ajusta la posición vertical
      size: 6,
      font,
    });
  }





let x = 344;
const spacing = 6; // Espacio entre caracteres
const text = datos.Ocupación4;

for (let i = 0; i < text.length; i++) {
  page2.drawText(text[i], { x, y: height - 244, size: 10, font });
  const width = font.widthOfTextAtSize(text[i], 10);
  x += width + spacing;
}




  // --- Género ---
if (datos.genero === 'Hombre') {
  page.drawText('Hombre', { x: 267, y: height - 293, size: 6, font });
} else if (datos.genero === 'Mujer') {
  page.drawText('Mujer', { x: 267, y: height - 293, size: 6, font });
} else if (datos.genero === 'NoBinario') {
  page.drawText('No binario', { x: 267, y: height - 293, size: 6, font });
}


  // --- Discapacidad ---
  if (datos.discapacidad === 'Sí') {
    page.drawText('X', { x: 447, y: height - 292, size: 6, font });
  } else if (datos.discapacidad === 'No') {
    page.drawText('X', { x: 471, y: height - 292, size: 6, font });
  }

  // --- Firma ---
  if (!signaturePad.isEmpty()) {
    const imgFirma = await pdfDoc.embedPng(firmaDataUrl);
    const dims = imgFirma.scale(0.4);
    page3.drawImage(imgFirma, {
      x: 295, y: height - 450, width: dims.width, height: dims.height
    });
  }

  // --- Guardar PDF ---
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'anexo_i_solicitud.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
