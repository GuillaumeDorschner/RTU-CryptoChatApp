import { ECC } from '../src/CryptoAlgs/ECC/ecc';
import { Point } from '../src/CryptoAlgs/ECC/point';
import { Secp256k1 } from '../src/CryptoAlgs/ECC/curve';

const eccAlice = new ECC()
const eccBob = new ECC()

describe('ECDH Key Exchange Tests', () => {
  test('Two users should derive the same shared secret', () => {

    const sharedKeyBob = Point.publicKeyToPoint(eccAlice.getPublicKey(), new Secp256k1()).scalarMul(BigInt(eccBob.sk)).x.toString()
    const sharedKeyAlice = Point.publicKeyToPoint(eccBob.getPublicKey(), new Secp256k1()).scalarMul(BigInt(eccAlice.sk)).x.toString()
    

    expect(sharedKeyBob).toEqual(sharedKeyAlice);
  });
});
