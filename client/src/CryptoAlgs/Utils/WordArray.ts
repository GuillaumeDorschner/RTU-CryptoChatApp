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

    private concatRecurse(wordArray: WordArray): WordArray {

        if(wordArray.nbBytes<=0) return this
        

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
        const clampedWord = this.words[this.nbBytes >>> 2] & (0xffffffff << (32 - (this.nbBytes % 4) * 8))
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



    static stringifyUtf8(wordArray: WordArray): string {
        try {
            return decodeURIComponent(escape(this.stringifyLatin1(wordArray)));
        } catch(e) {
            throw new Error('Malformed UTF-8 data, error:'+e);
        }
    }

    static utf8StringToWordArray(utf8Str: string): WordArray {
        return this.latin1StringToWordArray(unescape(encodeURIComponent(utf8Str)));
    }
    
    static base64ToWordArray(base64: string): WordArray {
        const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        const paddingChar = '=';
      
        // Step 1: Decode the Base64 string into a byte array (Uint8Array)
        let bytes: number[] = [];
        let padding = 0;
      
        // Remove padding and decode base64 string to bytes
        base64 = base64.replace(/[^A-Za-z0-9+\/]/g, ''); // Remove non-base64 characters
        padding = base64.endsWith(paddingChar) ? (base64.endsWith('==') ? 2 : 1) : 0;
      
        // Decode Base64 to bytes
        for (let i = 0; i < base64.length; i += 4) {
          const chunk = base64.slice(i, i + 4);
          const byte1 = base64Chars.indexOf(chunk[0]);
          const byte2 = base64Chars.indexOf(chunk[1]);
          const byte3 = base64Chars.indexOf(chunk[2]);
          const byte4 = base64Chars.indexOf(chunk[3]);
      
          bytes.push((byte1 << 2) | (byte2 >> 4));
          if (chunk[2] !== paddingChar) bytes.push(((byte2 & 0x0f) << 4) | (byte3 >> 2));
          if (chunk[3] !== paddingChar) bytes.push(((byte3 & 0x03) << 6) | byte4);
        }
      
        // Step 2: Convert the byte array into a WordArray
        const wordArray: number[] = [];
        for (let i = 0; i < bytes.length; i += 4) {
          const word = (bytes[i] << 24) | (bytes[i + 1] << 16) | (bytes[i + 2] << 8) | bytes[i + 3];
          wordArray.push(word);
        }
      
        // The number of significant bytes
        const sigBytes = bytes.length;
      
        return new WordArray(wordArray, sigBytes);
      }      

    static _map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
    public static stringifyBase64(wordArray: WordArray): string {
        // Clamp excess bits
        wordArray.clamp();
 
        // Convert
        const base64Chars = [];
        for (let i = 0; i < wordArray.nbBytes; i += 3) {
            const byte1 = (wordArray.words[i >>> 2]       >>> (24 - (i % 4) * 8))       & 0xff;
            const byte2 = (wordArray.words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
            const byte3 = (wordArray.words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

            const triplet = (byte1 << 16) | (byte2 << 8) | byte3;

            for (let j = 0; (j < 4) && (i + j * 0.75 < wordArray.nbBytes); j++) {
                base64Chars.push(this._map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
            }
        }

        // Add padding
        const paddingChar = this._map.charAt(64);
        if (paddingChar) {
            while (base64Chars.length % 4) {
                base64Chars.push(paddingChar);
            }
        }

        return base64Chars.join('');
    }

    static _reverseMap: number[]|undefined
    static parseBase64(base64Str: string): WordArray {
        // Shortcuts
        let base64StrLength = base64Str.length;
        
        if(this._reverseMap === undefined) {
                this._reverseMap = [];
                for(let j = 0; j < this._map.length; j++) {
                    this._reverseMap[this._map.charCodeAt(j)] = j;
                }
        }

        // Ignore padding
        const paddingChar = this._map.charAt(64);
        if(paddingChar) {
            const paddingIndex = base64Str.indexOf(paddingChar);
            if(paddingIndex !== -1) {
                base64StrLength = paddingIndex;
            }
        }

        // Convert
        return this.parseLoop(base64Str, base64StrLength, this._reverseMap);
    }

    public static parseLoop(base64Str: string, base64StrLength: number, reverseMap: Array<number>): WordArray {
        const words: Array<number> = [];
        let nBytes = 0;
        for(let i = 0; i < base64StrLength; i++) {
            if(i % 4) {
                const bits1 = reverseMap[base64Str.charCodeAt(i - 1)] << ((i % 4) * 2);
                const bits2 = reverseMap[base64Str.charCodeAt(i)] >>> (6 - (i % 4) * 2);
                words[nBytes >>> 2] |= (bits1 | bits2) << (24 - (nBytes % 4) * 8);
                nBytes++;
            }
        }

        return new WordArray(words, nBytes);
    }

}
