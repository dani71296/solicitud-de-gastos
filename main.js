// main.js - Manejo de la interfaz, eventos y selección manual

let beneficiariosBD = [];

const opcionesCategorias = [
  "Quórum Élderes", "Grupo Sumos Sacerdotes", "Adultos Solteros", "Administración",
  "Currículo", "Centro de Distribución", "PFJ en casa", "Misceláneo",
  "Hombres Jóvenes", "Mujeres Jóvenes", "Biblioteca", "Primaria",
  "Actividad FSY", "Convenciones JAS/AS", "Asignación de Presupuesto",
  "Sociedad de Socorro", "Escuela Dominical", "Otros"
];

window.addEventListener('DOMContentLoaded', async () => {
  // 1. Fecha actual por defecto
  document.getElementById('fecha').valueAsDate = new Date();

  // 2. Cargar opciones de categorías
  const selects = document.querySelectorAll('.select-categoria');
  selects.forEach(select => {
    select.innerHTML = '<option value="">-- Seleccionar --</option>';
    opcionesCategorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      select.appendChild(option);
    });
  });

  // 3. Cargar desplegable de beneficiarios
  try {
    const res = await fetch('./beneficiarios.json');
    if (res.ok) {
      beneficiariosBD = await res.json();
      const selectBeneficiario = document.getElementById('selectBeneficiario');
      
      beneficiariosBD.forEach((b, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = b.nombre;
        selectBeneficiario.appendChild(option);
      });

      const optOtro = document.createElement('option');
      optOtro.value = "OTRO";
      optOtro.textContent = "✍️ Otro / Escribir nombre manual...";
      selectBeneficiario.appendChild(optOtro);
    }
  } catch (error) {
    console.warn("No se pudo cargar beneficiarios.json:", error);
  }

  // 4. Escuchar selección del desplegable
  document.getElementById('selectBeneficiario').addEventListener('change', manejarSeleccionBeneficiario);

  // 5. Escuchar cambios de montos
  const montos = document.querySelectorAll('.input-monto');
  montos.forEach(input => {
    input.addEventListener('input', calcularTotal);
  });

  // 6. Manejo del envío del formulario
  document.getElementById('gastosForm').addEventListener('submit', manejarEnvio);
});

function manejarSeleccionBeneficiario() {
  const val = document.getElementById('selectBeneficiario').value;
  const grupoManual = document.getElementById('grupoNombreManual');
  const inputManual = document.getElementById('pagarNombre');

  if (val === "OTRO") {
    grupoManual.style.display = "block";
    inputManual.required = true;
    inputManual.value = "";
    inputManual.focus(); // Otorga el foco automático para escribir directo
    
    // Dejar campos limpios para escribir a mano
    document.getElementById('pagarDireccion').value = "";
    document.getElementById('titularCuenta').value = "";
    document.getElementById('tipoIdentificacion').value = "";
    document.getElementById('noIdentificacion').value = "";
  } else if (val !== "") {
    grupoManual.style.display = "none";
    inputManual.required = false;
    
    const b = beneficiariosBD[parseInt(val)];
    if (b) {
      inputManual.value = b.nombre;
      document.getElementById('pagarDireccion').value = b.direccion;
      document.getElementById('titularCuenta').value = b.titular;
      document.getElementById('tipoIdentificacion').value = b.tipoId;
      document.getElementById('noIdentificacion').value = b.noId;
    }
  } else {
    grupoManual.style.display = "none";
    inputManual.required = false;
    inputManual.value = "";
    document.getElementById('pagarDireccion').value = "";
    document.getElementById('titularCuenta').value = "";
    document.getElementById('tipoIdentificacion').value = "";
    document.getElementById('noIdentificacion').value = "";
  }
}

function calcularTotal() {
  const montos = document.querySelectorAll('.input-monto');
  let suma = 0;
  montos.forEach(input => {
    const val = parseFloat(input.value);
    if (!isNaN(val)) suma += val;
  });
  document.getElementById('lblTotal').textContent = suma.toFixed(2);
}

function manejarEnvio(e) {
  e.preventDefault();

  const propositos = document.getElementsByName('proposito');
  let propositoValor = 'Reembolso';
  for (let p of propositos) {
    if (p.checked) propositoValor = p.value;
  }

  const selectVal = document.getElementById('selectBeneficiario').value;
  let nombreBeneficiarioFinal = "";
  
  if (selectVal === "OTRO") {
    nombreBeneficiarioFinal = document.getElementById('pagarNombre').value;
  } else if (selectVal !== "") {
    nombreBeneficiarioFinal = beneficiariosBD[parseInt(selectVal)].nombre;
  }

  const datosFormulario = {
    proposito: propositoValor,
    solicitanteNombre: document.getElementById('solicitanteNombre').value,
    fecha: document.getElementById('fecha').value,
    pagarNombre: nombreBeneficiarioFinal,
    pagarDireccion: document.getElementById('pagarDireccion').value,
    razon: document.getElementById('razon').value,
    categoria1: document.getElementById('categoria1').value,
    monto1: document.getElementById('monto1').value,
    categoria2: document.getElementById('categoria2').value,
    monto2: document.getElementById('monto2').value,
    categoria3: document.getElementById('categoria3').value,
    monto3: document.getElementById('monto3').value,
    total: document.getElementById('lblTotal').textContent,
    titularCuenta: document.getElementById('titularCuenta').value,
    tipoIdentificacion: document.getElementById('tipoIdentificacion').value,
    noIdentificacion: document.getElementById('noIdentificacion').value
  };

  rellenarYDescargarPDF(datosFormulario);
}