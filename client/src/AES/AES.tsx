import { Vector, Matrix } from 'ts-matrix'


interface AES {
    createCipherKey(): number[];
    encrypt: any;
    decrypt: any;
}
class AESImpl {

    S_BOX: number[] = [];
    R_CON: number[] = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];
    INV_SBOX: number[] = [];
    SUB_MIX_0: number[] = [];
    SUB_MIX_1: number[] = [];
    SUB_MIX_2: number[] = [];
    SUB_MIX_3: number[] = [];
    INV_SUB_MIX_0: number[] = [];
    INV_SUB_MIX_1: number[] = [];
    INV_SUB_MIX_2: number[] = [];
    INV_SUB_MIX_3: number[] = [];

    addRoundKeyOnInput(block: number[], keySchedule: number[]): number[] {
        return  [...Array(3).keys()].map(i=>block[i] ^ keySchedule[i])
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

    addRoundKey(word: number, keySchedule: number[], ksRow: number): number {
        return word ^ keySchedule[ksRow]
    }

    doFinalRound(block: number[], subMixArrays: number[][], keySchedule: number[], ksRow: number): number[] {
        
        const subShiftedFinal0 = this.addRoundKey(this.subShift(block[0], subMixArrays[0], 24) << 24 | this.subShift(block[1], subMixArrays[1], 16) << 16 | this.subShift(block[2], subMixArrays[2], 8) << 8 | this.subShift(block[3], subMixArrays[3], 0), keySchedule, ksRow)   
        const subShiftedFinal1 = this.addRoundKey(this.subShift(block[1], subMixArrays[1], 24) << 24 | this.subShift(block[2], subMixArrays[2], 16) << 16 | this.subShift(block[3], subMixArrays[3], 8) << 8 | this.subShift(block[0], subMixArrays[0], 0), keySchedule, ksRow)   
        const subShiftedFinal2 = this.addRoundKey(this.subShift(block[2], subMixArrays[2], 24) << 24 | this.subShift(block[3], subMixArrays[3], 16) << 16 | this.subShift(block[0], subMixArrays[0], 8) << 8 | this.subShift(block[1], subMixArrays[1], 0), keySchedule, ksRow)   
        const subShiftedFinal3 = this.addRoundKey(this.subShift(block[3], subMixArrays[3], 24) << 24 | this.subShift(block[0], subMixArrays[0], 16) << 16 | this.subShift(block[1], subMixArrays[1], 8) << 8 | this.subShift(block[2], subMixArrays[2], 0), keySchedule, ksRow)   
        
        return [subShiftedFinal0, subShiftedFinal1, subShiftedFinal2, subShiftedFinal3]
    }


    doRounds(block: number[], subMixArrays: number[][], keySchedule: number[], ksRow: number, nbRounds: number, round:number=0): number[] {
        
        if(round>nbRounds) return block

        const subShifted0 = [this.subShift(block[0], subMixArrays[0], 24), this.subShift(block[1], subMixArrays[1], 16), this.subShift(block[2], subMixArrays[2], 8), this.subShift(block[3], subMixArrays[3], 0)]   
        const subShifted1 = [this.subShift(block[1], subMixArrays[1], 24), this.subShift(block[2], subMixArrays[2], 16), this.subShift(block[3], subMixArrays[3], 8), this.subShift(block[0], subMixArrays[0], 0)]   
        const subShifted2 = [this.subShift(block[2], subMixArrays[2], 24), this.subShift(block[3], subMixArrays[3], 16), this.subShift(block[0], subMixArrays[0], 8), this.subShift(block[1], subMixArrays[1], 0)]   
        const subShifted3 = [this.subShift(block[3], subMixArrays[3], 24), this.subShift(block[0], subMixArrays[0], 16), this.subShift(block[1], subMixArrays[1], 8), this.subShift(block[2], subMixArrays[2], 0)]   

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
        message: number[],
        offset: number,
        keySchedule: number[],
        subMixArrays: number[][],
        sbox: number[]
    ): number[] {

        const block = this.addRoundKeyOnInput(message.slice(offset, offset+4), keySchedule)
        const ksRow = 4
        const intermediateBlock = this.doRounds(block, subMixArrays,keySchedule, ksRow, nbRounds)

        const finalBlock = this.doFinalRound(intermediateBlock, subMixArrays, keySchedule, ksRow)


    }


}
export function createAESImpl(): AES {
    {
        
    }
}