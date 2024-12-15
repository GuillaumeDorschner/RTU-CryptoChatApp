

function formatWords (word: number, base: 2 | 8 | 16 | 10): string {
    const padding: 8|3|2 = base==2 ? 8 : ((base==8||base==10) ? 3 : 2)
    const bytes = [
        (word >>> 24) & 0xff, // Most significant byte
        (word >>> 16) & 0xff, // Second byte
        (word >>> 8) & 0xff,  // Third byte
        word & 0xff           // Least significant byte
      ];
    return bytes.map(byte => byte.toString(base).padStart(padding, '0')).join('-');
}

export function NumberArrayToHex(ar: number[]): string {
    return ar.map(word=>formatWords(word, 16)).join('_')
}

export function NumberArrayToBase10(ar: number[]): string {
    return ar.map(word=>formatWords(word, 10)).join('_')
}

export function NumberArrayToOctal(ar: number[]): string {
    return ar.map(word=>formatWords(word, 8)).join('_')
}

export function NumberArrayToBinary(ar: number[]): string {
    return ar.map(word=>formatWords(word, 2)).join('_')
}