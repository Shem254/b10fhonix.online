export const NarrativeCompiler={
  compile(raw, genre){
    const sentences=raw.split(/[.!?]+/).map(s=>s.trim()).filter(s=>s.length>12);
    const beats=this.extractBeats(sentences);
    const theme=this.extractTheme(raw, genre);
    const characters=this.extractCharacters(raw);
    const worldBible=this.buildWorld(raw, genre, beats);
    const sceneGraph=this.buildScenes(beats, characters, worldBible);
    return {title:raw.slice(0,28)+' — Movie', raw, genre, theme, beats, characters, worldBible, sceneGraph, created:new Date().toISOString()};
  },
  extractBeats(sentences){
    return sentences.map((s,i)=>{
      const lower=s.toLowerCase(); let act='confrontation'; if(i<sentences.length*0.25) act='setup'; else if(i>sentences.length*0.75) act='resolution';
      let mood='tense'; if(lower.includes('light')||lower.includes('hope')||lower.includes('dawn')) mood='triumphant'; else if(lower.includes('memory')||lower.includes('orb')) mood='dream';
      let location='Abandoned Room'; if(lower.includes('corridor')) location='Corridor - Electric Pulse'; else if(lower.includes('machine')||lower.includes('console')) location='Old Machine - Glowing Display'; else if(lower.includes('orb')||lower.includes('memory')) location='Memory Void - White'; else if(lower.includes('portal')||lower.includes('dawn')) location='Roof - Dawn Portal';
      return {index:i, text:s, act, mood, location, time:['Midnight','00:15','00:30','01:00','05:45'][Math.floor(i/(sentences.length/5))%5], duration:8};
    });
  },
  extractTheme(raw, genre){ return `technology as memory vessel + planting stories + signal as call + ${genre}`; },
  extractCharacters(raw){
    const candidates={}; raw.split(/\s+/).forEach(w=>{ const c=w.replace(/[^A-Za-z]/g,''); if(c.length>2 && c[0]===c[0].toUpperCase()) candidates[c]=(candidates[c]||0)+1; });
    let tops=Object.entries(candidates).sort((a,b)=>b[1]-a[1]).slice(0,3).map(e=>e[0]); if(tops.length===0) tops=['Alex','Maya'];
    return tops.map(name=>{ const seed=Math.abs([...name].reduce((a,ch)=>((a<<5)-a)+ch.charCodeAt(0),0)); return {name, seed, description:`${name}, consistent face, Afro sci-fi, seed locked`, visualSeed:`${name} seed ${seed} anamorphic 35mm`, arc:'seeker', continuitySeed:seed}; });
  },
  buildWorld(raw, genre, beats){ return `World: ${[...new Set(beats.map(b=>b.location))].join(' -> ')}. Genre ${genre}. Rule: machine reacts to thoughts, orb = memory interface, portal = reward. ${raw.slice(0,200)}`; },
  buildScenes(beats, characters, worldBible){
    const perScene=Math.ceil(beats.length/5); const scenes=[];
    for(let i=0;i<5;i++){ const chunk=beats.slice(i*perScene,(i+1)*perScene); if(!chunk.length) continue; scenes.push({id:`scene_${String(i+1).padStart(2,'0')}`, location:chunk[0].location, time:chunk[0].time, mood:chunk[0].mood, act:chunk[0].act, beats:chunk, characters:characters.map(c=>c.name), atmosphere:chunk.map(b=>b.mood).join(', ')}); }
    return scenes;
  }
};