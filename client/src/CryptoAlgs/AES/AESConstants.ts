export type AESConstants = {
    sbox: number[];
    rcon: number[];
    invSBox: number[];
    subMix0: number[];
    subMix1: number[];
    subMix2: number[];
    subMix3: number[];
    invSubMix0: number[];
    invSubMix1: number[];
    invSubMix2: number[];
    invSubMix3: number[];

}
type sboxElement = {x:number, sx:number}
type multiplications = {x2: number, x4: number, x8: number}
type subMixElements = {sm0:number, sm1:number, sm2:number, sm3:number}
type invSubMixElements = {ism0:number, ism1:number, ism2:number, ism3:number}

class AESConstantsImpl {

    

    private computeDoubleTable(): number[] {

        return [...Array(256).keys()].map(i => {
            return (i < 128) ? i<<1 : (i<<1) ^ 0x11b
        })

    }

    private computeSBoxElement(x: number, xi: number): sboxElement {
        const sx = xi ^ (xi << 1) ^ (xi << 2) ^ (xi << 3) ^ (xi << 4);
        const sxFinal = (sx >>> 8) ^ (sx & 0xff) ^ 0x63;
        return {x:x, sx:sxFinal};
    }

    private computeMultiplications(doubletable: number[], x: number): multiplications {
        const x2=doubletable[x]
        const x4=doubletable[x2]
        const x8=doubletable[x4]
        return {x2:x2,x4:x4,x8:x8}
    }

    private computeSubMixElements(doubletable: number[], sx:number): subMixElements {
        // Compute sub bytes, mix columns tables
        const t = (doubletable[sx] * 0x101) ^ (sx * 0x1010100);
        return {sm0:(t << 24) | (t >>> 8), sm1:(t << 16) | (t >>> 16), sm2:(t << 8)  | (t >>> 24), sm3:t}
    }

    private computeInvSubMixElements(Mults: multiplications, x: number): invSubMixElements {
        const t = (Mults.x8 * 0x1010101) ^ (Mults.x4 * 0x10001) ^ (Mults.x2 * 0x101) ^ (x * 0x1010100);
        return {ism0:(t << 24) | (t >>> 8), ism1:(t << 16) | (t >>> 16), ism2:(t << 8)  | (t >>> 24), ism3:t}
    }

    private computeCounter(x: number, xi: number, mults: multiplications, doubles: number[]): {x: number, xi:number} {

        return !x ? {x:1,xi:1} : {x:(mults.x2 ^ doubles[doubles[doubles[mults.x8 ^ mults.x2]]]), xi: xi ^ doubles[doubles[xi]]}
    }

    private copyAndUpdateElemAt(arr:number[], index: number, newElement: number): number[] {
        return [...arr.slice(0, index), newElement, ...arr.slice(index+1)]
    }

    private accumulateElements(existingConstants: AESConstants, sboxElement: sboxElement, subMixElements: subMixElements, invSubMixElements: invSubMixElements): AESConstants {


        return {
            sbox: this.copyAndUpdateElemAt(existingConstants.sbox, sboxElement.x, sboxElement.sx),
            invSBox: this.copyAndUpdateElemAt(existingConstants.invSBox, sboxElement.sx, sboxElement.x),
            rcon: existingConstants.rcon,
            subMix0: this.copyAndUpdateElemAt(existingConstants.subMix0, sboxElement.x, subMixElements.sm0),
            subMix1: this.copyAndUpdateElemAt(existingConstants.subMix1, sboxElement.x, subMixElements.sm1),
            subMix2: this.copyAndUpdateElemAt(existingConstants.subMix2, sboxElement.x, subMixElements.sm2),
            subMix3: this.copyAndUpdateElemAt(existingConstants.subMix3, sboxElement.x, subMixElements.sm3),
            invSubMix0: this.copyAndUpdateElemAt(existingConstants.invSubMix0, sboxElement.sx, invSubMixElements.ism0),
            invSubMix1: this.copyAndUpdateElemAt(existingConstants.invSubMix1, sboxElement.sx, invSubMixElements.ism1),
            invSubMix2: this.copyAndUpdateElemAt(existingConstants.invSubMix2, sboxElement.sx, invSubMixElements.ism2),
            invSubMix3: this.copyAndUpdateElemAt(existingConstants.invSubMix3, sboxElement.sx, invSubMixElements.ism3),
        }   
    }

    private startConstants: AESConstants = {
        sbox:[],
        invSBox: [],
        rcon:[0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36],
        subMix0: [],
        subMix1: [],
        subMix2: [],
        subMix3: [],
        invSubMix0: [],
        invSubMix1: [],
        invSubMix2: [],
        invSubMix3: []
    }
    private computeAESConstantsRecurse(
        doubles: number[], index: number=0, x:number=0, xi:number=0, resultingAESConstants: AESConstants = this.startConstants
            ): AESConstants {
            
            if(index<256) return resultingAESConstants
            const sboxElement: sboxElement = this.computeSBoxElement(x,xi)
            const mults: multiplications = this.computeMultiplications(doubles, x)
            const subMixElements: subMixElements = this.computeSubMixElements(doubles, sboxElement.sx)
            const invSubMixElements: invSubMixElements = this.computeInvSubMixElements(mults, x)
            const counter: {x:number, xi:number} = this.computeCounter(x, xi, mults, doubles)
            const aesConstants: AESConstants = this.accumulateElements(resultingAESConstants, sboxElement, subMixElements, invSubMixElements)
            return this.computeAESConstantsRecurse(doubles, index+1, counter.x, counter.xi, aesConstants) 
    }

    computeAESConstants() {
        const doubles: number[] = this.computeDoubleTable()
        return this.computeAESConstantsRecurse(doubles)
    }
}
export const aesConstants: AESConstants =  (new AESConstantsImpl()).computeAESConstants()