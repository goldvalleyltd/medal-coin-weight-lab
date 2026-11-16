/**
 * Medal & Coin Weight Estimator - Challenge Coin Procedural Geometry Builder
 * 3D 挑战币拓扑生成器：双阶外凸保护边框、下沉环形铭文凹槽带、同心机雕极光底盘、多层级立体浮雕与 6 种滚齿
 * 参考金瓒车间实样照片 COINS-1.jpg / 主图-02.jpg 解剖结构
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.MedalCoinLab = root.MedalCoinLab || {};
        root.MedalCoinLab.builderCoin = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    /**
     * 构建双阶外凸保护性边框 (Raised Protective Outer Rim)
     * 外缘高出中心底盘 0.55mm，防止币面浮雕和镜面在叠放摩擦中刮花
     */
    function buildCoinBaseAndRims(coinGroup, radius, height, rimWidth, innerRimR, primaryMat) {
        // 1. 币体主基准底盘 (Cylinder Core)
        const coinGeo = new THREE.CylinderGeometry(radius, radius, height, 64);
        coinGeo.rotateX(Math.PI / 2); // 正对观察面 (Z 轴为主法线)
        const baseMesh = new THREE.Mesh(coinGeo, primaryMat);
        coinGroup.add(baseMesh);

        // 2. 双阶外凸保护性边框 (Raised Rim)
        const rimShape = new THREE.Shape();
        rimShape.absarc(0, 0, radius, 0, Math.PI * 2, false);
        const rimHole = new THREE.Path();
        rimHole.absarc(0, 0, innerRimR, 0, Math.PI * 2, true);
        rimShape.holes.push(rimHole);

        const rimGeo = new THREE.ExtrudeGeometry(rimShape, {
            depth: 0.45,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.15,
            bevelThickness: 0.15
        });
        rimGeo.center();

        const frontRimMesh = new THREE.Mesh(rimGeo, primaryMat);
        frontRimMesh.position.z = height / 2 + 0.22;
        coinGroup.add(frontRimMesh);

        const backRimMesh = new THREE.Mesh(rimGeo, primaryMat);
        backRimMesh.position.z = -height / 2 - 0.22;
        coinGroup.add(backRimMesh);
    }

    /**
     * 构建下沉环形凹槽文字带 (Recessed Lettering Band) 与 28 颗立体星标/铆钉铭文
     */
    function buildCoinLetteringBand(coinGroup, height, innerRimR, fieldR, bandWidth, secondaryMat) {
        const bandMidR = (innerRimR + fieldR) / 2.0;
        const starCount = 28;
        const starGroup = new THREE.Group();

        // 冲压五角星 2D 轮廓
        const starShape = new THREE.Shape();
        const starR = Math.min(1.15, bandWidth * 0.30);
        const starInnerR = starR * 0.42;
        for (let pt = 0; pt < 10; pt++) {
            const a = (pt / 10) * Math.PI * 2 - Math.PI / 2;
            const r = (pt % 2 === 0) ? starR : starInnerR;
            const sx = Math.cos(a) * r;
            const sy = Math.sin(a) * r;
            if (pt === 0) starShape.moveTo(sx, sy);
            else starShape.lineTo(sx, sy);
        }
        starShape.closePath();

        const starGeo = new THREE.ExtrudeGeometry(starShape, {
            depth: 0.35,
            bevelEnabled: true,
            bevelSegments: 1,
            steps: 1,
            bevelSize: 0.08,
            bevelThickness: 0.08
        });
        starGeo.center();

        const studGeo = new THREE.SphereGeometry(starR * 0.85, 12, 8);
        studGeo.scale(1.0, 1.0, 0.45);

        for (let i = 0; i < starCount; i++) {
            const angle = (i / starCount) * Math.PI * 2;
            const isStar = (i % 2 === 0);
            const geom = isStar ? starGeo : studGeo;

            // 正面环形星标/铭文微凸块
            const frontStar = new THREE.Mesh(geom, secondaryMat);
            frontStar.userData = { isSecondary: true };
            frontStar.position.set(Math.cos(angle) * bandMidR, Math.sin(angle) * bandMidR, height / 2 + 0.16);
            frontStar.rotation.z = angle - Math.PI / 2;
            starGroup.add(frontStar);

            // 背面环形对称铭文微凸块
            const backStar = new THREE.Mesh(geom, secondaryMat);
            backStar.userData = { isSecondary: true };
            backStar.position.set(Math.cos(angle) * bandMidR, Math.sin(angle) * bandMidR, -height / 2 - 0.16);
            backStar.rotation.z = angle - Math.PI / 2;
            backStar.rotation.y = Math.PI;
            starGroup.add(backStar);
        }
        coinGroup.add(starGroup);
        return starGeo;
    }

    /**
     * 构建边缘 6 种滚花工艺 3D 几何
     */
    function buildCoinEdges(coinGroup, radius, height, edgeKey, primaryMat, secondaryMat) {
        if (edgeKey === 'reeded') {
            // (1) 细齿硬币滚花边 (密集高精 96 齿)
            const numTeeth = 96;
            const toothGroup = new THREE.Group();
            const toothGeo = new THREE.BoxGeometry(0.32, height * 0.96, 0.45);
            for (let i = 0; i < numTeeth; i++) {
                const angle = (i / numTeeth) * Math.PI * 2;
                const tooth = new THREE.Mesh(toothGeo, primaryMat);
                tooth.position.set(Math.cos(angle) * (radius + 0.08), Math.sin(angle) * (radius + 0.08), 0);
                tooth.rotation.z = angle;
                toothGroup.add(tooth);
            }
            coinGroup.add(toothGroup);

        } else if (edgeKey === 'diamond-cut') {
            // (2) 斜切交叉钻石边 (前后两圈 45 度倒角切削环 + 钻石切槽)
            const bevelW = Math.min(1.8, height * 0.35);
            const bevelGeoFront = new THREE.CylinderGeometry(radius, radius - bevelW, bevelW, 48);
            bevelGeoFront.rotateX(Math.PI / 2);
            const bevelMeshFront = new THREE.Mesh(bevelGeoFront, secondaryMat);
            bevelMeshFront.position.z = height / 2 - bevelW / 2 + 0.1;
            bevelMeshFront.userData = { isSecondary: true };
            coinGroup.add(bevelMeshFront);

            const bevelGeoBack = new THREE.CylinderGeometry(radius - bevelW, radius, bevelW, 48);
            bevelGeoBack.rotateX(Math.PI / 2);
            const bevelMeshBack = new THREE.Mesh(bevelGeoBack, secondaryMat);
            bevelMeshBack.position.z = -height / 2 + bevelW / 2 - 0.1;
            bevelMeshBack.userData = { isSecondary: true };
            coinGroup.add(bevelMeshBack);

            // 48 颗环绕反光菱形切面
            const diamondCutterGroup = new THREE.Group();
            for (let i = 0; i < 48; i++) {
                const angle = (i / 48) * Math.PI * 2;
                const diamondMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.75), secondaryMat);
                diamondMesh.userData = { isSecondary: true };
                diamondMesh.position.set(Math.cos(angle) * (radius - 0.4), Math.sin(angle) * (radius - 0.4), height / 2);
                diamondCutterGroup.add(diamondMesh);
            }
            coinGroup.add(diamondCutterGroup);

        } else if (edgeKey === 'rope') {
            // (3) 双股绳索扭纹边 (环绕螺旋麻花斜向倾角)
            const ropeSegments = 42;
            const ropeGroup = new THREE.Group();
            const strandGeo = new THREE.CylinderGeometry(0.65, 0.65, 2.4, 8);
            strandGeo.rotateZ(Math.PI / 3.2);

            for (let i = 0; i < ropeSegments; i++) {
                const angle = (i / ropeSegments) * Math.PI * 2;
                const strandFront = new THREE.Mesh(strandGeo, secondaryMat);
                strandFront.userData = { isSecondary: true };
                strandFront.position.set(Math.cos(angle) * (radius - 0.7), Math.sin(angle) * (radius - 0.7), height / 2);
                strandFront.rotation.z = angle + Math.PI / 4;
                ropeGroup.add(strandFront);

                const strandBack = new THREE.Mesh(strandGeo, secondaryMat);
                strandBack.userData = { isSecondary: true };
                strandBack.position.set(Math.cos(angle) * (radius - 0.7), Math.sin(angle) * (radius - 0.7), -height / 2);
                strandBack.rotation.z = angle - Math.PI / 4;
                ropeGroup.add(strandBack);
            }
            coinGroup.add(ropeGroup);

        } else if (edgeKey === 'wave') {
            // (4) 花瓣波浪弧齿边 (Wave / Petal Edge)
            const petalCount = 24;
            const waveGroup = new THREE.Group();
            const petalGeo = new THREE.CylinderGeometry(1.5, 1.5, height * 0.98, 16);
            petalGeo.rotateX(Math.PI / 2);

            for (let i = 0; i < petalCount; i++) {
                const angle = (i / petalCount) * Math.PI * 2;
                const petal = new THREE.Mesh(petalGeo, secondaryMat);
                petal.userData = { isSecondary: true };
                petal.position.set(Math.cos(angle) * (radius - 0.35), Math.sin(angle) * (radius - 0.35), 0);
                waveGroup.add(petal);
            }
            coinGroup.add(waveGroup);

        } else if (edgeKey === 'lettered') {
            // (5) 边缘凹凸激光刻字铭文带 (Lettered Edge)
            const charCount = 36;
            const letterGroup = new THREE.Group();
            const charBoxGeo = new THREE.BoxGeometry(0.55, height * 0.65, 0.75);

            for (let i = 0; i < charCount; i++) {
                if (i % 5 === 0) continue; // 空格
                const angle = (i / charCount) * Math.PI * 2;
                const charMesh = new THREE.Mesh(charBoxGeo, secondaryMat);
                charMesh.userData = { isSecondary: true };
                charMesh.position.set(Math.cos(angle) * (radius + 0.12), Math.sin(angle) * (radius + 0.12), 0);
                charMesh.rotation.z = angle;
                letterGroup.add(charMesh);
            }
            coinGroup.add(letterGroup);
        }
    }

    /**
     * 构建正反双面立体浮雕层 (4 种截然不同的真实工业外观与起伏深度)
     */
    function buildCoinReliefs(coinGroup, height, fieldR, reliefKey, primaryMat, secondaryMat, starGeo) {
        if (reliefKey === 'flat-2d') {
            // (1) 纯平烤漆 / 软珐琅 (2D Flat / 0.0mm 凸起)
            const enamelBlueMat = new THREE.MeshStandardMaterial({
                color: 0x0C2340, // 经典海军蓝软珐琅
                roughness: 0.10,
                metalness: 0.12
            });
            const enamelRedMat = new THREE.MeshStandardMaterial({
                color: 0x881337, // 赤焰红软珐琅
                roughness: 0.10,
                metalness: 0.12
            });

            // 正面外圈海军蓝填漆圆环
            const frontRingGeo = new THREE.RingGeometry(fieldR * 0.45, fieldR * 0.95, 48);
            const frontRingMesh = new THREE.Mesh(frontRingGeo, enamelBlueMat);
            frontRingMesh.userData = { isEnamel: true };
            frontRingMesh.position.z = height / 2 + 0.04;
            coinGroup.add(frontRingMesh);

            // 正面内圈赤焰红填漆圆心
            const frontCenterGeo = new THREE.CircleGeometry(fieldR * 0.38, 36);
            const frontCenterMesh = new THREE.Mesh(frontCenterGeo, enamelRedMat);
            frontCenterMesh.userData = { isEnamel: true };
            frontCenterMesh.position.z = height / 2 + 0.04;
            coinGroup.add(frontCenterMesh);

            // 平整金色中央徽标轮廓 (0.05mm 微微齐平)
            const flatStarGeo = new THREE.CircleGeometry(fieldR * 0.22, 6);
            const flatStarMesh = new THREE.Mesh(flatStarGeo, secondaryMat);
            flatStarMesh.userData = { isSecondary: true };
            flatStarMesh.position.z = height / 2 + 0.05;
            coinGroup.add(flatStarMesh);

            // 背面纯平双色同心圆填漆
            const backRingGeo = new THREE.RingGeometry(fieldR * 0.40, fieldR * 0.92, 48);
            const backRingMesh = new THREE.Mesh(backRingGeo, enamelBlueMat);
            backRingMesh.userData = { isEnamel: true };
            backRingMesh.position.z = -height / 2 - 0.04;
            backRingMesh.rotation.y = Math.PI;
            coinGroup.add(backRingMesh);

        } else if (reliefKey === 'stamped-2d') {
            // (2) 2D 多层多阶机械冷冲压 (2D Stamped / 0.35mm 凸起)
            const stepH = 0.40;
            const frontStepGroup = new THREE.Group();

            // 第一阶平顶多齿冲压齿轮环 (24 齿)
            const gearToothCount = 24;
            const gearGroup = new THREE.Group();
            const toothBoxGeo = new THREE.BoxGeometry(fieldR * 0.08, fieldR * 0.16, stepH);
            for (let g = 0; g < gearToothCount; g++) {
                const ga = (g / gearToothCount) * Math.PI * 2;
                const tooth = new THREE.Mesh(toothBoxGeo, secondaryMat);
                tooth.userData = { isSecondary: true };
                tooth.position.set(Math.cos(ga) * (fieldR * 0.82), Math.sin(ga) * (fieldR * 0.82), height / 2 + stepH / 2);
                tooth.rotation.z = ga;
                gearGroup.add(tooth);
            }
            frontStepGroup.add(gearGroup);

            // 第二阶平顶八边形冲压平台
            const step1Geo = new THREE.CylinderGeometry(fieldR * 0.65, fieldR * 0.65, stepH, 8);
            step1Geo.rotateX(Math.PI / 2);
            const step1Mesh = new THREE.Mesh(step1Geo, secondaryMat);
            step1Mesh.userData = { isSecondary: true };
            step1Mesh.position.z = height / 2 + stepH / 2;
            frontStepGroup.add(step1Mesh);

            // 第三阶中央冲压平顶五角星 (垂直切壁，高 0.70mm)
            const starCenter = new THREE.Mesh(starGeo, primaryMat);
            starCenter.scale.set(fieldR * 0.32, fieldR * 0.32, 1.6);
            starCenter.position.z = height / 2 + stepH + 0.15;
            frontStepGroup.add(starCenter);

            coinGroup.add(frontStepGroup);

            // 背面冲压同心同轴多环直壁台阶
            const backStepGeo = new THREE.CylinderGeometry(fieldR * 0.55, fieldR * 0.55, stepH, 8);
            backStepGeo.rotateX(Math.PI / 2);
            const backStepMesh = new THREE.Mesh(backStepGeo, secondaryMat);
            backStepMesh.userData = { isSecondary: true };
            backStepMesh.position.z = -height / 2 - stepH / 2;
            coinGroup.add(backStepMesh);

        } else if (reliefKey === 'semi-3d') {
            // (3) 2.5D 双面浮雕 (2.5D Semi-Relief / 0.75mm 凸起) - 实样加拿大枫叶币 (参考主图-02.jpg)
            const semiH = 0.85;
            const mapleGroup = new THREE.Group();

            // 构建五角立体枫叶造型
            const mapleShape = new THREE.Shape();
            const mScale = fieldR * 0.75;
            mapleShape.moveTo(0, mScale * 0.95); // 顶端主尖
            mapleShape.lineTo(mScale * 0.18, mScale * 0.62);
            mapleShape.lineTo(mScale * 0.38, mScale * 0.75);
            mapleShape.lineTo(mScale * 0.28, mScale * 0.45);
            mapleShape.lineTo(mScale * 0.75, mScale * 0.42); // 右上副尖
            mapleShape.lineTo(mScale * 0.45, mScale * 0.18);
            mapleShape.lineTo(mScale * 0.82, mScale * 0.05); // 右横尖
            mapleShape.lineTo(mScale * 0.42, -mScale * 0.12);
            mapleShape.lineTo(mScale * 0.65, -mScale * 0.38); // 右下尖
            mapleShape.lineTo(mScale * 0.22, -mScale * 0.28);
            mapleShape.lineTo(mScale * 0.08, -mScale * 0.55); // 右叶柄基部
            mapleShape.lineTo(0.04, -mScale * 0.85);          // 叶柄右侧
            mapleShape.lineTo(-0.04, -mScale * 0.85);         // 叶柄左侧
            mapleShape.lineTo(-mScale * 0.08, -mScale * 0.55);
            mapleShape.lineTo(-mScale * 0.22, -mScale * 0.28);
            mapleShape.lineTo(-mScale * 0.65, -mScale * 0.38); // 左下尖
            mapleShape.lineTo(-mScale * 0.42, -mScale * 0.12);
            mapleShape.lineTo(-mScale * 0.82, mScale * 0.05); // 左横尖
            mapleShape.lineTo(-mScale * 0.45, mScale * 0.18);
            mapleShape.lineTo(-mScale * 0.75, mScale * 0.42); // 左上副尖
            mapleShape.lineTo(-mScale * 0.28, mScale * 0.45);
            mapleShape.lineTo(-mScale * 0.38, mScale * 0.75);
            mapleShape.lineTo(-mScale * 0.18, mScale * 0.62);
            mapleShape.closePath();

            const mapleGeo = new THREE.ExtrudeGeometry(mapleShape, {
                depth: semiH,
                bevelEnabled: true,
                bevelSegments: 2,
                steps: 1,
                bevelSize: 0.22,
                bevelThickness: 0.25
            });
            mapleGeo.center();

            const mapleMesh = new THREE.Mesh(mapleGeo, secondaryMat);
            mapleMesh.userData = { isSecondary: true };
            mapleMesh.position.set(0, 0, height / 2 + semiH / 2 + 0.05);
            mapleGroup.add(mapleMesh);

            // 枫叶凸起立体主叶脉脊线 (Central Vein Ridge)
            const veinGeo = new THREE.CylinderGeometry(0.35, 0.7, mScale * 1.45, 6);
            const veinMesh = new THREE.Mesh(veinGeo, primaryMat);
            veinMesh.position.set(0, 0, height / 2 + semiH + 0.18);
            mapleGroup.add(veinMesh);

            // 枫叶左右侧叶脉
            const leftVeinGeo = new THREE.CylinderGeometry(0.25, 0.45, mScale * 0.8, 6);
            leftVeinGeo.rotateZ(Math.PI / 3.2);
            const leftVeinMesh = new THREE.Mesh(leftVeinGeo, primaryMat);
            leftVeinMesh.position.set(-mScale * 0.28, mScale * 0.12, height / 2 + semiH + 0.16);
            mapleGroup.add(leftVeinMesh);

            const rightVeinGeo = new THREE.CylinderGeometry(0.25, 0.45, mScale * 0.8, 6);
            rightVeinGeo.rotateZ(-Math.PI / 3.2);
            const rightVeinMesh = new THREE.Mesh(rightVeinGeo, primaryMat);
            rightVeinMesh.position.set(mScale * 0.28, mScale * 0.12, height / 2 + semiH + 0.16);
            mapleGroup.add(rightVeinMesh);

            coinGroup.add(mapleGroup);

            // 背面 2.5D 战术八角罗盘星芒与麦穗环
            const compassGroup = new THREE.Group();
            const star8Geo = new THREE.OctahedronGeometry(fieldR * 0.48);
            star8Geo.scale(1.0, 1.0, 0.38);
            const compassMesh = new THREE.Mesh(star8Geo, secondaryMat);
            compassMesh.userData = { isSecondary: true };
            compassMesh.position.z = -height / 2 - semiH / 2 - 0.08;
            compassGroup.add(compassMesh);

            const laurelRingGeo = new THREE.TorusGeometry(fieldR * 0.65, 0.85, 12, 48);
            const laurelRingMesh = new THREE.Mesh(laurelRingGeo, primaryMat);
            laurelRingMesh.position.z = -height / 2 - semiH / 2 - 0.04;
            compassGroup.add(laurelRingMesh);

            coinGroup.add(compassGroup);

        } else {
            // (4) 3D 双面超高浮雕 (3D High-Relief / 1.60mm 强隆起) - 实样哈雷展翅雄鹰勋标与军官军徽 (参考 COINS-1.jpg)
            const highH = 1.65;
            const eagleGroup = new THREE.Group();

            // A. 雄鹰胸前立体盾徽 (Center Shield with stripes)
            const shieldW = fieldR * 0.52;
            const shieldH = fieldR * 0.62;
            const shieldShape = new THREE.Shape();
            shieldShape.moveTo(-shieldW / 2, shieldH * 0.45);
            shieldShape.lineTo(shieldW / 2, shieldH * 0.45);
            shieldShape.lineTo(shieldW / 2, 0);
            shieldShape.bezierCurveTo(shieldW / 2, -shieldH * 0.35, shieldW * 0.2, -shieldH * 0.60, 0, -shieldH * 0.72);
            shieldShape.bezierCurveTo(-shieldW * 0.2, -shieldH * 0.60, -shieldW / 2, -shieldH * 0.35, -shieldW / 2, 0);
            shieldShape.closePath();

            const shieldGeo = new THREE.ExtrudeGeometry(shieldShape, {
                depth: highH * 0.65,
                bevelEnabled: true,
                bevelSegments: 2,
                steps: 1,
                bevelSize: 0.18,
                bevelThickness: 0.20
            });
            shieldGeo.center();
            const shieldMesh = new THREE.Mesh(shieldGeo, secondaryMat);
            shieldMesh.userData = { isSecondary: true };
            shieldMesh.position.set(0, -fieldR * 0.08, height / 2 + highH * 0.4);
            eagleGroup.add(shieldMesh);

            // 盾徽表面 3 条垂直浮雕条纹
            for (let st = -1; st <= 1; st++) {
                const stripeGeo = new THREE.BoxGeometry(shieldW * 0.12, shieldH * 0.75, highH * 0.25);
                const stripeMesh = new THREE.Mesh(stripeGeo, primaryMat);
                stripeMesh.position.set(st * shieldW * 0.22, -fieldR * 0.10, height / 2 + highH * 0.75);
                eagleGroup.add(stripeMesh);
            }

            // B. 左右展翅双翼 (Outspread Layered Wings - 跨度达内盘 75%)
            const wingSpanR = fieldR * 0.72;
            for (let w = 0; w < 4; w++) {
                const wingGeo = new THREE.CylinderGeometry(0.4, 2.2 - w * 0.35, wingSpanR * 0.85 - w * 1.8, 8);
                wingGeo.rotateZ(Math.PI / 2.6 + w * 0.12);
                const wingMesh = new THREE.Mesh(wingGeo, secondaryMat);
                wingMesh.userData = { isSecondary: true };
                wingMesh.position.set(-wingSpanR * 0.42 + w * 1.2, fieldR * 0.18 + w * 1.4, height / 2 + highH * 0.45 - w * 0.15);
                eagleGroup.add(wingMesh);
            }

            for (let w = 0; w < 4; w++) {
                const wingGeo = new THREE.CylinderGeometry(0.4, 2.2 - w * 0.35, wingSpanR * 0.85 - w * 1.8, 8);
                wingGeo.rotateZ(-Math.PI / 2.6 - w * 0.12);
                const wingMesh = new THREE.Mesh(wingGeo, secondaryMat);
                wingMesh.userData = { isSecondary: true };
                wingMesh.position.set(wingSpanR * 0.42 - w * 1.2, fieldR * 0.18 + w * 1.4, height / 2 + highH * 0.45 - w * 0.15);
                eagleGroup.add(wingMesh);
            }

            // C. 雄鹰立体鹰首与鹰喙 (Eagle Head & Hooked Beak)
            const headGeo = new THREE.ConeGeometry(fieldR * 0.20, highH * 1.1, 8);
            headGeo.rotateX(Math.PI / 2.2);
            const headMesh = new THREE.Mesh(headGeo, primaryMat);
            headMesh.position.set(0, fieldR * 0.36, height / 2 + highH * 0.8);
            eagleGroup.add(headMesh);

            const beakGeo = new THREE.ConeGeometry(fieldR * 0.08, highH * 0.65, 6);
            beakGeo.rotateX(Math.PI / 1.8);
            const beakMesh = new THREE.Mesh(beakGeo, secondaryMat);
            beakMesh.userData = { isSecondary: true };
            beakMesh.position.set(0, fieldR * 0.28, height / 2 + highH + 0.15);
            eagleGroup.add(beakMesh);

            // D. 底部鹰爪与月桂橄榄枝
            const clawRingGeo = new THREE.TorusGeometry(shieldW * 0.45, 0.7, 10, 24, Math.PI);
            const clawMesh = new THREE.Mesh(clawRingGeo, primaryMat);
            clawMesh.position.set(0, -fieldR * 0.52, height / 2 + highH * 0.35);
            eagleGroup.add(clawMesh);

            coinGroup.add(eagleGroup);

            // 背面：军官交叉双剑与三维立体五星勋章 (Crossed Sabers & 3D Star Medallion)
            const saberGroup = new THREE.Group();

            const bladeLen = fieldR * 1.35;
            const bladeGeo1 = new THREE.BoxGeometry(1.4, bladeLen, 0.8);
            bladeGeo1.rotateZ(Math.PI / 4);
            const blade1 = new THREE.Mesh(bladeGeo1, secondaryMat);
            blade1.userData = { isSecondary: true };
            blade1.position.z = -height / 2 - highH * 0.35;
            saberGroup.add(blade1);

            const bladeGeo2 = new THREE.BoxGeometry(1.4, bladeLen, 0.8);
            bladeGeo2.rotateZ(-Math.PI / 4);
            const blade2 = new THREE.Mesh(bladeGeo2, secondaryMat);
            blade2.userData = { isSecondary: true };
            blade2.position.z = -height / 2 - highH * 0.35;
            saberGroup.add(blade2);

            const star3D = new THREE.Mesh(starGeo, primaryMat);
            star3D.scale.set(fieldR * 0.45, fieldR * 0.45, 2.5);
            star3D.position.z = -height / 2 - highH * 0.75;
            star3D.rotation.y = Math.PI;
            saberGroup.add(star3D);

            coinGroup.add(saberGroup);
        }
    }

    /**
     * 3D 挑战币整体装配主函数
     */
    function buildProceduralCoin(diameterMm, thicknessMm, edgeKey, reliefKey, materialFactory) {
        const coinGroup = new THREE.Group();
        const radius = diameterMm / 2.0;
        const height = thicknessMm;

        const primaryMat = materialFactory(false, 'smooth');
        const secondaryMat = materialFactory(true, 'smooth');
        const guillocheMat = materialFactory(false, 'guilloche');
        const sandblastMat = materialFactory(false, 'sandblast');

        const rimWidth = Math.max(1.8, Math.min(3.2, radius * 0.08));
        const innerRimR = radius - rimWidth;
        const bandWidth = Math.max(2.6, Math.min(4.2, radius * 0.11));
        const fieldR = innerRimR - bandWidth;

        // 1. 基准盘与双阶外凸保护边框
        buildCoinBaseAndRims(coinGroup, radius, height, rimWidth, innerRimR, primaryMat);

        // 2. 环形凹槽带与立体星标铭文
        const starGeo = buildCoinLetteringBand(coinGroup, height, innerRimR, fieldR, bandWidth, secondaryMat);

        // 3. 中心内盘下沉底纹盘 (Field Disc)
        const fieldGeo = new THREE.CircleGeometry(fieldR, 48);
        const isFieldGuilloche = (reliefKey === 'semi-3d' || reliefKey === 'high-3d');
        const frontFieldMat = isFieldGuilloche ? guillocheMat : sandblastMat;

        const frontField = new THREE.Mesh(fieldGeo, frontFieldMat);
        frontField.userData = { isGuilloche: isFieldGuilloche, isSandblast: !isFieldGuilloche };
        frontField.position.z = height / 2 + 0.02;
        coinGroup.add(frontField);

        const backField = new THREE.Mesh(fieldGeo, sandblastMat);
        backField.userData = { isSandblast: true };
        backField.position.z = -height / 2 - 0.02;
        backField.rotation.y = Math.PI;
        coinGroup.add(backField);

        // 4. 边缘 6 种滚花齿形
        buildCoinEdges(coinGroup, radius, height, edgeKey, primaryMat, secondaryMat);

        // 5. 正反双面立体浮雕
        buildCoinReliefs(coinGroup, height, fieldR, reliefKey, primaryMat, secondaryMat, starGeo);

        // 6. 阴影投射配置
        coinGroup.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        return coinGroup;
    }

    return {
        buildProceduralCoin
    };

}));
