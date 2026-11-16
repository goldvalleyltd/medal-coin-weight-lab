/**
 * Medal & Coin Weight Estimator - PBR Metal Materials & Procedural Textures
 * True-to-sample electroplating finishes, Guilloche sunburst micro-engraving & Sandblast matte recessed textures
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.MedalCoinLab = root.MedalCoinLab || {};
        root.MedalCoinLab.materials = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    // Electroplating finish specs calibrated with Gold Valley studio PBR lighting
    const FINISH_MATERIALS = {
        'gold': {
            color: 0xF59E0B,
            metalness: 0.92,
            roughness: 0.15,
            name: '24K Mirror Gold Plating',
            nameEn: '24K Mirror Gold Plating',
            nameZh: '24K 真金镜面抛光'
        },
        'chrome': {
            color: 0xF8FAFC,
            metalness: 0.96,
            roughness: 0.08,
            name: 'Bright Nickel / Mirror Silver',
            nameEn: 'Bright Nickel / Mirror Silver',
            nameZh: '镜面亮镍 / 高光纯银'
        },
        'bronze': {
            color: 0x92400E,
            metalness: 0.85,
            roughness: 0.32,
            name: 'Antique Brushed Bronze',
            nameEn: 'Antique Brushed Bronze',
            nameZh: '复古拉丝古青铜'
        },
        'copper': {
            color: 0xB45309,
            metalness: 0.88,
            roughness: 0.28,
            name: 'Antique Brushed Red Copper',
            nameEn: 'Antique Brushed Red Copper',
            nameZh: '古典做旧古红铜'
        },
        'black': {
            color: 0x334155,
            metalness: 0.86,
            roughness: 0.22,
            name: 'Satin Black Nickel / Gunmetal',
            nameEn: 'Satin Black Nickel / Gunmetal',
            nameZh: '战术哑光黑镍 / 枪黑'
        },
        'two-tone': {
            color: 0xF59E0B,
            secondaryColor: 0xF1F5F9,
            metalness: 0.94,
            roughness: 0.14,
            name: 'Dual-Plated Gold & Silver',
            nameEn: 'Dual-Plated Gold & Silver',
            nameZh: '双色电镀 (24K金 + 亮银)'
        }
    };

    let cachedGuillocheTexture = null;
    let cachedSandblastTexture = null;

    /**
     * Procedural Guilloche Sunburst Texture
     */
    function getGuillocheTexture() {
        if (cachedGuillocheTexture) return cachedGuillocheTexture;
        if (typeof document === 'undefined') return null;

        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, 512, 512);

        const cx = 256, cy = 256, r = 246;
        const lines = 180;
        for (let i = 0; i < lines; i++) {
            const a = (i / lines) * Math.PI * 2;
            ctx.strokeStyle = (i % 2 === 0) ? '#b2b2b2' : '#525252';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
            ctx.stroke();
        }
        for (let dr = 24; dr < r; dr += 16) {
            ctx.strokeStyle = '#999999';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.arc(cx, cy, dr, 0, Math.PI * 2);
            ctx.stroke();
        }

        cachedGuillocheTexture = new THREE.CanvasTexture(canvas);
        cachedGuillocheTexture.wrapS = THREE.ClampToEdgeWrapping;
        cachedGuillocheTexture.wrapT = THREE.ClampToEdgeWrapping;
        return cachedGuillocheTexture;
    }

    /**
     * Procedural Fine Sandblast Matte Texture
     */
    function getSandblastTexture() {
        if (cachedSandblastTexture) return cachedSandblastTexture;
        if (typeof document === 'undefined') return null;

        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const imgData = ctx.createImageData(256, 256);
        for (let i = 0; i < imgData.data.length; i += 4) {
            const val = 100 + Math.floor(Math.random() * 65);
            imgData.data[i] = val;
            imgData.data[i + 1] = val;
            imgData.data[i + 2] = val;
            imgData.data[i + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);

        cachedSandblastTexture = new THREE.CanvasTexture(canvas);
        cachedSandblastTexture.wrapS = THREE.RepeatWrapping;
        cachedSandblastTexture.wrapT = THREE.RepeatWrapping;
        cachedSandblastTexture.repeat.set(4, 4);
        return cachedSandblastTexture;
    }

    /**
     * Create PBR Metal Material
     */
    function createMetalMaterial(finishKey, isSecondary = false, textureType = 'smooth', isWireframe = false) {
        const finish = FINISH_MATERIALS[finishKey] || FINISH_MATERIALS['gold'];
        let color = finish.color;
        if (finishKey === 'two-tone' && isSecondary) {
            color = finish.secondaryColor;
        }

        const matConfig = {
            color: color,
            metalness: finish.metalness,
            roughness: finish.roughness,
            wireframe: isWireframe,
            side: THREE.DoubleSide
        };

        if (textureType === 'guilloche') {
            const tex = getGuillocheTexture();
            if (tex) {
                matConfig.bumpMap = tex;
                matConfig.bumpScale = 0.05;
                matConfig.roughness = Math.min(0.35, finish.roughness + 0.10);
            }
        } else if (textureType === 'sandblast') {
            const tex = getSandblastTexture();
            if (tex) {
                matConfig.bumpMap = tex;
                matConfig.bumpScale = 0.08;
                matConfig.roughness = Math.min(0.55, finish.roughness + 0.22);
            }
        }

        return new THREE.MeshStandardMaterial(matConfig);
    }

    return {
        FINISH_MATERIALS,
        getGuillocheTexture,
        getSandblastTexture,
        createMetalMaterial
    };

}));
