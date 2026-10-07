export class AudioEngine{constructor(l){this.log=l;this.ctx=null;}init(){if(!this.ctx)this.ctx=new(window.AudioContext||window.webkitAudioContext)();}}
