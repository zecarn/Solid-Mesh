/**
 * Instant Quote Calculator & CAD Dropzone Module
 * Implements real-time 3D printing cost estimation, infill multipliers, and CAD file analysis simulation.
 */

let currentRate = 0.45; // R$ per gram (PLA Silk baseline)
let currentMaterialName = 'PLA Silk';

let weightInput, qtyInput, infillSlider, infillDisplay, totalPriceDisplay;
let summaryMaterial, summaryInfill, summaryWeight, summaryQty, summaryTime;
let materialButtons;

/**
 * Pure business logic function for 3D printing cost estimation.
 * Decoupled from DOM for reliable unit testing and headless calculations.
 */
export function calculate3DPrintCost({
  weight = 10,
  qty = 1,
  infill = 20,
  ratePerGram = 0.45,
  baseSetupRate = 20.0,
  machineHourlyRate = 7.5
} = {}) {
  const safeWeight = Math.max(1, parseFloat(weight) || 10);
  const safeQty = Math.max(1, parseInt(qty) || 1);
  const safeInfill = Math.min(100, Math.max(10, parseInt(infill) || 20));
  const safeRate = parseFloat(ratePerGram) || 0.45;

  // Infill multiplier adjustment: 20% is baseline 1.0, 100% is 1.5x material
  const infillFactor = 1 + ((safeInfill - 20) / 160);
  const effectiveWeight = safeWeight * infillFactor;

  // Machine hourly operational rate: 1 hour roughly per 26g
  const machineHours = (effectiveWeight / 26) * safeQty;
  const machineCost = machineHours * machineHourlyRate;

  // Material cost
  const materialCost = effectiveWeight * safeRate * safeQty;

  // Minimum floor price is R$ 35.00
  const grandTotal = Math.max(35.0, materialCost + machineCost + baseSetupRate);

  const hours = Math.floor(machineHours);
  const mins = Math.round((machineHours - hours) * 60);

  return {
    effectiveWeight,
    totalWeight: Math.round(effectiveWeight * safeQty),
    machineHours,
    machineCost,
    materialCost,
    grandTotal: parseFloat(grandTotal.toFixed(2)),
    formattedTotal: `R$ ${grandTotal.toFixed(2).replace('.', ',')}`,
    formattedTime: `~ ${Math.max(1, hours)}h ${mins}min`
  };
}

export function recalculateQuote() {
  if (!weightInput) return;

  const weight = parseFloat(weightInput.value) || 10;
  const qty = parseInt(qtyInput.value) || 1;
  const infill = parseInt(infillSlider.value) || 20;

  const result = calculate3DPrintCost({
    weight,
    qty,
    infill,
    ratePerGram: currentRate
  });

  // Update UI Displays
  if (totalPriceDisplay) {
    totalPriceDisplay.textContent = result.formattedTotal;
  }
  if (summaryMaterial) summaryMaterial.textContent = currentMaterialName;
  if (summaryInfill) summaryInfill.textContent = `${infill}% Estrutural`;
  if (summaryWeight) summaryWeight.textContent = `${result.totalWeight} gramas`;
  if (summaryQty) summaryQty.textContent = `${qty} ${qty > 1 ? 'unidades' : 'unidade'}`;
  if (summaryTime) summaryTime.textContent = result.formattedTime;
}

/**
 * Allows external modules (e.g. gallery) to inject a sample into the calculator
 */
export function loadSampleToCalculator(name, weight, matCategory) {
  if (!weightInput) return;

  weightInput.value = weight;
  
  if (materialButtons) {
    const targetMat = Array.from(materialButtons).find(b => b.textContent.includes(matCategory)) || materialButtons[0];
    if (targetMat) {
      targetMat.click();
    }
  }

  recalculateQuote();

  // Smooth scroll to calculator section
  const quoteSection = document.getElementById('orcamento');
  if (quoteSection) {
    quoteSection.scrollIntoView({ behavior: 'smooth' });
  }
}

export function initQuoteCalculator() {
  weightInput = document.getElementById('weightInput');
  qtyInput = document.getElementById('qtyInput');
  infillSlider = document.getElementById('infillSlider');
  infillDisplay = document.getElementById('infillValueDisplay');
  totalPriceDisplay = document.getElementById('totalPriceDisplay');
  summaryMaterial = document.getElementById('summary-material');
  summaryInfill = document.getElementById('summary-infill');
  summaryWeight = document.getElementById('summary-weight');
  summaryQty = document.getElementById('summary-qty');
  summaryTime = document.getElementById('summary-time');
  materialButtons = document.querySelectorAll('.mat-option');

  // Attach input listeners
  if (infillSlider && infillDisplay) {
    infillSlider.addEventListener('input', (e) => {
      infillDisplay.textContent = `${e.target.value}%`;
      recalculateQuote();
    });
  }

  if (weightInput) weightInput.addEventListener('input', recalculateQuote);
  if (qtyInput) qtyInput.addEventListener('input', recalculateQuote);

  // Material selector buttons
  materialButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      materialButtons.forEach(b => {
        b.classList.remove('border-neon-cyan', 'bg-neon-cyan/10', 'text-white');
        b.classList.add('border-cyber-700', 'bg-cyber-900/60', 'text-metal-300');
      });
      btn.classList.add('border-neon-cyan', 'bg-neon-cyan/10', 'text-white');
      btn.classList.remove('border-cyber-700', 'bg-cyber-900/60', 'text-metal-300');

      currentRate = parseFloat(btn.getAttribute('data-rate')) || 0.45;
      const titleSpan = btn.querySelector('.font-display');
      currentMaterialName = titleSpan ? titleSpan.textContent.trim() : 'PLA Silk';
      recalculateQuote();
    });
  });

  // Dropzone and CAD file upload simulation
  const dropzone = document.getElementById('dropzone');
  const cadFileInput = document.getElementById('cadFileInput');
  const uploadStatus = document.getElementById('upload-status');
  const fileNameLabel = document.getElementById('file-name-label');
  const fileSizeLabel = document.getElementById('file-size-label');

  if (dropzone && cadFileInput) {
    dropzone.addEventListener('click', () => cadFileInput.click());

    // Drag & Drop visual feedback
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('border-neon-cyan', 'bg-cyber-900');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('border-neon-cyan', 'bg-cyber-900');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleCADFile(files[0]);
      }
    });

    cadFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleCADFile(e.target.files[0]);
      }
    });
  }

  function handleCADFile(file) {
    if (uploadStatus) uploadStatus.classList.remove('hidden');
    if (fileNameLabel) fileNameLabel.textContent = file.name;
    if (fileSizeLabel) fileSizeLabel.textContent = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    
    // Simulate calculated weight based on file dimensions
    const calculatedWeight = Math.floor(Math.random() * 120) + 40;
    if (weightInput) {
      weightInput.value = calculatedWeight;
    }
    recalculateQuote();
  }

  // Quote confirmation button
  const sendQuoteBtn = document.getElementById('sendQuoteBtn');
  if (sendQuoteBtn) {
    sendQuoteBtn.addEventListener('click', () => {
      alert(`Solicitação confirmada! A engenharia da Solid Mesh Studio reservou seu lote. Um consultor entrará em contato com a revisão técnica da malha.`);
    });
  }

  // Initial Calculation
  recalculateQuote();
}
