export interface WordArray {
    words: number[];
    nbBytes: number;
    concat(wordArray: WordArray, index: number): WordArray;
    clamp(): WordArray;
    clone(): WordArray;

}
export class WordArray implements WordArray {
    words: number[];
    nbBytes: number

    constructor(words?: number[], nbBytes?: number) {
        
        this.words = words || [];

        if(nbBytes !== undefined) {
            this.nbBytes = nbBytes;
        } else {
            this.nbBytes = this.words.length * 4;
        }
    }

    concat(wordArray: WordArray): WordArray {
        const clampedLeft = this.clamp()
        return clampedLeft.concatRecurse(wordArray)
    }

    private concatRecurse(wordArray: WordArray, index: number=0): WordArray {

        if(index>wordArray.nbBytes) return this
        
        if(this.nbBytes %4){

            const thatByte = (wordArray.words[index] >>> (24 - (index % 4) * 8)) & 0xff;
            return (new WordArray(
                this.words.slice(0, Math.floor(this.nbBytes/4))
                    .concat(this.words[(this.nbBytes + index) >>> 2] | thatByte << (24 - ((this.nbBytes + index) % 4) * 8)),
                this.nbBytes+1
            )).concat(wordArray, index+1)
            
        }
        else{
            return (new WordArray(
                this.words.slice(0, Math.floor(this.nbBytes/4))
                    .concat(wordArray.words[index>>2]),
                this.nbBytes+1
            )).concat(wordArray, index+4)


        }

    }
    
    clamp(): WordArray {
        // Clamp
        return new WordArray(
            new Array(Math.ceil(this.nbBytes / 4), 
                ...(
                    this.words.slice(0, this.nbBytes >>> 2)
                    .concat(this.words[this.nbBytes >>> 2] & (0xffffffff << (32 - (this.nbBytes % 4) * 8)))
                    .concat(this.words.slice((this.nbBytes >>> 2)+1))
                )
            ),
            this.nbBytes
        ) 
    
    }

    clone(): WordArray {
        return new WordArray(this.words.slice(0), this.nbBytes);
    }
    

}
