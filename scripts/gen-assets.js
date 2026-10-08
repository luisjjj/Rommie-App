// Generates placeholder brand PNGs (solid Roomie colors with a center mark).
// Replace with final artwork before production release.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.join(__dirname, '..', 'assets');
fs.mkdirSync(OUT, { recursive: true });

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

// bg: [r,g,b], mark: [r,g,b] centered square covering `markRatio` of width
function png(width, height, bg, mark, markRatio) {
  const stride = width * 3 + 1;
  const raw = Buffer.alloc(stride * height);
  const m = Math.floor(Math.min(width, height) * markRatio);
  const x0 = Math.floor((width - m) / 2);
  const y0 = Math.floor((height - m) / 2);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0; // filter byte: none
    for (let x = 0; x < width; x++) {
      const inMark = x >= x0 && x < x0 + m && y >= y0 && y < y0 + m;
      const c = inMark ? mark : bg;
      const o = y * stride + 1 + x * 3;
      raw[o] = c[0]; raw[o + 1] = c[1]; raw[o + 2] = c[2];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit truecolor
  const idat = zlib.deflateSync(raw);
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

const FOREST = [27, 67, 50];
const CREAM = [250, 246, 238];
const WHITE = [255, 255, 255];

fs.writeFileSync(path.join(OUT, 'icon.png'), png(512, 512, FOREST, CREAM, 0.42));
fs.writeFileSync(path.join(OUT, 'adaptive-icon.png'), png(512, 512, FOREST, CREAM, 0.42));
fs.writeFileSync(path.join(OUT, 'splash.png'), png(1024, 1024, CREAM, FOREST, 0.24));
fs.writeFileSync(path.join(OUT, 'notification-icon.png'), png(96, 96, WHITE, FOREST, 0.5));
console.log('assets written to', OUT);
