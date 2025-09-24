const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Nome giocatore
let playerName = prompt("Inserisci il tuo nome:", "Giocatore");
document.getElementById('playerName').textContent = `Giocatore: ${playerName}`;

let score = 0;
let fruits = [];
let gameOver = false;
let elapsedTime = 0; // serve per aumentare la frequenza dei rossi

// Leaderboard
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
updateLeaderboard();

// Player
let player = {x: canvas.width/2 - 30, y: canvas.height-40, width:60, height:30};

// Movimento mouse
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  player.x = e.clientX - rect.left - player.width/2;
});

// Genera frutti
function spawnFruit() {
  const size = 20;
  const x = Math.random() * (canvas.width - size);
  const y = -size;
  const redProbability = Math.min(0.6, 0.2 + elapsedTime/100); // aumenta con il tempo, max 60%
  const type = Math.random() < redProbability ? 'bad' : 'good';
  const speed = Math.random()*2 + 2;
  fruits.push({x, y, size, type, speed});
}

// Disegna tutto
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Player
  ctx.fillStyle = '#00aaff';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Frutti
  for(let f of fruits){
    ctx.fillStyle = f.type === 'good' ? '#0f0' : '#f00';
    ctx.fillRect(f.x, f.y, f.size, f.size);
  }

  // Aggiorna punteggio
  document.getElementById('score').textContent = `Punti: ${score}`;
}

// Aggiorna gioco
function update() {
  if(gameOver) return;

  elapsedTime += 1/60;

  // spawn frutti frequenti e rossi sempre più frequenti
  if(Math.random() < 0.02 + elapsedTime/200) spawnFruit();

  for(let i = fruits.length-1; i >= 0; i--){
    let f = fruits[i];
    f.y += f.speed;

    // Collisione con player
    if(f.y + f.size > player.y && f.y < player.y + player.height &&
       f.x + f.size > player.x && f.x < player.x + player.width) {
      if(f.type === 'good') {
        score++;
      } else {
        endGame(); // toccato rosso = morte immediata
      }
      fruits.splice(i,1);
    } else if(f.y > canvas.height) {
      fruits.splice(i,1);
    }
  }

  draw();
  requestAnimationFrame(update);
}

// Fine gioco
function endGame() {
  gameOver = true;
  leaderboard.push({name: playerName, score: score});
  leaderboard.sort((a,b) => b.score - a.score);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
  updateLeaderboard();
  alert(`Hai toccato un frutto velenoso! Hai fatto ${score} punti.`);
}

// Aggiorna leaderboard (top 5)
function updateLeaderboard() {
  const list = document.getElementById('scoreList');
  list.innerHTML = '';

  leaderboard.slice(0,5).forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.name}: ${entry.score}`;
    list.appendChild(li);
  });
}

// Avvia gioco
update();

