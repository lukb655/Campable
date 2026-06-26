export const uid=()=>Math.random().toString(36).slice(2,10);
export const code6=()=>{const a="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";return Array.from({length:6},()=>a[Math.floor(Math.random()*a.length)]).join("");};
export const isIOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
export function directionsURL(lat,lng,label){
  const q=encodeURIComponent(label||"Campsite");
  return isIOS()
    ? `https://maps.apple.com/?daddr=${lat},${lng}&q=${q}`
    : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
export const fmt=(d)=>d?new Date(d+"T00:00").toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"}):"TBD";
export const ic=(n)=>({width:n,height:n,flexShrink:0});
export function fileToCompressedDataURL(file, maxDim=1200, quality=0.72){
  return new Promise((resolve,reject)=>{
    if(file.size > 15*1024*1024){
      return reject(new Error("That photo is over 15 MB — please resize or compress it first."));
    }
    const mime=(file.type||"").toLowerCase();
    const ext=(file.name||"").toLowerCase().split(".").pop();
    if(mime==="image/heic"||mime==="image/heif"||ext==="heic"||ext==="heif"){
      return reject(new Error("HEIC photos aren't supported by the browser. In the Photos app tap Share → Save to Files and choose JPEG, then try again."));
    }
    const reader=new FileReader();
    reader.onerror=()=>reject(new Error("Couldn't read that file."));
    reader.onload=()=>{
      const img=new Image();
      img.onerror=()=>reject(new Error("That file isn't a valid image. Try saving it as a JPEG, PNG, or WEBP first."));
      img.onload=()=>{
        let{width:w,height:h}=img;
        if(w>h && w>maxDim){h=Math.round(h*maxDim/w);w=maxDim;}
        else if(h>=w && h>maxDim){w=Math.round(w*maxDim/h);h=maxDim;}
        const c=document.createElement("canvas");c.width=w;c.height=h;
        const ctx=c.getContext("2d");
        ctx.fillStyle="#ffffff";
        ctx.fillRect(0,0,w,h);
        ctx.drawImage(img,0,0,w,h);
        resolve(c.toDataURL("image/jpeg",quality));
      };
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
}
