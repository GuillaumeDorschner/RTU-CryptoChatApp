import { WordArray } from '../Utils/WordArray';

export interface KeyPair {
  publicKey: WordArray;
  privateKey: WordArray;
}

export class ECDH {
  public static generateKeyPair(curveName: String): KeyPair {
    if (curveName === 'curve25519') {
      const privateKey = ECDH.generatePrivateKey();
      const publicKey = ECDH.x25519(privateKey, ECDH.basepoint());
      return { publicKey, privateKey };
    }

    throw new Error('Invalid curve name, only curve25519 is supported.');
  }

  public static computeSharedSecret(privateKey: WordArray, publicKey: WordArray): WordArray {
    return ECDH.x25519(privateKey, publicKey);
  }

  public static deriveAESKey(sharedSecret: WordArray, keySize: number = 256): WordArray {
    const keyBytes = keySize / 8;
    const outWords = new Uint8Array(32);
    ECDH.wordArrayToUint8(sharedSecret, outWords);

    // for for 128 bits (16 bytes) truncate
    const finalBytes = keyBytes <= 32 ? outWords.slice(0, keyBytes) : ECDH.padKey(outWords, keyBytes);

    return ECDH.uint8ToWordArray(finalBytes);
  }

  private static generatePrivateKey(): WordArray {
    const privateBytes = new Uint8Array(32);
    window.crypto.getRandomValues(privateBytes);

    // Clamp according to X25519 spec
    // privateBytes[0] & 248 (0b11111000)
    // privateBytes[31] & 127 (0b01111111), then privateBytes[31] | 64 (0b01000000)
    privateBytes[0] &= 248;
    privateBytes[31] &= 127;
    privateBytes[31] |= 64;

    return ECDH.uint8ToWordArray(privateBytes);
  }

  private static basepoint(): WordArray {
    const base = new Uint8Array(32);
    base[0] = 9;
    return ECDH.uint8ToWordArray(base);
  }

  private static wordArrayToUint8(wordArr: WordArray, out: Uint8Array) {
    let byteIndex = 0;
    for (let i = 0; i < wordArr.words.length; i++) {
      const word = wordArr.words[i];
      const b0 = (word >>> 24) & 0xff;
      const b1 = (word >>> 16) & 0xff;
      const b2 = (word >>> 8) & 0xff;
      const b3 = word & 0xff;

      if (byteIndex < wordArr.nbBytes) out[byteIndex++] = b0;
      if (byteIndex < wordArr.nbBytes) out[byteIndex++] = b1;
      if (byteIndex < wordArr.nbBytes) out[byteIndex++] = b2;
      if (byteIndex < wordArr.nbBytes) out[byteIndex++] = b3;
    }
  }

  private static uint8ToWordArray(u8: Uint8Array): WordArray {
    const words: number[] = [];
    for (let i = 0; i < u8.length; i += 4) {
      words.push(((u8[i] & 0xff) << 24) | ((u8[i + 1] & 0xff) << 16) | ((u8[i + 2] & 0xff) << 8) | (u8[i + 3] & 0xff));
    }
    return new WordArray(words, u8.length);
  }

  private static padKey(key: Uint8Array, length: number): Uint8Array {
    const padded = new Uint8Array(length);
    padded.set(key);
    return padded;
  }

  private static x25519(privateKey: WordArray, publicKey: WordArray): WordArray {
    const scalar = new Uint8Array(32);
    const u = new Uint8Array(32);

    ECDH.wordArrayToUint8(privateKey, scalar);
    ECDH.wordArrayToUint8(publicKey, u);

    const result = ECDH.curve25519_ladder(scalar, u);
    return ECDH.uint8ToWordArray(result);
  }

  private static curve25519_ladder(k: Uint8Array, u: Uint8Array): Uint8Array {
    const x1 = ECDH.fe_frombytes(u);
    // Initialize points
    let x2 = ECDH.fe_1();
    let z2 = ECDH.fe_0();
    let x3 = x1.slice();
    let z3 = ECDH.fe_1();
    let swap = 0;
    for (let t = 254; t >= 0; --t) {
      const kt = (k[t >>> 3] >>> (t & 7)) & 1;
      swap ^= kt;
      [x2, x3] = ECDH.fe_cswap(x2, x3, swap);
      [z2, z3] = ECDH.fe_cswap(z2, z3, swap);
      swap = kt;

      let A = ECDH.fe_add(x2, z2);
      let AA = ECDH.fe_square(A);
      let B = ECDH.fe_sub(x2, z2);
      let BB = ECDH.fe_square(B);
      let E = ECDH.fe_sub(AA, BB);
      let C = ECDH.fe_add(x3, z3);
      let D = ECDH.fe_sub(x3, z3);
      let DD = ECDH.fe_square(D);
      let CC = ECDH.fe_square(C);
      let F = ECDH.fe_sub(CC, DD);
      let G = ECDH.fe_mul(AA, BB);
      x2 = ECDH.fe_mul(F, B);
      x3 = ECDH.fe_mul(E, C);
      let H = ECDH.fe_mul(E, E);
      z2 = ECDH.fe_mul(F, A);
      z3 = ECDH.fe_mul(H, G);
    }
    [x2, x3] = ECDH.fe_cswap(x2, x3, swap);
    [z2, z3] = ECDH.fe_cswap(z2, z3, swap);

    let inv = ECDH.fe_invert(z2);
    let x = ECDH.fe_mul(x2, inv);

    const out = new Uint8Array(32);
    ECDH.fe_tobytes(out, x);
    return out;
  }

  private static fe_0(): number[] {
    return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }

  private static fe_1(): number[] {
    const r = ECDH.fe_0();
    r[0] = 1;
    return r;
  }

  private static fe_frombytes(s: Uint8Array): number[] {
    const h0 = s[0] | (s[1] << 8) | (s[2] << 16) | ((s[3] & 0x3) << 24);
    const h1 = (s[3] >>> 2) | (s[4] << 6) | (s[5] << 14) | ((s[6] & 0x1) << 22);
    const h2 = (s[6] >>> 1) | (s[7] << 7) | (s[8] << 15) | ((s[9] & 0x7) << 23);
    const h3 = (s[9] >>> 3) | (s[10] << 5) | (s[11] << 13) | ((s[12] & 0x3) << 21);
    const h4 = (s[12] >>> 2) | (s[13] << 6) | (s[14] << 14) | ((s[15] & 0x7) << 22);
    const h5 = (s[15] >>> 3) | (s[16] << 5) | (s[17] << 13) | ((s[18] & 0x3) << 21);
    const h6 = (s[18] >>> 2) | (s[19] << 6) | (s[20] << 14) | ((s[21] & 0x7) << 22);
    const h7 = (s[21] >>> 3) | (s[22] << 5) | (s[23] << 13) | ((s[24] & 0x3) << 21);
    const h8 = (s[24] >>> 2) | (s[25] << 6) | (s[26] << 14) | ((s[27] & 0x7) << 22);
    const h9 = (s[27] >>> 3) | (s[28] << 5) | (s[29] << 13) | ((s[30] & 0x3) << 21);

    return [
      h0 & 0x3ffffff,
      h1 & 0x3ffffff,
      h2 & 0x3ffffff,
      h3 & 0x3ffffff,
      h4 & 0x3ffffff,
      h5 & 0x3ffffff,
      h6 & 0x3ffffff,
      h7 & 0x3ffffff,
      h8 & 0x3ffffff,
      h9 & 0x3ffffff,
    ];
  }

  private static fe_tobytes(s: Uint8Array, h: number[]) {
    let t = new Uint32Array(10);
    for (let i = 0; i < 10; i++) t[i] = h[i];

    let outNum = BigInt(0);
    for (let i = 0; i < 10; i++) {
      outNum |= BigInt(t[i]) << BigInt(i * 26);
    }
    for (let i = 0; i < 32; i++) {
      s[i] = Number((outNum >> BigInt(i * 8)) & BigInt(0xff));
    }
  }

  private static fe_add(a: number[], b: number[]): number[] {
    const r = new Array(10);
    for (let i = 0; i < 10; i++) r[i] = (a[i] + b[i]) | 0;
    return r;
  }

  private static fe_sub(a: number[], b: number[]): number[] {
    const r = new Array(10);
    for (let i = 0; i < 10; i++) r[i] = (a[i] - b[i]) | 0;
    return r;
  }

  private static fe_square(a: number[]): number[] {
    return ECDH.fe_mul(a, a);
  }

  private static fe_mul(a: number[], b: number[]): number[] {
    const r = new Array(10).fill(0);
    for (let i = 0; i < 10; i++) {
      let carry = 0;
      for (let j = 0; j < 10; j++) {
        const v = r[(i + j) % 10] + a[i] * b[j] + carry;
        r[(i + j) % 10] = v & 0x3ffffff;
        carry = v >>> 26;
      }
    }
    return r;
  }

  private static fe_invert(a: number[]): number[] {
    return ECDH.fe_1();
  }

  private static fe_cswap(a: number[], b: number[], swap: number): [number[], number[]] {
    if (swap) {
      return [b, a];
    } else {
      return [a, b];
    }
  }
}
