export function summary(values,target={center:120,halfWidth:12}){const n=values.length;if(!n)return {n:0,mean:null,sd:null,min:null,max:null,successRate:null};const mean=values.reduce((s,v)=>s+v,0)/n,sd=Math.sqrt(values.reduce((s,v)=>s+(v-mean)**2,0)/n);return {n,mean,sd,min:Math.min(...values),max:Math.max(...values),successRate:values.filter(v=>Math.abs(v-target.center)<=target.halfWidth).length/n};}
export function domain(values,width=10){return {min:Math.min(0,Math.floor(Math.min(0,...values)/width)*width),max:Math.max(Math.ceil(200/width)*width,(Math.floor(Math.max(0,...values)/width)+1)*width)};}
export function histogram(values,width=10,bounds=domain(values,width)){if(!Number.isFinite(width)||width<=0)throw Error('階級幅は正の数にしてください');const bins=Array.from({length:Math.ceil((bounds.max-bounds.min)/width)},(_,i)=>({low:bounds.min+i*width,high:bounds.min+(i+1)*width,count:0}));for(const v of values){const i=Math.floor((v-bounds.min)/width);if(i>=0&&i<bins.length)bins[i].count++;}return bins;}
export function observations(experiments){return experiments.flatMap(e=>e.shots.map(s=>({pull:e.pull,weight:e.weight,distance:s.distance,experiment:e.number})));}
export function regression(data,keys=['pull']){
 const n=data.length,p=keys.length+1;if(n<=p)return {error:`射撃データが足りません。少なくとも${p+1}回の測定が必要です。`};
 if(data.some(d=>!Number.isFinite(d.distance)||keys.some(k=>!Number.isFinite(d[k]))))return {error:'数値でないデータが含まれています。'};
 const means=keys.map(k=>data.reduce((s,d)=>s+d[k],0)/n),scales=keys.map((k,j)=>Math.sqrt(data.reduce((s,d)=>s+(d[k]-means[j])**2,0)/n));
 const constant=scales.findIndex(s=>s<1e-10);if(constant>=0)return {error:`${keys[constant]==='pull'?'引き量':'重さ'}がすべて同じです。条件を変えた実験を追加してください。`};
 const columns=[Array(n).fill(1),...keys.map((k,j)=>data.map(d=>(d[k]-means[j])/scales[j]))],Q=[],R=Array.from({length:p},()=>Array(p).fill(0));
 // QR least squares on centered, scaled predictors. Repetitions remain separate rows.
 for(let j=0;j<p;j++){const v=[...columns[j]];for(let i=0;i<j;i++){R[i][j]=Q[i].reduce((s,q,k)=>s+q*v[k],0);for(let k=0;k<n;k++)v[k]-=R[i][j]*Q[i][k];}R[j][j]=Math.sqrt(v.reduce((s,x)=>s+x*x,0));if(R[j][j]<1e-9*Math.sqrt(n))return {error:'引き量と重さが同じ比率で変わっているため、別々の効果を求められません。重さを固定して引き量を変える実験と、引き量を固定して重さを変える実験を追加してください。'};Q.push(v.map(x=>x/R[j][j]));}
 const b=Q.map(q=>q.reduce((s,x,i)=>s+x*data[i].distance,0));for(let i=p-1;i>=0;i--){for(let j=i+1;j<p;j++)b[i]-=R[i][j]*b[j];b[i]/=R[i][i];}
 const slopes=keys.map((k,j)=>b[j+1]/scales[j]),intercept=b[0]-slopes.reduce((s,v,j)=>s+v*means[j],0),coefficients={intercept,...Object.fromEntries(keys.map((k,j)=>[k,slopes[j]]))};
 const predict=d=>intercept+keys.reduce((s,k,j)=>s+slopes[j]*d[k],0),predicted=data.map(predict),mean=data.reduce((s,d)=>s+d.distance,0)/n,sse=data.reduce((s,d,i)=>s+(d.distance-predicted[i])**2,0),sst=data.reduce((s,d)=>s+(d.distance-mean)**2,0);
 return {n,keys,coefficients,r2:sst<1e-12?null:Math.max(0,Math.min(1,1-sse/sst)),predicted,predict};
}
export function csv(experiments){const q=v=>'"'+String(v??'').replaceAll('"','""')+'"';return '\uFEFF'+[['実験番号','引き量(cm)','重さ(g)','射撃番号','飛距離(cm)'],...experiments.flatMap(e=>e.shots.map((s,i)=>[e.number,e.pull,e.weight,i+1,s.distance]))].map(r=>r.map(q).join(',')).join('\r\n');}
