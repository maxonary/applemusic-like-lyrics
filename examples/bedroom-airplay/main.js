import { applyDisplay } from './display.js';
import { BackgroundRender, MeshGradientRenderer } from '@applemusic-like-lyrics/core';
import '@applemusic-like-lyrics/core/style.css';
import './style.css';
const $=id=>document.getElementById(id);let state={},received=0,lastArt=0,online=false,bg,loadGeneration=0;
try{bg=BackgroundRender.new(MeshGradientRenderer);$('background').append(bg.getElement());bg.setRenderScale(.2);bg.setFPS(10);bg.setStaticMode(true)}catch(e){console.warn('Using static fallback background',e)}
let displaySettings={rotation:0,layout:'auto'};applyDisplay(displaySettings);addEventListener('resize',()=>applyDisplay(displaySettings));
function format(t){t=Math.max(0,Math.floor(t));return `${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}`}
function render(){
 const known=!!state.title,active=!!state.session;
 document.body.classList.toggle('idle',!known);document.body.classList.toggle('playing',online&&!!state.playing);document.body.classList.toggle('offline',!online);
 $('connection').textContent=online?'AirPlay receiver':'Reconnecting';
 $('mode').textContent=known?'NOW PLAYING':active?'AIRPLAY CONNECTED':'READY WHEN YOU ARE';
 $('title').textContent=known?state.title:active?'Music is playing':'Your music. Your room.';
 $('artist').textContent=known?state.artist:active?'Waiting for track information':'Choose Bedroom in AirPlay';
 $('album').textContent=known?state.album:'';
 $('status').textContent=!online?'Display connection interrupted':active?(state.playing?'Playing on Katana':'Paused'):known?'Playback ended':'Ready for AirPlay';
 const timing=known&&state.timing&&state.duration>0;
 document.querySelector('.timeline').hidden=!timing;
 let elapsed=Math.min(state.duration||0,(state.elapsed||0)+(state.playing&&online?(performance.now()-received)/1000:0));
 $('progress').max=state.duration||1;$('progress').value=elapsed;$('elapsed').textContent=format(elapsed);$('remaining').textContent='−'+format((state.duration||0)-elapsed);
}
async function poll(){
 try{
  const r=await fetch('/state',{cache:'no-store',signal:AbortSignal.timeout(3500)});if(!r.ok)throw Error(r.status);state=await r.json();displaySettings=state.display||displaySettings;applyDisplay(displaySettings);received=performance.now();online=true;
  if(!state.art&&lastArt){lastArt=0;loadGeneration++;$('art').hidden=true;$('placeholder').hidden=false;bg?.getElement().style.setProperty('visibility','hidden')}
  if(state.art&&state.art!==lastArt){
   const revision=state.art,generation=++loadGeneration,url='/art?v='+revision,image=new Image();image.src=url;
   image.onload=()=>{if(generation!==loadGeneration)return;lastArt=revision;$('art').src=url;$('art').hidden=false;$('placeholder').hidden=true;bg?.getElement().style.setProperty('visibility','visible');bg?.setAlbum(url).catch(()=>{})};
  }
 }catch(e){online=false}
 render();setTimeout(poll,1000)
}
setInterval(render,500);render();poll();
