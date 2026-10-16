export function geometry(width,height,rotation,layout){
 const quarter=rotation===90||rotation===270;
 const w=quarter?height:width,h=quarter?width:height;
 return {width:w,height:h,portrait:layout==='portrait'||(layout==='auto'&&h>w)};
}
export function applyDisplay(settings){
 const preview=new URLSearchParams(location.search);
 if(preview.get('preview')==='1')settings={rotation:Number(preview.get('rotation')||0),layout:preview.get('layout')||'auto'};
 const rotation=[0,90,180,270].includes(settings?.rotation)?settings.rotation:0;
 const layout=['auto','portrait','landscape'].includes(settings?.layout)?settings.layout:'auto';
 const g=geometry(innerWidth,innerHeight,rotation,layout),screen=document.getElementById('screen');
 screen.style.width=g.width+'px';screen.style.height=g.height+'px';
 screen.style.setProperty('--vw',g.width/100+'px');screen.style.setProperty('--vh',g.height/100+'px');
 screen.style.transform=`translate(-50%,-50%) rotate(${rotation}deg)`;
 screen.classList.toggle('portrait',g.portrait);
}
