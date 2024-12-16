import { ECC } from './ECC/ecc';

const ecc = new ECC()


console.log("private:"+ecc.sk)
console.log("public x:"+ecc.pk.x)
console.log("public y:"+ecc.pk.y)

