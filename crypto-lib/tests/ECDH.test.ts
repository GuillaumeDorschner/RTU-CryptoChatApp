// TODO: make ECDH the tests

import { ECDH } from '../src/CryptoAlgs/ECDH/ECDH';
import { WordArray } from '../src/CryptoAlgs/Utils/WordArray';

describe('ECDH Key Exchange Tests', () => {
  test('Two users should derive the same shared secret', () => {
    const A = ECDH.generateKeyPair();
    expect(A.publicKey).toBeInstanceOf(WordArray);
    expect(A.privateKey).toBeInstanceOf(WordArray);
    expect(A.publicKey.nbBytes).toBe(32);
    expect(A.privateKey.nbBytes).toBe(32);

    const B = ECDH.generateKeyPair();
    expect(B.publicKey).toBeInstanceOf(WordArray);
    expect(B.privateKey).toBeInstanceOf(WordArray);
    expect(B.publicKey.nbBytes).toBe(32);
    expect(B.privateKey.nbBytes).toBe(32);

    const sharedSecretA = ECDH.computeSharedSecret(A.privateKey, B.publicKey);
    expect(sharedSecretA).toBeInstanceOf(WordArray);
    expect(sharedSecretA.nbBytes).toBe(32);

    const sharedSecretB = ECDH.computeSharedSecret(B.privateKey, A.publicKey);
    expect(sharedSecretB).toBeInstanceOf(WordArray);
    expect(sharedSecretB.nbBytes).toBe(32);

    console.log(sharedSecretA);
    console.log(sharedSecretB);

    expect(sharedSecretA).toEqual(sharedSecretB);
  });
});
