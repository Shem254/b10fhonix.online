export class ContinuityEngine{
  constructor(){ this.seeds={}; this.worldSeed=0; }
  seedWorld(worldBible, characters){ this.worldSeed=this.hash(worldBible); characters.forEach(c=>{ this.seeds[c.name]=c.seed; }); }
  hash(s){ let h=0; for(let i=0;i<s.length;i++){ h=((h<<5)-h)+s.charCodeAt(i); h|=0; } return Math.abs(h); }
  getCharacterSeed(name){ return this.seeds[name]||this.hash(name); }
  deterministicRandom(seed, frame, salt=0){ const x=Math.sin(seed*9999 + frame*0.13 + salt*7.7)*10000; return x-Math.floor(x); }
}