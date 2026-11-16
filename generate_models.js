const fs = require('fs');
const path = require('path');

function createBinarySTL(triangles) {
    const buffer = Buffer.alloc(84 + triangles.length * 50);
    // 80 bytes header
    buffer.write("Gold Valley Precision Medal & Coin Binary STL", 0, "utf8");
    // Number of triangles
    buffer.writeUInt32LE(triangles.length, 80);

    let offset = 84;
    for (const tri of triangles) {
        // Normal vector (0, 0, 0)
        buffer.writeFloatLE(0, offset);
        buffer.writeFloatLE(0, offset + 4);
        buffer.writeFloatLE(0, offset + 8);
        offset += 12;

        // Vertices A, B, C
        for (let i = 0; i < 3; i++) {
            buffer.writeFloatLE(tri[i][0], offset);
            buffer.writeFloatLE(tri[i][1], offset + 4);
            buffer.writeFloatLE(tri[i][2], offset + 8);
            offset += 12;
        }

        // Attribute byte count
        buffer.writeUInt16LE(0, offset);
        offset += 2;
    }
    return buffer;
}

// 1. 生成 45mm x 3.5mm 挑战币模型 (带双面浮雕台阶)
function generateCoinSTL() {
    const triangles = [];
    const radius = 22.5; // 直径 45mm
    const halfH = 1.75;  // 厚度 3.5mm
    const segments = 48;

    // 圆柱主体侧面
    for (let i = 0; i < segments; i++) {
        const a1 = (i / segments) * Math.PI * 2;
        const a2 = ((i + 1) / segments) * Math.PI * 2;

        const x1 = Math.cos(a1) * radius, y1 = Math.sin(a1) * radius;
        const x2 = Math.cos(a2) * radius, y2 = Math.sin(a2) * radius;

        // 侧面两三角形
        triangles.push([[x1, y1, -halfH], [x2, y2, -halfH], [x2, y2, halfH]]);
        triangles.push([[x1, y1, -halfH], [x2, y2, halfH], [x1, y1, halfH]]);

        // 顶面底面封盖 (外圈)
        const innerR = 15.0;
        const xi1 = Math.cos(a1) * innerR, yi1 = Math.sin(a1) * innerR;
        const xi2 = Math.cos(a2) * innerR, yi2 = Math.sin(a2) * innerR;

        // 正面外环
        triangles.push([[xi1, yi1, halfH], [xi2, yi2, halfH], [x2, y2, halfH]]);
        triangles.push([[xi1, yi1, halfH], [x2, y2, halfH], [x1, y1, halfH]]);

        // 背面外环
        triangles.push([[xi1, yi1, -halfH], [x2, y2, -halfH], [xi2, yi2, -halfH]]);
        triangles.push([[xi1, yi1, -halfH], [x1, y1, -halfH], [x2, y2, -halfH]]);

        // 正面中心浮雕凸起 (+0.8mm)
        const reliefH = halfH + 0.8;
        triangles.push([[0, 0, reliefH], [xi1, yi1, reliefH], [xi2, yi2, reliefH]]);
        // 浮雕侧壁
        triangles.push([[xi1, yi1, halfH], [xi2, yi2, halfH], [xi2, yi2, reliefH]]);
        triangles.push([[xi1, yi1, halfH], [xi2, yi2, reliefH], [xi1, yi1, reliefH]]);

        // 背面中心浮雕凸起 (-0.8mm)
        const reliefBackH = -halfH - 0.8;
        triangles.push([[0, 0, reliefBackH], [xi2, yi2, reliefBackH], [xi1, yi1, reliefBackH]]);
        triangles.push([[xi1, yi1, -halfH], [xi2, yi2, reliefBackH], [xi2, yi2, -halfH]]);
        triangles.push([[xi1, yi1, -halfH], [xi1, yi1, reliefBackH], [xi2, yi2, reliefBackH]]);
    }

    return createBinarySTL(triangles);
}

// 2. 生成 70mm x 4.0mm 马拉松完赛奖牌 (带顶部吊鼻)
function generateMedalSTL() {
    const triangles = [];
    const radius = 35.0; // 直径 70mm
    const halfH = 2.0;   // 厚度 4.0mm
    const segments = 48;

    // 圆盘本体
    for (let i = 0; i < segments; i++) {
        const a1 = (i / segments) * Math.PI * 2;
        const a2 = ((i + 1) / segments) * Math.PI * 2;

        const x1 = Math.cos(a1) * radius, y1 = Math.sin(a1) * radius;
        const x2 = Math.cos(a2) * radius, y2 = Math.sin(a2) * radius;

        triangles.push([[x1, y1, -halfH], [x2, y2, -halfH], [x2, y2, halfH]]);
        triangles.push([[x1, y1, -halfH], [x2, y2, halfH], [x1, y1, halfH]]);

        triangles.push([[0, 0, halfH], [x1, y1, halfH], [x2, y2, halfH]]);
        triangles.push([[0, 0, -halfH], [x2, y2, -halfH], [x1, y1, -halfH]]);
    }

    // 顶部吊鼻 (一体铸造实心圆环外径 8mm，内孔 4mm)
    const loopY = radius + 3.5;
    const loopOutR = 7.0;
    const loopInR = 3.5;
    const loopSegs = 24;

    for (let i = 0; i < loopSegs; i++) {
        const a1 = (i / loopSegs) * Math.PI * 2;
        const a2 = ((i + 1) / loopSegs) * Math.PI * 2;

        const xo1 = Math.cos(a1) * loopOutR, yo1 = loopY + Math.sin(a1) * loopOutR;
        const xo2 = Math.cos(a2) * loopOutR, yo2 = loopY + Math.sin(a2) * loopOutR;

        const xi1 = Math.cos(a1) * loopInR, yi1 = loopY + Math.sin(a1) * loopInR;
        const xi2 = Math.cos(a2) * loopInR, yi2 = loopY + Math.sin(a2) * loopInR;

        // 顶面
        triangles.push([[xi1, yi1, halfH], [xo1, yo1, halfH], [xo2, yo2, halfH]]);
        triangles.push([[xi1, yi1, halfH], [xo2, yo2, halfH], [xi2, yi2, halfH]]);

        // 底面
        triangles.push([[xi1, yi1, -halfH], [xo2, yo2, -halfH], [xo1, yo1, -halfH]]);
        triangles.push([[xi1, yi1, -halfH], [xi2, yi2, -halfH], [xo2, yo2, -halfH]]);

        // 外壁
        triangles.push([[xo1, yo1, -halfH], [xo2, yo2, -halfH], [xo2, yo2, halfH]]);
        triangles.push([[xo1, yo1, -halfH], [xo2, yo2, halfH], [xo1, yo1, halfH]]);

        // 内孔壁
        triangles.push([[xi1, yi1, -halfH], [xi2, yi2, halfH], [xi2, yi2, -halfH]]);
        triangles.push([[xi1, yi1, -halfH], [xi1, yi1, halfH], [xi2, yi2, halfH]]);
    }

    return createBinarySTL(triangles);
}

const outDir = path.join(__dirname, 'assets', 'models');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'sample_challenge_coin.stl'), generateCoinSTL());
fs.writeFileSync(path.join(outDir, 'sample_marathon_medal.stl'), generateMedalSTL());

console.log("✅ 成功生成 sample_challenge_coin.stl 与 sample_marathon_medal.stl！");
