// TODO: Underlying AES implementation
// TODO: improve AES

import { PKCS7Impl } from '../Padding/PKCS7';
import { NumberArrayToBinary } from '../Utils/printFormat';
import { WordArray } from '../Utils/WordArray';
import { AESConstants, aesConstants } from './AESConstants';
import { KeyIVUtils } from './KeyIVUtils';

export class AES {
  _nbRounds!: number;
  _key!: WordArray;
  _iv!: WordArray;
  _keySchedule!: Array<number>;
  _invKeySchedule!: Array<number>;
  _salt!: WordArray;

  readonly paddingPKCS7: PKCS7Impl = new PKCS7Impl();

  constructor(passwordUtf8: string, salt?: WordArray) {
    if (!salt) {
      salt = WordArray.random(64 / 8);
    }
    this._salt = salt;
    const keyAndIV = new KeyIVUtils().computeDerivedKeyAndIV(passwordUtf8, passwordUtf8.length, 4, salt);
    this._iv = keyAndIV.iv;
    this.updateState(keyAndIV.key, aesConstants);
    return this;
  }

  private updateState(
    key: WordArray,
    aesConsts: AESConstants,
  ): { key: WordArray; keySchedule: number[]; ikeySchedule: number[] } {
    if (this._nbRounds && this._key === key) {
      return { key: this._key, keySchedule: this._keySchedule, ikeySchedule: this._invKeySchedule };
    }

    // Shortcuts
    this._key = key;
    const keyWords = key.words;
    const keySize = key.nbBytes / 4;
    const nbRounds = (this._nbRounds = keySize + 6);
    const ksRows = (nbRounds + 1) * 4;
    const keySchedule = (this._keySchedule = this.computeKeySchedule(keyWords, keySize, ksRows, aesConsts));
    const invKeySchedule = (this._invKeySchedule = this.computeInvKeySchedule(ksRows, keySchedule, aesConsts));

    return { key: key, keySchedule: keySchedule, ikeySchedule: invKeySchedule };
  }

  private computeKeySchedule(keyWords: number[], keySize: number, ksRows: number, aesConsts: AESConstants) {
    const keySchedule: Array<number> = (this._keySchedule = []);
    for (let ksRow = 0; ksRow < ksRows; ksRow++) {
      if (ksRow < keySize) {
        keySchedule[ksRow] = keyWords[ksRow];
      } else {
        let t = keySchedule[ksRow - 1];

        if (!(ksRow % keySize)) {
          // Rot word
          t = (t << 8) | (t >>> 24);

          // Sub word
          t =
            (aesConsts.sbox[t >>> 24] << 24) |
            (aesConsts.sbox[(t >>> 16) & 0xff] << 16) |
            (aesConsts.sbox[(t >>> 8) & 0xff] << 8) |
            aesConsts.sbox[t & 0xff];

          // Mix Rcon
          t ^= aesConsts.rcon[(ksRow / keySize) | 0] << 24;
        } else if (keySize > 6 && ksRow % keySize === 4) {
          // Sub word
          t =
            (aesConsts.sbox[t >>> 24] << 24) |
            (aesConsts.sbox[(t >>> 16) & 0xff] << 16) |
            (aesConsts.sbox[(t >>> 8) & 0xff] << 8) |
            aesConsts.sbox[t & 0xff];
        }

        keySchedule[ksRow] = keySchedule[ksRow - keySize] ^ t;
      }
    }

    return keySchedule;
    // Compute key schedule
    //const keySchedulePart1 = [...Array(keySize).keys()].map(ksRow=>keyWords[ksRow])

    //const keySchedulePart2 = [...Array(ksRows).slice(keySize).keys()].map(ksRow=> {
    //    const word = keySchedulePart1[ksRow - 1];
    //
    //    const finalWord: number = (()=> {if (!(ksRow % keySize)) {
    //        // Rot word
    //        const rotatedWord = (word << 8) | (word >>> 24);
    //
    //        // Sub word
    //        const subbedWord = ((aesConstants.sbox[rotatedWord >>> 24] << 24) |
    //            (aesConstants.sbox[(rotatedWord >>> 16) & 0xff] << 16) |
    //            (aesConstants.sbox[(rotatedWord >>> 8) & 0xff] << 8) |
    //            aesConstants.sbox[rotatedWord & 0xff]);
    //
    //        // Mix Rcon
    //        return subbedWord ^ aesConstants.rcon[(ksRow / keySize) | 0] << 24;
    //
    //    } else if (keySize > 6 && ksRow % keySize === 4) {
    //        // Sub word
    //        return ((aesConstants.sbox[word >>> 24] << 24) |
    //        (aesConstants.sbox[(word >>> 16) & 0xff] << 16) |
    //        (aesConstants.sbox[(word >>> 8) & 0xff] << 8) |
    //        aesConstants.sbox[word & 0xff]);
    //    } else return word })()
    //
    //    return keySchedulePart1[ksRow - keySize] ^ finalWord;
    //})
  }

  private computeInvKeySchedule(ksRows: number, keySchedule: number[], aesConsts: AESConstants): number[] {
    const invKeySchedule: Array<number> = (this._invKeySchedule = []);
    for (let invKsRow = 0; invKsRow < ksRows; invKsRow++) {
      const ksRow = ksRows - invKsRow;

      let t;
      if (invKsRow % 4) {
        t = keySchedule[ksRow];
      } else {
        t = keySchedule[ksRow - 4];
      }

      if (invKsRow < 4 || ksRow <= 4) {
        invKeySchedule[invKsRow] = t;
      } else {
        invKeySchedule[invKsRow] =
          aesConsts.invSubMix0[aesConsts.sbox[t >>> 24]] ^
          aesConsts.invSubMix1[aesConsts.sbox[(t >>> 16) & 0xff]] ^
          aesConsts.invSubMix2[aesConsts.sbox[(t >>> 8) & 0xff]] ^
          aesConsts.invSubMix3[aesConsts.sbox[t & 0xff]];
      }
    }
    return invKeySchedule;
  }

  private subShift(word: number, subMixArray: number[], shiftAmmount: 24 | 16 | 8 | 0): number {
    if (shiftAmmount == 16 || shiftAmmount == 8 || shiftAmmount == 0) {
      return subMixArray[(word >>> shiftAmmount) & 0xff];
    } else {
      return subMixArray[word >>> shiftAmmount];
    }
  }

  private mixColumns(bytes: number[]): number {
    return bytes[0] ^ bytes[1] ^ bytes[2] ^ bytes[3];
  }

  private combineFinalBytes(bytes: number[]): number {
    return (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
  }

  private addRoundKey(word: number, keySchedule: number[], ksRow: number): number {
    return word ^ keySchedule[ksRow];
  }

  private doFinalRound(block: number[], sbox: number[], keySchedule: number[], ksRow: number): number[] {
    const subShiftedFinal0 = this.addRoundKey(
      this.combineFinalBytes([
        this.subShift(block[0], sbox, 24),
        this.subShift(block[1], sbox, 16),
        this.subShift(block[2], sbox, 8),
        this.subShift(block[3], sbox, 0),
      ]),
      keySchedule,
      ksRow,
    );
    const subShiftedFinal1 = this.addRoundKey(
      this.combineFinalBytes([
        this.subShift(block[1], sbox, 24),
        this.subShift(block[2], sbox, 16),
        this.subShift(block[3], sbox, 8),
        this.subShift(block[0], sbox, 0),
      ]),
      keySchedule,
      ksRow + 1,
    );
    const subShiftedFinal2 = this.addRoundKey(
      this.combineFinalBytes([
        this.subShift(block[2], sbox, 24),
        this.subShift(block[3], sbox, 16),
        this.subShift(block[0], sbox, 8),
        this.subShift(block[1], sbox, 0),
      ]),
      keySchedule,
      ksRow + 2,
    );
    const subShiftedFinal3 = this.addRoundKey(
      this.combineFinalBytes([
        this.subShift(block[3], sbox, 24),
        this.subShift(block[0], sbox, 16),
        this.subShift(block[1], sbox, 8),
        this.subShift(block[2], sbox, 0),
      ]),
      keySchedule,
      ksRow + 3,
    );

    return [subShiftedFinal0, subShiftedFinal1, subShiftedFinal2, subShiftedFinal3];
  }

  private doRounds(
    block: number[],
    subMixArrays: number[][],
    keySchedule: number[],
    ksRow: number,
    nbRounds: number,
    round: number = 1,
  ): number[] {
    if (round > nbRounds - 1) return block;

    const subShifted0 = [
      this.subShift(block[0], subMixArrays[0], 24),
      this.subShift(block[1], subMixArrays[1], 16),
      this.subShift(block[2], subMixArrays[2], 8),
      this.subShift(block[3], subMixArrays[3], 0),
    ];
    const subShifted1 = [
      this.subShift(block[1], subMixArrays[0], 24),
      this.subShift(block[2], subMixArrays[1], 16),
      this.subShift(block[3], subMixArrays[2], 8),
      this.subShift(block[0], subMixArrays[3], 0),
    ];
    const subShifted2 = [
      this.subShift(block[2], subMixArrays[0], 24),
      this.subShift(block[3], subMixArrays[1], 16),
      this.subShift(block[0], subMixArrays[2], 8),
      this.subShift(block[1], subMixArrays[3], 0),
    ];
    const subShifted3 = [
      this.subShift(block[3], subMixArrays[0], 24),
      this.subShift(block[0], subMixArrays[1], 16),
      this.subShift(block[1], subMixArrays[2], 8),
      this.subShift(block[2], subMixArrays[3], 0),
    ];

    return this.doRounds(
      [
        this.addRoundKey(this.mixColumns(subShifted0), keySchedule, ksRow),
        this.addRoundKey(this.mixColumns(subShifted1), keySchedule, ksRow + 1),
        this.addRoundKey(this.mixColumns(subShifted2), keySchedule, ksRow + 2),
        this.addRoundKey(this.mixColumns(subShifted3), keySchedule, ksRow + 3),
      ],
      subMixArrays,
      keySchedule,
      ksRow + 4,
      nbRounds,
      ++round,
    );
  }

  private cryptBlock(block: number[], keySchedule: number[], subMixArrays: number[][], sbox: number[]): number[] {
    const blockWithRKey: number[] = this.xorBlock(block, keySchedule);
    const ksRow: number = 4;
    const intermediateBlock: number[] = this.doRounds(blockWithRKey, subMixArrays, keySchedule, ksRow, this._nbRounds);
    return this.doFinalRound(intermediateBlock, sbox, keySchedule, 4 + 4 * (this._nbRounds - 1));
  }

  private xorBlock(xoredBlock: number[], xoringBlock: number[]): number[] {
    return [...Array(4).keys()].map((i) => xoredBlock[i] ^ xoringBlock[i]);
  }

  private encryptBlock(
    block: number[],
    prevBlockOrIv: number[],
    aesConsts: AESConstants,
  ): { prevBlock: number[]; rslt: number[] } {
    const xoredBlock = this.xorBlock(block, prevBlockOrIv);
    const cypherText = this.cryptBlock(
      xoredBlock,
      this._keySchedule,
      [aesConsts.subMix0, aesConsts.subMix1, aesConsts.subMix2, aesConsts.subMix3],
      aesConsts.sbox,
    );
    return { prevBlock: cypherText, rslt: cypherText };
  }

  private decryptBlock(
    block: number[],
    prevBlockOrIv: number[],
    aesConsts: AESConstants,
  ): { prevBlock: number[]; rslt: number[] } {
    const newBlock = [block[0], block[3], block[2], block[1]];

    const deciphered = this.cryptBlock(
      newBlock,
      this._invKeySchedule,
      [aesConsts.invSubMix0, aesConsts.invSubMix1, aesConsts.invSubMix2, aesConsts.invSubMix3],
      aesConsts.invSBox,
    );

    const swappedAgain = [deciphered[0], deciphered[3], deciphered[2], deciphered[1]];

    const xoredBlock = this.xorBlock(swappedAgain, prevBlockOrIv);

    return { prevBlock: block, rslt: xoredBlock };
  }

  private processssssssRecurse(
    message: WordArray,
    nBlocksReady: number,
    processBlock: (
      block: number[],
      prevBlockOrIv: number[],
      aesConsts: AESConstants,
    ) => { prevBlock: number[]; rslt: number[] },
    aesConsts: AESConstants,
    blockStartIndex: number = 0,
    processedWords: number[] = [],
    prevBlock: number[] = [],
  ): number[] {
    if (blockStartIndex >= nBlocksReady * 4) return processedWords;
    const prevBlockOrIv = blockStartIndex > 4 ? prevBlock : this._iv.words;
    const rslt: { prevBlock: number[]; rslt: number[] } = processBlock(
      message.words.slice(blockStartIndex, blockStartIndex + 4),
      prevBlockOrIv,
      aesConsts,
    );
    return this.processssssssRecurse(
      message,
      nBlocksReady,
      processBlock,
      aesConsts,
      blockStartIndex + 4,
      [...processedWords, ...rslt.rslt],
      rslt.prevBlock,
    );
  }

  private process(
    message: WordArray,
    aesConsts: AESConstants,
    processBlock: (
      block: number[],
      prevBlockOrIv: number[],
      aesConsts: AESConstants,
    ) => { prevBlock: number[]; rslt: number[] },
  ) {
    const blockSizeBytes = 16;
    const nBlocksReady = Math.ceil(message.nbBytes / blockSizeBytes);
    const nBytesReady = message.nbBytes;
    const processedWords = this.processssssssRecurse(message, nBlocksReady, processBlock, aesConsts);

    // Return processed words
    return new WordArray(processedWords, nBytesReady);
  }

  encryptMessage(message: string): WordArray {
    const waMessage: WordArray = WordArray.utf8StringToWordArray(message);
    const padded: WordArray = this.paddingPKCS7.pad(waMessage, 16);
    const processed: WordArray = this.process(padded, aesConstants, this.encryptBlock.bind(this));
    return processed;
  }

  decryptMessage(cypheredMessage: WordArray): string {
    const processed: WordArray = this.process(cypheredMessage, aesConstants, this.decryptBlock.bind(this));
    const unpadded: WordArray = this.paddingPKCS7.unpad(processed);
    const stringified: string = WordArray.stringifyUtf8(unpadded);
    return stringified;
  }
}
