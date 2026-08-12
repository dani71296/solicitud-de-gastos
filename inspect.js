// inspect.js - Diagnóstico de campos PDF
async function inspeccionarCamposPDF() {
  try {
    const response = await fetch('./plantilla_gastos.pdf');
    if (!response.ok) {
      console.error("❌ No se encontró 'plantilla_gastos.pdf'. Revisa que esté en la misma carpeta.");
      return;
    }

    const arrayBuffer = await response.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    console.log("==========================================");
    console.log(`📋 TOTAL DE CAMPOS DETECTADOS: ${fields.length}`);
    console.log("==========================================");

    fields.forEach((field, index) => {
      const type = field.constructor.name;
      const name = field.getName();
      console.log(`Índice ${index} | Tipo: ${type} | Nombre: "${name}"`);
    });

    console.log("==========================================");
  } catch (error) {
    console.error("❌ Error al leer el PDF:", error);
  }
}

inspeccionarCamposPDF();