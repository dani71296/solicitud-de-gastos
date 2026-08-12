// app.js - Forzado de texto en negro puro y negrita

async function rellenarYDescargarPDF(datos) {
  try {
    const urlPlantilla = './plantilla_gastos.pdf';
    const response = await fetch(urlPlantilla);

    if (!response.ok) {
      throw new Error("No se pudo cargar 'plantilla_gastos.pdf'. Revisa que esté en la carpeta.");
    }

    const arrayBuffer = await response.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    const form = pdfDoc.getForm();

    // Embed de la fuente en negrita
    const fontBold = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

    // Helper para asignar valor y FORZAR color negro
    const setCampo = (nombreCampo, valor) => {
      if (valor === undefined || valor === null || valor === "") return;
      try {
        const field = form.getField(nombreCampo);

        // Se asigna el valor al campo
        if (field.setText) {
          field.setText(String(valor));
        } else if (field.select) {
          field.select(String(valor));
        }

        // Forzar el estilo de la fuente y color NEGRO (0, 0, 0)
        if (field.acroField && field.acroField.getWidgets) {
          const widgets = field.acroField.getWidgets();
          widgets.forEach(widget => {
            widget.setDefaultAppearance(
              `/${fontBold.name} 10 Tf 0 0 0 rg` // '0 0 0 rg' indica color NEGRO absoluto
            );
          });
        }
      } catch (e) {
        console.warn(`Aviso al asignar campo '${nombreCampo}':`, e);
      }
    };

    // 1. CHECKBOXES
    try {
      if (datos.proposito === 'Reembolso') {
        form.getCheckBox('Button11').check();
      } else if (datos.proposito === 'Por adelantado') {
        form.getCheckBox('Button12').check();
      }
    } catch (e) {
      console.warn("Error asignando checkboxes:", e);
    }

    // 2. DATOS DEL SOLICITANTE
    setCampo('Text2', datos.solicitanteNombre);
    setCampo('Text3', datos.fecha);

    // 3. DATOS DEL BENEFICIARIO (PAGAR A)
    setCampo('Choice23', datos.pagarNombre);
    setCampo('Choice24', datos.pagarDireccion);

    // 4. RAZÓN
    setCampo('Text10', datos.razon);

    // 5. CATEGORÍAS Y MONTOS
    setCampo('Choice16', datos.categoria1);
    setCampo('Text13', datos.monto1);

    setCampo('Choice17', datos.categoria2);
    setCampo('Text14', datos.monto2);

    setCampo('Choice18', datos.categoria3);
    setCampo('Text15', datos.monto3);

    // 6. TOTAL
    setCampo('Text19', datos.total);

    // 7. DATOS BANCARIOS (MEX BANCOMER CAW)
    setCampo('Text20', datos.titularCuenta);
    setCampo('Text21', datos.tipoIdentificacion);
    setCampo('Text22', datos.noIdentificacion);

    // Aplanar formulario
    try {
      form.flatten();
    } catch (e) {
      console.warn("Aviso al aplanar PDF:", e);
    }

    // GUARDAR Y DESCARGAR
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Solicitud_Gastos_${datos.solicitanteNombre || 'Formulario'}.pdf`;
    link.click();

    console.log("✅ PDF generado en negro puro.");

  } catch (error) {
    console.error("❌ Error en rellenarYDescargarPDF:", error);
    alert("Ocurrió un error al generar el PDF. Revisa la consola.");
  }
}