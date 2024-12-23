import { ECC, Point, Secp256k1 } from '../ECC';

describe('ECC Key Exchange', () => {
  test('Generate shared secret and verify equivalence', () => {
    const ecc1 = new ECC();
    const ecc2 = new ECC();

    const publicKey1 = Point.publicKeyToPoint(ecc1.getPublicKey(), new Secp256k1());
    const publicKey2 = Point.publicKeyToPoint(ecc2.getPublicKey(), new Secp256k1());

    const sharedSecret1 = publicKey2.scalarMul(ecc1.sk).x;
    const sharedSecret2 = publicKey1.scalarMul(ecc2.sk).x;

    expect(sharedSecret1.toString()).toBe(sharedSecret2.toString());
  });
});
