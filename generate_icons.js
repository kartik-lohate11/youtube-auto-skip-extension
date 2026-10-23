const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(size) {
    const width = size;
    const height = size;

    const rowBytes = 1 + width * 4;
    const rawData = Buffer.alloc(rowBytes * height);

    const radius = Math.floor(size * 0.22);

    for (let y = 0; y < height; y++) {
        const rowStart = y * rowBytes;
        rawData[rowStart] = 0; // Filter: None

        for (let x = 0; x < width; x++) {
            const pixelStart = rowStart + 1 + x * 4;

            // Rounded corners
            let inside = true;
            const dx = Math.min(x, width - 1 - x);
            const dy = Math.min(y, height - 1 - y);

            if (dx < radius && dy < radius) {
                const cornerDist = Math.hypot(radius - dx, radius - dy);
                if (cornerDist > radius) {
                    inside = false;
                }
            }

            if (!inside) {
                rawData[pixelStart] = 0;
                rawData[pixelStart + 1] = 0;
                rawData[pixelStart + 2] = 0;
                rawData[pixelStart + 3] = 0;
                continue;
            }

            // Vibrant YouTube red gradient (#FF0033 to #CC0029)
            const gradientT = (x + y) / (width + height);
            let r = Math.round(255 - gradientT * 35);
            let g = Math.round(15 + gradientT * 10);
            let b = Math.round(40 + gradientT * 15);
            let a = 255;

            // Normalized coordinates
            const nx = x / width;
            const ny = y / height;

            // Fast forward icon: Two rightward pointing triangles + vertical bar
            // Triangle 1: Base at nx = 0.22 (height ±0.26), apex at nx = 0.50 (ny = 0.50)
            const inTri1 = nx >= 0.22 && nx <= 0.50 &&
                Math.abs(ny - 0.5) <= (0.50 - nx) * (0.26 / 0.28);

            // Triangle 2: Base at nx = 0.48 (height ±0.26), apex at nx = 0.74 (ny = 0.50)
            const inTri2 = nx >= 0.48 && nx <= 0.74 &&
                Math.abs(ny - 0.5) <= (0.74 - nx) * (0.26 / 0.26);

            // Vertical skip bar: nx from 0.76 to 0.83, ny from 0.24 to 0.76
            const inBar = nx >= 0.76 && nx <= 0.83 && ny >= 0.24 && ny <= 0.76;

            if (inTri1 || inTri2 || inBar) {
                r = 255;
                g = 255;
                b = 255;
            }

            rawData[pixelStart] = r;
            rawData[pixelStart + 1] = g;
            rawData[pixelStart + 2] = b;
            rawData[pixelStart + 3] = a;
        }
    }

    const compressed = zlib.deflateSync(rawData);

    // PNG signature
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

    // IHDR chunk
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8;
    ihdr[9] = 6;
    ihdr[10] = 0;
    ihdr[11] = 0;
    ihdr[12] = 0;

    const ihdrChunk = createChunk('IHDR', ihdr);
    const idatChunk = createChunk('IDAT', compressed);
    const iendChunk = createChunk('IEND', Buffer.alloc(0));

    return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(8 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);

    const crcVal = crc32(buf.subarray(4, 8 + len));
    buf.writeInt32BE(crcVal, 8 + len);
    return buf;
}

const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
        if (c & 1) {
            c = 0xedb88320 ^ (c >>> 1);
        } else {
            c = c >>> 1;
        }
    }
    crcTable[n] = c;
}

function crc32(buf) {
    let c = -1;
    for (let i = 0; i < buf.length; i++) {
        c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ -1);
}

const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
}

[16, 48, 128].forEach(size => {
    const png = createPng(size);
    fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), png);
    console.log(`Generated icon${size}.png (${size}x${size})`);
});
