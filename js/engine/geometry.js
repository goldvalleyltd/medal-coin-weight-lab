/**
 * Medal & Coin Weight Estimator - Geometry & Volume Engine
 * Dual-channel volume integration: Parametric Cylinder/Contour Approximation & Gauss Divergence Theorem Mesh Solver
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        const presets = require('./presets.js');
        module.exports = factory(presets);
    } else {
        root.MedalCoinLab = root.MedalCoinLab || {};
        root.MedalCoinLab.geometry = factory(root.MedalCoinLab.presets);
    }
}(typeof self !== 'undefined' ? self : this, function (presets) {

    /**
     * Channel A-1: Challenge Coin Parametric Volume & Weight Estimation
     * @param {number} diameterMm  Coin diameter (mm)
     * @param {number} thicknessMm Base rim thickness (mm)
     * @param {string} reliefKey   Relief process key ('flat-2d', 'stamped-2d', 'semi-3d', 'high-3d')
     * @param {string} edgeKey     Edge cut key ('flat', 'reeded', 'rope', 'diamond-cut', 'wave', 'lettered')
     * @param {string} materialKey Alloy material key
     */
    function estimateCoin(diameterMm, thicknessMm, reliefKey, edgeKey, materialKey) {
        const relief = presets.RELIEF_STYLES[reliefKey] || presets.RELIEF_STYLES['stamped-2d'];
        const edge = presets.EDGE_CUTS[edgeKey] || presets.EDGE_CUTS['flat'];
        const mat = presets.MATERIALS[materialKey] || presets.MATERIALS['zn-zamak3'];

        const radiusCm = (diameterMm / 2.0) / 10.0;
        const crossAreaCm2 = Math.PI * radiusCm * radiusCm;
        const crossAreaMm2 = crossAreaCm2 * 100.0;

        // Effective equivalent thickness (mm) = base rim thickness + double-sided relief compensation - enamel recess compensation
        const effectiveThicknessMm = Math.max(1.2, thicknessMm + relief.deltaThicknessMm - 0.12);
        const effectiveThicknessCm = effectiveThicknessMm / 10.0;

        // Net metal volume (cm³) = cross-sectional area × effective thickness × edge milling retention factor
        const volumeCm3 = crossAreaCm2 * effectiveThicknessCm * edge.volumeFactor;
        const metalWeightGrams = volumeCm3 * mat.density;

        // Areal density (g/cm²) — key metric for palm heft perception
        const arealDensity = metalWeightGrams / crossAreaCm2;

        // Net core web thickness (after subtracting double-sided recess depth, for shrink-mark / die-strike risk check)
        const coreThicknessMm = Math.max(0.4, thicknessMm - relief.enamelRecessDepthMm * 2.0);

        return {
            crossAreaMm2: parseFloat(crossAreaMm2.toFixed(1)),
            crossAreaCm2: parseFloat(crossAreaCm2.toFixed(2)),
            effectiveThicknessMm: parseFloat(effectiveThicknessMm.toFixed(2)),
            coreThicknessMm: parseFloat(coreThicknessMm.toFixed(2)),
            volumeCm3: parseFloat(volumeCm3.toFixed(2)),
            metalWeightGrams: parseFloat(metalWeightGrams.toFixed(1)),
            totalWeightGrams: parseFloat(metalWeightGrams.toFixed(1)),
            arealDensity: parseFloat(arealDensity.toFixed(2))
        };
    }

    /**
     * Channel A-2: Sports / Marathon Medal Parametric Volume & Weight Estimation
     * @param {string} shapeKey     Contour shape ('round', 'shield', 'oval', 'polygon')
     * @param {number} lengthMm     Height / diameter (mm)
     * @param {number} widthMm      Width (mm)
     * @param {number} thicknessMm  Base thickness (mm)
     * @param {string} reliefKey    Relief style
     * @param {number} cutoutRatio  Open cutout ratio (0.0 ~ 0.60)
     * @param {string} loopKey      Hanger type ('cast-loop', 'jump-ring')
     * @param {string} ribbonKey    Ribbon specification
     * @param {string} materialKey  Alloy material key
     */
    function estimateMedal(shapeKey, lengthMm, widthMm, thicknessMm, reliefKey, cutoutRatio, loopKey, ribbonKey, materialKey) {
        const shape = presets.MEDAL_SHAPES[shapeKey] || presets.MEDAL_SHAPES['round'];
        const relief = presets.RELIEF_STYLES[reliefKey] || presets.RELIEF_STYLES['semi-3d'];
        const ribbon = presets.RIBBON_SPECS[ribbonKey] || presets.RIBBON_SPECS['sub-30'];
        const mat = presets.MATERIALS[materialKey] || presets.MATERIALS['zn-zamak3'];

        // When round or regular octagon is selected, width equals length (diameter)
        const actualWidthMm = (shapeKey === 'round' || shapeKey === 'polygon') ? lengthMm : widthMm;

        // Projected solid area (cm²)
        const boundingAreaCm2 = (lengthMm / 10.0) * (actualWidthMm / 10.0);
        const grossPlanarAreaCm2 = boundingAreaCm2 * shape.kShape;
        const netPlanarAreaCm2 = grossPlanarAreaCm2 * (1.0 - cutoutRatio);

        // Effective thickness (mm)
        const effectiveThicknessMm = Math.max(1.5, thicknessMm + relief.deltaThicknessMm - 0.10);
        const effectiveThicknessCm = effectiveThicknessMm / 10.0;

        // Integrated cast bridge slot adds ~0.38 cm³ of alloy; wire jump ring adds ~0.08 cm³
        const loopVolumeCm3 = (loopKey === 'cast-loop') ? 0.38 : 0.08;

        const volumeCm3 = (netPlanarAreaCm2 * effectiveThicknessCm) + loopVolumeCm3;
        const metalBodyWeightGrams = volumeCm3 * mat.density;
        const ribbonWeightGrams = ribbon.weightGrams;
        const totalWeightGrams = metalBodyWeightGrams + ribbonWeightGrams;

        const arealDensity = netPlanarAreaCm2 > 0.1 ? (metalBodyWeightGrams / netPlanarAreaCm2) : 0;
        const coreThicknessMm = Math.max(0.5, thicknessMm - relief.enamelRecessDepthMm * 2.0);

        return {
            actualWidthMm: parseFloat(actualWidthMm.toFixed(1)),
            grossPlanarAreaCm2: parseFloat(grossPlanarAreaCm2.toFixed(2)),
            netPlanarAreaCm2: parseFloat(netPlanarAreaCm2.toFixed(2)),
            effectiveThicknessMm: parseFloat(effectiveThicknessMm.toFixed(2)),
            coreThicknessMm: parseFloat(coreThicknessMm.toFixed(2)),
            volumeCm3: parseFloat(volumeCm3.toFixed(2)),
            metalWeightGrams: parseFloat(metalBodyWeightGrams.toFixed(1)),
            metalBodyWeightGrams: parseFloat(metalBodyWeightGrams.toFixed(1)),
            ribbonWeightGrams: parseFloat(ribbonWeightGrams.toFixed(1)),
            totalWeightGrams: parseFloat(totalWeightGrams.toFixed(1)),
            arealDensity: parseFloat(arealDensity.toFixed(2))
        };
    }

    /**
     * Channel B: Exact 3D Mesh Volume & Centroid Solver (Gauss's Divergence Theorem)
     * Uses bounding-box center as local integration origin to prevent floating-point cancellation on off-origin CAD models.
     * @param {Float32Array|Array} positions Flat vertex coordinate array [x1,y1,z1, x2,y2,z2, ...]
     */
    function computeMeshVolumeAndCentroid(positions) {
        const numVertices = positions.length / 3;
        const numTriangles = Math.floor(numVertices / 3);

        if (numTriangles === 0) {
            throw new Error("Invalid mesh data: Triangle count is 0.");
        }

        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i], y = positions[i + 1], z = positions[i + 2];
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (z < minZ) minZ = z;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
            if (z > maxZ) maxZ = z;
        }

        const refX = (minX + maxX) * 0.5;
        const refY = (minY + maxY) * 0.5;
        const refZ = (minZ + maxZ) * 0.5;

        let totalSignedVolume = 0;
        let weightedCx = 0;
        let weightedCy = 0;
        let weightedCz = 0;
        let nxSum = 0, nySum = 0, nzSum = 0;
        let totalArea2 = 0;

        for (let i = 0; i < numTriangles; i++) {
            const i9 = i * 9;
            const x1 = positions[i9] - refX,     y1 = positions[i9 + 1] - refY, z1 = positions[i9 + 2] - refZ;
            const x2 = positions[i9 + 3] - refX, y2 = positions[i9 + 4] - refY, z2 = positions[i9 + 5] - refZ;
            const x3 = positions[i9 + 6] - refX, y3 = positions[i9 + 7] - refY, z3 = positions[i9 + 8] - refZ;

            // Surface normal vector (e1 x e2) for watertight closure verification
            const e1x = x2 - x1, e1y = y2 - y1, e1z = z2 - z1;
            const e2x = x3 - x1, e2y = y3 - y1, e2z = z3 - z1;
            const fnx = e1y * e2z - e1z * e2y;
            const fny = e1z * e2x - e1x * e2z;
            const fnz = e1x * e2y - e1y * e2x;
            nxSum += fnx;
            nySum += fny;
            nzSum += fnz;
            totalArea2 += Math.sqrt(fnx * fnx + fny * fny + fnz * fnz);

            const crossX = y2 * z3 - z2 * y3;
            const crossY = z2 * x3 - x2 * z3;
            const crossZ = x2 * y2 - y2 * x3;
            // Wait: careful! crossZ is x2 * y3 - y2 * x3!
            const cZ = x2 * y3 - y2 * x3;

            const vTet = (x1 * crossX + y1 * crossY + z1 * cZ) / 6.0;
            totalSignedVolume += vTet;

            weightedCx += vTet * ((x1 + x2 + x3) / 4.0);
            weightedCy += vTet * ((y1 + y2 + y3) / 4.0);
            weightedCz += vTet * ((z1 + z2 + z3) / 4.0);
        }

        const volumeMm3 = Math.abs(totalSignedVolume);
        const volumeCm3 = volumeMm3 / 1000.0;

        let centroidX = refX;
        let centroidY = refY;
        let centroidZ = refZ;
        if (Math.abs(totalSignedVolume) > 1e-7) {
            centroidX = refX + (weightedCx / totalSignedVolume);
            centroidY = refY + (weightedCy / totalSignedVolume);
            centroidZ = refZ + (weightedCz / totalSignedVolume);
        }

        // Sort bounding dimensions so flat thickness is always identified accurately regardless of CAD export orientation
        const dims = [maxX - minX, maxY - minY, maxZ - minZ].sort((a, b) => b - a);
        const normalResidual = Math.sqrt(nxSum * nxSum + nySum * nySum + nzSum * nzSum);
        const isClosedManifold = totalArea2 > 0 ? (normalResidual / totalArea2) < 0.01 : false;

        return {
            triangleCount: numTriangles,
            volumeMm3: parseFloat(volumeMm3.toFixed(2)),
            volumeCm3: parseFloat(volumeCm3.toFixed(3)),
            centroid: {
                x: parseFloat(centroidX.toFixed(2)),
                y: parseFloat(centroidY.toFixed(2)),
                z: parseFloat(centroidZ.toFixed(2))
            },
            bounds: {
                min: { x: minX, y: minY, z: minZ },
                max: { x: maxX, y: maxY, z: maxZ },
                dimensions: {
                    lengthMm: parseFloat(dims[0].toFixed(1)),
                    widthMm: parseFloat(dims[1].toFixed(1)),
                    thicknessMm: parseFloat(dims[2].toFixed(1))
                }
            },
            isWatertight: isClosedManifold && volumeMm3 > 0.01
        };
    }

    return {
        estimateCoin,
        estimateMedal,
        computeMeshVolumeAndCentroid
    };

}));
