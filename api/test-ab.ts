import * as fs from 'fs';

const b = Buffer.from('hello', 'utf8');
console.log('Buffer.buffer:', b.buffer !== undefined);

const u = new Uint8Array(b);
console.log('Uint8Array byteLength:', u.byteLength);
console.log('Uint8Array buffer byteLength:', u.buffer.byteLength);

const arrayBuf = u.buffer;
console.log('arrayBuf is ArrayBuffer:', arrayBuf instanceof ArrayBuffer);
