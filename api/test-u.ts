const b = Buffer.from('hello', 'utf8');
const ab = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);

const u1 = new Uint8Array(b).buffer;
const u2 = new Uint8Array(ab).buffer;

console.log(u1.byteLength); // 5
console.log(u2.byteLength); // 5
