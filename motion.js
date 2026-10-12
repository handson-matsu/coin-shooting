// Presentation only: no random numbers and no changes to recorded distances.
export const SPEEDS=[1,3,10,30];
export const SLIDE_WORK=380;
export const GAP_WORK=90;
export function easeOut(progress){const p=Math.max(0,Math.min(1,progress));return 1-(1-p)**3;}
export function slidePosition(progress,startX,endX,displayY){const p=easeOut(progress);return {x:startX+(endX-startX)*p,y:180+displayY*p};}
export function rubberStretch(pull,progress=null){const stretch=14+pull*3;return stretch*(progress===null?1:Math.max(0,1-progress/.18));}
