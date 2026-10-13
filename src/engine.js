export const mask = width => (1n << BigInt(width)) - 1n;
export function parseValue(text, base, width) {
  let s = text.trim().replace(/[ _]/g, '');
  if (!s) throw Error('Enter a value to begin.');
  const negative = s.startsWith('-');
  if (/^[+-]/.test(s)) s = s.slice(1);
  const prefixes = { 16: /^0x/i, 2: /^0b/i, 8: /^0o/i };
  if (prefixes[base]) s = s.replace(prefixes[base], '');
  const patterns = { 16: /^[0-9a-f]+$/i, 10: /^\d+$/, 2: /^[01]+$/, 8: /^[0-7]+$/ };
  if (!patterns[base]?.test(s)) throw Error(`Invalid base-${base} value.`);
  let n = BigInt(({16:'0x',2:'0b',8:'0o',10:''})[base] + s);
  if (negative) n = -n;
  if (n < -(1n << BigInt(width - 1)) || n > mask(width)) throw Error(`Value is outside the ${width}-bit range.`);
  return n & mask(width);
}
export function signed(n, width) { return n & (1n << BigInt(width - 1)) ? n - (1n << BigInt(width)) : n; }
export function bytes(n, width, little = false) {
  const parts = n.toString(16).padStart(width / 4, '0').toUpperCase().match(/../g);
  return (little ? parts.reverse() : parts).join(' ');
}
export function swap(n, width) { return BigInt('0x' + bytes(n, width, true).replaceAll(' ', '')); }
export function floatValue(n, width) {
  if (![32,64].includes(width)) return 'Requires 32 or 64 bits';
  const view = new DataView(new ArrayBuffer(width / 8));
  if (width === 32) { view.setUint32(0, Number(n)); return view.getFloat32(0); }
  view.setBigUint64(0,n); return view.getFloat64(0);
}
export function floatBits(text, width) {
  if (![32,64].includes(width)) throw Error('IEEE 754 input requires 32 or 64 bits.');
  if (!text.trim() || (Number.isNaN(Number(text)) && text.trim().toLowerCase() !== 'nan')) throw Error('Invalid floating-point value.');
  const view = new DataView(new ArrayBuffer(width/8));
  if (width === 32) { view.setFloat32(0,Number(text)); return BigInt(view.getUint32(0)); }
  view.setFloat64(0,Number(text)); return view.getBigUint64(0);
}
export function fixed(n, width, fraction) {
  const val = signed(n,width), neg = val < 0n, abs = neg ? -val : val, scale = 1n << BigInt(fraction);
  const remainder = abs % scale;
  return (neg ? '-' : '') + (abs / scale) + (remainder ? '.' + (remainder * 5n ** BigInt(fraction)).toString().padStart(fraction,'0').replace(/0+$/,'') : '');
}
export function operate(n, width, op, amount = 1) {
  const w = BigInt(width), k = BigInt(amount), m = mask(width);
  if (op === 'not') return (~n) & m;
  if (op === 'neg') return (-n) & m;
  if (op === 'swap') return swap(n,width);
  if (op === 'shl') return (n << k) & m;
  if (op === 'shr') return n >> k;
  if (op === 'sar') return (signed(n,width) >> k) & m;
  if (op === 'rol') { const r = k % w; return ((n << r) | (n >> (w-r))) & m; }
  if (op === 'ror') { const r = k % w; return ((n >> r) | (n << (w-r))) & m; }
  return n;
}
export function addressParts(n) {
  const address = n & mask(32);
  return { high: ((address + 0x8000n) >> 16n) & 0xffffn, low: signed(address & 0xffffn,16) };
}
