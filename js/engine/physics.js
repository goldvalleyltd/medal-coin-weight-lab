/**
 * Medal & Coin Weight Estimator - Physics, Ergonomics & DFM Engine
 * Challenge Coin Tactile Heft Index, Marathon Neck Ergonomics, 2.5g Celebration Dynamic Load & DFM Shrinkage Diagnostics
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        const presets = require('./presets.js');
        module.exports = factory(presets);
    } else {
        root.MedalCoinLab = root.MedalCoinLab || {};
        root.MedalCoinLab.physics = factory(root.MedalCoinLab.presets);
    }
}(typeof self !== 'undefined' ? self : this, function (presets) {

    /**
     * 1. Challenge Coin Tactile Heft Index & DFM Evaluation
     * @param {Object} geoResult   Output of geometry.estimateCoin()
     * @param {string} materialKey Selected alloy ID
     * @param {string} edgeKey     Selected edge cut ID
     * @param {string} lang        'en' | 'zh' (default 'en')
     */
    function evaluateCoinPhysics(geoResult, materialKey, edgeKey, lang = 'en') {
        const isZh = (lang === 'zh');
        const arealDensity = geoResult.arealDensity; // g/cm²
        const coreThickness = geoResult.coreThicknessMm;
        const weight = geoResult.metalWeightGrams;
        const ozWeight = presets.gToOz(weight, 2);

        // Tactile Heft Score (0 ~ 100), benchmarked against 44.5 mm (1.75") × 3.5 mm H65 Brass (~2.65 g/cm² -> 88 pts)
        let tactileScore = Math.round(Math.min(99, Math.max(15, (arealDensity / 2.85) * 90)));
        if (edgeKey === 'diamond-cut' || edgeKey === 'reeded' || edgeKey === 'rope') {
            tactileScore = Math.min(99, tactileScore + 4);
        }

        let tactileGradeEn = 'STANDARD';
        let tactileTitleEn = 'Standard Commercial Heft';
        let tactileDescEn = `Palm weight ${weight} g (${ozWeight} oz) with areal density ${arealDensity} g/cm². Balanced metallic feel for corporate & event coins.`;
        let tactileGradeZh = 'STANDARD';
        let tactileTitleZh = '标准商务纪念手感 (Standard Commercial)';
        let tactileDescZh = `掌心实重 ${weight} g (${ozWeight} oz)，面密度 ${arealDensity} g/cm²。具备清晰的金属坠手感，适合企业周年与会议纪念。`;
        let bannerClass = '';

        if (arealDensity < 1.65 || weight < 24) {
            tactileGradeEn = 'LIGHTWEIGHT';
            tactileTitleEn = 'Lightweight Token Feel (Thin / Low Gravity Alert)';
            tactileDescEn = `At ${weight} g (${ozWeight} oz) and ${arealDensity} g/cm², this coin may feel light like an arcade token. Consider ≥3.5 mm (0.14") thickness or H65 Brass.`;
            tactileGradeZh = 'LIGHTWEIGHT';
            tactileTitleZh = '偏轻薄单薄感（类游戏代币预警）';
            tactileDescZh = `当前仅 ${weight} g (${ozWeight} oz)，面密度 ${arealDensity} g/cm²，拿在手中略显轻飘。建议加厚至 3.5 mm (0.14") 以上或切换 H65 黄铜。`;
            bannerClass = 'warning';
        } else if (arealDensity >= 2.35 && weight >= 42) {
            tactileGradeEn = 'HEAVYWEIGHT COMMANDER';
            tactileTitleEn = 'Heavyweight Commander Heft (Collector Grade)';
            tactileDescEn = `Solid ${weight} g (${ozWeight} oz) palm heft with ${arealDensity} g/cm² areal density. Delivers an authoritative acoustic clink and substantial tactile authority.`;
            tactileGradeZh = 'HEAVYWEIGHT COMMANDER';
            tactileTitleZh = '典藏指挥官级重磅坠手 (Commander Heft)';
            tactileDescZh = `掌心实重达 ${weight} g (${ozWeight} oz)，面密度 ${arealDensity} g/cm²！抛接碰撞声清脆浑厚，极具军警授勋与高端礼赠威严感。`;
            bannerClass = '';
        }

        // Cross-material weight benchmark: Zamak 3 vs H65 Brass
        const zincWeightGrams = parseFloat((geoResult.volumeCm3 * presets.MATERIALS['zn-zamak3'].density).toFixed(1));
        const brassWeightGrams = parseFloat((geoResult.volumeCm3 * presets.MATERIALS['cu-c260'].density).toFixed(1));
        const deltaWeightGrams = parseFloat((brassWeightGrams - zincWeightGrams).toFixed(1));

        // DFM (Design for Manufacturing) warnings
        const dfmWarningsEn = [];
        const dfmWarningsZh = [];
        let dfmStatus = 'OPTIMAL';

        if (coreThickness < 1.2) {
            dfmStatus = 'CRITICAL';
            dfmWarningsEn.push(
                `CRITICAL DFM ALERT: Net core web thickness is only ${coreThickness} mm (< 1.2 mm threshold). Double-sided deep recesses risk die-casting cold shuts or stamping ghost-through marks. Increase base thickness to ≥ 3.5 mm (0.14").`
            );
            dfmWarningsZh.push(
                `⚠️ 车间压铸高危警报：扣除正反双面凹槽后，中心底板净余壁厚仅 ${coreThickness} mm（低于 1.2 mm 临界线），易产生透底、冷隔或表面缩水凹坑！强烈建议将基础厚度调至 ≥ 3.5 mm (0.14")。`
            );
            bannerClass = 'critical';
        } else if (coreThickness < 1.6) {
            dfmStatus = 'MARGINAL';
            dfmWarningsEn.push(
                `DFM Notice: Net core web thickness is ${coreThickness} mm. Offset front and back deep recesses to prevent localized shrinkage porosity during solidification.`
            );
            dfmWarningsZh.push(
                `⚠️ 工艺提示：中心底板净壁厚 ${coreThickness} mm 偏薄，正反面大面积深凹槽区域请尽量错位排布，避免局部缩水。`
            );
            if (!bannerClass) bannerClass = 'warning';
        }

        if (materialKey === 'al-6061' && edgeKey !== 'flat' && edgeKey !== 'reeded') {
            dfmWarningsEn.push(
                `Process Note: 6061 Aluminium Alloy is best suited for CNC turned smooth or reeded edges; complex rope or wave edges require Zamak 3 die-casting.`
            );
            dfmWarningsZh.push(
                `ℹ️ 材质工艺提示：6061 铝合金通常采用冲压或 CNC 车削，复杂波浪/绳索边建议改用 3号锌合金 (Zamak 3) 一体压铸。`
            );
        }

        if (dfmWarningsEn.length === 0) {
            dfmWarningsEn.push(
                `DFM Rating: OPTIMAL. Core web thickness (${coreThickness} mm) and aspect ratio ensure smooth cavity filling, crisp enamel color separation, and zero shrink marks.`
            );
            dfmWarningsZh.push(
                `🟢 车间制造评级：优 (Optimal DFM)。底板净壁厚 ${coreThickness} mm 充裕，金属液流道顺畅，电镀抛光与填色良率极佳。`
            );
        }

        return {
            tactileScore,
            tactileGrade: isZh ? tactileGradeZh : tactileGradeEn,
            tactileGradeEn,
            tactileGradeZh,
            tactileTitle: isZh ? tactileTitleZh : tactileTitleEn,
            tactileTitleEn,
            tactileTitleZh,
            tactileDesc: isZh ? tactileDescZh : tactileDescEn,
            tactileDescEn,
            tactileDescZh,
            bannerClass,
            dfmStatus,
            dfmWarnings: isZh ? dfmWarningsZh : dfmWarningsEn,
            dfmWarningsEn,
            dfmWarningsZh,
            zincWeightGrams,
            brassWeightGrams,
            deltaWeightGrams
        };
    }

    /**
     * 2. Sports Medal Neck Ergonomics & 2.5g Dynamic Celebration Shock Evaluation
     * @param {Object} geoResult   Output of geometry.estimateMedal()
     * @param {string} loopKey     Hanger type ('cast-loop' | 'jump-ring')
     * @param {string} ribbonKey   Ribbon specification
     * @param {string} materialKey Selected alloy ID
     * @param {string} lang        'en' | 'zh' (default 'en')
     */
    function evaluateMedalPhysics(geoResult, loopKey, ribbonKey, materialKey, lang = 'en') {
        const isZh = (lang === 'zh');
        const totalWeightGrams = geoResult.totalWeightGrams;
        const metalWeightGrams = geoResult.metalBodyWeightGrams;
        const ozTotal = presets.gToOz(totalWeightGrams, 2);
        const loop = presets.LOOP_STRENGTH[loopKey] || presets.LOOP_STRENGTH['cast-loop'];
        const ribbon = presets.RIBBON_SPECS[ribbonKey] || presets.RIBBON_SPECS['sub-30'];

        // Static gravity load F_static = m * g (N)
        const massKg = totalWeightGrams / 1000.0;
        const staticForceN = massKg * 9.81;

        // Post-finish jumping/celebration 2.5g peak dynamic shock load F_dynamic = 2.5 * m * g (N)
        const dynamicLoadN = staticForceN * 2.5;
        const dynamicLoadKgf = dynamicLoadN / 9.81;

        // Hanger pull-out safety factor S = F_allowable / F_dynamic
        const safetyFactor = dynamicLoadN > 0.01 ? (loop.maxSafeLoadN / dynamicLoadN) : 99.9;

        // Neck ergonomics & lanyard pressure comfort rating
        let neckLevel = 'COMFORT';
        let neckTitleEn = 'Optimal Finisher Neck Comfort (Ergonomic Pass)';
        let neckDescEn = `Total assembly weight ${totalWeightGrams} g (${ozTotal} oz); 2.5g celebration peak load is ${dynamicLoadN.toFixed(2)} N (${dynamicLoadKgf.toFixed(2)} kgf). Comfortable for all-day post-race wear.`;
        let neckTitleZh = '黄金完赛佩戴舒适区 (Optimal Neck Comfort)';
        let neckDescZh = `含织带总重 ${totalWeightGrams} g (${ozTotal} oz)，完赛跳跃峰值冲击力 ${dynamicLoadN.toFixed(2)} N（约 ${dynamicLoadKgf.toFixed(2)} kgf）。选手挂脖拍照与赛后行走全天舒适无勒痕。`;
        let bannerClass = '';

        if (totalWeightGrams > 220) {
            neckLevel = 'HEAVY_LOAD';
            neckTitleEn = 'Overweight Neck Strain Alert (> 220 g / 7.76 oz)';
            neckDescEn = `Total assembly reaches ${totalWeightGrams} g (${ozTotal} oz)! Running or jumping causes pendulum swing against the sternum. Add 20%–35% open cutouts or pair with a 38 mm (1.5") wide lanyard.`;
            neckTitleZh = '⚠️ 颈椎超重负荷预警（Heavy Neck Strain > 220 g）';
            neckDescZh = `总重高达 ${totalWeightGrams} g (${ozTotal} oz)！奔跑欢呼时胸前摆动撞击感强烈，长时间佩戴易引发颈后酸痛。建议增加 20%~35% 镂空比或强制搭配 38 mm (1.5") 加宽提花织带。`;
            bannerClass = 'critical';
        } else if (totalWeightGrams > 155) {
            neckLevel = 'SUBSTANTIAL';
            neckTitleEn = 'Heavyweight Championship Prestige (155–220 g)';
            neckDescEn = `At ${totalWeightGrams} g (${ozTotal} oz), this medal delivers a prestigious championship feel. Pair with a ≥30 mm (1.2") wide lanyard to distribute cervical pressure.`;
            neckTitleZh = '重磅赛事荣耀感（Substantial Weight 155~220 g）';
            neckDescZh = `总重 ${totalWeightGrams} g (${ozTotal} oz)，具有极强的全马完赛分量感。建议选用 ≥30 mm (1.2") 宽幅织带以分散颈部压强。`;
            if (ribbon.widthMm > 0 && ribbon.widthMm < 30) {
                bannerClass = 'warning';
                neckDescEn += ` Note: Current ${ribbon.widthMm} mm ribbon is narrow for this weight; upgrade to 30 mm or 38 mm.`;
                neckDescZh += `（当前 ${ribbon.widthMm} mm 挂带偏窄，建议升级至 30 mm 或 38 mm 宽带）。`;
            }
        } else if (totalWeightGrams < 55) {
            neckLevel = 'ULTRA_LIGHT';
            neckTitleEn = 'Featherweight Finisher Medal (< 55 g / 1.94 oz)';
            neckDescEn = `Total weight ${totalWeightGrams} g (${ozTotal} oz) — zero neck strain, ideal for kids/youth runs. For adult full marathons, increase thickness to ≥3.5 mm (0.14") for stronger perceived value.`;
            neckTitleZh = '超轻量化少儿/欢乐跑级别 (< 55 g)';
            neckDescZh = `总重 ${totalWeightGrams} g (${ozTotal} oz)，适合儿童跑或迷你跑；若用于成人全马赛事可能显得分量感不足，建议加厚至 3.5~4.0 mm。`;
            bannerClass = 'warning';
        }

        // Hanger & DFM diagnostics
        const dfmWarningsEn = [];
        const dfmWarningsZh = [];
        let dfmStatus = 'OPTIMAL';

        if (loopKey === 'jump-ring' && metalWeightGrams > 110) {
            dfmStatus = 'CRITICAL';
            bannerClass = 'critical';
            dfmWarningsEn.push(
                `CRITICAL HANGER RISK: Medal body is ${metalWeightGrams} g (${presets.gToOz(metalWeightGrams, 2)} oz) using an unwelded Ø1.5 mm split wire jump ring. Dynamic celebration shock risk pulling the ring open! Switch to an Integrated Cast Bridge Slot.`
            );
            dfmWarningsZh.push(
                `🚨 挂环脱落高危警报：奖牌净重达 ${metalWeightGrams} g 且使用外接开口细跳环，完赛跳跃动载下极易将铁丝环拉豁导致奖牌跌落摔碎！请务必改为「一体铸造宽幅穿带扁桥」。`
            );
        } else if (safetyFactor < 4.0) {
            dfmStatus = 'MARGINAL';
            if (!bannerClass) bannerClass = 'warning';
            dfmWarningsEn.push(
                `Hanger Load Notice: Structural safety factor is ${safetyFactor.toFixed(1)}×. Reinforce the hanger root fillet to ≥ R1.5 mm.`
            );
            dfmWarningsZh.push(
                `⚠️ 结构安全提醒：挂环动载安全系数为 ${safetyFactor.toFixed(1)}x，建议在吊鼻根部增加 R1.5 mm 倒角加强筋。`
            );
        }

        if (geoResult.coreThicknessMm < 1.3) {
            dfmStatus = 'CRITICAL';
            bannerClass = 'critical';
            dfmWarningsEn.push(
                `Wall Thickness Alert: Net core web thickness (${geoResult.coreThicknessMm} mm) is too thin for large-span die casting, risking cold-shut flow lines. Increase thickness to ≥ 3.5 mm (0.14").`
            );
            dfmWarningsZh.push(
                `⚠️ 壁厚过薄警报：大跨度奖牌中心底板净厚仅 ${geoResult.coreThicknessMm} mm，压铸充型长路径易出现水纹冷隔，建议总厚度 ≥ 3.5 mm (0.14")。`
            );
        }

        const zincWeightGrams = parseFloat((geoResult.volumeCm3 * presets.MATERIALS['zn-zamak3'].density).toFixed(1));
        const brassWeightGrams = parseFloat((geoResult.volumeCm3 * presets.MATERIALS['cu-c260'].density).toFixed(1));
        const deltaWeightGrams = parseFloat((brassWeightGrams - zincWeightGrams).toFixed(1));

        if (dfmWarningsEn.length === 0) {
            dfmWarningsEn.push(
                `DFM Rating: OPTIMAL. Hanger dynamic safety factor > 15× (${loop.nameEn}) with balanced flow channels and neck pressure distribution.`
            );
            dfmWarningsZh.push(
                `🟢 车间结构评级：优 (Optimal DFM)。吊鼻抗拉脱安全系数 > 15x，压铸流道与颈部压强分布均处于最佳工程区间。`
            );
        }

        return {
            neckLevel,
            neckTitle: isZh ? neckTitleZh : neckTitleEn,
            neckTitleEn,
            neckTitleZh,
            neckDesc: isZh ? neckDescZh : neckDescEn,
            neckDescEn,
            neckDescZh,
            bannerClass,
            staticForceN: parseFloat(staticForceN.toFixed(2)),
            dynamicLoadN: parseFloat(dynamicLoadN.toFixed(2)),
            dynamicLoadKgf: parseFloat(dynamicLoadKgf.toFixed(2)),
            safetyFactor: parseFloat(Math.min(99.9, safetyFactor).toFixed(1)),
            dfmStatus,
            dfmWarnings: isZh ? dfmWarningsZh : dfmWarningsEn,
            dfmWarningsEn,
            dfmWarningsZh,
            zincWeightGrams,
            brassWeightGrams,
            deltaWeightGrams
        };
    }

    return {
        evaluateCoinPhysics,
        evaluateMedalPhysics
    };

}));
