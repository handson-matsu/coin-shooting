// Statistical teaching model. Replace this module when measured data becomes available.
export const MODEL=Object.freeze({intercept:35,pull:12,weight:-3,errorSD:8});
export const LIMITS=Object.freeze({pull:{min:4,max:12,step:.5},weight:{min:3,max:12,step:.5}});
export const TARGET=Object.freeze({center:120,halfWidth:12});
export function normal(rng=Math.random){return Math.sqrt(-2*Math.log(Math.max(Number.MIN_VALUE,rng())))*Math.cos(2*Math.PI*rng());}
export function generateDistance(pull,weight,rng=Math.random){if(!Number.isFinite(pull)||!Number.isFinite(weight)||pull<LIMITS.pull.min||pull>LIMITS.pull.max||weight<LIMITS.weight.min||weight>LIMITS.weight.max)throw Error('条件が設定範囲外です');return MODEL.intercept+MODEL.pull*pull+MODEL.weight*weight+MODEL.errorSD*normal(rng);}
export function seeded(seed){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
