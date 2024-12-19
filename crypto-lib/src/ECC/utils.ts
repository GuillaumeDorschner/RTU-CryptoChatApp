export function getRandomNumber(bytes = 32, modulus?: bigint) {
  const array = new Uint8Array(bytes);

  crypto.getRandomValues(array);

  // See: https://stackoverflow.com/a/75259983
  const hexString = Array.from(array)
    .map((i) => i.toString(16).padStart(2, '0'))
    .join('');

  const number = BigInt(`0x${hexString}`);

  if (modulus) {
    return mod(number, modulus);
  }

  return number;
}

export function mod(a: bigint, b: bigint) {
  const result = a % b;
  return result >= 0 ? result : result + b;
}

// LSB -> MSB.
export function* toBinary(number: bigint) {
  while (number) {
    yield number & 1n;
    number >>= 1n;
  }
}

// See: https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm#Pseudocode
// See: https://brilliant.org/wiki/extended-euclidean-algorithm
// Returns [gcd, x, y] such that `(a * x) + (b * y) = gcd` (`gcd` -> `gcd(a, b)`).
export function egcd(a: bigint, b: bigint) {
  let x = 0n;
  let y = 1n;
  let u = 1n;
  let v = 0n;

  while (a !== 0n) {
    const q = b / a;
    const r = b % a;
    const m = x - u * q;
    const n = y - v * q;
    b = a;
    a = r;
    x = u;
    y = v;
    u = m;
    v = n;
  }

  const gcd = b;

  return [gcd, x, y];
}

// Returns multiplicative inverse of `number` modulo `modulus`.
// Returns integer `x` s.th. `(number * x) % modulus === 1`.
export function inverseOf(number: bigint, modulus: bigint) {
  const a = mod(number, modulus);
  const [gcd, x, y] = egcd(a, modulus);

  if (gcd !== 1n) {
    // Either `number` is 0 or `modulus` is not prime.
    throw new Error(`${number} has no multiplicative inverse modulo ${modulus}...`);
  }

  return mod(x, modulus);
}

export function int2Hex(number: bigint, prefix = true, pad = true) {
  const padding = pad ? 32 : 1;
  const result = buf2hex(int2BytesBe(number, padding), false);

  if (prefix) {
    return `0x${result}`;
  }

  return result;
}

export function hex2Int(hex: string) {
  if (hex.startsWith('0x')) {
    hex = hex.slice(2);
  }

  const result = fromBigEndian(hex2buf(hex));

  return result;
}

// See: https://stackoverflow.com/a/40031979
export function buf2hex(buffer: Uint8Array, prefix = true) {
  const result = [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, '0')).join('');

  if (prefix) {
    return `0x${result}`;
  }

  return result;
}

// See: https://stackoverflow.com/a/40031979
export function hex2buf(hex: string): Uint8Array {
  // Remove optional "0x" prefix if present
  if (hex.startsWith('0x')) {
    hex = hex.slice(2);
  }

  // Ensure the hex string has an even length
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex string: must have an even length.');
  }

  // Convert each pair of hex characters into a byte
  const byteArray = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    byteArray[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }

  return byteArray;
}

// See: https://stackoverflow.com/a/56943145
export function int2BytesBe(int: bigint, padding = 32) {
  return int2BytesLe(int, padding).reverse();
}

// See: https://stackoverflow.com/a/56943145
export function int2BytesLe(int: bigint, padding = 32) {
  const result = new Uint8Array(padding);

  let i = 0;
  let bigint = int;
  while (bigint > 0n) {
    result[i] = Number(bigint % 256n);
    bigint = bigint / 256n;
    i += 1;
  }

  return result;
}

export function fromLittleEndian(bytes: Uint8Array) {
  let result = 0n;
  let base = 1n;
  bytes.forEach(function (byte) {
    result += base * BigInt(byte);
    base = base * 256n;
  });
  return result;
}

export function fromBigEndian(bytes: Uint8Array) {
  return fromLittleEndian(bytes.reverse());
}
