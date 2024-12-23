import { AESImpl, aesConstants } from '../AES/index';
import { WordArray } from '../Utils/WordArray';

describe('AES Encryption-Decryption', () => {
  test('Encrypt and decrypt a message', () => {
    const key = 'MySecretKey12345';
    const message = 'Very to secret message';

    const aes = new AESImpl();
    aes.init(key, key.length, aesConstants);
    const salt = aes._salt;
    const encryptedMessage = WordArray.stringifyBase64(aes.encryptMessage(message, aesConstants));

    const decryptedMessage = new AESImpl()
      .init(key, key.length, aesConstants, salt)
      .decryptMessage(WordArray.parseBase64(encryptedMessage), aesConstants);

    expect(decryptedMessage).toBe(message);
  });
});
