import { NarrativeCompiler } from './story.js';
import { Director } from './director.js';
import { ContinuityEngine } from './continuity.js';
import { CinemaRenderer } from './renderer.js';
import { Timeline } from './timeline.js';
import { AudioEngine } from './audio.js';
const $=s=>document.querySelector(s); const log=m=>{ const el=$('#log'); el.textContent+=`\n${new Date().toLocaleTimeString()} ${m}`; el.scrollTop=el.scrollHeight; };
const continuity=new ContinuityEngine(); const director=new Director(continuity); const renderer=new CinemaRenderer($('#masterCanvas'), $('#hiddenCanvas'), continuity, log); const timeline=new Timeline($('#timeline'), log); new AudioEngine(log);
let project=null;
$('#compileBtn').onclick=()=>{
  const story=$('#storyInput').value.trim(); if(!story){ alert('Paste story'); return; }
  log('[NARRATIVE] Compiling...'); const compiled=NarrativeCompiler.compile(story, $('#genre').value); project=compiled; continuity.seedWorld(compiled.worldBible, compiled.characters);
  $('#sceneGraph').textContent=JSON.stringify(compiled.sceneGraph,null,2);
  $('#charBible').innerHTML=compiled.characters.map(c=>`<div style="padding:8px;border:1px solid #26262f;border-radius:10px;margin:6px 0;background:#121214"><b>${c.name}</b> <span style="color:#7EC8F0">${c.seed}</span><br><span class="small">${c.description}</span></div>`).join('');
  $('#worldBible').innerHTML=`<span class="small">${compiled.worldBible}</span>`;
  const shotGraph=director.plan(compiled.sceneGraph, {lensPack:$('#lensPack').value, cameraRig:$('#cameraRig').value, light:$('#lightModel').value});
  project.shotGraph=shotGraph; $('#shotGraph').textContent=JSON.stringify(shotGraph.slice(0,2),null,2); $('#movieJson').textContent=JSON.stringify({scenes:compiled.sceneGraph.length, shots:shotGraph.length},null,2);
  const strip=$('#shotStrip'); strip.innerHTML=''; shotGraph.forEach(s=>{ const d=document.createElement('div'); d.className='shot'; d.textContent=s.id.replace('scene_','S'); d.onclick=()=>{ document.querySelectorAll('.shot').forEach(x=>x.classList.remove('active')); d.classList.add('active'); $('#shotLabel').textContent=`${s.id} | ${s.location} | ${s.camera}`; renderer.previewShot(s); }; strip.appendChild(d); }); if(strip.firstChild) strip.firstChild.click(); timeline.load(shotGraph);
};
$('#renderAll').onclick=async()=>{ if(!project) return; for(let i=0;i<project.shotGraph.length;i++){ await renderer.renderShot(project.shotGraph[i]); $('#progress').style.width=((i+1)/project.shotGraph.length*100)+'%'; } };
$('#masterBtn').onclick=async()=>{ await renderer.masterAssemble(project.shotGraph, $('#final')); };
$('#exportBtn').onclick=()=>$('#masterBtn').click();
$('#playBtn').onclick=()=>timeline.play(id=>{ const s=project.shotGraph.find(x=>x.id===id); if(s) renderer.previewShot(s); });
$('#loadBtn').onclick=()=>{ $('#storyInput').value=`A young man wakes up in a dark room. He hears a strange electrical pulse that seems to follow him. He follows the corridor that flickers with blue light. He discovers an old machine connected to a glowing display that reacts to his thoughts. The console shows a floating orb. He touches the orb and sees memories of everyone who used the machine before him — their fears, their hopes. He realizes the machine doesn't control people, people planted their stories into it. He decides to plant his own story, one about return and light, and the machine opens a portal of dawn.`; };
$('#exportJson').onclick=()=>{ const blob=new Blob([JSON.stringify(project,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='project.sese.json'; a.click(); };