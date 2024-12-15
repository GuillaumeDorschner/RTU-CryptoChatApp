import { ECDH, KeyPair } from './ECDH/ECDH';
function testECDH() {
  console.log('Generating key pairs for Alice and Bob...');

  const aliceKeyPair: KeyPair = ECDH.generateKeyPair('curve25519');
  console.log('Alice Key Pair:', aliceKeyPair);

  const bobKeyPair: KeyPair = ECDH.generateKeyPair('curve25519');
  console.log('Bob Key Pair:', bobKeyPair);

  const aliceSharedSecret = ECDH.computeSharedSecret(aliceKeyPair.privateKey, bobKeyPair.publicKey);
  console.log('Alice Shared Secret:', aliceSharedSecret);

  const bobSharedSecret = ECDH.computeSharedSecret(bobKeyPair.privateKey, aliceKeyPair.publicKey);
  console.log('Bob Shared Secret:', bobSharedSecret);
}

testECDH();
