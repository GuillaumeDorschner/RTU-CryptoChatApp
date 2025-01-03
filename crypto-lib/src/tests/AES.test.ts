import { AES } from '../AES/index';
import { WordArray } from '../Utils/WordArray';

describe('AES Encryption-Decryption', () => {
  test('Encrypt and decrypt a message', () => {
    const key = 'MySecretKey12345';
    const message = 'Very to secret message';

    const aes = new AES(key);
    const salt = aes._salt;
    const encryptedMessage = WordArray.stringifyBase64(aes.encryptMessage(message));

    const decryptedMessage = new AES(key, salt).decryptMessage(WordArray.parseBase64(encryptedMessage));

    expect(decryptedMessage).toBe(message);
  });
});
