import { PKCS7Impl } from "../Padding/PKCS7";
import { NumberArrayToBinary } from "../Utils/printFormat";
import { WordArray } from "../Utils/WordArray";
import { AESConstants, aesConstants } from "./AESConstants";
import { KeyIVUtils } from "./KeyIVUtils";
interface AES {
    createCipherKey(): number[];
    encrypt: any;
    decrypt: any;
}
export class AESImpl {

    _nbRounds!: number;
    _key!: WordArray;
    _iv!: WordArray;
    _keySchedule!: Array<number>;
    _invKeySchedule!: Array<number>;
    _salt!: WordArray


    readonly paddingPKCS7: PKCS7Impl = (new PKCS7Impl)

    init(passwordUtf8: string, keySize: number, aesConstants: AESConstants, salt?:WordArray): AESImpl {
        if(!salt){
            salt = WordArray.random(64 / 8);
        }
        this._salt = salt
        const keyAndIV = (new KeyIVUtils).computeDerivedKeyAndIV(passwordUtf8, keySize, 4, salt)
        //const key = new WordArray([
        //    653745428,
        //    -162117686,
        //    2145768267,
        //    -1794206835,
        //    278504082,
        //    -801674998,
        //    -1243076349,
        //    -2119957319,
        //    -2091216879,
        //    -2003306387,
        //    -222491591,
        //    -1023359112,
        //  ], 32)
        this._iv = keyAndIV.iv //new WordArray( [-2091216879,-2003306387,-222491591,-1023359112,], 16)//
        this.updateState(keyAndIV.key, aesConstants)
        return this
    }

    updateState(key: WordArray, aesConstants: AESConstants): {key: WordArray, keySchedule: number[], ikeySchedule: number[]} {
        if (this._nbRounds && this._key === key) {
            return {key: this._key, keySchedule: this._keySchedule, ikeySchedule: this._invKeySchedule};
        }

        // Shortcuts
        this._key = key;
        const keyWords = key.words
        const keySize = key.nbBytes/4
        const nbRounds = this._nbRounds = keySize+6
        const ksRows = (nbRounds+1)*4
        const keySchedule = this._keySchedule = this.computeKeySchedule(keyWords, keySize, ksRows, aesConstants)
        const invKeySchedule = this._invKeySchedule = this.computeInvKeySchedule(keyWords, keySize, ksRows, keySchedule, aesConstants) 
        
        return {key: key, keySchedule: keySchedule, ikeySchedule: invKeySchedule};
    }


    computeKeySchedule(keyWords: number[], keySize: number, ksRows: number, aesConstants: AESConstants) {
        
        const keySchedule: Array<number> = this._keySchedule = [];
        for (let ksRow = 0; ksRow < ksRows; ksRow++) {
            if (ksRow < keySize) {
                keySchedule[ksRow] = keyWords[ksRow];
            } else {
                let t = keySchedule[ksRow - 1];

                if (!(ksRow % keySize)) {
                    // Rot word
                    t = (t << 8) | (t >>> 24);

                    // Sub word
                    t = (aesConstants.sbox[t >>> 24] << 24) | (aesConstants.sbox[(t >>> 16) & 0xff] << 16) | (aesConstants.sbox[(t >>> 8) & 0xff] << 8) | aesConstants.sbox[t & 0xff];

                    // Mix Rcon
                    t ^= aesConstants.rcon[(ksRow / keySize) | 0] << 24;
                } else if (keySize > 6 && ksRow % keySize === 4) {
                    // Sub word
                    t = (aesConstants.sbox[t >>> 24] << 24) | (aesConstants.sbox[(t >>> 16) & 0xff] << 16) | (aesConstants.sbox[(t >>> 8) & 0xff] << 8) | aesConstants.sbox[t & 0xff];
                }

                keySchedule[ksRow] = keySchedule[ksRow - keySize] ^ t;
            }
        }

        return keySchedule
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

    computeInvKeySchedule(keyWords: number[], keySize: number, ksRows: number, keySchedule: number[] , aesConstants: AESConstants): number[] {
        
        const invKeySchedule: Array<number> = this._invKeySchedule = [];
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
                invKeySchedule[invKsRow] = aesConstants.invSubMix0[aesConstants.sbox[t >>> 24]] ^ aesConstants.invSubMix1[aesConstants.sbox[(t >>> 16) & 0xff]] ^
                aesConstants.invSubMix2[aesConstants.sbox[(t >>> 8) & 0xff]] ^ aesConstants.invSubMix3[aesConstants.sbox[t & 0xff]];
            }
        }
        return invKeySchedule
        
    }


    subShift(word: number, subMixArray: number[], shiftAmmount: 24|16|8|0): number {
        if(shiftAmmount==16||shiftAmmount==8||shiftAmmount==0){
            return subMixArray[(word >>> shiftAmmount) & 0xff]
        }
        else{
            return subMixArray[word >>> shiftAmmount]
        } 
    }

    mixColumns(bytes: number[]): number {
        return bytes[0] ^ bytes[1] ^ bytes[2] ^ bytes[3]
    }

    combineFinalBytes(bytes: number[]): number {
        return bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3]
    }

    addRoundKey(word: number, keySchedule: number[], ksRow: number): number {
        return word ^ keySchedule[ksRow]
    }

    doFinalRound(block: number[], sbox: number[], keySchedule: number[], ksRow: number): number[] {
        
        const subShiftedFinal0 = this.addRoundKey(this.combineFinalBytes([this.subShift(block[0], sbox, 24),this.subShift(block[1], sbox, 16),this.subShift(block[2], sbox, 8),this.subShift(block[3], sbox, 0)]), keySchedule, ksRow);    
        const subShiftedFinal1 = this.addRoundKey(this.combineFinalBytes([this.subShift(block[1], sbox, 24),this.subShift(block[2], sbox, 16),this.subShift(block[3], sbox, 8),this.subShift(block[0], sbox, 0)]), keySchedule, ksRow+1);   
        const subShiftedFinal2 = this.addRoundKey(this.combineFinalBytes([this.subShift(block[2], sbox, 24),this.subShift(block[3], sbox, 16),this.subShift(block[0], sbox, 8),this.subShift(block[1], sbox, 0)]), keySchedule, ksRow+2);   
        const subShiftedFinal3 = this.addRoundKey(this.combineFinalBytes([this.subShift(block[3], sbox, 24),this.subShift(block[0], sbox, 16),this.subShift(block[1], sbox, 8),this.subShift(block[2], sbox, 0)]), keySchedule, ksRow+3);   
        
        return [subShiftedFinal0, subShiftedFinal1, subShiftedFinal2, subShiftedFinal3]
    }


    doRounds(block: number[], subMixArrays: number[][], keySchedule: number[], ksRow: number, nbRounds: number, round:number=1): number[] {
        
        if(round>nbRounds-1) return block

        const subShifted0 = [this.subShift(block[0], subMixArrays[0], 24), this.subShift(block[1], subMixArrays[1], 16), this.subShift(block[2], subMixArrays[2], 8), this.subShift(block[3], subMixArrays[3], 0)];   
        const subShifted1 = [this.subShift(block[1], subMixArrays[0], 24), this.subShift(block[2], subMixArrays[1], 16), this.subShift(block[3], subMixArrays[2], 8), this.subShift(block[0], subMixArrays[3], 0)];   
        const subShifted2 = [this.subShift(block[2], subMixArrays[0], 24), this.subShift(block[3], subMixArrays[1], 16), this.subShift(block[0], subMixArrays[2], 8), this.subShift(block[1], subMixArrays[3], 0)];   
        const subShifted3 = [this.subShift(block[3], subMixArrays[0], 24), this.subShift(block[0], subMixArrays[1], 16), this.subShift(block[1], subMixArrays[2], 8), this.subShift(block[2], subMixArrays[3], 0)];   

        return this.doRounds(
            [
                this.addRoundKey(this.mixColumns(subShifted0), keySchedule, ksRow),
                this.addRoundKey(this.mixColumns(subShifted1), keySchedule, ksRow+1),
                this.addRoundKey(this.mixColumns(subShifted2), keySchedule, ksRow+2),
                this.addRoundKey(this.mixColumns(subShifted3), keySchedule, ksRow+3),
            ],
            subMixArrays,
            keySchedule,
            ksRow+4,
            nbRounds,
            ++round
        )
    }


    cryptBlock(
        block: number[],
        keySchedule: number[],
        subMixArrays: number[][],
        sbox: number[]
    ): number[] {

        const blockWithRKey: number[] = this.xorBlock(block, keySchedule)
        const ksRow: number = 4
        const intermediateBlock: number[] = this.doRounds(blockWithRKey, subMixArrays,keySchedule, ksRow, this._nbRounds)
        return this.doFinalRound(intermediateBlock, sbox, keySchedule, 4+4*(this._nbRounds-1))
    }

    xorBlock(xoredBlock: number[], xoringBlock: number[]): number[] {
        return [...Array(4).keys()].map(i=>xoredBlock[i] ^ xoringBlock[i])
    }

    encryptBlock(block: number[], prevBlockOrIv: number[], aesConstants: AESConstants): {prevBlock:number[], rslt:number[]} {
        const xoredBlock = this.xorBlock(block, prevBlockOrIv)
        //console.log("xoredBlock: "+NumberArrayToBinary(xoredBlock) )
        const cypherText = this.cryptBlock(xoredBlock, this._keySchedule, [aesConstants.subMix0, aesConstants.subMix1, aesConstants.subMix2, aesConstants.subMix3], aesConstants.sbox)
        //console.log("cypherText: "+NumberArrayToBinary(cypherText) )
        return {prevBlock:cypherText, rslt:cypherText}
    }
    
    decryptBlock(block: number[], prevBlockOrIv: number[], aesConstants: AESConstants): {prevBlock:number[], rslt:number[]} {


        const newBlock = [block[0], block[3], block[2], block[1]]
        //console.log("newBlock: "+NumberArrayToBinary(newBlock) )

        const deciphered = this.cryptBlock(newBlock, this._invKeySchedule, [aesConstants.invSubMix0, aesConstants.invSubMix1, aesConstants.invSubMix2, aesConstants.invSubMix3], aesConstants.invSBox)
        //console.log("deciphered: "+NumberArrayToBinary(deciphered) )

        const swappedAgain = [deciphered[0], deciphered[3], deciphered[2], deciphered[1]]
        //console.log("swappedAgain: "+NumberArrayToBinary(swappedAgain) )

        const xoredBlock = this.xorBlock(swappedAgain, prevBlockOrIv)

        return {prevBlock:block, rslt:xoredBlock  }
    }

    
    processssssssRecurse(
        message: WordArray, 
        nBlocksReady: number,
        processBlock: (block: number[], prevBlockOrIv: number[], aesConstants: AESConstants)=> {prevBlock:number[], rslt:number[]},
        aesConstants: AESConstants,
        blockStartIndex: number = 0,
        processedWords: number[] = [], 
        prevBlock: number[] = []
    ): number[] {

        if(blockStartIndex>=nBlocksReady*4) return processedWords
        const prevBlockOrIv = blockStartIndex>4 ? prevBlock : this._iv.words
        const rslt: {prevBlock:number[], rslt:number[]} = processBlock(message.words.slice(blockStartIndex, blockStartIndex+4), prevBlockOrIv, aesConstants)
        return this.processssssssRecurse(message, nBlocksReady, processBlock, 
            aesConstants, blockStartIndex+4, [...processedWords, ...rslt.rslt], rslt.prevBlock)
    }

    process(
        message: WordArray, 
        aesConstants: AESConstants,
        processBlock: (block: number[], prevBlockOrIv: number[], aesConstants: AESConstants)=> {prevBlock:number[], rslt:number[]} 
    ) {

        const blockSizeBytes = 16;
        const nBlocksReady = Math.ceil(message.nbBytes / blockSizeBytes);
        const nBytesReady = message.nbBytes;
        const processedWords = this.processssssssRecurse(message, nBlocksReady, processBlock, aesConstants)

        // Return processed words
        return new WordArray(processedWords, nBytesReady);
    }

    encryptMessage(message: string, aesConstants: AESConstants): WordArray {
        const waMessage: WordArray= WordArray.utf8StringToWordArray(message)
        //console.log("waMessage: "+NumberArrayToBinary(waMessage.words) )
        const padded: WordArray= this.paddingPKCS7.pad(waMessage, 16)
        //console.log("padded: "+NumberArrayToBinary(padded.words) )
        const processed: WordArray = this.process(padded, aesConstants, this.encryptBlock.bind(this))
        //console.log("processed: "+NumberArrayToBinary(waMessage.words) )
        return processed
    }

    decryptMessage(cypheredMessage: WordArray, aesConstants:AESConstants): string {

        const processed: WordArray = this.process(cypheredMessage, aesConstants, this.decryptBlock.bind(this))
        const unpadded: WordArray= this.paddingPKCS7.unpad(processed)
        const stringified: string = WordArray.stringifyUtf8(unpadded)
        return stringified
    }


}


//export function createAESImpl(): AES {
//    {
//        
//    }
//}