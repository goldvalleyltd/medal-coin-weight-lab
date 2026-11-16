/**
 * Medal & Coin Weight Estimator - B2B Export Logistics & Carton Calculator
 * Anti-burst export carton packing (≤18.0 kg / 39.7 lbs per carton), actual vs dimensional weight & Air/Ocean freight estimation
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.MedalCoinLab = root.MedalCoinLab || {};
        root.MedalCoinLab.shipping = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    // Export master carton specs: Double-wall K=K corrugated box (35 x 28 x 25 cm = 0.0245 CBM)
    const CARTON_SPECS = {
        lengthCm: 35,
        widthCm: 28,
        heightCm: 25,
        tareWeightKg: 0.85,
        maxSafeGrossKg: 18.0,      // Strict ≤18.0 kg (39.7 lbs) anti-burst & OSHA/FBA single-person handling limit
        packagingAddGramsPerPc: 3.5 // Individual OPP polybag / PVC pouch + inner box buffer per piece
    };

    /**
     * Calculate export carton packing, gross weight, and Air Courier vs Ocean LCL freight estimates
     * @param {number} unitWeightGrams Single piece weight (including ribbon if medal), in grams
     * @param {number} orderQty        Total order quantity (pcs)
     * @param {string} lang            'en' | 'zh' (default 'en')
     */
    function calculateLogistics(unitWeightGrams, orderQty, lang = 'en') {
        const isZh = (lang === 'zh');
        const safeQty = Math.max(1, Math.round(orderQty || 500));
        const unitPackedGrams = Math.max(5, unitWeightGrams + CARTON_SPECS.packagingAddGramsPerPc);
        const unitPackedKg = unitPackedGrams / 1000.0;

        // Maximum net product weight per master carton (kg)
        const maxNetKgPerCarton = CARTON_SPECS.maxSafeGrossKg - CARTON_SPECS.tareWeightKg;

        // Max pieces per carton (rounded down to multiples of 10 or 25, capped at 500 pcs volume limit)
        let rawMaxPcs = Math.floor(maxNetKgPerCarton / unitPackedKg);
        rawMaxPcs = Math.min(500, Math.max(10, rawMaxPcs));
        const maxPiecesPerCarton = rawMaxPcs >= 50 ? Math.floor(rawMaxPcs / 10) * 10 : rawMaxPcs;

        // Total cartons required
        const totalCartons = Math.ceil(safeQty / maxPiecesPerCarton);

        // Total net weight & total gross weight (kg & lbs)
        const totalNetWeightKg = (safeQty * unitWeightGrams) / 1000.0;
        const totalGrossWeightKg = (safeQty * unitPackedKg) + (totalCartons * CARTON_SPECS.tareWeightKg);
        const totalGrossWeightLbs = totalGrossWeightKg * 2.20462262;
        const avgGrossWeightPerCartonKg = totalGrossWeightKg / totalCartons;
        const avgGrossWeightPerCartonLbs = avgGrossWeightPerCartonKg * 2.20462262;

        // Total shipment volume (CBM) & courier volumetric weight (L*W*H / 5000)
        const singleCartonCbm = (CARTON_SPECS.lengthCm * CARTON_SPECS.widthCm * CARTON_SPECS.heightCm) / 1000000.0;
        const totalVolumeCbm = totalCartons * singleCartonCbm;

        const singleCartonDimKg = (CARTON_SPECS.lengthCm * CARTON_SPECS.widthCm * CARTON_SPECS.heightCm) / 5000.0;
        const totalDimWeightKg = totalCartons * singleCartonDimKg;

        // Metal hardware is High-Density Deadweight Cargo (actual gross weight >> volumetric weight)
        const chargeableWeightCourierKg = Math.max(totalGrossWeightKg, totalDimWeightKg);
        const isDenseCargo = totalGrossWeightKg >= totalDimWeightKg;

        // Reference freight cost estimation (Air Express ~$6.8/kg vs DDP Sea/Rail Freight)
        const estimatedAirCourierUsd = Math.round(chargeableWeightCourierKg * 6.8);
        const estimatedOceanLclUsd = Math.round(Math.max(165, chargeableWeightCourierKg * 2.1));
        const savingsUsd = Math.max(0, estimatedAirCourierUsd - estimatedOceanLclUsd);

        let logisticsTipEn = '';
        let logisticsTipZh = '';

        if (totalGrossWeightKg >= 120) {
            logisticsTipEn = `Heavy Cargo Alert: Total gross weight reaches ${totalGrossWeightKg.toFixed(1)} kg (${totalGrossWeightLbs.toFixed(1)} lbs) across ${totalCartons} cartons (100% Deadweight Cargo). Air Express (DHL/FedEx) costs ~$${estimatedAirCourierUsd} USD, whereas DDP Sea Freight is ~$${estimatedOceanLclUsd} USD (saving ~$${savingsUsd} USD).`;
            logisticsTipZh = `💡 外贸物流筹划建议：当前订单总毛重达 ${totalGrossWeightKg.toFixed(1)} kg (${totalGrossWeightLbs.toFixed(1)} lbs，共 ${totalCartons} 箱)，属于典型五金纯重货 (Deadweight Cargo)。商业快递 (DHL/FedEx) 预估运费约 $${estimatedAirCourierUsd} USD；若交期允许（提前 30 天备货），强烈建议改走海运快船美森/盐田包税专线 (DDP Sea Freight)，预估仅需 ~$${estimatedOceanLclUsd} USD，立省约 $${savingsUsd} USD！`;
        } else if (totalGrossWeightKg >= 45) {
            logisticsTipEn = `Mid-Size Shipment: Total gross weight is ${totalGrossWeightKg.toFixed(1)} kg (${totalGrossWeightLbs.toFixed(1)} lbs, ${totalCartons} cartons). Qualifies for Air Dedicated Line (>45 kg tier) or split shipping (20% by Air Express for urgent event preview + 80% by Sea).`;
            logisticsTipZh = `💡 外贸物流筹划建议：当前订单总毛重 ${totalGrossWeightKg.toFixed(1)} kg (${totalGrossWeightLbs.toFixed(1)} lbs，共 ${totalCartons} 箱)，已达到国际空派专线起运档位（>45 kg 大货价）。急单可选红单商业快递（约 $${estimatedAirCourierUsd} USD），常规排期可选空派包税或“20% 空运应急 + 80% 海运大货”分批出运方案。`;
        } else {
            logisticsTipEn = `Small-Batch Express Optimal: Total gross weight is ${totalGrossWeightKg.toFixed(1)} kg (${totalGrossWeightLbs.toFixed(1)} lbs, ${totalCartons} cartons, ${maxPiecesPerCarton} pcs/ctn max). Door-to-door Air Express (DHL/FedEx/UPS) is most cost-effective at ~$${estimatedAirCourierUsd} USD without minimum LCL port fees.`;
            logisticsTipZh = `💡 外贸物流筹划建议：当前订单总毛重 ${totalGrossWeightKg.toFixed(1)} kg (${totalGrossWeightLbs.toFixed(1)} lbs，共 ${totalCartons} 箱，每箱严控 ≤${maxPiecesPerCarton} pcs 防爆箱)。小批量总重轻，直接走 DHL/FedEx 国际快递门到门（约 $${estimatedAirCourierUsd} USD）比海运最低起运港杂费更划算且时效仅需 4~6 天。`;
        }

        return {
            orderQty: safeQty,
            maxPiecesPerCarton,
            totalCartons,
            totalNetWeightKg: parseFloat(totalNetWeightKg.toFixed(1)),
            totalGrossWeightKg: parseFloat(totalGrossWeightKg.toFixed(1)),
            totalGrossWeightLbs: parseFloat(totalGrossWeightLbs.toFixed(1)),
            avgGrossWeightPerCartonKg: parseFloat(avgGrossWeightPerCartonKg.toFixed(1)),
            avgGrossWeightPerCartonLbs: parseFloat(avgGrossWeightPerCartonLbs.toFixed(1)),
            totalVolumeCbm: parseFloat(totalVolumeCbm.toFixed(3)),
            totalDimWeightKg: parseFloat(totalDimWeightKg.toFixed(1)),
            chargeableWeightCourierKg: parseFloat(chargeableWeightCourierKg.toFixed(1)),
            isDenseCargo,
            estimatedAirCourierUsd,
            estimatedOceanLclUsd,
            logisticsTip: isZh ? logisticsTipZh : logisticsTipEn,
            logisticsTipEn,
            logisticsTipZh,
            cartonDimStr: `${CARTON_SPECS.lengthCm}×${CARTON_SPECS.widthCm}×${CARTON_SPECS.heightCm} cm`
        };
    }

    return {
        CARTON_SPECS,
        calculateLogistics
    };

}));
