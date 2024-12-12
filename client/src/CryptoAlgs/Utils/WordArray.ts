import { NumberArrayToBinary } from "./printFormat";

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

    //private concatRecurse(wordArray: WordArray, index: number=0): WordArray {
//
    //    if(index>wordArray.nbBytes) return this
    //    
    //    if(this.nbBytes %4){
//
    //        const thatByte = (wordArray.words[index >>> 2] >>> (24 - (index % 4) * 8)) & 0xff;
    //        return (new WordArray(
    //            this.words.slice(0, Math.floor(this.nbBytes/4))
    //                .concat(this.words[(this.nbBytes + index) >>> 2] | thatByte << (24 - ((this.nbBytes + index) % 4) * 8)),
    //            this.nbBytes+1
    //        )).concatRecurse(wordArray, index+1)
    //        
    //    }
    //    else{
    //        return (new WordArray(
    //            this.words.slice(0, Math.floor(this.nbBytes/4))
    //                .concat(wordArray.words[index>>2]),
    //            this.nbBytes+1
    //        )).concatRecurse(wordArray, index+4)
//
//
    //    }
//
    //}

    private concatRecurse(wordArray: WordArray): WordArray {

        if(wordArray.nbBytes<=0) return this
        
        console.log("right:"+NumberArrayToBinary(this.words))
        console.log("left:"+NumberArrayToBinary(wordArray.words))

        if(this.nbBytes %4){

            const thatByte = (wordArray.words[0] >>> 24) & 0xff;
            const newRightWordArray = new WordArray(
                [...Array(wordArray.words.length).keys()].map(i=>{
                    return wordArray.words[i]<<8 | wordArray.words[i+1]>>>24 & 0xff 
                }),
                wordArray.nbBytes-1
            )

            return (
                new WordArray(
                    this.words.slice(0, Math.floor(this.nbBytes/4))
                        .concat(this.words[this.nbBytes >>> 2] | thatByte << (24 - (this.nbBytes % 4) * 8)),
                    this.nbBytes+1
                )
            ).concatRecurse(newRightWordArray)
            
        }
        else{
            const currentWord = wordArray.words[0]
            const newRightWords = new WordArray(wordArray.words.slice(1), wordArray.nbBytes-4) 
            return (new WordArray(
                this.words.slice(0, Math.floor(this.nbBytes/4))
                    .concat(currentWord),
                this.nbBytes+4
            )).concatRecurse(newRightWords)


        }

    }
    
    clamp(): WordArray {

        const prevElements = this.words.slice(0, this.nbBytes >>> 2)
        console.log(NumberArrayToBinary(prevElements))
        const clampedWord = this.words[this.nbBytes >>> 2] & (0xffffffff << (32 - (this.nbBytes % 4) * 8))
        console.log(NumberArrayToBinary([clampedWord]))
        const otherWords = this.words.slice((this.nbBytes >>> 2)+1)
        const newWords =  prevElements.concat(clampedWord)
    
        return new WordArray(newWords, this.nbBytes)
    }

    clone(): WordArray {
        return new WordArray(this.words.slice(0), this.nbBytes);
    }
    

}
