/**
 * Medal & Coin Weight Estimator - Three.js Scene & Caliper Inspection Manager
 * 暗黑工业五金 3D 视窗、摄影棚中性掠光、剖切透视与数显游标卡尺高精测厚系统
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.MedalCoinLab = root.MedalCoinLab || {};
        root.MedalCoinLab.scene = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    class LabScene {
        constructor(containerElement) {
            this.container = containerElement;
            this.scene = null;
            this.camera = null;
            this.renderer = null;
            this.controls = null;
            this.modelGroup = null;
            this.caliperGroup = null;

            // 剖切平面 (沿着 Z 轴剖切半边观察内部浮雕与底板)
            this.clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
            this.isClippingEnabled = false;

            // 慢速平稳自转控制
            this.isAutoRotating = true;
            this.autoRotateSpeed = 0.008;

            // 游标卡尺测量状态
            this.isCaliperVisible = false;
            this.currentMeasuredThickness = 3.5;

            this.init();
        }

        init() {
            if (typeof THREE === 'undefined') {
                console.error("Three.js not found! Please check script tags.");
                return;
            }

            const width = this.container.clientWidth || 600;
            const height = this.container.clientHeight || 480;

            // 1. 场景
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x070B12); // 深邃科技工业黑

            // 2. 相机
            this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
            this.camera.position.set(0, 35, 140);

            // 3. WebGL 渲染器 (高精对数深度缓冲，开启局部剖切)
            this.renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
                preserveDrawingBuffer: true,
                logarithmicDepthBuffer: true
            });
            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.outputEncoding = THREE.sRGBEncoding;
            this.renderer.localClippingEnabled = true;

            this.container.innerHTML = '';
            this.container.appendChild(this.renderer.domElement);

            // 4. 轨道控制器
            if (typeof THREE.OrbitControls !== 'undefined') {
                this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                this.controls.enableDamping = true;
                this.controls.dampingFactor = 0.05;
                this.controls.minDistance = 35;
                this.controls.maxDistance = 320;
                this.controls.target.set(0, 0, 0);

                // 用户手动交互时暂停自动旋转，释放后平滑恢复
                this.controls.addEventListener('start', () => {
                    this.userInteracting = true;
                });
                this.controls.addEventListener('end', () => {
                    this.userInteracting = false;
                });
            }

            // 5. 摄影棚级五金 PBR 照明 (纯净柔光箱 + 轮廓光)
            this.setupLighting();

            // 6. 辅助地网
            const gridHelper = new THREE.GridHelper(160, 16, 0x1E293B, 0x0F172A);
            gridHelper.position.y = -40;
            this.scene.add(gridHelper);

            // 7. 装配总容器
            this.modelGroup = new THREE.Group();
            this.scene.add(this.modelGroup);

            // 8. 虚拟数显游标卡尺测厚组件 (D203 实测流)
            this.initDigitalCaliper();

            // 9. 窗口重置监听与渲染主循环
            window.addEventListener('resize', () => this.onWindowResize());
            this.animate = this.animate.bind(this);
            this.animate();
        }

        setupLighting() {
            // 基础环境漫射光 (中性纯白)
            const ambient = new THREE.AmbientLight(0x475569, 0.8);
            this.scene.add(ambient);

            // 主掠光 (高亮纯白柔光箱，打出正面浮雕与真金属边缘高反光)
            const keyLight = new THREE.DirectionalLight(0xFFFFFF, 2.4);
            keyLight.position.set(50, 75, 75);
            keyLight.castShadow = true;
            this.scene.add(keyLight);

            // 侧部暖柔补光
            const fillLight = new THREE.DirectionalLight(0xFFFBEB, 1.2);
            fillLight.position.set(-65, 45, 55);
            this.scene.add(fillLight);

            // 背部高亮轮廓光 (专门刻画挑战币 6 种滚齿细节与边缘倒角)
            const rimLight = new THREE.DirectionalLight(0xF8FAFC, 2.2);
            rimLight.position.set(0, 85, -65);
            this.scene.add(rimLight);

            // 摄影棚级高精环境反射贴图 (真金属珠宝级高光流转)
            this.setupStudioEnvironment();
        }

        setupStudioEnvironment() {
            try {
                if (typeof document === 'undefined') return;
                const canvas = document.createElement('canvas');
                canvas.width = 512;
                canvas.height = 256;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                // 深灰蓝渐变工作室暗调天幕
                const bgGrad = ctx.createLinearGradient(0, 0, 0, 256);
                bgGrad.addColorStop(0, '#1e293b');
                bgGrad.addColorStop(0.35, '#0f172a');
                bgGrad.addColorStop(0.7, '#090d16');
                bgGrad.addColorStop(1, '#020617');
                ctx.fillStyle = bgGrad;
                ctx.fillRect(0, 0, 512, 256);

                // 顶部高光柔光箱 (带暖金色泽的摄影棚主灯)
                const softboxTop = ctx.createRadialGradient(256, 50, 2, 256, 50, 110);
                softboxTop.addColorStop(0, '#ffffff');
                softboxTop.addColorStop(0.25, '#fffbeb');
                softboxTop.addColorStop(0.6, '#64748b');
                softboxTop.addColorStop(1, 'transparent');
                ctx.fillStyle = softboxTop;
                ctx.fillRect(140, 0, 232, 130);

                // 左侧大反光板 (冷白)
                const softboxLeft = ctx.createRadialGradient(70, 110, 2, 70, 110, 85);
                softboxLeft.addColorStop(0, '#ffffff');
                softboxLeft.addColorStop(0.4, '#94a3b8');
                softboxLeft.addColorStop(1, 'transparent');
                ctx.fillStyle = softboxLeft;
                ctx.fillRect(0, 25, 160, 170);

                // 右侧大反光板 (纯白侧光)
                const softboxRight = ctx.createRadialGradient(440, 110, 2, 440, 110, 85);
                softboxRight.addColorStop(0, '#ffffff');
                softboxRight.addColorStop(0.4, '#94a3b8');
                softboxRight.addColorStop(1, 'transparent');
                ctx.fillStyle = softboxRight;
                ctx.fillRect(350, 25, 162, 170);

                // 地平线反光带 (为金属滚花倒角产生极度锐利的高光切线)
                const strip = ctx.createLinearGradient(0, 120, 512, 120);
                strip.addColorStop(0, 'rgba(255,255,255,0.15)');
                strip.addColorStop(0.25, 'rgba(255,255,255,0.65)');
                strip.addColorStop(0.5, 'rgba(255,255,255,0.95)');
                strip.addColorStop(0.75, 'rgba(255,255,255,0.65)');
                strip.addColorStop(1, 'rgba(255,255,255,0.15)');
                ctx.fillStyle = strip;
                ctx.fillRect(0, 116, 512, 8);

                const canvasTexture = new THREE.CanvasTexture(canvas);
                canvasTexture.mapping = THREE.EquirectangularReflectionMapping;

                if (this.renderer && THREE.PMREMGenerator) {
                    const pmrem = new THREE.PMREMGenerator(this.renderer);
                    pmrem.compileEquirectangularShader();
                    const envRenderTarget = pmrem.fromEquirectangular(canvasTexture);
                    this.scene.environment = envRenderTarget.texture;
                    pmrem.dispose();
                } else {
                    this.scene.environment = canvasTexture;
                }
            } catch (e) {
                console.warn("Studio Environment setup fallback:", e);
            }
        }

        /**
         * 构建高精 3D 数显游标卡尺 (Digital Vernier Caliper)
         * 卡爪从 3 点钟方向咬合币/牌外缘，沿 Z 轴厚度方向精确开合贴合正反两面
         */
        initDigitalCaliper() {
            this.caliperGroup = new THREE.Group();
            this.caliperGroup.visible = false;

            const steelMat = new THREE.MeshStandardMaterial({
                color: 0xE2E8F0,
                metalness: 0.92,
                roughness: 0.18
            });

            const darkMat = new THREE.MeshStandardMaterial({
                color: 0x1E293B,
                metalness: 0.5,
                roughness: 0.4
            });

            // 主梁 (沿着 X 轴向右延伸，置于工件后方 Z < 0)
            const beamGeo = new THREE.BoxGeometry(100, 7, 4);
            beamGeo.translate(50, 8, -6);
            const beamMesh = new THREE.Mesh(beamGeo, steelMat);
            this.caliperGroup.add(beamMesh);

            // 定卡爪 (固定在主梁基底，下探并贴合在工件背面 Z = -T/2)
            this.fixedJawMesh = new THREE.Mesh(new THREE.BoxGeometry(8, 32, 4), steelMat);
            this.fixedJawMesh.position.set(0, -6, -2);
            this.caliperGroup.add(this.fixedJawMesh);

            // 动卡爪滑块组件 (沿着 Z 轴滑动开合)
            this.slidingJawGroup = new THREE.Group();

            // 滑块壳体
            const sliderBodyGeo = new THREE.BoxGeometry(22, 16, 8);
            sliderBodyGeo.translate(11, 8, 0);
            const sliderBodyMesh = new THREE.Mesh(sliderBodyGeo, darkMat);
            this.slidingJawGroup.add(sliderBodyMesh);

            // 动卡爪本体 (下探贴合在工件正面 Z = +T/2)
            const movJawGeo = new THREE.BoxGeometry(8, 32, 4);
            movJawGeo.translate(0, -6, 2);
            const movJawMesh = new THREE.Mesh(movJawGeo, steelMat);
            this.slidingJawGroup.add(movJawMesh);

            // 数显 LCD 液晶读数屏幕 (位于正面滑块上)
            this.caliperCanvas = document.createElement('canvas');
            this.caliperCanvas.width = 256;
            this.caliperCanvas.height = 128;
            this.caliperTexture = new THREE.CanvasTexture(this.caliperCanvas);

            const screenMat = new THREE.MeshBasicMaterial({ map: this.caliperTexture });
            const screenGeo = new THREE.PlaneGeometry(14, 7);
            screenGeo.translate(11, 8, 4.05);
            const screenMesh = new THREE.Mesh(screenGeo, screenMat);
            this.slidingJawGroup.add(screenMesh);

            this.caliperGroup.add(this.slidingJawGroup);
            this.scene.add(this.caliperGroup);

            this.updateCaliperPosition(22.5, 3.5);
        }

        /**
         * 动态调整卡尺空间坐标，实现严丝合缝的自适应边缘咬合
         * @param {number} outerRadiusMm 工件实时外径半径 mm
         * @param {number} thicknessMm 工件实时厚度 mm
         */
        updateCaliperPosition(outerRadiusMm, thicknessMm) {
            this.currentMeasuredThickness = thicknessMm;
            const halfT = Math.max(0.5, thicknessMm / 2.0);

            // 1. 卡尺基准点严格贴合在工件右侧边缘 (X = outerRadiusMm - 2mm 咬入感)
            if (this.caliperGroup) {
                this.caliperGroup.position.set(outerRadiusMm - 2.5, 0, 0);
            }

            // 2. 定卡爪紧贴背面
            if (this.fixedJawMesh) {
                this.fixedJawMesh.position.z = -halfT - 2.0;
            }

            // 3. 动卡爪滑块平移至正面
            if (this.slidingJawGroup) {
                this.slidingJawGroup.position.z = halfT;
            }

            // 4. 刷新电子液晶屏读数 (公英制双显)
            if (this.caliperCanvas) {
                const ctx = this.caliperCanvas.getContext('2d');
                ctx.fillStyle = '#6EE7B7'; // 经典微绿数显背光
                ctx.fillRect(0, 0, 256, 128);

                ctx.fillStyle = '#064E3B';
                ctx.font = 'bold 52px "Courier New", monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${thicknessMm.toFixed(2)} mm`, 128, 44);

                const inchVal = (thicknessMm / 25.4).toFixed(3);
                ctx.font = 'bold 30px "Courier New", monospace';
                ctx.fillText(`${inchVal} in`, 128, 94);

                if (this.caliperTexture) {
                    this.caliperTexture.needsUpdate = true;
                }
            }
        }

        updateCaliperReading(thicknessMm) {
            // 兼容容错别名
            if (this.currentOuterRadiusMm) {
                this.updateCaliperPosition(this.currentOuterRadiusMm, thicknessMm);
            }
        }

        /**
         * 切换数显卡尺咬合测厚显示
         */
        toggleCaliper() {
            this.isCaliperVisible = !this.isCaliperVisible;
            if (this.caliperGroup) {
                this.caliperGroup.visible = this.isCaliperVisible;
            }

            // 开启卡尺时工件归正并暂时暂停自转，确保卡爪咬合稳定
            if (this.isCaliperVisible) {
                if (this.modelGroup) {
                    this.modelGroup.rotation.y = 0;
                }
                this.wasAutoRotatingBeforeCaliper = this.isAutoRotating;
                this.isAutoRotating = false;
            } else {
                if (this.wasAutoRotatingBeforeCaliper !== undefined) {
                    this.isAutoRotating = this.wasAutoRotatingBeforeCaliper;
                }
            }

            return this.isCaliperVisible;
        }

        /**
         * 切换剖切观察 (Cross-Section)
         */
        toggleClipping() {
            this.isClippingEnabled = !this.isClippingEnabled;
            const planes = this.isClippingEnabled ? [this.clipPlane] : [];
            this.applyClippingPlanes(this.modelGroup, planes);
            return this.isClippingEnabled;
        }

        applyClippingPlanes(group, planes) {
            if (!group) return;
            group.traverse(child => {
                if (child.isMesh && child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => {
                            m.clippingPlanes = planes;
                            m.clipShadows = true;
                        });
                    } else {
                        child.material.clippingPlanes = planes;
                        child.material.clipShadows = true;
                    }
                }
            });
        }

        toggleAutoRotate() {
            this.isAutoRotating = !this.isAutoRotating;
            return this.isAutoRotating;
        }

        resetCamera(category = 'coin') {
            if (this.controls) {
                this.controls.reset();
                if (category === 'medal') {
                    this.controls.target.set(0, 12, 0);
                } else {
                    this.controls.target.set(0, 0, 0);
                }
            }
            if (category === 'medal') {
                this.camera.position.set(0, 42, 185);
            } else {
                this.camera.position.set(0, 35, 130);
            }
        }

        getCanvasDataURL() {
            if (!this.renderer) return null;
            this.renderer.render(this.scene, this.camera);
            return this.renderer.domElement.toDataURL('image/png');
        }

        onWindowResize() {
            if (!this.container || !this.renderer || !this.camera) return;
            const width = this.container.clientWidth;
            const height = this.container.clientHeight;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }

        animate() {
            this.animationId = requestAnimationFrame(this.animate);

            // 平稳自转 (当用户没有拖拽且开启自转时)
            if (this.isAutoRotating && !this.userInteracting && this.modelGroup) {
                this.modelGroup.rotation.y += this.autoRotateSpeed;
            }

            if (this.controls) {
                this.controls.update();
            }

            this.renderer.render(this.scene, this.camera);
        }
    }

    return {
        LabScene
    };

}));
