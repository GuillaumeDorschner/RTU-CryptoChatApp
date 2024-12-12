import { WordArray } from "../Utils/WordArray";
import { AESConstants, aesConstants } from "./AESConstants";
interface AES {
    createCipherKey(): number[];
    encrypt: any;
    decrypt: any;
}
class AESImpl {

    _nbRounds!: number;
    _key!: WordArray;
    _keySchedule!: Array<number>;
    _invKeySchedule!: Array<number>;

    updateState(key: WordArray, aesConstants: AESConstants): {key: WordArray, keySchedule: number[], ikeySchedule: number[]} {
        if (this._nbRounds && this._key === key) {
            return {key: this._key, keySchedule: this._keySchedule, ikeySchedule: this._invKeySchedule};
        }

        // Shortcuts
        this._key = key;
        const keyWords = key.words
        const keySize = key.nbBytes/4
        const nbRounds = keySize+6
        const ksRows = (nbRounds+1)*4
        const keySchedule = this._keySchedule = this.computeKeySchedule(keyWords, keySize, ksRows, aesConstants)
        const invKeySchedule = this._invKeySchedule = this.computeInvKeySchedule(keyWords, keySize, ksRows, keySchedule, aesConstants) 
        
        return {key: key, keySchedule: keySchedule, ikeySchedule: invKeySchedule};
    }


    computeKeySchedule(keyWords: number[], keySize: number, ksRows: number, aesConstants: AESConstants) {
        
        // Compute key schedule
        const keySchedulePart1 = [...Array(keySize).keys()].map(ksRow=>keyWords[ksRow])

        const keySchedulePart2 = [...Array(ksRows).slice(keySize).keys()].map(ksRow=> {
            const word = keySchedulePart1[ksRow - 1];

            const finalWord: number = (()=> {if (!(ksRow % keySize)) {
                // Rot word
                const rotatedWord = (word << 8) | (word >>> 24);

                // Sub word
                const subbedWord = ((aesConstants.sbox[rotatedWord >>> 24] << 24) | 
                    (aesConstants.sbox[(rotatedWord >>> 16) & 0xff] << 16) | 
                    (aesConstants.sbox[(rotatedWord >>> 8) & 0xff] << 8) | 
                    aesConstants.sbox[rotatedWord & 0xff]);

                // Mix Rcon
                return subbedWord ^ aesConstants.rcon[(ksRow / keySize) | 0] << 24;
            
            } else if (keySize > 6 && ksRow % keySize === 4) {
                // Sub word
                return ((aesConstants.sbox[word >>> 24] << 24) | 
                (aesConstants.sbox[(word >>> 16) & 0xff] << 16) | 
                (aesConstants.sbox[(word >>> 8) & 0xff] << 8) | 
                aesConstants.sbox[word & 0xff]);
            } else return word })()

            return keySchedulePart1[ksRow - keySize] ^ finalWord;
        })

        return [...keySchedulePart1, ...keySchedulePart2]

    }

    computeInvKeySchedule(keyWords: number[], keySize: number, ksRows: number, keySchedule: number[] , aesConstants: AESConstants): number[] {
        
        return [...Array(ksRows).keys()].map(invKsRow=>{
            const ksRow = ksRows - invKsRow;
            const word = invKsRow%4 ? keySchedule[ksRow] : keySchedule[ksRow-4]
            
            if (invKsRow < 4 || ksRow <= 4) {
                return word;
            } else {
                return (aesConstants.invSubMix0[aesConstants.sbox[word >>> 24]] ^
                    aesConstants.invSubMix1[aesConstants.sbox[(word >>> 16) & 0xff]] ^
                    aesConstants.invSubMix2[aesConstants.sbox[(word >>> 8) & 0xff]] ^ 
                    aesConstants.invSubMix3[aesConstants.sbox[word & 0xff]])
            }
        })
        
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
        const subShiftedFinal1 = this.addRoundKey(this.combineFinalBytes([this.subShift(block[1], sbox, 24),this.subShift(block[2], sbox, 16),this.subShift(block[3], sbox, 8),this.subShift(block[0], sbox, 0)]), keySchedule, ksRow);   
        const subShiftedFinal2 = this.addRoundKey(this.combineFinalBytes([this.subShift(block[2], sbox, 24),this.subShift(block[3], sbox, 16),this.subShift(block[0], sbox, 8),this.subShift(block[1], sbox, 0)]), keySchedule, ksRow);   
        const subShiftedFinal3 = this.addRoundKey(this.combineFinalBytes([this.subShift(block[3], sbox, 24),this.subShift(block[0], sbox, 16),this.subShift(block[1], sbox, 8),this.subShift(block[2], sbox, 0)]), keySchedule, ksRow);   
        
        return [subShiftedFinal0, subShiftedFinal1, subShiftedFinal2, subShiftedFinal3]
    }


    doRounds(block: number[], subMixArrays: number[][], keySchedule: number[], ksRow: number, nbRounds: number, round:number=0): number[] {
        
        if(round>nbRounds) return block

        const subShifted0 = [this.subShift(block[0], subMixArrays[0], 24), this.subShift(block[1], subMixArrays[1], 16), this.subShift(block[2], subMixArrays[2], 8), this.subShift(block[3], subMixArrays[3], 0)];   
        const subShifted1 = [this.subShift(block[1], subMixArrays[1], 24), this.subShift(block[2], subMixArrays[2], 16), this.subShift(block[3], subMixArrays[3], 8), this.subShift(block[0], subMixArrays[0], 0)];   
        const subShifted2 = [this.subShift(block[2], subMixArrays[2], 24), this.subShift(block[3], subMixArrays[3], 16), this.subShift(block[0], subMixArrays[0], 8), this.subShift(block[1], subMixArrays[1], 0)];   
        const subShifted3 = [this.subShift(block[3], subMixArrays[3], 24), this.subShift(block[0], subMixArrays[0], 16), this.subShift(block[1], subMixArrays[1], 8), this.subShift(block[2], subMixArrays[2], 0)];   

        return this.doRounds(
            [
                this.addRoundKey(this.mixColumns(subShifted0), keySchedule, ksRow),
                this.addRoundKey(this.mixColumns(subShifted1), keySchedule, ksRow),
                this.addRoundKey(this.mixColumns(subShifted2), keySchedule, ksRow),
                this.addRoundKey(this.mixColumns(subShifted3), keySchedule, ksRow),
            ],
            subMixArrays,
            keySchedule,
            ksRow,
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

        return this.doFinalRound(intermediateBlock, sbox, keySchedule, ksRow)
    }

    xorBlock(xoredBlock: number[], xoringBlock: number[]): number[] {
        return [...Array(4).keys()].map(i=>xoredBlock[i] ^ xoringBlock[i])
    }

    encryptBlock(block: number[], prevBlockOrIv: number[]): number[] {
        const xoredBlock = this.xorBlock(block, prevBlockOrIv)
        const cypherText = this.cryptBlock(xoredBlock, this._keySchedule, [aesConstants.subMix0, aesConstants.subMix1, aesConstants.subMix2, aesConstants.subMix3], aesConstants.sbox)
        return cypherText   
    }
    
    decryptBlock(block: number[], prevBlockOrIv: number[], aesConstants: AESConstants): number[] {


        const newBlock = [block[0], block[3], block[2], block[1]]

        const plainText = this.cryptBlock(newBlock, this._keySchedule, [aesConstants.subMix0, aesConstants.subMix1, aesConstants.subMix2, aesConstants.subMix3], aesConstants.sbox)

        const swappedAgain = [plainText[0], plainText[3], plainText[2], plainText[1]]

        const xoredBlock = this.xorBlock(swappedAgain, prevBlockOrIv)

        return xoredBlock
    }
}


//export function createAESImpl(): AES {
//    {
//        
//    }
//}