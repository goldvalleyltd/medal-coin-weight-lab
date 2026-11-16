/**
 * Medal & Coin Weight Estimator - 3D Mesh Loader (100% Client-Side)
 * 纯前端离线 STL (Binary & ASCII) 与 OBJ 格式几何解析器，零云端上传
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.MedalCoinLab = root.MedalCoinLab || {};
        root.MedalCoinLab.loader = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    /**
     * 解析 STL 文件（自动识别二进制或 ASCII 格式）
     * @param {ArrayBuffer} buffer
     * @returns {Float32Array} 顶点坐标扁平数组
     */
    function parseSTL(buffer) {
        if (!buffer || buffer.byteLength < 84) {
            throw new Error("无效的 STL 文件：文件体积过小");
        }

        // 检查是否为 Binary STL
        const reader = new DataView(buffer);
        const numTriangles = reader.getUint32(80, true);
        const expectedByteLength = 84 + numTriangles * 50;

        if (buffer.byteLength === expectedByteLength) {
            return parseBinarySTL(reader, numTriangles);
        }

        // 尝试作为 ASCII STL 解析
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(buffer);
        if (text.includes('facet normal') || text.includes('solid')) {
            return parseAsciiSTL(text);
        }

        // 若不是严格的 ASCII，尝试强制作为二进制读取
        return parseBinarySTL(reader, numTriangles);
    }

    function parseBinarySTL(reader, numTriangles) {
        const positions = new Float32Array(numTriangles * 9);
        let offset = 84;
        let pIdx = 0;

        for (let i = 0; i < numTriangles; i++) {
            // 跳过 12 字节法线 (3 * float32)
            offset += 12;

            // 3 个顶点 (每个 3 * float32 = 12 字节)
            for (let v = 0; v < 3; v++) {
                positions[pIdx++] = reader.getFloat32(offset, true);
                positions[pIdx++] = reader.getFloat32(offset + 4, true);
                positions[pIdx++] = reader.getFloat32(offset + 8, true);
                offset += 12;
            }

            // 跳过 2 字节属性字节
            offset += 2;
        }

        return positions;
    }

    function parseAsciiSTL(text) {
        const lines = text.split('\n');
        const vertices = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('vertex')) {
                const parts = line.split(/\s+/);
                if (parts.length >= 4) {
                    vertices.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
                }
            }
        }

        if (vertices.length % 9 !== 0) {
            console.warn("ASCII STL 顶点数量非 3 的倍数，已截断多余顶点");
            const validLen = Math.floor(vertices.length / 9) * 9;
            return new Float32Array(vertices.slice(0, validLen));
        }

        return new Float32Array(vertices);
    }

    /**
     * 解析 OBJ 文本文件
     * @param {string} text
     * @returns {Float32Array}
     */
    function parseOBJ(text) {
        const lines = text.split('\n');
        const vList = [];
        const positions = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('v ')) {
                const parts = line.split(/\s+/);
                vList.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
            } else if (line.startsWith('f ')) {
                const parts = line.split(/\s+/).slice(1);
                const faceIndices = [];

                for (let p = 0; p < parts.length; p++) {
                    const idxStr = parts[p].split('/')[0];
                    let idx = parseInt(idxStr, 10);
                    if (idx < 0) idx = vList.length + idx;
                    else idx = idx - 1;
                    faceIndices.push(idx);
                }

                // 三角剖分 (Triangulate)
                for (let k = 1; k < faceIndices.length - 1; k++) {
                    const i0 = faceIndices[0];
                    const i1 = faceIndices[k];
                    const i2 = faceIndices[k + 1];

                    if (vList[i0] && vList[i1] && vList[i2]) {
                        positions.push(...vList[i0]);
                        positions.push(...vList[i1]);
                        positions.push(...vList[i2]);
                    }
                }
            }
        }

        return new Float32Array(positions);
    }

    /**
     * 统一文件入口
     * @param {File} file
     */
    async function loadFile(file) {
        const fileName = file.name.toLowerCase();

        if (fileName.endsWith('.stl')) {
            const buffer = await file.arrayBuffer();
            const positions = parseSTL(buffer);
            return { positions, fileName: file.name };
        } else if (fileName.endsWith('.obj')) {
            const text = await file.text();
            const positions = parseOBJ(text);
            return { positions, fileName: file.name };
        } else {
            throw new Error("不支持的文件格式！请上传 .stl 或 .obj 格式的 3D 模型文件。");
        }
    }

    return {
        parseSTL,
        parseOBJ,
        loadFile
    };

}));
