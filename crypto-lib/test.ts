import { ECC } from "./ECC/ecc";
import { Point } from "./ECC/point";
import { Secp256k1 } from "./ECC/curve";
import { AESImpl } from "./AES/AES";
import { aesConstants } from "./AES/AESConstants";
import { WordArray } from "./Utils/WordArray";
import { int2Hex } from "./ECC/utils";


const decryptedMessage: string = (new AESImpl())
          .init(getOrThrowStr("113855548845585887380465484721142807114220151779225572086674982284738214363425"), getByteLengthUtf16("113855548845585887380465484721142807114220151779225572086674982284738214363425"), aesConstants)
          .decryptMessage(WordArray.parseBase64("7iJEAVMwQvxHR1aFoyARgw=="), aesConstants)


function getOrThrowStr(input:string|undefined): string{
    if(typeof input === 'string'){
      return input
    }
    throw new Error("string was undefined")
  }
  
  function getByteLengthUtf16(input: string): number {
    let byteLength = 0;
    for (const char of input) {
      byteLength += char.charCodeAt(0) > 0xffff ? 4 : 2;
    }
    return byteLength;
  }

const a =   WordArray.stringifyBase64(WordArray.utf8StringToWordArray("salut"))

const eccAlice = new ECC()

console.log("private:"+eccAlice.sk)
console.log("public x:"+eccAlice.pk.x)
console.log("public y:"+eccAlice.pk.y)


const eccBob = new ECC()

console.log("private:"+eccAlice.sk)
console.log("public x:"+eccAlice.pk.x)
console.log("public y:"+eccAlice.pk.y)

eccAlice.pk.isOnCurve()

function getPublicKey(pk: Point): string {
    const x = int2Hex(pk.x, false);
    const y = int2Hex(pk.y, false);
    return `0x04${x}${y}`;
  }

const kg = eccAlice.pk
const aada = getPublicKey(eccAlice.pk)
const le = aada.length-4
const b = Point.publicKeyToPoint(aada, new Secp256k1())

const sk = eccAlice.sk
const skStr = sk.toString()
const skStrBI = BigInt(skStr)

console.log("")
const sharedKeyBob = Point.publicKeyToPoint(eccAlice.getPublicKey(), new Secp256k1()).scalarMul(BigInt(eccBob.sk)).x.toString()
const sharedKeyAlice = Point.publicKeyToPoint(eccBob.getPublicKey(), new Secp256k1()).scalarMul(BigInt(eccAlice.sk)).x.toString()

console.log("sharedkey bob:"+ sharedKeyBob)
console.log("sharedkey alice:"+ sharedKeyAlice)

const message = "new Message"
const aes = (new AESImpl()).init(getOrThrowStr(sharedKeyBob), getByteLengthUtf16(getOrThrowStr(sharedKeyBob)), aesConstants) 
const encryptedMessage = WordArray.stringifyBase64(aes.encryptMessage(message.trim(), aesConstants));
console.log(aes._salt)



const aes2 = (new AESImpl()).init(getOrThrowStr(sharedKeyAlice), getByteLengthUtf16(getOrThrowStr(sharedKeyAlice)), aesConstants) 
const decryptMessage = aes2.decryptMessage(WordArray.parseBase64(encryptedMessage), aesConstants);


console.log("")
