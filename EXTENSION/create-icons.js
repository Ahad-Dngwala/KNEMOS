// create-icons.js
// Creates PNG icons using pure Node.js (no npm packages needed)
// Run: node create-icons.js

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

function uint32BE(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n >>> 0, 0);
  return b;
}

function makeCrcTable() {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c;
  }
  return t;
}
const CRC_TABLE = makeCrcTable();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const tb = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.concat([tb, data]);
  return Buffer.concat([uint32BE(data.length), tb, data, uint32BE(crc32(crcBuf))]);
}

function createPNG(size) {
  // RGBA pixel array
  const pixels = new Uint8Array(size * size * 4);

  const cx = size / 2, cy = size / 2;
  const hexR = size * 0.37;
  const strokeW = Math.max(1.2, size * 0.055);

  // Background: #080808
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = 8; pixels[i+1] = 8; pixels[i+2] = 8; pixels[i+3] = 255;
  }

  // Hexagon (6 sides)
  const hexPts = [];
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 3 * i - Math.PI / 6;
    hexPts.push([cx + hexR * Math.cos(a), cy + hexR * Math.sin(a)]);
  }

  // Rasterize hexagon edges
  for (let s = 0; s < 6; s++) {
    const [x0, y0] = hexPts[s];
    const [x1, y1] = hexPts[(s + 1) % 6];
    const steps = Math.ceil(Math.max(Math.abs(x1-x0), Math.abs(y1-y0)) * 4);
    for (let t = 0; t <= steps; t++) {
      const fx = x0 + (x1-x0)*t/steps;
      const fy = y0 + (y1-y0)*t/steps;
      // Draw thick stroke
      for (let dy = -strokeW; dy <= strokeW; dy++) {
        for (let dx = -strokeW; dx <= strokeW; dx++) {
          if (dx*dx + dy*dy > strokeW*strokeW) continue;
          const px = Math.round(fx + dx);
          const py = Math.round(fy + dy);
          if (px < 0 || px >= size || py < 0 || py >= size) continue;
          const idx = (py * size + px) * 4;
          pixels[idx] = 0; pixels[idx+1] = 200; pixels[idx+2] = 150; pixels[idx+3] = 255;
        }
      }
    }
  }

  // Draw "K" using stroke segments (simplified vector K)
  const margin = size * 0.28;
  const barW = Math.max(1.5, size * 0.11);
  const top = margin, bottom = size - margin;
  const mid = size / 2;
  const leftX = margin + barW * 0.5;
  const rightX = size - margin;

  function drawLine(x0, y0, x1, y1, w, r, g, b) {
    const steps = Math.ceil(Math.max(Math.abs(x1-x0), Math.abs(y1-y0)) * 4);
    const hw = w / 2;
    for (let t = 0; t <= steps; t++) {
      const fx = x0 + (x1-x0)*t/steps;
      const fy = y0 + (y1-y0)*t/steps;
      for (let dy = -hw; dy <= hw; dy++) {
        for (let dx = -hw; dx <= hw; dx++) {
          if (dx*dx + dy*dy > hw*hw) continue;
          const px = Math.round(fx + dx);
          const py = Math.round(fy + dy);
          if (px < 0 || px >= size || py < 0 || py >= size) continue;
          const idx = (py * size + px) * 4;
          pixels[idx] = r; pixels[idx+1] = g; pixels[idx+2] = b; pixels[idx+3] = 255;
        }
      }
    }
  }

  // Vertical bar of K
  drawLine(leftX, top, leftX, bottom, barW, 255, 255, 255);
  // Upper arm of K (from mid of vertical to top-right)
  drawLine(leftX, mid - barW * 0.3, rightX - barW*0.5, top, barW, 255, 255, 255);
  // Lower arm of K (from mid of vertical to bottom-right)
  drawLine(leftX, mid + barW * 0.3, rightX - barW*0.5, bottom, barW, 255, 255, 255);

  // Build PNG
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);

  const ihdrData = Buffer.concat([uint32BE(size), uint32BE(size), Buffer.from([8,6,0,0,0])]);
  const ihdr = chunk('IHDR', ihdrData);

  // Raw scanlines with filter byte 0
  const raw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    raw[y * (1 + size * 4)] = 0;
    for (let x = 0; x < size; x++) {
      const src = (y * size + x) * 4;
      const dst = y * (1 + size * 4) + 1 + x * 4;
      raw[dst] = pixels[src];
      raw[dst+1] = pixels[src+1];
      raw[dst+2] = pixels[src+2];
      raw[dst+3] = pixels[src+3];
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });
  const idat = chunk('IDAT', compressed);
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

for (const size of [16, 32, 48, 128]) {
  const buf = createPNG(size);
  const out = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(out, buf);
  console.log(`✓ icon${size}.png  (${buf.length} bytes)`);
}
console.log('\nAll done! Icons saved to ./icons/');
