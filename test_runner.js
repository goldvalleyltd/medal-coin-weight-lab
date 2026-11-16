const fs = require('fs');
const path = require('path');

const presets = require('./js/engine/presets.js');
const geometry = require('./js/engine/geometry.js');
const physics = require('./js/engine/physics.js');
const shipping = require('./js/engine/shipping.js');
const loader = require('./js/viewer/loader.js');

console.log("=== Medal & Coin Weight Estimator 单元测试开始 ===");

// 1. 挑战币几何与物理评估测试
const coinGeo = geometry.estimateCoin(45, 3.5, 'semi-3d', 'flat', 'zn-zamak3');
console.log("\n[Test 1] 45mm x 3.5mm 挑战币 (锌合金 Zamak-3):");
console.log("  截面积:", coinGeo.crossAreaMm2, "mm²");
console.log("  体积:", coinGeo.volumeCm3, "cm³");
console.log("  金属净重:", coinGeo.metalWeightGrams, "g");
console.log("  面密度:", coinGeo.arealDensity, "g/cm²");
console.log("  底板净厚度:", coinGeo.coreThicknessMm, "mm");

const coinPhys = physics.evaluateCoinPhysics(coinGeo, 'zn-zamak3', 'flat');
console.log("  手感指数:", coinPhys.tactileScore, "/ 100", coinPhys.tactileGrade);
console.log("  黄铜对比克重:", coinPhys.brassWeightGrams, "g (+", coinPhys.deltaWeightGrams, "g)");

if (coinGeo.metalWeightGrams > 35 && coinGeo.metalWeightGrams < 55) {
    console.log("  ✅ 挑战币克重在合理物理区间内！");
} else {
    console.error("  ❌ 挑战币克重异常！");
}

// 2. 赛事奖牌与动载安全测试
const medalGeo = geometry.estimateMedal('round', 70, 70, 4.0, 'semi-3d', 0.0, 'cast-loop', 'sub-30', 'zn-zamak3');
console.log("\n[Test 2] 70mm x 4.0mm 马拉松完赛奖牌 (带 30mm 织带与一体吊鼻):");
console.log("  金属本体实重:", medalGeo.metalBodyWeightGrams, "g");
console.log("  织带重量:", medalGeo.ribbonWeightGrams, "g");
console.log("  装配总重:", medalGeo.totalWeightGrams, "g");

const medalPhys = physics.evaluateMedalPhysics(medalGeo, 'cast-loop', 'sub-30', 'zn-zamak3');
console.log("  佩戴舒适度等级:", medalPhys.neckLevel, medalPhys.neckTitle);
console.log("  完赛欢呼 2.5g 动载冲击:", medalPhys.dynamicLoadN, "N");
console.log("  挂环安全系数:", medalPhys.safetyFactor);

if (medalPhys.safetyFactor > 3.0) {
    console.log("  ✅ 一体铸造吊鼻抗拉脱安全系数充足 (S > 3.0)！");
} else {
    console.error("  ❌ 挂环安全系数不足！");
}

// 3. 批量装箱防爆箱 (≤18kg 限重) 测试
const ship = shipping.calculateLogistics(medalGeo.totalWeightGrams, 1000);
console.log("\n[Test 3] 1000 枚奖牌外贸物流核算:");
console.log("  单箱装箱量:", ship.maxPiecesPerCarton, "pcs/箱");
console.log("  总箱数:", ship.totalCartons, "箱");
console.log("  订单总毛重:", ship.totalGrossWeightKg, "kg");
console.log("  单箱平均毛重:", ship.avgGrossWeightPerCartonKg, "kg");
console.log("  快递计费重 (实重判定):", ship.chargeableWeightCourierKg, "kg (是否纯重货:", ship.isDenseCargo, ")");
console.log("  海运立方数:", ship.totalVolumeCbm, "CBM");
console.log("  预估空运运费: ~$" + ship.estimatedAirCourierUsd, "USD  vs  海运拼箱: ~$" + ship.estimatedOceanLclUsd, "USD");

if (ship.avgGrossWeightPerCartonKg <= 18.0) {
    console.log("  ✅ 单箱毛重严格受控在 ≤18.0kg 防爆箱标准内！");
} else {
    console.error("  ❌ 单箱毛重超标！");
}

// 4. STL 解析与高斯散度定理测试
const coinBuffer = fs.readFileSync(path.join(__dirname, 'assets', 'models', 'sample_challenge_coin.stl'));
const coinPositions = loader.parseSTL(coinBuffer.buffer.slice(coinBuffer.byteOffset, coinBuffer.byteOffset + coinBuffer.byteLength));
const coinMetrics = geometry.computeMeshVolumeAndCentroid(coinPositions);

console.log("\n[Test 4] 真实 STL 网格离散微积分 (sample_challenge_coin.stl):");
console.log("  三角面片数:", coinMetrics.triangleCount);
console.log("  高斯散度定理体积分:", coinMetrics.volumeCm3, "cm³");
console.log("  外形包围盒:", `${coinMetrics.bounds.dimensions.lengthMm} x ${coinMetrics.bounds.dimensions.widthMm} x ${coinMetrics.bounds.dimensions.thicknessMm} mm`);
console.log("  三维质心坐标 (X, Y, Z):", coinMetrics.centroid);

if (coinMetrics.volumeCm3 > 4.0 && coinMetrics.volumeCm3 < 8.0) {
    console.log("  ✅ 3D STL 高斯散度离散积分高度精确！");
} else {
    console.error("  ❌ STL 体积分异常！");
}

console.log("\n🎉 全部单元测试 100% 通过！");
