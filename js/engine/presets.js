/**
 * Medal & Coin Weight Estimator - Industrial Presets & Material Constants
 * Aligned with Gold Valley Industrial Engineering Parameters (Zamak 3, H65 Brass, T2 Copper, SPCC Iron, SUS304, 6061 Al)
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.MedalCoinLab = root.MedalCoinLab || {};
        root.MedalCoinLab.presets = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    // 1. Industrial Metal Alloys (Densities strictly calibrated per engineering-params.md)
    const MATERIALS = {
        'zn-zamak3': {
            id: 'zn-zamak3',
            name: 'Zamak 3 Zinc Alloy (6.70 g/cm³)',
            nameEn: 'Zamak 3 Zinc Alloy (6.70 g/cm³)',
            nameZh: '3号压铸锌合金 (Zamak 3 - 6.70 g/cm³)',
            shortName: 'Zamak 3 Zinc Alloy',
            shortNameEn: 'Zamak 3 Zinc Alloy',
            shortNameZh: '3号压铸锌合金 (Zamak 3)',
            density: 6.70,
            process: 'die-cast',
            desc: 'High-fluidity hot-chamber die-casting alloy for full 3D high relief and open cutouts (±0.15 mm tolerance)',
            descEn: 'High-fluidity hot-chamber die-casting alloy for full 3D high relief and open cutouts (±0.15 mm tolerance)',
            descZh: '高流动性压铸锌合金，适合深浮雕、镂空异形与复杂跑马奖牌（公差 ±0.15 mm）',
            colorHex: '#94A3B8'
        },
        'cu-c268': {
            id: 'cu-c268',
            name: 'H65 / C26800 Brass (8.50 g/cm³)',
            nameEn: 'H65 / C26800 Brass (8.50 g/cm³)',
            nameZh: 'H65 冲压黄铜 (C26800 - 8.50 g/cm³)',
            shortName: 'H65 Stamped Brass',
            shortNameEn: 'H65 Stamped Brass',
            shortNameZh: 'H65 冲压黄铜',
            density: 8.50,
            process: 'stamped',
            desc: 'Dense cold-stamped yellow brass with crisp micro-text edges and mirror-polishing substrate (±0.08 mm tolerance)',
            descEn: 'Dense cold-stamped yellow brass with crisp micro-text edges and mirror-polishing substrate (±0.08 mm tolerance)',
            descZh: '高致密冷冲压黄铜，字口锋利、镜面抛光佳，高定军警挑战币与珐琅章首选（公差 ±0.08 mm）',
            colorHex: '#EAB308'
        },
        'cu-pure': {
            id: 'cu-pure',
            name: 'T2 / C11000 Pure Copper (8.90 g/cm³)',
            nameEn: 'T2 / C11000 Pure Copper (8.90 g/cm³)',
            nameZh: 'T2 高纯紫铜 (C11000 - 8.90 g/cm³)',
            shortName: 'T2 Pure Copper',
            shortNameEn: 'T2 Pure Copper',
            shortNameZh: 'T2 高纯紫铜',
            density: 8.90,
            process: 'stamped',
            desc: 'Maximum specific gravity for museum-grade commemorative coins and true cloisonné hard enamel firing',
            descEn: 'Maximum specific gravity for museum-grade commemorative coins and true cloisonné hard enamel firing',
            descZh: '最高比重贵金属质感，适用于博物馆级纪念章与景泰蓝真珐琅高温烧制',
            colorHex: '#D97706'
        },
        'fe-stamped': {
            id: 'fe-stamped',
            name: 'SPCC / DT4 Stamped Iron (7.85 g/cm³)',
            nameEn: 'SPCC / DT4 Stamped Iron (7.85 g/cm³)',
            nameZh: 'SPCC 冲压软铁 (7.85 g/cm³)',
            shortName: 'SPCC Stamped Iron',
            shortNameEn: 'SPCC Stamped Iron',
            shortNameZh: 'SPCC 冲压软铁',
            density: 7.85,
            process: 'stamped',
            desc: 'Cost-effective cold-stamped steel core for large-volume 2D soft enamel coins and promotional emblems',
            descEn: 'Cost-effective cold-stamped steel core for large-volume 2D soft enamel coins and promotional emblems',
            descZh: '高性价比冷冲压基材，广泛用于大批量 2D 软珐琅/烤漆徽章与纪念币',
            colorHex: '#64748B'
        },
        'ss-304': {
            id: 'ss-304',
            name: 'SUS304 Stainless Steel (7.93 g/cm³)',
            nameEn: 'SUS304 Stainless Steel (7.93 g/cm³)',
            nameZh: 'SUS304 不锈钢 (7.93 g/cm³)',
            shortName: 'SUS304 Stainless Steel',
            shortNameEn: 'SUS304 Stainless Steel',
            shortNameZh: 'SUS304 不锈钢',
            density: 7.93,
            process: 'stamped',
            desc: 'Corrosion-resistant brushed or laser-etched functional bottle-opener coins and outdoor endurance medals',
            descEn: 'Corrosion-resistant brushed or laser-etched functional bottle-opener coins and outdoor endurance medals',
            descZh: '耐腐蚀高耐磨，适合拉丝本色、激光深度精雕与带开瓶器功能的挑战币',
            colorHex: '#CBD5E1'
        },
        'al-6061': {
            id: 'al-6061',
            name: '6061 Anodized Aluminium (2.70 g/cm³)',
            nameEn: '6061 Anodized Aluminium (2.70 g/cm³)',
            nameZh: '6061 阳极氧化铝合金 (2.70 g/cm³)',
            shortName: '6061 Aluminium Alloy',
            shortNameEn: '6061 Aluminium Alloy',
            shortNameZh: '6061 阳极氧化铝合金',
            density: 2.70,
            process: 'cnc',
            desc: 'Ultra-lightweight alloy for colorful anodized finishes and oversized youth/kids finisher medals',
            descEn: 'Ultra-lightweight alloy for colorful anodized finishes and oversized youth/kids finisher medals',
            descZh: '超轻量化阳极氧化铝合金，适合炫彩氧化着色与大尺寸青少年/儿童赛事奖牌',
            colorHex: '#38BDF8'
        }
    };

    // 2. Surface Relief & Enamel Process Styles
    const RELIEF_STYLES = {
        'flat-2d': {
            id: 'flat-2d',
            name: 'Flat / Enamel Filled (0.0 mm relief)',
            nameEn: 'Flat / Enamel Filled (0.0 mm relief)',
            nameZh: '纯平烤漆 / 仿珐琅填色 (Flat / Enamel)',
            deltaThicknessMm: 0.0,
            minMetalLineMm: 0.15,
            enamelRecessDepthMm: 0.28,
            desc: 'Recessed color basins (0.25–0.35 mm depth) filled with soft enamel or polished flush synthetic hard enamel',
            descEn: 'Recessed color basins (0.25–0.35 mm depth) filled with soft enamel or polished flush synthetic hard enamel',
            descZh: '表面平整或填满软珐琅/仿珐琅色膏，金属高线与色块齐平或微凸（凹槽深 0.25~0.35 mm）'
        },
        'stamped-2d': {
            id: 'stamped-2d',
            name: '2D Multi-Level Relief (0.35 mm relief)',
            nameEn: '2D Multi-Level Relief (0.35 mm relief)',
            nameZh: '2D 双面标准立体阶梯 (0.35 mm 凸起)',
            deltaThicknessMm: 0.12,
            minMetalLineMm: 0.18,
            enamelRecessDepthMm: 0.30,
            desc: 'Sharp stepped flat planes with 90° vertical walls over a recessed sandblasted field',
            descEn: 'Sharp stepped flat planes with 90° vertical walls over a recessed sandblasted field',
            descZh: '正反面金属线条垂直凸起 0.3~0.4 mm，具有鲜明的台阶层次与喷砂底面对比'
        },
        'semi-3d': {
            id: 'semi-3d',
            name: '2.5D Sculpted Semi-Relief (0.75 mm relief)',
            nameEn: '2.5D Sculpted Semi-Relief (0.75 mm relief)',
            nameZh: '2.5D 双面弧面中浮雕 (0.75 mm 凸起)',
            deltaThicknessMm: 0.28,
            minMetalLineMm: 0.20,
            enamelRecessDepthMm: 0.32,
            desc: 'Contoured 3D center emblem (e.g., foliage, wings, or crest) rising 0.6–0.9 mm above the field',
            descEn: 'Contoured 3D center emblem (e.g., foliage, wings, or crest) rising 0.6–0.9 mm above the field',
            descZh: '中心主图案具有圆润三维弧度过渡（凸起 0.6~0.9 mm），兼顾立体感与批量压铸良率'
        },
        'high-3d': {
            id: 'high-3d',
            name: '3D Deep High-Relief (1.60 mm relief)',
            nameEn: '3D Deep High-Relief (1.60 mm relief)',
            nameZh: '3D 深度高浮雕精雕 (1.60 mm 强隆起)',
            deltaThicknessMm: 0.52,
            minMetalLineMm: 0.25,
            enamelRecessDepthMm: 0.35,
            desc: 'Dramatic sculpted architectural/portrait relief rising 1.2–2.0 mm; requires ≥3.5 mm base thickness',
            descEn: 'Dramatic sculpted architectural/portrait relief rising 1.2–2.0 mm; requires ≥3.5 mm base thickness',
            descZh: '鹰翼、人像或建筑深浮雕强力隆起 1.2~2.0 mm，建议底板总厚 ≥3.5 mm 以防缩水'
        }
    };

    // 3. Challenge Coin Edge Milling Styles
    const EDGE_CUTS = {
        'flat': {
            id: 'flat',
            name: 'Standard Smooth Edge (1.00× Vol)',
            nameEn: 'Standard Smooth Edge (1.00× Vol)',
            nameZh: '标准平滑光边 (Smooth Edge - 1.00×)',
            volumeFactor: 1.000,
            desc: 'Mirror-polished smooth cylindrical rim; supports continuous 360° laser serial numbering',
            descEn: 'Mirror-polished smooth cylindrical rim; supports continuous 360° laser serial numbering',
            descZh: '标准直筒抛光边缘，无材料切削损耗，支持 360° 边缘激光独立编号'
        },
        'reeded': {
            id: 'reeded',
            name: 'Reeded Milled Edge (0.985× Vol)',
            nameEn: 'Reeded Milled Edge (0.985× Vol)',
            nameZh: '细齿硬币防滑滚边 (Reeded Edge - 0.985×)',
            volumeFactor: 0.985,
            desc: '96-tooth precision vertical reeding like currency coins for crisp anti-slip grip',
            descEn: '96-tooth precision vertical reeding like currency coins for crisp anti-slip grip',
            descZh: '类似流通银元的精密直纹滚齿，提升指尖防滑摩挲手感'
        },
        'rope': {
            id: 'rope',
            name: 'Twisted Rope Edge (0.965× Vol)',
            nameEn: 'Twisted Rope Edge (0.965× Vol)',
            nameZh: '麻花绳索扭纹边 (Rope Cut - 0.965×)',
            volumeFactor: 0.965,
            desc: 'Traditional naval & military twisted rope relief along the perimeter bevel',
            descEn: 'Traditional naval & military twisted rope relief along the perimeter bevel',
            descZh: '经典海军与军警纪念币螺旋绳索立体花边'
        },
        'diamond-cut': {
            id: 'diamond-cut',
            name: 'Diamond Cross-Cut Edge (0.955× Vol)',
            nameEn: 'Diamond Cross-Cut Edge (0.955× Vol)',
            nameZh: '钻石菱形斜切花边 (Diamond Cut - 0.955×)',
            volumeFactor: 0.955,
            desc: 'CNC facet-milled diamond cross-hatching that catches multi-angle specular highlights',
            descEn: 'CNC facet-milled diamond cross-hatching that catches multi-angle specular highlights',
            descZh: 'CNC 多角度斜切菱形反光刻面，转动时呈现璀璨金属折光'
        },
        'wave': {
            id: 'wave',
            name: 'Petal / Wave Cut Edge (0.960× Vol)',
            nameEn: 'Petal / Wave Cut Edge (0.960× Vol)',
            nameZh: '波浪弧齿花边 (Wave Edge - 0.960×)',
            volumeFactor: 0.960,
            desc: 'Scalloped wave contours integrated into the perimeter die cavity',
            descEn: 'Scalloped wave contours integrated into the perimeter die cavity',
            descZh: '交替内凹的波浪花瓣几何边，增强异形视觉辨识度'
        },
        'lettered': {
            id: 'lettered',
            name: 'Laser / Stamped Edge Text (0.990× Vol)',
            nameEn: 'Laser / Stamped Edge Text (0.990× Vol)',
            nameZh: '边缘激光刻字 / 序列号 (Edge Text - 0.990×)',
            volumeFactor: 0.990,
            desc: 'Recessed perimeter motto engraving or sequential laser serial numbers (001–500)',
            descEn: 'Recessed perimeter motto engraving or sequential laser serial numbers (001–500)',
            descZh: '在币边刻制部队格言或激光独立流水编号（如 001/500）'
        }
    };

    // 4. Sports Medal Contour Shapes (Shape Fullness Factor k_shape)
    const MEDAL_SHAPES = {
        'round': {
            id: 'round',
            name: 'Classic Marathon Round (k = 0.785)',
            nameEn: 'Classic Marathon Round (k = 0.785)',
            nameZh: '经典正圆跑马奖牌 (Round - k=0.785)',
            kShape: Math.PI / 4, // ~0.7854
            desc: 'Standard circular finisher medal (π/4 area ratio of bounding square)',
            descEn: 'Standard circular finisher medal (π/4 area ratio of bounding square)',
            descZh: '最经典的圆形赛事完赛奖牌（占外接正方形面积 78.5%）'
        },
        'shield': {
            id: 'shield',
            name: 'Heraldic Championship Shield (k = 0.720)',
            nameEn: 'Heraldic Championship Shield (k = 0.720)',
            nameZh: '皇家骑士盾形奖牌 (Shield - k=0.720)',
            kShape: 0.720,
            desc: 'Tapered heraldic shield silhouette for football, rugby, and tactical tournaments',
            descEn: 'Tapered heraldic shield silhouette for football, rugby, and tactical tournaments',
            descZh: '欧式竞技盾徽轮廓，常用于足球、橄榄球及战术联赛奖牌'
        },
        'oval': {
            id: 'oval',
            name: 'Vintage Oval Crest (k = 0.750)',
            nameEn: 'Vintage Oval Crest (k = 0.750)',
            nameZh: '古典椭圆勋章 (Oval - k=0.750)',
            kShape: 0.750,
            desc: 'Elongated elliptical medallion with balanced vertical stature',
            descEn: 'Elongated elliptical medallion with balanced vertical stature',
            descZh: '纵向修长的古典椭圆奖章，适合学院及古典周年赛事'
        },
        'polygon': {
            id: 'polygon',
            name: 'Octagonal / Esports Geometric (k = 0.828)',
            nameEn: 'Octagonal / Esports Geometric (k = 0.828)',
            nameZh: '现代八角几何多边形 (Octagon - k=0.828)',
            kShape: 0.828,
            desc: 'Faceted octagonal silhouette popular for modern esports, CrossFit, and triathlon events',
            descEn: 'Faceted octagonal silhouette popular for modern esports, CrossFit, and triathlon events',
            descZh: '硬朗切角八边形轮廓，深受现代铁人三项、CrossFit 与电竞赛事青睐'
        }
    };

    // 5. Neck Ribbon / Lanyard Specifications (900 mm cut length folded to ~430 mm drop)
    const RIBBON_SPECS = {
        'none': {
            id: 'none',
            name: 'Medal Body Only (No Ribbon +0.0 g)',
            nameEn: 'Medal Body Only (No Ribbon +0.0 g)',
            nameZh: '仅测算金属奖牌本体 (+0.0 g)',
            widthMm: 0,
            weightGrams: 0.0
        },
        'sub-25': {
            id: 'sub-25',
            name: '25 mm (1.0") Sublimated Polyester (+11.5 g)',
            nameEn: '25 mm (1.0") Sublimated Polyester (+11.5 g)',
            nameZh: '25 mm (1.0") 涤纶热转印挂带 (+11.5 g)',
            widthMm: 25,
            weightGrams: 11.5
        },
        'sub-30': {
            id: 'sub-30',
            name: '30 mm (1.2") Heavy Satin Lanyard (+14.8 g)',
            nameEn: '30 mm (1.2") Heavy Satin Lanyard (+14.8 g)',
            nameZh: '30 mm (1.2") 加厚加密热转印挂带 (+14.8 g)',
            widthMm: 30,
            weightGrams: 14.8
        },
        'jacquard-38': {
            id: 'jacquard-38',
            name: '38 mm (1.5") Pro Marathon Jacquard (+19.5 g)',
            nameEn: '38 mm (1.5") Pro Marathon Jacquard (+19.5 g)',
            nameZh: '38 mm (1.5") 专业马拉松宽幅提花织带 (+19.5 g)',
            widthMm: 38,
            weightGrams: 19.5
        }
    };

    // 6. Hanger / Loop Structural Load Specs
    const LOOP_STRENGTH = {
        'cast-loop': {
            id: 'cast-loop',
            name: 'Integrated Cast Bridge Slot (32.0 kgf / 314 N)',
            nameEn: 'Integrated Cast Bridge Slot (32.0 kgf / 314 N)',
            nameZh: '一体铸造宽幅穿带扁桥 (32.0 kgf / 314 N)',
            maxSafeLoadN: 314.0,
            desc: 'Cast monolithically with the medal body; recommended for heavy medals ≥120 g',
            descEn: 'Cast monolithically with the medal body; recommended for heavy medals ≥120 g',
            descZh: '与奖牌主体同模一体压铸成型，承重极高，重型奖牌（≥120 g）首选'
        },
        'jump-ring': {
            id: 'jump-ring',
            name: 'Split Wire Jump Ring Ø1.5 mm (5.5 kgf / 54 N)',
            nameEn: 'Split Wire Jump Ring Ø1.5 mm (5.5 kgf / 54 N)',
            nameZh: '外接开口细铁丝跳环 Ø1.5 mm (5.5 kgf / 54 N)',
            maxSafeLoadN: 54.0,
            desc: 'Unwelded split wire ring tends to gap or pull open under dynamic celebration shock on heavy medals',
            descEn: 'Unwelded split wire ring tends to gap or pull open under dynamic celebration shock on heavy medals',
            descZh: '未焊接开口圆环在重型奖牌跑步欢呼颠簸下易被拉扯变形脱开'
        }
    };

    // 7. Metric + Imperial Dual-Unit Formatting Helpers (per engineering-params.md)
    function mmToIn(mm, decimals = 2) {
        return (Number(mm) / 25.4).toFixed(decimals);
    }

    function gToOz(grams, decimals = 2) {
        return (Number(grams) / 28.349523125).toFixed(decimals);
    }

    function formatMmIn(mm, mmDecimals = 1, inDecimals = 2) {
        const m = Number(mm).toFixed(mmDecimals);
        const i = mmToIn(mm, inDecimals);
        return `${m} mm (${i}")`;
    }

    return {
        MATERIALS,
        RELIEF_STYLES,
        EDGE_CUTS,
        MEDAL_SHAPES,
        RIBBON_SPECS,
        LOOP_STRENGTH,
        mmToIn,
        gToOz,
        formatMmIn
    };

}));
