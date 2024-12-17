import { WordArray } from "../Utils/WordArray";
import { Md5 } from "ts-md5";

export class KeyIVUtils {

    narrowToNbArr(input: string | Int32Array<ArrayBufferLike> | undefined): number[] {
        if(input instanceof Int32Array){
            return Array.from(input);
        }
        
        throw new Error("input was not instance of Int32Array")
    }

    computeDerivedKeyRecurse(hasher: Md5, password: WordArray, salt: WordArray, 
        iterations: number, keySize: number, prevBlock: number[]= [], resultDerivedKey:WordArray= new WordArray([], 0)): WordArray {
        
        if(resultDerivedKey.words.length>= keySize) return resultDerivedKey
        if(prevBlock.length>0) {
            hasher.start().appendByteArray(new Uint8Array(prevBlock));
        }
        const block: number[] = this.narrowToNbArr(hasher.appendByteArray(new Uint8Array(password.words))
            .appendByteArray(new Uint8Array(salt.words))
            .end(true));

        // Iterations
        let blockIterate = block;
        for(let i = 1; i < iterations; i++) {
            blockIterate = this.narrowToNbArr(hasher.start().appendByteArray(new Uint8Array(blockIterate)).end(true));
        }

        return this.computeDerivedKeyRecurse(hasher, password, salt, iterations, 
            keySize, blockIterate, resultDerivedKey.concat(new WordArray(blockIterate, 16)));
        
        

    }

    computeDerivedKey(password: WordArray, salt: WordArray, keySize: number, iterations: number): WordArray {
        // Init hasher²
        const hasher = new Md5();

        // Initial values
        const derivedKey = this.computeDerivedKeyRecurse(hasher, password, salt, iterations, keySize)

        return new WordArray(derivedKey.words, keySize*4);
    }

    computeDerivedKeyAndIV(passwordUtf8: string, keySize: number, ivSize: number): {key:WordArray, iv:WordArray, salt:WordArray} {
        // Generate random salt
        const salt = WordArray.random(64 / 8);

        const passwordWa = WordArray.utf8StringToWordArray(passwordUtf8)

        // Derive key and IV
        const key = this.computeDerivedKey(passwordWa, salt, keySize+ivSize, 1);

        // Separate key and IV
        const iv = new WordArray(key.words.slice(keySize), ivSize * 4);

        // Return params
        return { key: (new WordArray(key.words,  keySize * 4)), iv: iv, salt: salt };
    }
    
    
}