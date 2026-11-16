/**
 * Medal & Coin Weight Estimator - Sports Medal Procedural Geometry Builder
 * 3D 赛事奖牌拓扑生成器：欧式巴洛克一体压铸雕花连体吊梁 (横向穿带扁孔)、立体双麦穗月桂枝环绕、
 * 底座立体缎带蝴蝶结、正面 3D 冠军奖杯浮雕、背面大面积微喷砂激光刻字板与柔性双层挂带
 * 参考金瓒车间实样照片 exist mold medal (1).jpg / O1CN016Ord8G1n1msZia9Fq_!!1098635030-0-cib.jpg 解剖结构
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.MedalCoinLab = root.MedalCoinLab || {};
        root.MedalCoinLab.builderMedal = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    /**
     * 构建奖牌外轮廓与贯穿镂空通孔
     */
    function buildMedalBody(medalGroup, shapeType, radiusX, radiusY, depth, cutoutRatio, primaryMat) {
        const shape = new THREE.Shape();
        let topY = radiusY + 3.0;

        if (shapeType === 'shield') {
            // (1) 赛事荣耀盾形 Shield
            const rx = radiusX;
            const ry = radiusY;
            shape.moveTo(-rx, ry * 0.88);
            shape.lineTo(rx, ry * 0.88);
            shape.lineTo(rx, ry * 0.15);
            shape.bezierCurveTo(rx, -ry * 0.50, rx * 0.45, -ry * 1.05, 0, -ry * 1.30);
            shape.bezierCurveTo(-rx * 0.45, -ry * 1.05, -rx, -ry * 0.50, -rx, ry * 0.15);
            shape.closePath();
            topY = ry * 0.88;

        } else if (shapeType === 'oval') {
            // (2) 经典长跑椭圆形 Oval
            const rx = radiusX * 0.82;
            const ry = radiusY * 1.18;
            shape.absellipse(0, 0, rx, ry, 0, Math.PI * 2, false, 0);
            topY = ry;

        } else if (shapeType === 'polygon') {
            // (3) 现代潮流电竞八边形 Polygon
            const sides = 8;
            const polyR = radiusX * 0.98;
            for (let i = 0; i < sides; i++) {
                const a = (i / sides) * Math.PI * 2 + Math.PI / sides;
                const px = Math.cos(a) * polyR;
                const py = Math.sin(a) * polyR;
                if (i === 0) shape.moveTo(px, py);
                else shape.lineTo(px, py);
            }
            shape.closePath();
            topY = polyR * Math.cos(Math.PI / 8);

        } else {
            // (4) 标准正圆跑马奖牌 Round: 70% 赛事经典大正圆
            shape.absarc(0, 0, radiusX, 0, Math.PI * 2, false);
            topY = radiusX;
        }

        // 若有镂空比例，在牌体中心生成真实贯穿透光的通孔 (Holes)
        if (cutoutRatio > 0.05) {
            const holePath = new THREE.Path();
            const scaleHole = Math.min(0.68, Math.sqrt(cutoutRatio) * 1.12);

            if (shapeType === 'shield') {
                const hrx = radiusX * scaleHole;
                const hry = radiusY * scaleHole;
                holePath.moveTo(-hrx, hry * 0.85);
                holePath.lineTo(hrx, hry * 0.85);
                holePath.bezierCurveTo(hrx, -hry * 0.5, 0, -hry * 1.2, 0, -hry * 1.2);
                holePath.bezierCurveTo(0, -hry * 1.2, -hrx, -hry * 0.5, -hrx, hry * 0.85);
                holePath.closePath();
            } else if (shapeType === 'oval') {
                holePath.absellipse(0, 0, radiusX * 0.82 * scaleHole, radiusY * 1.18 * scaleHole, 0, Math.PI * 2, false, 0);
            } else {
                holePath.absarc(0, 0, radiusX * scaleHole, 0, Math.PI * 2, true);
            }
            shape.holes.push(holePath);
        }

        const extrudeSettings = {
            depth: depth,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.6,
            bevelThickness: 0.6
        };
        const bodyGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        bodyGeo.center();
        const bodyMesh = new THREE.Mesh(bodyGeo, primaryMat);
        medalGroup.add(bodyMesh);

        return topY;
    }

    /**
     * 构建经典立体双麦穗月桂枝环绕与底座缎带蝴蝶结
     */
    function buildLaurelWreathAndBow(medalGroup, shapeType, radiusX, radiusY, depth, primaryMat, secondaryMat) {
        const wreathGroup = new THREE.Group();
        const leafPairs = 10;
        const leafGeo = new THREE.CylinderGeometry(0.3, 1.4, 4.2, 6);
        leafGeo.scale(1.0, 0.45, 1.0); // 榄核形立体微凸叶片

        const effRx = (shapeType === 'oval') ? radiusX * 0.82 : radiusX;
        const effRy = (shapeType === 'oval') ? radiusY * 1.18 : ((shapeType === 'shield') ? radiusY : radiusX);

        for (let i = 1; i <= leafPairs; i++) {
            const t = i / (leafPairs + 1);
            const angleLeft = -Math.PI / 2 + t * (Math.PI - 0.25);
            const angleRight = -Math.PI / 2 - t * (Math.PI - 0.25);
            const rxCur = effRx * 0.85;
            const ryCur = effRy * 0.85;

            // 左侧麦叶
            const leafL = new THREE.Mesh(leafGeo, secondaryMat);
            leafL.userData = { isSecondary: true };
            leafL.position.set(Math.cos(angleLeft) * rxCur, Math.sin(angleLeft) * ryCur, depth / 2 + 0.35);
            leafL.rotation.z = angleLeft + Math.PI / 3.8;
            wreathGroup.add(leafL);

            // 右侧麦叶
            const leafR = new THREE.Mesh(leafGeo, secondaryMat);
            leafR.userData = { isSecondary: true };
            leafR.position.set(Math.cos(angleRight) * rxCur, Math.sin(angleRight) * ryCur, depth / 2 + 0.35);
            leafR.rotation.z = angleRight - Math.PI / 3.8;
            wreathGroup.add(leafR);
        }

        // 6 点钟位置立体压铸缎带蝴蝶结 (Ribbon Bow)
        const bowGroup = new THREE.Group();
        bowGroup.position.set(0, -effRy * 0.86, depth / 2 + 0.40);

        const knotGeo = new THREE.BoxGeometry(2.4, 2.0, 1.6);
        const knotMesh = new THREE.Mesh(knotGeo, primaryMat);
        bowGroup.add(knotMesh);

        const bowLoopGeo = new THREE.TorusGeometry(2.2, 0.7, 8, 16);
        const loopL = new THREE.Mesh(bowLoopGeo, secondaryMat);
        loopL.userData = { isSecondary: true };
        loopL.position.set(-2.8, 0.2, 0);
        loopL.rotation.z = Math.PI / 5;
        bowGroup.add(loopL);

        const loopR = new THREE.Mesh(bowLoopGeo, secondaryMat);
        loopR.userData = { isSecondary: true };
        loopR.position.set(2.8, 0.2, 0);
        loopR.rotation.z = -Math.PI / 5;
        bowGroup.add(loopR);

        const tailGeo = new THREE.BoxGeometry(1.2, 4.5, 0.6);
        tailGeo.rotateZ(Math.PI / 8);
        const tailL = new THREE.Mesh(tailGeo, secondaryMat);
        tailL.userData = { isSecondary: true };
        tailL.position.set(-1.8, -2.5, -0.2);
        bowGroup.add(tailL);

        const tailR = new THREE.Mesh(tailGeo, secondaryMat);
        tailR.userData = { isSecondary: true };
        tailR.position.set(1.8, -2.5, -0.2);
        tailR.rotation.z = -Math.PI / 4;
        bowGroup.add(tailR);

        wreathGroup.add(bowGroup);
        medalGroup.add(wreathGroup);
    }

    /**
     * 构建正面中心荣耀主题浮雕 (立体双耳冠军奖杯)
     */
    function buildFrontEmblem(medalGroup, radiusX, radiusY, depth, cutoutRatio, reliefKey, primaryMat, secondaryMat, sandblastMat) {
        if (cutoutRatio >= 0.35) return;

        const reliefGroup = new THREE.Group();
        const reliefH = reliefKey === 'high-3d' ? 1.6 : (reliefKey === 'flat-2d' ? 0.10 : 0.90);

        if (reliefKey === 'flat-2d') {
            const enamelMedalMat = new THREE.MeshStandardMaterial({
                color: 0x881337,
                roughness: 0.12,
                metalness: 0.15
            });
            const emblemGeo = new THREE.CylinderGeometry(radiusX * 0.48, radiusX * 0.48, 0.12, 36);
            emblemGeo.rotateX(Math.PI / 2);
            const emblemMesh = new THREE.Mesh(emblemGeo, enamelMedalMat);
            emblemMesh.userData = { isEnamel: true };
            emblemMesh.position.z = depth / 2 + 0.06;
            reliefGroup.add(emblemMesh);

        } else {
            // 正面下沉圆台 (Recessed Medallion Disc)
            const dishGeo = new THREE.CylinderGeometry(radiusX * 0.54, radiusX * 0.54, 0.35, 48);
            dishGeo.rotateX(Math.PI / 2);
            const dishMesh = new THREE.Mesh(dishGeo, sandblastMat);
            dishMesh.userData = { isSandblast: true };
            dishMesh.position.z = depth / 2 + 0.15;
            reliefGroup.add(dishMesh);

            // 中央三维冠军奖杯 (3D Champion Trophy Cup)
            const trophyGroup = new THREE.Group();
            trophyGroup.position.set(0, -radiusY * 0.05, depth / 2 + 0.35);

            // 奖杯底座
            const baseGeo = new THREE.BoxGeometry(radiusX * 0.28, 2.5, reliefH * 0.8);
            const trophyBase = new THREE.Mesh(baseGeo, secondaryMat);
            trophyBase.userData = { isSecondary: true };
            trophyBase.position.y = -radiusY * 0.25;
            trophyGroup.add(trophyBase);

            // 奖杯高脚支柱
            const stemGeo = new THREE.CylinderGeometry(1.2, 1.6, radiusY * 0.15, 12);
            const stemMesh = new THREE.Mesh(stemGeo, primaryMat);
            stemMesh.position.y = -radiusY * 0.15;
            trophyGroup.add(stemMesh);

            // 奖杯圆口杯身
            const cupGeo = new THREE.CylinderGeometry(radiusX * 0.22, radiusX * 0.12, radiusY * 0.32, 16);
            const cupMesh = new THREE.Mesh(cupGeo, secondaryMat);
            cupMesh.userData = { isSecondary: true };
            cupMesh.position.y = radiusY * 0.08;
            trophyGroup.add(cupMesh);

            // 左右双耳把手
            const handleGeo = new THREE.TorusGeometry(radiusX * 0.12, 0.8, 8, 16, Math.PI);
            const handleL = new THREE.Mesh(handleGeo, primaryMat);
            handleL.position.set(-radiusX * 0.22, radiusY * 0.08, 0);
            handleL.rotation.z = Math.PI / 2;
            trophyGroup.add(handleL);

            const handleR = new THREE.Mesh(handleGeo, primaryMat);
            handleR.position.set(radiusX * 0.22, radiusY * 0.08, 0);
            handleR.rotation.z = -Math.PI / 2;
            trophyGroup.add(handleR);

            // 奖杯中心立体五角星
            const starGeo = new THREE.DodecahedronGeometry(radiusX * 0.11);
            starGeo.scale(1.0, 1.0, 0.5);
            const starMesh = new THREE.Mesh(starGeo, primaryMat);
            starMesh.position.set(0, radiusY * 0.08, reliefH * 0.5);
            trophyGroup.add(starMesh);

            reliefGroup.add(trophyGroup);
        }

        medalGroup.add(reliefGroup);
    }

    /**
     * 构建背面微喷砂激光刻字板与工贸字条
     */
    function buildBackLaserPad(medalGroup, radiusX, depth, primaryMat, sandblastMat) {
        const backPadGeo = new THREE.CylinderGeometry(radiusX * 0.65, radiusX * 0.65, 0.25, 48);
        backPadGeo.rotateX(Math.PI / 2);
        const backPadMesh = new THREE.Mesh(backPadGeo, sandblastMat);
        backPadMesh.userData = { isSandblast: true };
        backPadMesh.position.z = -depth / 2 - 0.12;
        medalGroup.add(backPadMesh);

        const textLineGeo = new THREE.BoxGeometry(radiusX * 0.72, 1.2, 0.2);
        for (let l = -1; l <= 1; l++) {
            const lineMesh = new THREE.Mesh(textLineGeo, primaryMat);
            lineMesh.position.set(0, l * 6.5, -depth / 2 - 0.25);
            medalGroup.add(lineMesh);
        }
    }

    /**
     * 构建顶部一体连体雕花穿带吊梁 vs 跳环
     */
    function buildCrownHanger(radiusX, depth, topY, loopKey, primaryMat, secondaryMat) {
        const loopAnchorGroup = new THREE.Group();
        loopAnchorGroup.position.set(0, topY, 0);

        if (loopKey === 'jump-ring') {
            // 外接开口细铁丝跳环
            const eyeletGeo = new THREE.CylinderGeometry(2.5, 2.5, depth, 16);
            eyeletGeo.rotateX(Math.PI / 2);
            const eyeletMesh = new THREE.Mesh(eyeletGeo, primaryMat);
            eyeletMesh.position.y = 1.8;
            loopAnchorGroup.add(eyeletMesh);

            const wireGeo = new THREE.TorusGeometry(4.6, 0.8, 12, 28, Math.PI * 1.85); // 留开口
            const wireMesh = new THREE.Mesh(wireGeo, secondaryMat);
            wireMesh.userData = { isSecondary: true };
            wireMesh.position.y = 5.2;
            loopAnchorGroup.add(wireMesh);

        } else {
            // 一体压铸欧式巴洛克雕花连体吊梁 (Crown Hanger with Ribbon Slot)
            const crownW = Math.min(48, radiusX * 0.85);
            const crownH = 10.0;
            const slotW = Math.min(28, crownW * 0.68);
            const slotH = 4.2;

            const crownShape = new THREE.Shape();
            crownShape.moveTo(-crownW / 2, 0);
            crownShape.lineTo(crownW / 2, 0);
            crownShape.bezierCurveTo(crownW * 0.52, crownH * 0.6, crownW * 0.35, crownH * 1.05, 0, crownH);
            crownShape.bezierCurveTo(-crownW * 0.35, crownH * 1.05, -crownW * 0.52, crownH * 0.6, -crownW / 2, 0);
            crownShape.closePath();

            // 扁平横穿带槽孔
            const slotPath = new THREE.Path();
            const sw = slotW / 2;
            const sh = slotH / 2;
            const slotCenterY = crownH * 0.52;
            slotPath.moveTo(-sw + 1, slotCenterY - sh);
            slotPath.lineTo(sw - 1, slotCenterY - sh);
            slotPath.bezierCurveTo(sw, slotCenterY - sh, sw, slotCenterY + sh, sw - 1, slotCenterY + sh);
            slotPath.lineTo(-sw + 1, slotCenterY + sh);
            slotPath.bezierCurveTo(-sw, slotCenterY + sh, -sw, slotCenterY - sh, -sw + 1, slotCenterY - sh);
            slotPath.closePath();
            crownShape.holes.push(slotPath);

            const crownGeo = new THREE.ExtrudeGeometry(crownShape, {
                depth: depth * 1.05,
                bevelEnabled: true,
                bevelSegments: 2,
                steps: 1,
                bevelSize: 0.45,
                bevelThickness: 0.45
            });
            crownGeo.center();

            const crownMesh = new THREE.Mesh(crownGeo, primaryMat);
            crownMesh.position.y = crownH / 2;
            loopAnchorGroup.add(crownMesh);

            // 巴洛克两侧卷叶浮雕加强筋 (Acanthus Scrolls)
            const scrollGeo = new THREE.TorusGeometry(3.5, 0.9, 8, 16, Math.PI * 1.2);
            const scrollL = new THREE.Mesh(scrollGeo, secondaryMat);
            scrollL.userData = { isSecondary: true };
            scrollL.position.set(-crownW * 0.38, crownH * 0.45, 0);
            scrollL.rotation.z = Math.PI / 3;
            loopAnchorGroup.add(scrollL);

            const scrollR = new THREE.Mesh(scrollGeo, secondaryMat);
            scrollR.userData = { isSecondary: true };
            scrollR.position.set(crownW * 0.38, crownH * 0.45, 0);
            scrollR.rotation.z = -Math.PI / 3;
            loopAnchorGroup.add(scrollR);
        }

        return loopAnchorGroup;
    }

    /**
     * 构建柔性 V 字形挂带
     */
    function buildNeckRibbon(medalGroup, topY, loopKey, ribbonKey) {
        if (ribbonKey === 'none') return;

        const ribbonMat = new THREE.MeshStandardMaterial({
            color: 0x1E3A8A,
            roughness: 0.85,
            metalness: 0.05,
            side: THREE.DoubleSide
        });

        const ribbonSlotY = (loopKey === 'jump-ring') ? topY + 5.5 : topY + 5.2;

        // 左侧 V 字形延伸织带
        const leftRibbonCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-4, ribbonSlotY, 0),
            new THREE.Vector3(-15, ribbonSlotY + 26, -12),
            new THREE.Vector3(-26, ribbonSlotY + 68, -32)
        ]);
        const leftRibbonGeo = new THREE.TubeGeometry(leftRibbonCurve, 24, 2.6, 6, false);
        leftRibbonGeo.scale(1.0, 0.35, 1.0);
        const leftRibbonMesh = new THREE.Mesh(leftRibbonGeo, ribbonMat);
        leftRibbonMesh.userData = { isRibbon: true };
        medalGroup.add(leftRibbonMesh);

        // 右侧 V 字形延伸织带
        const rightRibbonCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(4, ribbonSlotY, 0),
            new THREE.Vector3(15, ribbonSlotY + 26, -12),
            new THREE.Vector3(26, ribbonSlotY + 68, -32)
        ]);
        const rightRibbonGeo = new THREE.TubeGeometry(rightRibbonCurve, 24, 2.6, 6, false);
        rightRibbonGeo.scale(1.0, 0.35, 1.0);
        const rightRibbonMesh = new THREE.Mesh(rightRibbonGeo, ribbonMat);
        rightRibbonMesh.userData = { isRibbon: true };
        medalGroup.add(rightRibbonMesh);
    }

    /**
     * 3D 赛事奖牌整体装配主函数
     */
    function buildProceduralMedal(shapeType, lengthMm, widthMm, thicknessMm, cutoutRatio, loopKey, ribbonKey, reliefKey, materialFactory) {
        const medalGroup = new THREE.Group();
        const primaryMat = materialFactory(false, 'smooth');
        const secondaryMat = materialFactory(true, 'smooth');
        const sandblastMat = materialFactory(false, 'sandblast');

        const radiusX = lengthMm / 2.0;
        const radiusY = widthMm / 2.0;
        const depth = thicknessMm;

        // 1. 牌体轮廓与镂空
        const topY = buildMedalBody(medalGroup, shapeType, radiusX, radiusY, depth, cutoutRatio, primaryMat);

        // 2. 双麦穗月桂枝与 6 点钟蝴蝶结
        buildLaurelWreathAndBow(medalGroup, shapeType, radiusX, radiusY, depth, primaryMat, secondaryMat);

        // 3. 正面荣耀主题浮雕 (冠军双耳奖杯)
        buildFrontEmblem(medalGroup, radiusX, radiusY, depth, cutoutRatio, reliefKey, primaryMat, secondaryMat, sandblastMat);

        // 4. 背面激光微喷砂刻字板
        buildBackLaserPad(medalGroup, radiusX, depth, primaryMat, sandblastMat);

        // 5. 顶部一体压铸雕花吊梁 / 跳环
        const loopAnchorGroup = buildCrownHanger(radiusX, depth, topY, loopKey, primaryMat, secondaryMat);
        medalGroup.add(loopAnchorGroup);

        // 6. 柔性 V 字形挂带
        buildNeckRibbon(medalGroup, topY, loopKey, ribbonKey);

        medalGroup.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        return {
            medalGroup,
            loopAnchorGroup
        };
    }

    return {
        buildProceduralMedal
    };

}));
