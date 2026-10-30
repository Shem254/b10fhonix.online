import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ===== REAL GAME STATE (server remembers) =====
let state = {
  round: 181710,
  phase: 'betting',
  timeLeft: 8,
  history: [],
  players: {} // socketId -> { name, balance, bets }
};

const ORDER = ['1','CoinFlip','2','5','1','2','1','CashHunt','1','2','1','Pachinko','2','1','10','1','2','5','1','2','1','CoinFlip','2','1','2','1','5','1','2','1','CoinFlip','1','2','10','1','2','1','5','2','1','CashHunt','1','2','1','Pachinko','1','2','1','CoinFlip','1','CrazyTime','2','1'];
const PAYOUT = { '1':1,'2':2,'5':5,'10':10,'CoinFlip':5,'CashHunt':10,'Pachinko':10,'CrazyTime':20 };

function startBetting(){
  state.phase='betting'; state.timeLeft=8;
  state.topSlot = Math.random()>0.6 ? { type: ORDER[Math.floor(Math.random()*54)], mult: [2,3,5,10,15,25,50][Math.floor(Math.random()*7)] } : null;
  io.emit('phase', state);
  clearInterval(state.timer);
  state.timer = setInterval(()=>{
    state.timeLeft -= 0.1;
    if(state.timeLeft<=0){ clearInterval(state.timer); spinServer(); }
    io.emit('tick', { timeLeft: state.timeLeft });
  },100);
}

function spinServer(){
  state.phase='spinning';
  const idx = Math.floor(Math.random()*54);
  const winner = ORDER[idx];
  io.emit('spinning', { winnerIdx: idx });
  
  setTimeout(()=>{
    const topMult = state.topSlot && state.topSlot.type===winner ? state.topSlot.mult : 1;
    state.history.unshift(winner);
    if(state.history.length>30) state.history.pop();
    
    // pay everyone
    let results = [];
    for(let id in state.players){
      let p = state.players[id];
      let win = 0;
      if(p.bets[winner]) win = Math.floor(p.bets[winner] * (PAYOUT[winner]||1) * topMult);
      if(win>0) p.balance += win;
      results.push({ id, name: p.name, betOn: Object.keys(p.bets)[0]||'-', win });
      p.bets = {}; // clear
    }
    state.round++;
    io.emit('winner', { winner, topMult, results, history: state.history, round: state.round });
    setTimeout(startBetting, 2500);
  }, 5000);
}

io.on('connection', (socket)=>{
  console.log('player connected', socket.id);
  state.players[socket.id] = { name: 'GUEST'+Math.floor(Math.random()*99), balance: 50000, bets: {} };
  
  socket.emit('init', state);
  socket.emit('me', state.players[socket.id]);

  socket.on('setName', (name)=>{
    if(state.players[socket.id]) state.players[socket.id].name = name.slice(0,12);
    io.emit('players', state.players);
  });

  socket.on('placeBet', ({ type, amount })=>{
    let p = state.players[socket.id];
    if(!p || state.phase!=='betting') return;
    if(p.balance < amount) return;
    if(!p.bets[type]) p.bets[type]=0;
    p.bets[type]+=amount;
    p.balance-=amount;
    io.emit('players', state.players);
    socket.emit('balance', p.balance);
  });

  socket.on('clearBets', ()=>{
    let p = state.players[socket.id];
    if(!p) return;
    let total = Object.values(p.bets).reduce((a,b)=>a+b,0);
    p.balance+=total;
    p.bets={};
    io.emit('players', state.players);
    socket.emit('balance', p.balance);
  });

  socket.on('disconnect', ()=>{
    delete state.players[socket.id];
    io.emit('players', state.players);
  });
});

app.get('/', (req,res)=> res.send('b10fhonix REAL SERVER ONLINE - round '+state.round));

const PORT = process.env.PORT || 3000;
server.listen(PORT, ()=>{ console.log('Server on '+PORT); startBetting(); });
