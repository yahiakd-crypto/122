// ============================================================
// Pure-JS ZIP writer (STORE method, no compression, no deps).
// Reads [{ path, content }] and returns a Uint8Array .zip blob.
// ============================================================

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

export function buildZip(files) {
  const enc = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;
  const toBytes = (s) => (enc ? enc.encode(s) : new Uint8Array([...s].map(ch => ch.charCodeAt(0) & 0xff)));

  const entries = files.map(f => ({ path: String(f.path || "file.txt"), data: toBytes(String(f.content ?? "")) }));

  const out = [];
  const pushU16 = (v) => { out.push(v & 0xff, (v >>> 8) & 0xff); };
  const pushU32 = (v) => { out.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff); };

  const DOS_DATE = 0x5021; // ~2020-01-01 (year 2020 in DOS format)

  const localOffsets = [];
  for (const e of entries) {
    const name = toBytes(e.path);
    const crc = crc32(e.data);
    localOffsets.push(out.length);
    pushU32(0x04034b50);       // local file header signature
    pushU16(20);                // version needed to extract
    pushU16(0x0800);            // general purpose flag: UTF-8 names
    pushU16(0);                 // compression method: STORE
    pushU16(0);                 // last mod time
    pushU16(DOS_DATE);          // last mod date
    pushU32(crc);
    pushU32(e.data.length);     // compressed size
    pushU32(e.data.length);     // uncompressed size
    pushU16(name.length);
    pushU16(0);                 // extra field length
    for (const b of name) out.push(b);
    for (const b of e.data) out.push(b);
  }

  const centralStart = out.length;
  entries.forEach((e, i) => {
    const name = toBytes(e.path);
    const crc = crc32(e.data);
    pushU32(0x02014b50);        // central directory signature
    pushU16(20);                // version made by
    pushU16(20);                // version needed
    pushU16(0x0800);            // flags
    pushU16(0);                 // method: STORE
    pushU16(0);                 // mod time
    pushU16(DOS_DATE);          // mod date
    pushU32(crc);
    pushU32(e.data.length);
    pushU32(e.data.length);
    pushU16(name.length);
    pushU16(0);                 // extra len
    pushU16(0);                 // comment len
    pushU16(0);                 // disk number start
    pushU16(0);                 // internal attrs
    pushU32(0);                 // external attrs
    pushU32(localOffsets[i]);   // local header offset
    for (const b of name) out.push(b);
  });

  const centralSize = out.length - centralStart;

  pushU32(0x06054b50);          // end of central directory
  pushU16(0);
  pushU16(0);
  pushU16(entries.length);
  pushU16(entries.length);
  pushU32(centralSize);
  pushU32(centralStart);
  pushU16(0);

  return new Uint8Array(out);
}

export function zipDownloadUrl(files, name = "shopify-theme.zip") {
  const buf = buildZip(files);
  const blob = new Blob([buf], { type: "application/zip" });
  return URL.createObjectURL(blob);
}