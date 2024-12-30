import { AESImpl } from "../src/CryptoAlgs/AES/AES";
import { WordArray } from "../src/CryptoAlgs/Utils/WordArray";
import { aesConstants } from "../src/CryptoAlgs/AES/AESConstants";


function getOrThrowStr(input:string|undefined): string{
  if(typeof input === 'string'){
    return input
  }
  throw new Error("string was undefined")
}

function getByteLengthUtf16(input: string): number {
  let byteLength = 0;
  for (const char of input) {
    byteLength += char.charCodeAt(0) > 0xffff ? 4 : 2;
  }
  return byteLength;
}

const message = "new Message"
const testPasswword = "testPassword"
const aesAlice = (new AESImpl()).init(
  getOrThrowStr(testPasswword), 
  getByteLengthUtf16(getOrThrowStr(testPasswword)), 
  aesConstants) 
const aesBob = (new AESImpl()).init(
  getOrThrowStr(testPasswword), 
  getByteLengthUtf16(getOrThrowStr(testPasswword)), 
  aesConstants) 


describe('Whole process', () => {
  it('Is decrypted orginal message', () => {
    const encryptedMessage = WordArray.stringifyBase64(aesAlice.encryptMessage(message.trim(), aesConstants));
    const decryptMessage = aesBob.decryptMessage(WordArray.parseBase64(encryptedMessage), aesConstants);

    expect(decryptMessage).toBe(message);
  });
});
