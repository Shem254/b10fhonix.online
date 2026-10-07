export class Director{
  constructor(continuity){ this.continuity=continuity; }
  plan(sceneGraph, opts){
    const lensMap={anamorphic:{fov:38, lens:'35mm anamorphic'}, spherical:{fov:50, lens:'50mm spherical'}, macro:{fov:20, lens:'100mm macro'}, wide:{fov:75, lens:'24mm wide'}};
    const lens=lensMap[opts.lensPack]||lensMap.anamorphic;
    const shotGraph=[];
    sceneGraph.forEach(scene=>{
      for(let si=0; si<2; si++){
        const beat=scene.beats[Math.min(si, scene.beats.length-1)];
        const char=scene.characters[0]||'Alex'; const seed=this.continuity.getCharacterSeed(char);
        shotGraph.push({
          id:`${scene.id}_shot_${String(si+1).padStart(2,'0')}`, scene:scene.id, location:scene.location, time:scene.time, mood:scene.mood,
          camera: si===1?`close-up ${lens.lens}, eye level`:`wide ${lens.lens}, establishing`, lens:lens.lens, fov:lens.fov,
          cameraRig:opts.cameraRig, movement: si===1?'static with micro jitter':'dolly_in 0.6m', angle: si===1?'eye level':'low angle 15deg',
          action: si===0?`Establishing ${scene.location}`:`Close on ${char}, ${beat.text.slice(0,60)}`,
          visual:`${scene.location}, ${beat.text.slice(0,100)}, seed ${seed}, ${lens.lens}`, dialogue: si===1?beat.text.slice(0,120):'', narration: si===0?beat.text.slice(0,180):'',
          sound: scene.location.includes('Corridor')?'electric pulse 60Hz':'ambient', continuity:`Keep ${char} seed ${seed} consistent`,
          seed, duration:beat.duration, light:opts.light, depth:['foreground character','midground console','background void'], signal:{type:'orb', intensity:0.5+si*0.2}
        });
      }
    });
    return shotGraph;
  }
}