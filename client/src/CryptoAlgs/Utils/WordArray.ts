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

    static random(nBytes: number): WordArray {

        const r = (function(m_w: number) {
            let m_z = 0x3ade68b1;

            const mask = 0xffffffff;

            return function() {
                m_z = (0x9069 * (m_z & 0xFFFF) + (m_z >> 0x10)) & mask;
                m_w = (0x4650 * (m_w & 0xFFFF) + (m_w >> 0x10)) & mask;
                let result = ((m_z << 0x10) + m_w) & mask;
                result /= 0x100000000;
                result += 0.5;
                return result * (Math.random() > .5 ? 1 : -1);
            };
        });
        
        const words = [];
        for(let i = 0, rcache; i < nBytes; i += 4) {
            const _r = r((rcache || Math.random()) * 0x100000000);

            rcache = _r() * 0x3ade67b7;
            words.push((_r() * 0x100000000) | 0);
        }

        return new WordArray(words, nBytes);
    }


    clone(): WordArray {
        return new WordArray(this.words.slice(0), this.nbBytes);
    }

    static stringifyLatin1(wordArray: WordArray): string {
        // Convert
        const latin1Chars = [];
        for (let i = 0; i < wordArray.nbBytes; i++) {
            const bite = (wordArray.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
            latin1Chars.push(String.fromCharCode(bite));
        }

        return latin1Chars.join('');
    }

    static latin1StringToWordArray(latin1Str: string): WordArray {
        // Shortcut
        const latin1StrLength = latin1Str.length;

        // Convert
        const words: Array<number> = [];
        for (let i = 0; i < latin1StrLength; i++) {
            words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
        }

        return new WordArray(words, latin1StrLength);
    }



    public static stringifyUtf8(wordArray: WordArray): string {
        try {
            return decodeURIComponent(escape(this.stringifyLatin1(wordArray)));
        } catch(e) {
            throw new Error('Malformed UTF-8 data');
        }
    }

    static utf8StringToWordArray(utf8Str: string): WordArray {
        return this.latin1StringToWordArray(unescape(encodeURIComponent(utf8Str)));
    }
    

}
