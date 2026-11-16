/**
 * Medal & Coin Weight Estimator - Assembly & Mesh Manager (Orchestrator)
 * 3D 挑战币与赛事奖牌装配管理器：协调材质系统 (materials.js)、挑战币生成器 (builder-coin.js) 与奖牌生成器 (builder-medal.js)
 * 纯净精简架构，轻量解耦，便于长期工程扩展与车间模具定制
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(
            require('./materials.js'),
            require('./builder-coin.js'),
            require('./builder-medal.js')
        );
    } else {
        root.MedalCoinLab = root.MedalCoinLab || {};
        root.MedalCoinLab.assembly = factory(
            root.MedalCoinLab.materials,
            root.MedalCoinLab.builderCoin,
            root.MedalCoinLab.builderMedal
        );
    }
}(typeof self !== 'undefined' ? self : this, function (materialsModule, coinBuilderModule, medalBuilderModule) {

    class MetalAssembly {
        constructor(sceneManager) {
            this.sceneManager = sceneManager;
            this.group = sceneManager.modelGroup;

            this.currentCategory = 'coin'; // 'coin' | 'medal'
            this.currentFinish = 'gold';
            this.isWireframe = false;

            this.currentMesh = null;
            this.loopAnchorGroup = null;
            this.isAnimatingShock = false;

            // 模块依赖绑定 (支持浏览器全局与 CommonJS)
            this.materials = materialsModule || (typeof MedalCoinLab !== 'undefined' ? MedalCoinLab.materials : null);
            this.builderCoin = coinBuilderModule || (typeof MedalCoinLab !== 'undefined' ? MedalCoinLab.builderCoin : null);
            this.builderMedal = medalBuilderModule || (typeof MedalCoinLab !== 'undefined' ? MedalCoinLab.builderMedal : null);
        }

        /**
         * 代理创建 PBR 金属材质
         */
        createMetalMaterial(finishKey, isSecondary = false, textureType = 'smooth') {
            if (this.materials && this.materials.createMetalMaterial) {
                return this.materials.createMetalMaterial(finishKey, isSecondary, textureType, this.isWireframe);
            }
            return new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.9, roughness: 0.2, wireframe: this.isWireframe });
        }

        /**
         * 动态切换真金属电镀光泽与换色
         */
        setFinish(finishKey) {
            this.currentFinish = finishKey;
            const primaryMat = this.createMetalMaterial(finishKey, false, 'smooth');
            const secondaryMat = this.createMetalMaterial(finishKey, true, 'smooth');
            const guillocheMat = this.createMetalMaterial(finishKey, false, 'guilloche');
            const sandblastMat = this.createMetalMaterial(finishKey, false, 'sandblast');

            if (this.currentMesh) {
                this.currentMesh.traverse(child => {
                    if (child.isMesh) {
                        if (child.userData && child.userData.isRibbon) return;
                        if (child.userData && child.userData.isEnamel) return;

                        if (child.userData && child.userData.isGuilloche) {
                            child.material = guillocheMat;
                        } else if (child.userData && child.userData.isSandblast) {
                            child.material = sandblastMat;
                        } else if (child.userData && child.userData.isSecondary) {
                            child.material = secondaryMat;
                        } else {
                            child.material = primaryMat;
                        }
                    }
                });
            }
        }

        /**
         * 切换线框透视调试模式
         */
        toggleWireframe() {
            this.isWireframe = !this.isWireframe;
            this.setFinish(this.currentFinish);
            return this.isWireframe;
        }

        /**
         * 装配 3D 挑战币模型 (委托至 builder-coin.js)
         */
        updateProceduralCoin(diameterMm, thicknessMm, edgeKey, reliefKey) {
            this.currentCategory = 'coin';
            if (this.currentMesh) {
                this.group.remove(this.currentMesh);
                this.currentMesh = null;
            }

            const materialFactory = (isSec, texType) => this.createMetalMaterial(this.currentFinish, isSec, texType);
            this.currentMesh = this.builderCoin.buildProceduralCoin(diameterMm, thicknessMm, edgeKey, reliefKey, materialFactory);
            this.group.add(this.currentMesh);
        }

        /**
         * 装配 3D 赛事奖牌模型 (委托至 builder-medal.js)
         */
        updateProceduralMedal(shapeType, lengthMm, widthMm, thicknessMm, cutoutRatio, loopKey, ribbonKey, reliefKey = 'semi-3d') {
            this.currentCategory = 'medal';
            if (this.currentMesh) {
                this.group.remove(this.currentMesh);
                this.currentMesh = null;
            }

            const materialFactory = (isSec, texType) => this.createMetalMaterial(this.currentFinish, isSec, texType);
            const { medalGroup, loopAnchorGroup } = this.builderMedal.buildProceduralMedal(
                shapeType, lengthMm, widthMm, thicknessMm, cutoutRatio, loopKey, ribbonKey, reliefKey, materialFactory
            );

            this.currentMesh = medalGroup;
            this.loopAnchorGroup = loopAnchorGroup;
            this.group.add(this.currentMesh);
        }

        /**
         * 跑者冲线欢呼跳跃 (2.5G Shock) 动载物理动画与安全光晕
         */
        triggerJumpingShockTest(safetyFactor) {
            if (this.isAnimatingShock) return;
            this.isAnimatingShock = true;

            const startTime = performance.now();
            const durationMs = 1800;
            const originalY = this.group.position.y;

            // 挂环处动载受力发光光圈指示
            const isSafe = safetyFactor >= 3.0;
            const ringColor = isSafe ? 0x10B981 : 0xEF4444;

            const ringGeo = new THREE.RingGeometry(5.5, 9.5, 32);
            const ringMat = new THREE.MeshBasicMaterial({
                color: ringColor,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.85
            });
            const shockHalo = new THREE.Mesh(ringGeo, ringMat);
            if (this.loopAnchorGroup) {
                shockHalo.position.set(0, 0, 0.5);
                this.loopAnchorGroup.add(shockHalo);
            }

            const animateShock = (time) => {
                const elapsed = time - startTime;
                if (elapsed < durationMs) {
                    const t = elapsed / durationMs;
                    // 阻尼正弦衰减振动: A * e^(-damping * t) * sin(frequency * t)
                    const amp = 18.0 * Math.exp(-3.2 * t);
                    const yOffset = amp * Math.sin(t * Math.PI * 10);
                    this.group.position.y = originalY + yOffset;

                    // 光圈脉冲频闪
                    shockHalo.scale.setScalar(1.0 + Math.sin(t * Math.PI * 12) * 0.35);
                    shockHalo.material.opacity = Math.max(0.1, 1.0 - t * 0.8);

                    requestAnimationFrame(animateShock);
                } else {
                    this.group.position.y = originalY;
                    if (this.loopAnchorGroup) {
                        this.loopAnchorGroup.remove(shockHalo);
                    }
                    this.isAnimatingShock = false;
                }
            };

            requestAnimationFrame(animateShock);
        }

        /**
         * 载入外部 STL / OBJ 真实网格资产
         */
        loadCustomMesh(positions, bounds) {
            if (this.currentMesh) {
                this.group.remove(this.currentMesh);
                this.currentMesh = null;
            }

            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geo.computeVertexNormals();

            // 中心居中归一
            const midX = (bounds.min.x + bounds.max.x) / 2.0;
            const midY = (bounds.min.y + bounds.max.y) / 2.0;
            const midZ = (bounds.min.z + bounds.max.z) / 2.0;
            geo.translate(-midX, -midY, -midZ);

            const mat = this.createMetalMaterial(this.currentFinish, false, 'smooth');
            this.currentMesh = new THREE.Mesh(geo, mat);
            this.currentMesh.castShadow = true;
            this.currentMesh.receiveShadow = true;
            this.group.add(this.currentMesh);
        }
    }

    return {
        MetalAssembly
    };

}));
