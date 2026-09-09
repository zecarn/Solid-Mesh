/**
 * Unit Test Suite for 3D Printing Cost Calculator Engine
 * Uses Node.js Native Test Runner (node:test & node:assert)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculate3DPrintCost } from '../js/modules/calculator.js';

describe('3D Printing Cost Calculator Engine', () => {

  it('should calculate baseline cost correctly for 85g PLA Silk at 20% infill', () => {
    const result = calculate3DPrintCost({
      weight: 85,
      qty: 1,
      infill: 20,
      ratePerGram: 0.45,
      baseSetupRate: 20.0,
      machineHourlyRate: 7.5
    });

    // Infill 20% factor is 1.0 -> effective weight is 85g
    assert.equal(result.effectiveWeight, 85);
    assert.equal(result.totalWeight, 85);

    // Material cost: 85 * 0.45 = 38.25
    assert.equal(result.materialCost, 38.25);

    // Machine hours: (85 / 26) * 1 = 3.2692...
    // Machine cost: (85 / 26) * 7.5 = 24.5192...
    // Grand total: 38.25 + 24.5192 + 20.0 = 82.7692... -> 82.77
    assert.equal(result.grandTotal, 82.77);
    assert.equal(result.formattedTotal, 'R$ 82,77');
    assert.equal(result.formattedTime, '~ 3h 16min');
  });

  it('should enforce minimum order price floor (R$ 35,00) for tiny parts', () => {
    const result = calculate3DPrintCost({
      weight: 2, // 2 grams
      qty: 1,
      infill: 10,
      ratePerGram: 0.45,
      baseSetupRate: 20.0,
      machineHourlyRate: 7.5
    });

    // Without floor, total would be ~21.50, but floor clamps at 35.00
    assert.equal(result.grandTotal, 35.00);
    assert.equal(result.formattedTotal, 'R$ 35,00');
  });

  it('should scale material and machine time when infill is 100% (Solid part)', () => {
    const baseline = calculate3DPrintCost({ weight: 100, qty: 1, infill: 20 });
    const solid = calculate3DPrintCost({ weight: 100, qty: 1, infill: 100 });

    // 100% infill factor: 1 + (80/160) = 1.5x effective weight
    assert.equal(solid.effectiveWeight, 150);
    assert.equal(solid.totalWeight, 150);
    assert.ok(solid.grandTotal > baseline.grandTotal);
    assert.ok(solid.machineHours > baseline.machineHours);
  });

  it('should calculate batch production proportionally when quantity > 1', () => {
    const single = calculate3DPrintCost({ weight: 50, qty: 1, infill: 20, ratePerGram: 0.55 });
    const batch = calculate3DPrintCost({ weight: 50, qty: 10, infill: 20, ratePerGram: 0.55 });

    assert.equal(batch.totalWeight, 500);
    assert.equal(batch.materialCost, single.materialCost * 10);
    assert.equal(batch.machineCost, single.machineCost * 10);
    assert.ok(batch.grandTotal > single.grandTotal * 9);
  });

  it('should apply higher rates for high-precision resin 8K correctly', () => {
    const plaResult = calculate3DPrintCost({ weight: 60, ratePerGram: 0.45 });
    const resinResult = calculate3DPrintCost({ weight: 60, ratePerGram: 0.95 });

    assert.ok(resinResult.materialCost > plaResult.materialCost);
    assert.ok(resinResult.grandTotal > plaResult.grandTotal);
  });

  it('should handle edge cases and invalid input defensively', () => {
    const result = calculate3DPrintCost({
      weight: -50,
      qty: 0,
      infill: 500
    });

    assert.ok(result.grandTotal >= 35.00);
    assert.ok(result.totalWeight > 0);
    assert.match(result.formattedTotal, /^R\$\s\d+,\d{2}$/);
  });

});
