/**
 * Medal & Coin Weight Estimator - High-Resolution DFM Spec Sheet & Logistics Report Generator
 * Pure client-side HTML5 Canvas 2D synthesis (1200 x 1600 px) with bilingual EN/ZH & Metric/Imperial support
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.MedalCoinLab = root.MedalCoinLab || {};
        root.MedalCoinLab.report = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    /**
     * Generate a 1200x1600 px DFM Engineering & Export Logistics Report PNG
     * @param {Object} reportData Full snapshot of dimensions, material, physics, shipping, lang, and 3D canvas dataURL
     * @returns {Promise<string>} Base64 PNG DataURL
     */
    async function generateSpecReportImage(reportData) {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 1600;
        const ctx = canvas.getContext('2d');
        const isZh = (reportData.lang === 'zh');

        // 1. Deep Navy Blueprint Background
        const bgGrad = ctx.createLinearGradient(0, 0, 1200, 1600);
        bgGrad.addColorStop(0, '#070C1B');
        bgGrad.addColorStop(0.5, '#0F1A36');
        bgGrad.addColorStop(1, '#091124');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1200, 1600);

        // Engineering grid overlay
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
        ctx.lineWidth = 1;
        for (let x = 0; x < 1200; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1600); ctx.stroke();
        }
        for (let y = 0; y < 1600; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1200, y); ctx.stroke();
        }

        // 2. Top Brand Header Banner
        ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
        ctx.fillRect(0, 0, 1200, 130);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, 130); ctx.lineTo(1200, 130); ctx.stroke();

        // Gold Valley Emblem
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.roundRect(50, 32, 64, 64, 12);
        ctx.fill();
        ctx.fillStyle = '#0B132B';
        ctx.font = 'bold 30px "Inter", "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GV', 82, 75);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 28px "Inter", "Segoe UI", "Microsoft YaHei", sans-serif';
        ctx.fillText(
            isZh ? 'GOLD VALLEY | 奖牌与挑战币工程克重及装箱核价单' : 'GOLD VALLEY | MEDAL & COIN DFM WEIGHT SPEC SHEET',
            134,
            64
        );

        ctx.fillStyle = '#94A3B8';
        ctx.font = '16px "Inter", "Segoe UI", "Microsoft YaHei", sans-serif';
        const dateStr = new Date().toISOString().slice(0, 10);
        const catStr = reportData.category === 'coin'
            ? (isZh ? '定制挑战币 (Challenge Coin)' : 'Custom Challenge Coin')
            : (isZh ? '赛事完赛奖牌 (Sports Finisher Medal)' : 'Custom Sports Finisher Medal');
        ctx.fillText(
            isZh
                ? `品类: ${catStr}   |   评估编号: GV-MC-${Math.floor(100000 + Math.random() * 900000)}   |   日期: ${dateStr}`
                : `Category: ${catStr}   |   Ref ID: GV-MC-${Math.floor(100000 + Math.random() * 900000)}   |   Date: ${dateStr}`,
            134,
            96
        );

        // 3. Left Panel: 3D Viewport Snapshot (520 x 440)
        drawCard(ctx, 50, 165, 520, 440, isZh ? '3D 实时工程几何与电镀预览' : '3D CAD GEOMETRY & PLATING SNAPSHOT');

        if (reportData.viewportDataUrl) {
            try {
                const img = await loadImage(reportData.viewportDataUrl);
                ctx.save();
                ctx.beginPath();
                ctx.roundRect(66, 215, 488, 370, 8);
                ctx.clip();
                ctx.drawImage(img, 66, 215, 488, 370);
                ctx.restore();
            } catch (e) {
                console.warn('Viewport snapshot draw skipped:', e);
            }
        }

        // 4. Right Panel: Engineering Input Specs (560 x 440)
        drawCard(ctx, 590, 165, 560, 440, isZh ? '模具结构与工艺输入参数 (DFM Specs)' : 'TOOLING & PROCESS SPECIFICATIONS');

        const specs = reportData.specsList || [];
        let specY = 238;
        specs.forEach(item => {
            ctx.fillStyle = '#94A3B8';
            ctx.font = '16px "Inter", "Segoe UI", "Microsoft YaHei", sans-serif';
            ctx.fillText(item.label, 620, specY);

            ctx.fillStyle = '#F8FAFC';
            ctx.font = 'bold 16.5px "Consolas", "Inter", "Microsoft YaHei", sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(item.value, 1120, specY);
            ctx.textAlign = 'left';

            ctx.strokeStyle = 'rgba(255,255,255,0.06)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(620, specY + 14); ctx.lineTo(1120, specY + 14); ctx.stroke();
            specY += 46;
        });

        // 5. Middle Section: Core Weight & Physics KPIs (4 Cards)
        drawCard(ctx, 50, 635, 1100, 215, isZh ? '核心物理克重与人体工学指标 (Metric + Imperial)' : 'CORE MASS, TACTILE HEFT & ERGONOMIC METRICS');

        const kpis = reportData.kpis || [];
        const kpiWidth = 248;
        kpis.forEach((kpi, idx) => {
            const kx = 76 + idx * (kpiWidth + 20);
            const ky = 695;

            ctx.fillStyle = 'rgba(11, 19, 43, 0.85)';
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(kx, ky, kpiWidth, 130, 10);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#94A3B8';
            ctx.font = 'bold 13px "Inter", "Segoe UI", "Microsoft YaHei", sans-serif';
            ctx.fillText(kpi.title, kx + 16, ky + 30);

            ctx.fillStyle = '#FBBF24';
            ctx.font = 'bold 26px "Consolas", monospace';
            ctx.fillText(kpi.value, kx + 16, ky + 72);

            ctx.fillStyle = '#CBD5E1';
            ctx.font = '13px "Inter", "Segoe UI", "Microsoft YaHei", sans-serif';
            ctx.fillText(kpi.sub, kx + 16, ky + 105);
        });

        // 6. DFM Diagnosis & Alloy Comparison Section
        drawCard(ctx, 50, 880, 1100, 235, isZh ? '金瓒模具车间 DFM 诊断与跨材质对比' : 'FACTORY DFM DIAGNOSIS & ALLOY BENCHMARK');

        const statusColor = reportData.dfmStatus === 'CRITICAL' ? '#EF4444' : (reportData.dfmStatus === 'MARGINAL' ? '#F59E0B' : '#10B981');
        ctx.fillStyle = statusColor;
        ctx.font = 'bold 20px "Inter", "Segoe UI", "Microsoft YaHei", sans-serif';
        ctx.fillText(`● ${reportData.ergoTitle}`, 80, 950);

        ctx.fillStyle = '#E2E8F0';
        ctx.font = '15.5px "Inter", "Segoe UI", "Microsoft YaHei", sans-serif';
        wrapText(ctx, reportData.ergoDesc, 80, 982, 1040, 24);

        const warnText = (reportData.dfmWarnings || []).join('  ');
        ctx.fillStyle = '#FCD34D';
        ctx.font = '14.5px "Inter", "Segoe UI", "Microsoft YaHei", sans-serif';
        wrapText(ctx, warnText, 80, 1042, 1040, 22);

        // 7. Export Carton & Freight Estimation Section
        drawCard(ctx, 50, 1145, 1100, 245, isZh ? 'B2B 外贸防爆箱装箱规格与海空运费测算 (≤18.0 kg / 39.7 lbs)' : 'B2B EXPORT CARTON PACKING & FREIGHT ESTIMATION (≤18.0 kg / 39.7 lbs)');

        const ship = reportData.shipping || {};
        const shipBoxes = isZh
            ? [
                { label: `订单批量 (${ship.orderQty} pcs)`, val: `${ship.totalCartons} 箱 (${ship.maxPiecesPerCarton} pcs/箱)` },
                { label: '整单预估总毛重 (Gross Wt)', val: `${ship.totalGrossWeightKg} kg (${ship.totalGrossWeightLbs} lbs)` },
                { label: '单箱均重 & 总体积', val: `${ship.avgGrossWeightPerCartonKg} kg/箱 | ${ship.totalVolumeCbm} CBM` },
                { label: '空运快递 vs 海运专线预估', val: `~$${ship.estimatedAirCourierUsd} vs ~$${ship.estimatedOceanLclUsd}` }
            ]
            : [
                { label: `Order Qty (${ship.orderQty} pcs)`, val: `${ship.totalCartons} Ctns (${ship.maxPiecesPerCarton} pcs/ctn)` },
                { label: 'Total Gross Weight', val: `${ship.totalGrossWeightKg} kg (${ship.totalGrossWeightLbs} lbs)` },
                { label: 'Carton Avg & Volume', val: `${ship.avgGrossWeightPerCartonKg} kg/ctn | ${ship.totalVolumeCbm} CBM` },
                { label: 'Air Express vs DDP Sea', val: `~$${ship.estimatedAirCourierUsd} vs ~$${ship.estimatedOceanLclUsd}` }
            ];

        shipBoxes.forEach((sb, idx) => {
            const sx = 80 + idx * 265;
            const sy = 1212;
            ctx.fillStyle = '#94A3B8';
            ctx.font = '13.5px "Inter", "Segoe UI", "Microsoft YaHei", sans-serif';
            ctx.fillText(sb.label, sx, sy);

            ctx.fillStyle = '#38BDF8';
            ctx.font = 'bold 18px "Consolas", "Inter", "Microsoft YaHei", sans-serif';
            ctx.fillText(sb.val, sx, sy + 28);
        });

        ctx.fillStyle = '#CBD5E1';
        ctx.font = '14.5px "Inter", "Segoe UI", "Microsoft YaHei", sans-serif';
        wrapText(ctx, ship.logisticsTip || '', 80, 1288, 1040, 22);

        // 8. Bottom Factory Verification & Contact Footer
        ctx.fillStyle = '#060A17';
        ctx.fillRect(0, 1430, 1200, 170);
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, 1430); ctx.lineTo(1200, 1430); ctx.stroke();

        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 20px "Inter", "Segoe UI", "Microsoft YaHei", sans-serif';
        ctx.fillText('Gold Valley Industrial Gifts Co., Ltd. (金瓒五金工艺制品厂)', 50, 1475);

        ctx.fillStyle = '#FBBF24';
        ctx.font = '15.5px "Inter", "Segoe UI", "Microsoft YaHei", sans-serif';
        ctx.fillText(
            isZh
                ? 'OEM/ODM 精密压铸与冷冲压源头工厂  |  免费 3D 模具图纸审查与精准克重打样报价'
                : 'Direct OEM/ODM Die-Casting & Cold-Stamping Factory  |  Free 3D Tooling DFM Review & Sample Quote',
            50,
            1508
        );

        ctx.fillStyle = '#94A3B8';
        ctx.font = '14.5px "Consolas", "Inter", sans-serif';
        ctx.fillText('Web: https://www.goldvalleyltd.com   |   Email: paula@goldvalleyltd.com', 50, 1540);
        ctx.fillText('Catalogs: /challenge-coins/  •  /custom-medals/  •  /contact-us/', 50, 1568);

        // Official Stamp
        ctx.save();
        ctx.translate(1030, 1510);
        ctx.rotate(-0.12);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.75)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-115, -40, 230, 80, 8);
        ctx.stroke();
        ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';
        ctx.font = 'bold 16px "Consolas", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GOLD VALLEY LAB', 0, -8);
        ctx.font = 'bold 13px "Consolas", monospace';
        ctx.fillText('DFM VERIFIED SPEC', 0, 18);
        ctx.restore();

        return canvas.toDataURL('image/png');
    }

    function drawCard(ctx, x, y, w, h, title) {
        ctx.fillStyle = 'rgba(19, 30, 56, 0.88)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 14);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
        ctx.beginPath();
        ctx.roundRect(x, y, w, 40, [14, 14, 0, 0]);
        ctx.fill();

        ctx.fillStyle = '#FBBF24';
        ctx.font = 'bold 14.5px "Inter", "Segoe UI", "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(title, x + 20, y + 26);
    }

    /**
     * Word-boundary + CJK aware text wrapper so neither English words nor Chinese sentences break awkwardly
     */
    function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        if (!text) return y;
        // Tokenize into English words (with trailing space) or individual CJK characters
        const tokens = text.match(/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]|[^\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef\s]+\s*|\s+/g) || [text];
        let line = '';
        let curY = y;

        for (let i = 0; i < tokens.length; i++) {
            const testLine = line + tokens[i];
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && line.trim().length > 0) {
                ctx.fillText(line.trimEnd(), x, curY);
                line = tokens[i].trimStart();
                curY += lineHeight;
            } else {
                line = testLine;
            }
        }
        if (line.trim().length > 0) {
            ctx.fillText(line.trimEnd(), x, curY);
            curY += lineHeight;
        }
        return curY;
    }

    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    return {
        generateSpecReportImage
    };

}));
