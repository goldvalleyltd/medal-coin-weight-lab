/**
 * Medal & Coin Weight Estimator - Main Application Controller
 * Bilingual (EN/ZH), Metric + Imperial dual-unit readouts, 3D CAD Viewport & Native <dialog> Report Export
 */

document.addEventListener('DOMContentLoaded', () => {
    const presets = window.MedalCoinLab.presets;
    const geometry = window.MedalCoinLab.geometry;
    const physics = window.MedalCoinLab.physics;
    const shipping = window.MedalCoinLab.shipping;
    const LabScene = window.MedalCoinLab.scene.LabScene;
    const MetalAssembly = window.MedalCoinLab.assembly.MetalAssembly;
    const materials = window.MedalCoinLab.materials;
    const loader = window.MedalCoinLab.loader;
    const report = window.MedalCoinLab.report;

    // 1. Global Application State
    const state = {
        lang: 'en',              // 'en' (default for global B2B) | 'zh'
        category: 'coin',        // 'coin' | 'medal'
        mode: 'quick',           // 'quick' | 'pro'
        material: 'zn-zamak3',
        finish: 'gold',
        orderQty: 500,

        // Challenge Coin Parameters
        coinDiameterMm: 45.0,
        coinThicknessMm: 3.5,
        coinRelief: 'semi-3d',
        coinEdge: 'flat',

        // Sports Medal Parameters
        medalShape: 'round',
        medalLengthMm: 70.0,
        medalWidthMm: 70.0,
        medalThicknessMm: 4.0,
        medalCutoutPercent: 0,
        medalLoop: 'cast-loop',
        medalRibbon: 'sub-30',

        // Pro 3D Mesh State
        customMesh: null,
        latestEval: null
    };

    // 2. Initialize 3D Scene & Assembly
    const canvasContainer = document.getElementById('three-canvas-container');
    const sceneManager = new LabScene(canvasContainer);
    const assembly = new MetalAssembly(sceneManager);

    // 3. Language Switching Engine (EN / 中文)
    const btnLangToggle = document.getElementById('btn-lang-toggle');
    const langToggleLabel = document.getElementById('lang-toggle-label');

    function applyLanguage(lang) {
        state.lang = lang;
        const isZh = (lang === 'zh');
        document.documentElement.lang = isZh ? 'zh-CN' : 'en';
        if (langToggleLabel) {
            langToggleLabel.textContent = isZh ? 'EN' : '中文';
        }

        // Update all static elements with data-i18n-en / data-i18n-zh
        document.querySelectorAll('[data-i18n-en]').forEach(el => {
            const targetText = isZh ? el.getAttribute('data-i18n-zh') : el.getAttribute('data-i18n-en');
            if (!targetText) return;
            if (targetText.includes('<br>')) {
                el.innerHTML = targetText;
            } else {
                el.textContent = targetText;
            }
        });

        // Update Custom Mesh empty prompt if no mesh loaded
        if (!state.customMesh) {
            const nameEl = document.getElementById('pro-mesh-name');
            const statsEl = document.getElementById('pro-mesh-stats');
            if (nameEl) nameEl.textContent = isZh ? '尚未载入外部网格' : 'No 3D Mesh Loaded Yet';
            if (statsEl) statsEl.textContent = isZh ? '请点击上方示例模型或拖入本地 CAD 文件' : 'Select a benchmark STL above or drop your local CAD file';
        } else {
            updateProMeshInfoDisplay();
        }

        recalculateAll(false);
    }

    if (btnLangToggle) {
        btnLangToggle.addEventListener('click', () => {
            applyLanguage(state.lang === 'en' ? 'zh' : 'en');
        });
    }

    // 4. Bind UI Events
    bindCategoryAndModeSwitchers();
    bindCoinControls();
    bindMedalControls();
    bindMaterialAndFinishControls();
    bindViewportToolbar();
    bindProMeshUpload();
    bindReportExportModal();

    // Sync initial Medal width slider state & render initial 3D model
    syncMedalWidthSliderState();
    recalculateAll(true);

    // ==================== Event Binding Functions ====================

    function setActiveCategory(category) {
        const tabCoin = document.getElementById('tab-cat-coin');
        const tabMedal = document.getElementById('tab-cat-medal');
        const isCoin = (category === 'coin');
        state.category = isCoin ? 'coin' : 'medal';
        tabCoin.classList.toggle('active', isCoin);
        tabCoin.setAttribute('aria-selected', String(isCoin));
        tabMedal.classList.toggle('active', !isCoin);
        tabMedal.setAttribute('aria-selected', String(!isCoin));
        sceneManager.resetCamera(state.category);
        updatePanelVisibility();
    }

    function bindCategoryAndModeSwitchers() {
        const tabCoin = document.getElementById('tab-cat-coin');
        const tabMedal = document.getElementById('tab-cat-medal');
        const btnQuick = document.getElementById('btn-mode-quick');
        const btnPro = document.getElementById('btn-mode-pro');

        tabCoin.addEventListener('click', () => {
            setActiveCategory('coin');
            recalculateAll(true);
        });

        tabMedal.addEventListener('click', () => {
            setActiveCategory('medal');
            recalculateAll(true);
        });

        btnQuick.addEventListener('click', () => {
            state.mode = 'quick';
            btnQuick.classList.add('active');
            btnQuick.setAttribute('aria-selected', 'true');
            btnPro.classList.remove('active');
            btnPro.setAttribute('aria-selected', 'false');
            updatePanelVisibility();
            recalculateAll(true);
        });

        btnPro.addEventListener('click', () => {
            state.mode = 'pro';
            btnPro.classList.add('active');
            btnPro.setAttribute('aria-selected', 'true');
            btnQuick.classList.remove('active');
            btnQuick.setAttribute('aria-selected', 'false');
            updatePanelVisibility();
            if (!state.customMesh) {
                loadSampleModel(state.category === 'coin' ? 'coin' : 'medal');
            } else {
                recalculateAll(false);
            }
        });
    }

    function updatePanelVisibility() {
        const coinPanel = document.getElementById('panel-coin-controls');
        const medalPanel = document.getElementById('panel-medal-controls');
        const proPanel = document.getElementById('panel-pro-controls');
        const shockBtn = document.getElementById('btn-tool-shock');

        if (state.mode === 'pro') {
            coinPanel.style.display = 'none';
            medalPanel.style.display = 'none';
            proPanel.style.display = 'block';
        } else {
            proPanel.style.display = 'none';
            coinPanel.style.display = state.category === 'coin' ? 'block' : 'none';
            medalPanel.style.display = state.category === 'medal' ? 'block' : 'none';
        }

        shockBtn.style.display = (state.category === 'medal') ? 'inline-flex' : 'none';
    }

    function bindCoinControls() {
        const sliderD = document.getElementById('slider-coin-d');
        const valD = document.getElementById('val-coin-d');
        const sliderT = document.getElementById('slider-coin-t');
        const valT = document.getElementById('val-coin-t');
        const selectRelief = document.getElementById('select-coin-relief');
        const selectEdge = document.getElementById('select-coin-edge');

        sliderD.addEventListener('input', (e) => {
            state.coinDiameterMm = parseFloat(e.target.value);
            valD.textContent = presets.formatMmIn(state.coinDiameterMm, 1, 2);
            syncActiveChips('#coin-d-chips [data-coin-d]', 'data-coin-d', state.coinDiameterMm);
            recalculateAll(true);
        });

        sliderT.addEventListener('input', (e) => {
            state.coinThicknessMm = parseFloat(e.target.value);
            valT.textContent = presets.formatMmIn(state.coinThicknessMm, 1, 2);
            syncActiveChips('#coin-t-chips [data-coin-t]', 'data-coin-t', state.coinThicknessMm);
            recalculateAll(true);
        });

        // Preset chips for Coin Diameter
        document.querySelectorAll('#coin-d-chips [data-coin-d]').forEach(btn => {
            btn.addEventListener('click', () => {
                const d = parseFloat(btn.getAttribute('data-coin-d'));
                state.coinDiameterMm = d;
                sliderD.value = d;
                valD.textContent = presets.formatMmIn(d, 1, 2);
                syncActiveChips('#coin-d-chips [data-coin-d]', 'data-coin-d', d);
                recalculateAll(true);
            });
        });

        // Preset chips for Coin Thickness
        document.querySelectorAll('#coin-t-chips [data-coin-t]').forEach(btn => {
            btn.addEventListener('click', () => {
                const t = parseFloat(btn.getAttribute('data-coin-t'));
                state.coinThicknessMm = t;
                sliderT.value = t;
                valT.textContent = presets.formatMmIn(t, 1, 2);
                syncActiveChips('#coin-t-chips [data-coin-t]', 'data-coin-t', t);
                recalculateAll(true);
            });
        });

        selectRelief.addEventListener('change', (e) => {
            state.coinRelief = e.target.value;
            const medalRelief = document.getElementById('select-medal-relief');
            if (medalRelief) medalRelief.value = state.coinRelief;
            recalculateAll(true);
        });

        selectEdge.addEventListener('change', (e) => {
            state.coinEdge = e.target.value;
            recalculateAll(true);
        });
    }

    function syncMedalWidthSliderState() {
        const isSymmetric = (state.medalShape === 'round' || state.medalShape === 'polygon');
        const groupW = document.getElementById('group-medal-w');
        const sliderW = document.getElementById('slider-medal-w');
        const valW = document.getElementById('val-medal-w');

        if (isSymmetric) {
            state.medalWidthMm = state.medalLengthMm;
            if (sliderW) {
                sliderW.value = state.medalLengthMm;
                sliderW.disabled = true;
            }
            if (valW) {
                valW.textContent = presets.formatMmIn(state.medalWidthMm, 1, 2);
            }
            if (groupW) groupW.classList.add('is-disabled');
        } else {
            if (sliderW) sliderW.disabled = false;
            if (groupW) groupW.classList.remove('is-disabled');
        }
    }

    function bindMedalControls() {
        const selectShape = document.getElementById('select-medal-shape');
        const sliderL = document.getElementById('slider-medal-l');
        const valL = document.getElementById('val-medal-l');
        const sliderW = document.getElementById('slider-medal-w');
        const valW = document.getElementById('val-medal-w');
        const sliderT = document.getElementById('slider-medal-t');
        const valT = document.getElementById('val-medal-t');
        const sliderCutout = document.getElementById('slider-medal-cutout');
        const valCutout = document.getElementById('val-medal-cutout');
        const selectMedalRelief = document.getElementById('select-medal-relief');
        const selectLoop = document.getElementById('select-medal-loop');
        const selectRibbon = document.getElementById('select-medal-ribbon');

        selectShape.addEventListener('change', (e) => {
            state.medalShape = e.target.value;
            syncMedalWidthSliderState();
            recalculateAll(true);
        });

        sliderL.addEventListener('input', (e) => {
            state.medalLengthMm = parseFloat(e.target.value);
            valL.textContent = presets.formatMmIn(state.medalLengthMm, 1, 2);
            syncActiveChips('#medal-l-chips [data-medal-l]', 'data-medal-l', state.medalLengthMm);
            syncMedalWidthSliderState();
            recalculateAll(true);
        });

        document.querySelectorAll('#medal-l-chips [data-medal-l]').forEach(btn => {
            btn.addEventListener('click', () => {
                const l = parseFloat(btn.getAttribute('data-medal-l'));
                state.medalLengthMm = l;
                sliderL.value = l;
                valL.textContent = presets.formatMmIn(l, 1, 2);
                syncActiveChips('#medal-l-chips [data-medal-l]', 'data-medal-l', l);
                syncMedalWidthSliderState();
                recalculateAll(true);
            });
        });

        sliderW.addEventListener('input', (e) => {
            state.medalWidthMm = parseFloat(e.target.value);
            valW.textContent = presets.formatMmIn(state.medalWidthMm, 1, 2);
            recalculateAll(true);
        });

        sliderT.addEventListener('input', (e) => {
            state.medalThicknessMm = parseFloat(e.target.value);
            valT.textContent = presets.formatMmIn(state.medalThicknessMm, 1, 2);
            recalculateAll(true);
        });

        sliderCutout.addEventListener('input', (e) => {
            state.medalCutoutPercent = parseFloat(e.target.value);
            valCutout.textContent = `${state.medalCutoutPercent}%`;
            recalculateAll(true);
        });

        if (selectMedalRelief) {
            selectMedalRelief.addEventListener('change', (e) => {
                state.coinRelief = e.target.value;
                const coinRelief = document.getElementById('select-coin-relief');
                if (coinRelief) coinRelief.value = state.coinRelief;
                recalculateAll(true);
            });
        }

        selectLoop.addEventListener('change', (e) => {
            state.medalLoop = e.target.value;
            recalculateAll(true);
        });

        selectRibbon.addEventListener('change', (e) => {
            state.medalRibbon = e.target.value;
            recalculateAll(true);
        });
    }

    function syncActiveChips(selector, attrName, currentValue) {
        document.querySelectorAll(selector).forEach(btn => {
            const chipVal = parseFloat(btn.getAttribute(attrName));
            btn.classList.toggle('active', Math.abs(chipVal - currentValue) < 0.2);
        });
    }

    function bindMaterialAndFinishControls() {
        const selectMat = document.getElementById('select-material');
        const matDesc = document.getElementById('material-desc-text');
        const inputQty = document.getElementById('input-order-qty');

        selectMat.addEventListener('change', (e) => {
            state.material = e.target.value;
            const m = presets.MATERIALS[state.material];
            if (m && matDesc) {
                matDesc.textContent = state.lang === 'zh' ? m.descZh : m.descEn;
            }
            recalculateAll(false);
        });

        // Swatches for Electroplating Finish
        document.querySelectorAll('.swatch-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.swatch-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.finish = btn.getAttribute('data-finish');
                const fObj = materials.FINISH_MATERIALS[state.finish];
                if (fObj) {
                    document.getElementById('val-finish-name').textContent = state.lang === 'zh' ? fObj.nameZh : fObj.nameEn;
                }
                assembly.setFinish(state.finish);
            });
        });

        // Order Qty Input
        inputQty.addEventListener('input', (e) => {
            state.orderQty = Math.max(10, parseInt(e.target.value, 10) || 500);
            recalculateAll(false);
        });

        // Alloy Comparison Cards (Click or Enter/Space to switch substrate)
        document.querySelectorAll('.material-compare-card').forEach(card => {
            const activateCard = () => {
                const matKey = card.getAttribute('data-mat-select');
                if (matKey && presets.MATERIALS[matKey]) {
                    state.material = matKey;
                    selectMat.value = matKey;
                    const m = presets.MATERIALS[matKey];
                    if (m && matDesc) {
                        matDesc.textContent = state.lang === 'zh' ? m.descZh : m.descEn;
                    }
                    recalculateAll(false);
                }
            };
            card.addEventListener('click', activateCard);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    activateCard();
                }
            });
        });
    }

    function bindViewportToolbar() {
        const btnRotate = document.getElementById('btn-tool-rotate');
        const btnCaliper = document.getElementById('btn-tool-caliper');
        const btnClip = document.getElementById('btn-tool-clip');
        const btnWire = document.getElementById('btn-tool-wireframe');
        const btnShock = document.getElementById('btn-tool-shock');
        const btnReset = document.getElementById('btn-tool-reset');

        btnRotate.addEventListener('click', () => {
            const active = sceneManager.toggleAutoRotate();
            btnRotate.classList.toggle('active', active);
            btnRotate.setAttribute('aria-pressed', String(active));
        });

        btnCaliper.addEventListener('click', () => {
            const active = sceneManager.toggleCaliper();
            btnCaliper.classList.toggle('active', active);
            btnCaliper.setAttribute('aria-pressed', String(active));
            btnRotate.classList.toggle('active', sceneManager.isAutoRotating);
            btnRotate.setAttribute('aria-pressed', String(sceneManager.isAutoRotating));
        });

        btnClip.addEventListener('click', () => {
            const active = sceneManager.toggleClipping();
            btnClip.classList.toggle('active', active);
            btnClip.setAttribute('aria-pressed', String(active));
        });

        btnWire.addEventListener('click', () => {
            const active = assembly.toggleWireframe();
            btnWire.classList.toggle('active', active);
            btnWire.setAttribute('aria-pressed', String(active));
        });

        btnShock.addEventListener('click', () => {
            const sf = (state.latestEval && state.latestEval.physResult && state.latestEval.physResult.safetyFactor) || 15.0;
            btnShock.classList.add('active');
            assembly.triggerJumpingShockTest(sf);
            setTimeout(() => {
                btnShock.classList.remove('active');
            }, 1800);
        });

        btnReset.addEventListener('click', () => {
            sceneManager.resetCamera(state.category);
        });
    }

    function updateProMeshInfoDisplay() {
        if (!state.customMesh) return;
        const isZh = (state.lang === 'zh');
        const { fileName, metrics } = state.customMesh;
        const dims = metrics.bounds.dimensions;
        document.getElementById('pro-mesh-name').textContent = `✅ ${fileName}`;
        document.getElementById('pro-mesh-stats').innerHTML = isZh
            ? `三角面片: <b>${metrics.triangleCount.toLocaleString()}</b> | 散度积分净体积: <b>${metrics.volumeCm3} cm³</b><br>` +
              `外接包围盒: <b>${dims.lengthMm} × ${dims.widthMm} × ${dims.thicknessMm} mm (${presets.mmToIn(dims.lengthMm)}" × ${presets.mmToIn(dims.widthMm)}" × ${presets.mmToIn(dims.thicknessMm)}")</b>`
            : `Triangles: <b>${metrics.triangleCount.toLocaleString()}</b> | Divergence Volume: <b>${metrics.volumeCm3} cm³</b><br>` +
              `Bounding Box: <b>${dims.lengthMm} × ${dims.widthMm} × ${dims.thicknessMm} mm (${presets.mmToIn(dims.lengthMm)}" × ${presets.mmToIn(dims.widthMm)}" × ${presets.mmToIn(dims.thicknessMm)}")</b>`;
    }

    function bindProMeshUpload() {
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        const btnSampleCoin = document.getElementById('btn-sample-coin');
        const btnSampleMedal = document.getElementById('btn-sample-medal');

        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInput.click();
            }
        });

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#F59E0B';
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.style.borderColor = '';
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '';
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleUploadedFile(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleUploadedFile(e.target.files[0]);
            }
        });

        btnSampleCoin.addEventListener('click', () => {
            setActiveCategory('coin');
            loadSampleModel('coin');
        });

        btnSampleMedal.addEventListener('click', () => {
            setActiveCategory('medal');
            loadSampleModel('medal');
        });
    }

    async function handleUploadedFile(file) {
        try {
            const { positions, fileName } = await loader.loadFile(file);
            applyCustomMeshPositions(fileName || file.name, positions);
        } catch (err) {
            alert('3D Mesh Parse Error: ' + err.message);
        }
    }

    async function loadSampleModel(type) {
        try {
            const url = type === 'coin'
                ? 'assets/models/sample_challenge_coin.stl'
                : 'assets/models/sample_marathon_medal.stl';
            const resp = await fetch(url);
            if (!resp.ok) throw new Error('Failed to load sample STL');
            const buffer = await resp.arrayBuffer();
            const positions = loader.parseSTL(buffer);
            const label = type === 'coin' ? 'sample_challenge_coin.stl (45×3.5mm)' : 'sample_marathon_medal.stl (70×4.0mm)';
            applyCustomMeshPositions(label, positions);
        } catch (e) {
            console.warn('Sample STL fetch fallback to procedural geometry:', e);
            recalculateAll(true);
        }
    }

    function applyCustomMeshPositions(fileName, positions) {
        const metrics = geometry.computeMeshVolumeAndCentroid(positions);
        state.customMesh = {
            fileName,
            metrics
        };

        updateProMeshInfoDisplay();
        assembly.loadCustomMesh(positions, metrics.bounds);
        recalculateAll(false);
    }

    // ==================== Core Calculation & UI Refresh ====================

    function recalculateAll(rebuild3D = false) {
        const isZh = (state.lang === 'zh');
        const mat = presets.MATERIALS[state.material];
        let geoResult, physResult;
        let currentSpanMm = 45.0;
        let currentThickness = 3.5;

        // Ensure Material Description & Finish Name match active language
        const matDesc = document.getElementById('material-desc-text');
        if (mat && matDesc) {
            matDesc.textContent = isZh ? mDesc(mat, true) : mDesc(mat, false);
        }
        const fObj = materials.FINISH_MATERIALS[state.finish];
        if (fObj) {
            document.getElementById('val-finish-name').textContent = isZh ? fObj.nameZh : fObj.nameEn;
        }

        if (state.mode === 'pro' && state.customMesh) {
            const m = state.customMesh.metrics;
            const volCm3 = m.volumeCm3;
            const metalWeightGrams = parseFloat((volCm3 * mat.density).toFixed(1));
            const lengthMm = m.bounds.dimensions.lengthMm;
            const widthMm = m.bounds.dimensions.widthMm;
            const thicknessMm = m.bounds.dimensions.thicknessMm;
            currentSpanMm = lengthMm;
            currentThickness = thicknessMm;

            const areaCm2 = Math.max(1.0, (Math.PI * (lengthMm / 20.0) * (widthMm / 20.0)));
            const arealDensity = parseFloat((metalWeightGrams / areaCm2).toFixed(2));
            const coreThicknessMm = parseFloat(Math.max(1.2, thicknessMm * 0.72).toFixed(2));

            if (state.category === 'coin') {
                geoResult = {
                    crossAreaCm2: parseFloat(areaCm2.toFixed(2)),
                    effectiveThicknessMm: thicknessMm,
                    coreThicknessMm,
                    volumeCm3: volCm3,
                    metalWeightGrams,
                    totalWeightGrams: metalWeightGrams,
                    arealDensity
                };
                physResult = physics.evaluateCoinPhysics(geoResult, state.material, state.coinEdge, state.lang);
            } else {
                const ribbon = presets.RIBBON_SPECS[state.medalRibbon];
                const totalWeightGrams = parseFloat((metalWeightGrams + ribbon.weightGrams).toFixed(1));
                geoResult = {
                    netPlanarAreaCm2: parseFloat(areaCm2.toFixed(2)),
                    effectiveThicknessMm: thicknessMm,
                    coreThicknessMm,
                    volumeCm3: volCm3,
                    metalWeightGrams,
                    metalBodyWeightGrams: metalWeightGrams,
                    ribbonWeightGrams: ribbon.weightGrams,
                    totalWeightGrams,
                    arealDensity
                };
                physResult = physics.evaluateMedalPhysics(geoResult, state.medalLoop, state.medalRibbon, state.material, state.lang);
            }
        } else if (state.category === 'coin') {
            geoResult = geometry.estimateCoin(
                state.coinDiameterMm,
                state.coinThicknessMm,
                state.coinRelief,
                state.coinEdge,
                state.material
            );
            physResult = physics.evaluateCoinPhysics(geoResult, state.material, state.coinEdge, state.lang);
            currentSpanMm = state.coinDiameterMm;
            currentThickness = state.coinThicknessMm;

            if (rebuild3D) {
                assembly.updateProceduralCoin(
                    state.coinDiameterMm,
                    state.coinThicknessMm,
                    state.coinEdge,
                    state.coinRelief
                );
            }
        } else {
            const cutoutRatio = state.medalCutoutPercent / 100.0;
            geoResult = geometry.estimateMedal(
                state.medalShape,
                state.medalLengthMm,
                state.medalWidthMm,
                state.medalThicknessMm,
                state.coinRelief,
                cutoutRatio,
                state.medalLoop,
                state.medalRibbon,
                state.material
            );
            physResult = physics.evaluateMedalPhysics(geoResult, state.medalLoop, state.medalRibbon, state.material, state.lang);
            currentSpanMm = Math.max(state.medalLengthMm, geoResult.actualWidthMm);
            currentThickness = state.medalThicknessMm;

            if (rebuild3D) {
                assembly.updateProceduralMedal(
                    state.medalShape,
                    state.medalLengthMm,
                    geoResult.actualWidthMm,
                    state.medalThicknessMm,
                    cutoutRatio,
                    state.medalLoop,
                    state.medalRibbon,
                    state.coinRelief
                );
            }
        }

        // Update 3D Digital Caliper jaw position & dual-unit reading
        sceneManager.currentOuterRadiusMm = currentSpanMm / 2.0;
        sceneManager.updateCaliperPosition(currentSpanMm / 2.0, currentThickness);
        if (sceneManager.isClippingEnabled) {
            sceneManager.applyClippingPlanes(sceneManager.modelGroup, [sceneManager.clipPlane]);
        }

        // Calculate Export Logistics
        const shipResult = shipping.calculateLogistics(geoResult.totalWeightGrams, state.orderQty, state.lang);

        // Save snapshot for PNG Report Generator
        state.latestEval = {
            geoResult,
            physResult,
            shipResult,
            currentSpanMm,
            currentThickness
        };

        // Refresh UI Readouts
        updateDashboardUI(geoResult, physResult, shipResult, mat, currentThickness);
    }

    function mDesc(mat, isZh) {
        return isZh ? mat.descZh : mat.descEn;
    }

    function updateDashboardUI(geo, phys, ship, mat, currentThickness) {
        const isZh = (state.lang === 'zh');

        // Top HUD & Bottom Legend
        const dimSummary = document.getElementById('hud-dim-summary');
        if (state.mode === 'pro' && state.customMesh) {
            const d = state.customMesh.metrics.bounds.dimensions;
            dimSummary.textContent = `${d.lengthMm} × ${d.widthMm} × ${d.thicknessMm} mm (${presets.mmToIn(d.lengthMm)}" × ${presets.mmToIn(d.thicknessMm)}")`;
        } else if (state.category === 'coin') {
            dimSummary.textContent = `Ø ${state.coinDiameterMm.toFixed(1)} × ${state.coinThicknessMm.toFixed(1)} mm (${presets.mmToIn(state.coinDiameterMm)}" × ${presets.mmToIn(state.coinThicknessMm)}")`;
        } else {
            const wMm = geo.actualWidthMm || state.medalWidthMm;
            dimSummary.textContent = `${state.medalLengthMm.toFixed(0)} × ${wMm.toFixed(0)} × ${state.medalThicknessMm.toFixed(1)} mm (${presets.mmToIn(state.medalLengthMm)}" × ${presets.mmToIn(state.medalThicknessMm)}")`;
        }

        const shortMatName = isZh ? mat.shortNameZh : mat.shortNameEn;
        document.getElementById('legend-alloy-text').textContent = `${shortMatName} (${mat.density.toFixed(2)} g/cm³)`;
        document.getElementById('legend-thickness-text').textContent = isZh
            ? `厚度: ${ presets.formatMmIn(currentThickness, 1, 2) }`
            : `Thickness: ${ presets.formatMmIn(currentThickness, 1, 2) }`;

        // 4 KPI Cards
        if (state.category === 'coin') {
            document.getElementById('kpi-1-label').textContent = isZh ? '预估金属净重 (NET METAL WT)' : 'ESTIMATED NET METAL WEIGHT';
            document.getElementById('kpi-1-val').textContent = geo.metalWeightGrams.toFixed(1);
            document.getElementById('kpi-1-unit').textContent = `g (${presets.gToOz(geo.metalWeightGrams, 2)} oz)`;
            document.getElementById('kpi-1-sub').textContent = isZh
                ? `有效体积: ${geo.volumeCm3} cm³`
                : `Effective Volume: ${geo.volumeCm3} cm³`;

            document.getElementById('kpi-2-label').textContent = isZh ? '掌心面密度与压手指数 (HEFT)' : 'PALM HEFT & AREAL DENSITY';
            document.getElementById('kpi-2-val').textContent = phys.tactileScore;
            document.getElementById('kpi-2-unit').textContent = '/ 100 pts';
            document.getElementById('kpi-2-sub').textContent = isZh
                ? `面密度: ${geo.arealDensity} g/cm² (${phys.tactileGrade})`
                : `Areal Density: ${geo.arealDensity} g/cm² (${phys.tactileGrade})`;

            document.getElementById('kpi-3-label').textContent = isZh ? '同尺寸 H65 黄铜克重对比' : 'ZAMAK 3 vs H65 BRASS BENCHMARK';
            document.getElementById('kpi-3-val').textContent = phys.brassWeightGrams.toFixed(1);
            document.getElementById('kpi-3-unit').textContent = `g (${presets.gToOz(phys.brassWeightGrams, 2)} oz)`;
            document.getElementById('kpi-3-sub').textContent = isZh
                ? `比 3号锌合金 (${phys.zincWeightGrams} g) 重 +${phys.deltaWeightGrams} g`
                : `+${phys.deltaWeightGrams} g (+26.8%) heavier than Zamak 3 (${phys.zincWeightGrams} g)`;

            document.getElementById('kpi-4-label').textContent = isZh ? '中心底板净壁厚 (CORE WEB)' : 'CORE WEB WALL THICKNESS';
            document.getElementById('kpi-4-val').textContent = geo.coreThicknessMm.toFixed(2);
            document.getElementById('kpi-4-unit').textContent = 'mm';
            document.getElementById('kpi-4-sub').textContent = isZh
                ? `车间成型评级: ${phys.dfmStatus}`
                : `DFM Rating: ${phys.dfmStatus}`;
        } else {
            document.getElementById('kpi-1-label').textContent = isZh ? '含挂带装配总重 (TOTAL MASS)' : 'TOTAL ASSEMBLY WEIGHT';
            document.getElementById('kpi-1-val').textContent = geo.totalWeightGrams.toFixed(1);
            document.getElementById('kpi-1-unit').textContent = `g (${presets.gToOz(geo.totalWeightGrams, 2)} oz)`;
            document.getElementById('kpi-1-sub').textContent = isZh
                ? `金属牌体: ${geo.metalBodyWeightGrams} g + 织带: ${geo.ribbonWeightGrams} g`
                : `Metal Body: ${geo.metalBodyWeightGrams} g + Ribbon: ${geo.ribbonWeightGrams} g`;

            document.getElementById('kpi-2-label').textContent = isZh ? '完赛跳跃 2.5g 冲击载荷' : '2.5g CELEBRATION SHOCK LOAD';
            document.getElementById('kpi-2-val').textContent = phys.dynamicLoadN.toFixed(1);
            document.getElementById('kpi-2-unit').textContent = `N (${phys.dynamicLoadKgf} kgf)`;
            document.getElementById('kpi-2-sub').textContent = isZh
                ? `颈部挂重等级: ${phys.neckLevel}`
                : `Neck Comfort Grade: ${phys.neckLevel}`;

            document.getElementById('kpi-3-label').textContent = isZh ? '吊耳抗拉脱安全系数' : 'HANGER PULL-OUT SAFETY FACTOR';
            document.getElementById('kpi-3-val').textContent = `${phys.safetyFactor}×`;
            document.getElementById('kpi-3-unit').textContent = phys.safetyFactor >= 4.0 ? 'SAFE' : 'RISK';
            document.getElementById('kpi-3-sub').textContent = state.medalLoop === 'cast-loop'
                ? (isZh ? '一体铸造穿带扁桥 (314 N)' : 'Integrated Cast Bridge Slot (314 N)')
                : (isZh ? '外接开口细跳环 (54 N)' : 'Split Wire Jump Ring (54 N)');

            document.getElementById('kpi-4-label').textContent = isZh ? '净金属体积 (扣除镂空)' : 'NET METAL VOLUME (AFTER CUTOUT)';
            document.getElementById('kpi-4-val').textContent = geo.volumeCm3.toFixed(2);
            document.getElementById('kpi-4-unit').textContent = 'cm³';
            document.getElementById('kpi-4-sub').textContent = isZh
                ? `中心净壁厚: ${geo.coreThicknessMm} mm`
                : `Core Web Thickness: ${geo.coreThicknessMm} mm`;
        }

        // Ergonomics & DFM Banner
        const banner = document.getElementById('ergo-status-banner');
        banner.className = 'status-banner ' + (phys.bannerClass || '');
        document.getElementById('ergo-status-icon').textContent =
            phys.bannerClass === 'critical' ? '🚨' : (phys.bannerClass === 'warning' ? '⚠️' : '🛡️');
        document.getElementById('ergo-status-title').textContent =
            state.category === 'coin' ? phys.tactileTitle : phys.neckTitle;
        document.getElementById('ergo-status-desc').textContent =
            state.category === 'coin' ? phys.tactileDesc : phys.neckDesc;
        document.getElementById('dfm-warning-line').textContent = (phys.dfmWarnings || []).join('  ');

        // Export Carton & Freight Readouts
        document.getElementById('ship-cartons').textContent = isZh
            ? `${ship.totalCartons} 箱 (${ship.maxPiecesPerCarton} pcs/箱)`
            : `${ship.totalCartons} Ctns (${ship.maxPiecesPerCarton} pcs/ctn)`;
        document.getElementById('ship-gross-wt').textContent =
            `${ship.totalGrossWeightKg} kg (${ship.totalGrossWeightLbs} lbs)`;
        document.getElementById('ship-cbm').textContent = isZh
            ? `${ship.avgGrossWeightPerCartonKg} kg/箱 | ${ship.totalVolumeCbm} CBM`
            : `${ship.avgGrossWeightPerCartonKg} kg/ctn | ${ship.totalVolumeCbm} CBM`;
        document.getElementById('ship-cost').textContent =
            `~$${ship.estimatedAirCourierUsd} vs ~$${ship.estimatedOceanLclUsd}`;
        document.getElementById('ship-advice-text').textContent = ship.logisticsTip;
    }

    // ==================== Native <dialog> Modal & High-Res PNG Export ====================

    function bindReportExportModal() {
        const btnExport = document.getElementById('btn-export-report');
        const dialog = document.getElementById('report-modal');
        const btnClose = document.getElementById('btn-close-modal');
        const btnDownload = document.getElementById('btn-download-png');
        const previewImg = document.getElementById('report-preview-img');

        // Light-dismiss pointer fallback for browsers without native closedby="any" support
        if (dialog && !('closedBy' in dialog)) {
            let downTarget = null;
            dialog.addEventListener('pointerdown', (e) => { downTarget = e.target; });
            dialog.addEventListener('pointerup', (e) => {
                if (e.target === dialog && downTarget === dialog) {
                    dialog.close('light-dismiss');
                }
                downTarget = null;
            });
        }

        btnExport.addEventListener('click', async () => {
            if (!state.latestEval) return;
            const isZh = (state.lang === 'zh');
            const { geoResult, physResult, shipResult, currentThickness } = state.latestEval;
            const mat = presets.MATERIALS[state.material];
            const fObj = materials.FINISH_MATERIALS[state.finish];
            const reliefObj = presets.RELIEF_STYLES[state.coinRelief];

            const specsList = [];
            if (state.category === 'coin') {
                specsList.push({
                    label: isZh ? '产品类型 (Category)' : 'Product Category',
                    value: isZh ? '定制挑战币 (Challenge Coin)' : 'Custom Challenge Coin'
                });
                specsList.push({
                    label: isZh ? '外径与边缘厚度 (Dimensions)' : 'Diameter & Rim Thickness',
                    value: `Ø ${state.coinDiameterMm} × ${currentThickness} mm (${presets.mmToIn(state.coinDiameterMm)}" × ${presets.mmToIn(currentThickness)}")`
                });
                specsList.push({
                    label: isZh ? '金属合金基材 (Base Alloy)' : 'Base Metal Alloy',
                    value: isZh ? mat.nameZh : mat.nameEn
                });
                specsList.push({
                    label: isZh ? '双面浮雕层级 (Relief Style)' : 'Surface Relief Style',
                    value: isZh ? reliefObj.nameZh : reliefObj.nameEn
                });
                specsList.push({
                    label: isZh ? '边缘滚花切边 (Edge Milling)' : 'Edge Milling Cut',
                    value: isZh ? presets.EDGE_CUTS[state.coinEdge].nameZh : presets.EDGE_CUTS[state.coinEdge].nameEn
                });
                specsList.push({
                    label: isZh ? '电镀表面处理 (Plating Finish)' : 'Electroplating Finish',
                    value: isZh ? fObj.nameZh : fObj.nameEn
                });
            } else {
                const wMm = geoResult.actualWidthMm || state.medalWidthMm;
                specsList.push({
                    label: isZh ? '产品类型 (Category)' : 'Product Category',
                    value: isZh ? '赛事完赛奖牌 (Sports Medal)' : 'Custom Sports Finisher Medal'
                });
                specsList.push({
                    label: isZh ? '外形尺寸与厚度 (Dimensions)' : 'Dimensions & Thickness',
                    value: `${state.medalLengthMm} × ${wMm} × ${currentThickness} mm (${presets.mmToIn(state.medalLengthMm)}" × ${presets.mmToIn(currentThickness)}")`
                });
                specsList.push({
                    label: isZh ? '金属合金基材 (Base Alloy)' : 'Base Metal Alloy',
                    value: isZh ? mat.nameZh : mat.nameEn
                });
                specsList.push({
                    label: isZh ? '轮廓形态与镂空比 (Contour)' : 'Silhouette & Open Cutout',
                    value: `${isZh ? presets.MEDAL_SHAPES[state.medalShape].nameZh : presets.MEDAL_SHAPES[state.medalShape].nameEn} | ${state.medalCutoutPercent}%`
                });
                specsList.push({
                    label: isZh ? '顶部吊耳结构 (Top Hanger)' : 'Top Hanger Structure',
                    value: isZh ? presets.LOOP_STRENGTH[state.medalLoop].nameZh : presets.LOOP_STRENGTH[state.medalLoop].nameEn
                });
                specsList.push({
                    label: isZh ? '配套挂脖织带 (Neck Lanyard)' : 'Neck Lanyard Spec',
                    value: isZh ? presets.RIBBON_SPECS[state.medalRibbon].nameZh : presets.RIBBON_SPECS[state.medalRibbon].nameEn
                });
            }

            const kpis = state.category === 'coin'
                ? [
                    {
                        title: isZh ? '单枚金属净重' : 'NET METAL WEIGHT',
                        value: `${geoResult.metalWeightGrams} g`,
                        sub: `${presets.gToOz(geoResult.metalWeightGrams, 2)} oz | ${geoResult.volumeCm3} cm³`
                    },
                    {
                        title: isZh ? '掌心压手指数' : 'PALM HEFT SCORE',
                        value: `${physResult.tactileScore} / 100`,
                        sub: `${geoResult.arealDensity} g/cm²`
                    },
                    {
                        title: isZh ? 'H65 黄铜基准克重' : 'H65 BRASS BENCHMARK',
                        value: `${physResult.brassWeightGrams} g`,
                        sub: `+${physResult.deltaWeightGrams} g vs Zamak 3`
                    },
                    {
                        title: isZh ? '底板中心净壁厚' : 'CORE WEB THICKNESS',
                        value: `${geoResult.coreThicknessMm} mm`,
                        sub: `DFM: ${physResult.dfmStatus}`
                    }
                ]
                : [
                    {
                        title: isZh ? '含织带装配总重' : 'TOTAL ASSEMBLY MASS',
                        value: `${geoResult.totalWeightGrams} g`,
                        sub: `${presets.gToOz(geoResult.totalWeightGrams, 2)} oz (Body ${geoResult.metalBodyWeightGrams}g)`
                    },
                    {
                        title: isZh ? '2.5g 完赛跳跃冲击' : '2.5g SHOCK LOAD',
                        value: `${physResult.dynamicLoadN} N`,
                        sub: `${physResult.dynamicLoadKgf} kgf (${physResult.neckLevel})`
                    },
                    {
                        title: isZh ? '吊耳拉脱安全系数' : 'HANGER SAFETY FACTOR',
                        value: `${physResult.safetyFactor}×`,
                        sub: physResult.safetyFactor >= 4.0 ? ' Structural Pass' : 'Pull-Out Risk'
                    },
                    {
                        title: isZh ? '净金属体积' : 'NET METAL VOLUME',
                        value: `${geoResult.volumeCm3} cm³`,
                        sub: `Core Web: ${geoResult.coreThicknessMm} mm`
                    }
                ];

            const reportPayload = {
                lang: state.lang,
                category: state.category,
                viewportDataUrl: sceneManager.getCanvasDataURL(),
                specsList,
                kpis,
                dfmStatus: physResult.dfmStatus,
                ergoTitle: state.category === 'coin' ? physResult.tactileTitle : physResult.neckTitle,
                ergoDesc: state.category === 'coin' ? physResult.tactileDesc : physResult.neckDesc,
                dfmWarnings: physResult.dfmWarnings,
                shipping: shipResult
            };

            const dataUrl = await report.generateSpecReportImage(reportPayload);
            previewImg.src = dataUrl;
            if (dialog && typeof dialog.showModal === 'function') {
                dialog.showModal();
            }
        });

        btnClose.addEventListener('click', () => {
            if (dialog) dialog.close('close-button');
        });

        btnDownload.addEventListener('click', () => {
            if (!previewImg.src) return;
            const link = document.createElement('a');
            link.download = `GoldValley-${state.category.toUpperCase()}-DFM-Spec-${Date.now()}.png`;
            link.href = previewImg.src;
            link.click();
        });
    }
});
