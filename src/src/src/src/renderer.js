export class CinemaRenderer{
  constructor(masterCanvas, hiddenCanvas, continuity, logger){
    this.canvas=masterCanvas; this.hidden=hiddenCanvas; this.ctx=masterCanvas.getContext('2d'); this.continuity=continuity; this.log=logger; this.clips={};
  }
  previewShot(shot){ this.ctx.fillStyle='#000'; this.ctx.fillRect(0,0,1920,1080); this.ctx.fillStyle='#444'; this.ctx.font='20px Inter'; this.ctx.fillText(`Preview ${shot.id} — ${shot.location} — ${shot.camera}`,60,540); }
  async renderShot(shot){
    const canvas=document.createElement('canvas'); canvas.width=1920; canvas.height=1080; const ctx=canvas.getContext('2d');
    const stream=canvas.captureStream(24); const rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9'}); let chunks=[];
    rec.ondataavailable=e=>{ if(e.data.size>0) chunks.push(e.data); };
    const done=new Promise(r=>{ rec.onstop=()=>{ const blob=new Blob(chunks,{type:'video/webm'}); const url=URL.createObjectURL(blob); this.clips[shot.id]={url, blob, duration:shot.duration}; this.ctx.drawImage(canvas,0,0); r(); }; });
    rec.start(); const max=shot.duration*24; let frame=0;
    const draw=()=>{
      const rnd=(n)=>this.continuity.deterministicRandom(shot.seed, frame, n);
      if(shot.location.includes('Machine')){
        ctx.fillStyle='#080a14'; ctx.fillRect(0,0,1920,1080);
        ctx.fillStyle='rgba(20,22,34,0.9)'; ctx.fillRect(320,220,1280,620);
        ctx.strokeStyle='rgba(124,124,255,0.22)'; ctx.strokeRect(320,220,1280,620);
        const pulse=0.4+Math.sin(frame/10)*0.2; ctx.shadowColor='#7EC8F0'; ctx.shadowBlur=40*pulse; ctx.fillStyle=`rgba(200,230,255,${pulse})`; ctx.beginPath(); ctx.arc(960,520,44,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
        ctx.strokeStyle='rgba(124,200,240,0.35)'; ctx.beginPath(); for(let x=0;x<1280;x+=8){ const y=520+Math.sin((x+frame*4)/80)*20*rnd(1); if(x===0) ctx.moveTo(320+x,y); else ctx.lineTo(320+x,y); } ctx.stroke();
      }else if(shot.location.includes('Void')){
        ctx.fillStyle='#020208'; ctx.fillRect(0,0,1920,1080); const p=1+Math.sin(frame/16)*0.18; ctx.save(); ctx.translate(960,540); ctx.scale(p,p); ctx.fillStyle='#fff'; ctx.shadowColor='#7c7cff'; ctx.shadowBlur=28; ctx.beginPath(); ctx.arc(0,0,30,0,Math.PI*2); ctx.fill(); ctx.restore();
      }else if(shot.location.includes('Dawn')){
        const g=ctx.createLinearGradient(0,0,0,1080); g.addColorStop(0,'#1a182a'); g.addColorStop(1,'#ffb86a'); ctx.fillStyle=g; ctx.fillRect(0,0,1920,1080);
      }else{ ctx.fillStyle='#0c0c14'; ctx.fillRect(0,0,1920,1080); }
      const charX=960+Math.sin(frame/90+shot.seed*0.001)*18; ctx.fillStyle='rgba(255,255,255,0.07)'; ctx.beginPath(); ctx.ellipse(charX,680,46,98,0,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(charX,580,28,0,Math.PI*2); ctx.fill();
      if(shot.location.includes('Machine')){ const grad=ctx.createRadialGradient(960,520,10,960,520,600); grad.addColorStop(0,'rgba(126,200,240,0.14)'); grad.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=grad; ctx.fillRect(0,0,1920,1080); }
      ctx.fillStyle='rgba(0,0,0,0.62)'; ctx.fillRect(0,0,1920,82); ctx.fillRect(0,998,1920,82);
      ctx.fillStyle='rgba(255,255,255,0.04)'; for(let i=0;i<120;i++){ ctx.fillRect(rnd(i)*1920, rnd(i+100)*1080,1,1); }
      ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(0,880,1920,118); ctx.fillStyle='#fff'; ctx.font='600 20px Inter'; ctx.fillText((shot.narration||shot.dialogue||'').slice(0,110),32,926);
      ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.font='11px JetBrains Mono'; ctx.fillText(`${shot.camera} | ${shot.lens} | ${shot.movement} | ${shot.location} | seed:${shot.seed}`,32,952);
      frame++; if(frame<max) requestAnimationFrame(draw); else rec.stop();
    }; draw(); await done; this.log(`[RENDERER] ${shot.id} rendered`);
  }
  async masterAssemble(shotGraph, finalDiv){
    if(!Object.keys(this.clips).length){ alert('Render first'); return; }
    const ordered=shotGraph.filter(s=>this.clips[s.id]); const c=this.hidden; const ctx=c.getContext('2d'); const stream=c.captureStream(24); const rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9'}); let chunks=[];
    rec.ondataavailable=e=>{ if(e.data.size>0) chunks.push(e.data); };
    const done=new Promise(r=>{ rec.onstop=()=>{ const blob=new Blob(chunks,{type:'video/webm'}); const url=URL.createObjectURL(blob); finalDiv.innerHTML=`<video controls src="${url}" style="width:100%;border-radius:16px"></video><br><a href="${url}" download="SESE_V3_MASTER.webm"><button class="primary" style="width:100%">⬇ DOWNLOAD MASTER</button></a>`; r(); }; });
    rec.start();
    for(let idx=0; idx<ordered.length; idx++){ const s=ordered[idx]; const clip=this.clips[s.id]; const v=document.createElement('video'); v.src=clip.url; v.muted=true; await new Promise(r=>{ v.onloadedmetadata=()=>{ v.play(); r(); }; }); const frames=clip.duration*24; let f=0; await new Promise(r=>{ const loop=()=>{ let alpha=1; if(f<12 && idx>0) alpha=f/12; ctx.globalAlpha=1; ctx.fillStyle='#000'; ctx.fillRect(0,0,1920,1080); ctx.globalAlpha=alpha; ctx.drawImage(v,0,0,1920,1080); ctx.globalAlpha=1; f++; if(f<frames &&!v.ended) requestAnimationFrame(loop); else r(); }; loop(); }); }
    rec.stop(); await done; this.log('[MASTER] Master ready');
  }
}