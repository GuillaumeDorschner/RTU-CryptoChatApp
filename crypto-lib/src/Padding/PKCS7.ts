import { WordArray } from '../Utils/WordArray';

export interface PKCS7 {
  pad(block: WordArray, blockSizeBytes: number): WordArray;
  unpad(block: WordArray): WordArray;
}
export class PKCS7Impl implements PKCS7 {
  pad(data: WordArray, blockSizeBytes: number): WordArray {
    const nPaddingBytes: number = blockSizeBytes - (data.nbBytes % blockSizeBytes);

    const paddingWord = (nPaddingBytes << 24) | (nPaddingBytes << 16) | (nPaddingBytes << 8) | nPaddingBytes;

    const paddingWords = [...Array(Math.ceil(nPaddingBytes / 4)).keys()].map((_) => paddingWord);

    return data.concat(new WordArray(paddingWords, nPaddingBytes));
  }

  unpad(data: WordArray): WordArray {
    const nPaddingBytes = data.words[(data.nbBytes - 1) >>> 2] & 0xff;

    return new WordArray(data.words, data.nbBytes - nPaddingBytes);
  }
}
