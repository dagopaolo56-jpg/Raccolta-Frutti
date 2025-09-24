const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let playerName = prompt("Inserisci il tuo nome:", "Giocatore");
document.getElementById('playerName').textContent = `Giocatore: ${playerName}`;

let score = 0;
let timeLeft = 60;
let fruits = [];
let gameOver = false;

let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
updateLeaderboard();

// Carica immagini
const playerImg = new Image();
playerImg.src = 'cestino.png';

const goodFruitsImg = ['mela.png','banana.png','arancia.png'].map(src=>{
  const img = new Image(); img.src = src; return img;
});

const badFruitImg = new Image();
badFruitImg.src = 'rotten.png';

// Player
let player = {x: canvas.width/2 - 30, y: canvas.height-50, width:60, height:40};

// Movimento mouse
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  player.x = e.clientX - rect.left - player.width/2;
});

// Genera frutti
function spawnFruit() {
  const size = 40;
  const x = Math.random() * (canvas.width - size);
  const y = -size;
  const type = Math.random() < 0.7 ? 'good' : 'bad'; // più frutti velenosi
  const speed = Math.random()*2 + 2 + (60 - timeLeft)/20; // velocità crescente
  const img = type === 'good' ? goodFruitsImg[Math.floor(Math.random()*goodFruitsImg.length)] : badFruitImg;
  fruits.push({x,y,size,type,speed,img});
}

// Aggiorna gioco
function update() {
  if(gameOver) return;

  timeLeft -= 1/60;
  document.getElementById('timer').textContent = `Tempo: ${Math.ceil(timeLeft)}`;

  if(Math.random() < 0.03) spawnFruit(); // spawn più frequente

  for(let i = fruits.length-1; i>=0; i--) {
    const f = fruits[i];
    f.y += f.speed;
    // Collisione con cestino
    if(f.y + f.size > player.y && f.y < player.y + player.height &&
       f.x + f.size > player.x && f.x < player.x + player.width) {
      if(f.type === 'good') score++;
      else score = Math.max(0, score-1);
      fruits.splice(i,1);
      document.getElementById('score').textContent = `Punti: ${score}`;
    } else if(f.y > canvas.height) {
      fruits.splice(i,1);
    }
  }

  draw();

  if(timeLeft <= 0) endGame();
  else requestAnimationFrame(update);
}

// Disegna
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Player
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

  // Frutti
  for(const f of fruits){
    ctx.drawImage(f.img, f.x, f.y, f.size, f.size);
  }
}

function endGame() {
  gameOver = true;
  leaderboard.push({name: playerName, score: score});
  leaderboard.sort((a,b)=>b.score-a.score);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
  updateLeaderboard();
  alert(`Tempo scaduto! Hai fatto ${score} punti.`);
}

function updateLeaderboard() {
  const list = document.getElementById('scoreList');
  list.innerHTML = '';
  leaderboard.slice(0,10).forEach(entry=>{
    const li = document.createElement('li');
    li.textContent = `${entry.name}: ${entry.score}`;
    list.appendChild(li);
  });
}

update();
