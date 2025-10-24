// Hydro Hero - game script

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// HUD elements from new HTML structure
const overlay = document.getElementById('overlay');
const startMessage = document.getElementById('startMessage');
const countdownMessage = document.getElementById('countdownMessage');
const hudScore = document.getElementById('score');
const hudTimer = document.getElementById('timer');

// Game state
let gameActive = false;
let timeLeft = 60;
let score = 0;
let highScore = 0;
let keys = {};
let rainDrops = [];
let timerInterval = null;

// Player state
const player = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 80,
  width: 40,
  height: 40,
  speed: 5,
  bucket: 0,
  bucketMax: 5,
};

const tanks = {
  left: { x: 10, y: canvas.height - 70, width: 40, height: 60 },
  right: { x: canvas.width - 50, y: canvas.height - 70, width: 40, height: 60 },
};

// Input
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (!gameActive && overlay.style.display !== 'none' && e.key === ' ') {
    startCountdown();
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// Countdown then start
function startCountdown() {
  let steps = ['Ready?', '3', '2', '1', 'GO!'];
  let i = 0;
  overlay.style.display = 'flex';
  startMessage.style.display = 'none';
  countdownMessage.textContent = steps[i];

  function next() {
    i++;
    if (i < steps.length) {
      countdownMessage.textContent = steps[i];
      setTimeout(next, 800);
    } else {
      overlay.style.display = 'none';
      gameStart();
    }
  }

  setTimeout(next, 800);
}

function gameStart() {
  gameActive = true;
  score = 0;
  timeLeft = 60;
  player.x = canvas.width / 2 - player.width / 2;
  player.y = canvas.height - 80;
  player.bucket = 0;
  rainDrops = [];
  hudScore.textContent = `Score: ${score}`;
  hudTimer.textContent = `Time: ${timeLeft}`;

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!gameActive) return;
    timeLeft--;
    hudTimer.textContent = `Time: ${timeLeft}`;
    if (timeLeft <= 0) {
      gameOver();
    }
  }, 1000);

  requestAnimationFrame(gameLoop);
}

function gameOver() {
  gameActive = false;
  if (timerInterval) clearInterval(timerInterval);
  highScore = Math.max(highScore, score);
  startMessage.innerHTML = `Time's up!<br>Score: ${score}<br>High Score: ${highScore}<br><br>Press Space to play again`;
  startMessage.style.display = 'block';
  countdownMessage.textContent = '';
  overlay.style.display = 'flex';
}

// Spawning rain
function spawnRain() {
  const drop = {
    x: Math.random() * (canvas.width - 10) + 5,
    y: -10,
    radius: 4,
    speed: 3 + Math.random() * 1.5,
  };
  rainDrops.push(drop);
}

function catchDrop(drop) {
  return (
    drop.y + drop.radius >= player.y &&
    drop.x >= player.x &&
    drop.x <= player.x + player.width &&
    player.bucket < player.bucketMax &&
    gameActive
  );
}

function atTank() {
  return (
    player.x <= tanks.left.x + tanks.left.width ||
    player.x + player.width >= tanks.right.x
  );
}

// Update
function update() {
  if (!gameActive) return;
  if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
  if (keys['ArrowRight'] && player.x + player.width < canvas.width) player.x += player.speed;

  if (Math.random() < 0.035) spawnRain();

  for (let i = rainDrops.length - 1; i >= 0; i--) {
    const d = rainDrops[i];
    d.y += d.speed;

    if (catchDrop(d)) {
      player.bucket++;
      score += 10;
      hudScore.textContent = `Score: ${score}`;
      rainDrops.splice(i, 1);
    } else if (d.y > canvas.height + 10) {
      rainDrops.splice(i, 1);
    }
  }

  if (atTank() && player.bucket > 0) {
    player.bucket = 0; // deposit
  }
}

// Draw helpers
function drawBackground() {
  // stormy sky
  ctx.fillStyle = '#888a8c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // hills
  ctx.beginPath();
  ctx.arc(160, canvas.height - 40, 110, Math.PI, 2 * Math.PI);
  ctx.arc(360, canvas.height - 20, 150, Math.PI, 2 * Math.PI);
  ctx.arc(600, canvas.height - 50, 100, Math.PI, 2 * Math.PI);
  ctx.fillStyle = '#43a047';
  ctx.fill();
  ctx.closePath();
}

function drawClouds() {
  ctx.fillStyle = '#b0bec5';
  ctx.font = '28px Courier New';
  ctx.fillText('☁', 90, 70);
  ctx.fillText('☁', 200, 90);
  ctx.fillText('☁', 310, 60);
  ctx.fillText('☁', 420, 85);
  ctx.fillText('☁', 520, 65);
  ctx.fillText('☁', 640, 95);

  ctx.fillStyle = '#cfd8dc';
  ctx.beginPath();
  ctx.ellipse(250, 50, 40, 18, 0, 0, Math.PI * 2);
  ctx.ellipse(270, 55, 30, 14, 0, 0, Math.PI * 2);
  ctx.ellipse(230, 60, 25, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}

function drawRain() {
  rainDrops.forEach((drop) => {
    // raindrop shape
    ctx.beginPath();
    ctx.ellipse(drop.x, drop.y, drop.radius, drop.radius * 1.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#00b0ff';
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.closePath();

    // highlight
    ctx.beginPath();
    ctx.ellipse(
      drop.x - drop.radius / 3,
      drop.y - drop.radius / 2,
      drop.radius / 3,
      drop.radius / 2.2,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = '#b3e5fc';
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.closePath();
  });
}

function drawPlayer() {
  const centerX = player.x + player.width / 2;
  const headRadius = 10;
  const bodyLength = 24;
  const legLength = 18;
  const armLength = 18;
  const bodyTop = player.y + headRadius * 2;

  // head
  ctx.beginPath();
  ctx.arc(centerX, player.y + headRadius, headRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#ffcc99';
  ctx.fill();
  ctx.closePath();

  // hat
  ctx.fillStyle = '#00e5ff';
  ctx.fillRect(centerX - headRadius + 2, player.y + 2, headRadius * 1.6, 8);
  ctx.fillRect(centerX - headRadius - 2, player.y + 9, headRadius * 2, 4);

  // torso
  ctx.beginPath();
  ctx.moveTo(centerX, player.y + headRadius * 2);
  ctx.lineTo(centerX, bodyTop + bodyLength);
  ctx.strokeStyle = '#cc3344';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.closePath();

  // arms
  ctx.beginPath();
  ctx.moveTo(centerX, bodyTop + 6);
  ctx.lineTo(centerX - armLength, bodyTop + 18);
  ctx.moveTo(centerX, bodyTop + 6);
  ctx.lineTo(centerX + armLength, bodyTop + 18);
  ctx.strokeStyle = '#cc3344';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.closePath();

  // hands
  ctx.fillStyle = '#ffcc99';
  ctx.beginPath();
  ctx.arc(centerX - armLength, bodyTop + 18, 3, 0, Math.PI * 2);
  ctx.arc(centerX + armLength, bodyTop + 18, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();

  // legs
  ctx.beginPath();
  ctx.moveTo(centerX, bodyTop + bodyLength);
  ctx.lineTo(centerX - 10, bodyTop + bodyLength + legLength);
  ctx.moveTo(centerX, bodyTop + bodyLength);
  ctx.lineTo(centerX + 10, bodyTop + bodyLength + legLength);
  ctx.strokeStyle = '#cc3344';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.closePath();

  // barrel bucket
  const bucketWidth = player.width + 22;
  const bucketHeight = 32;
  const bucketY = bodyTop + 10;
  const grad = ctx.createLinearGradient(centerX - bucketWidth / 2, 0, centerX + bucketWidth / 2, 0);
  grad.addColorStop(0, '#0090d0');
  grad.addColorStop(0.5, '#00b0ff');
  grad.addColorStop(1, '#0090d0');

  ctx.beginPath();
  ctx.ellipse(centerX, bucketY + bucketHeight / 2, bucketWidth / 2, bucketHeight / 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = '#004a63';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.closePath();

  // rim
  ctx.beginPath();
  ctx.ellipse(centerX, bucketY + 4, bucketWidth / 2, 7, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#b3e5fc';
  ctx.globalAlpha = 0.7;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#004a63';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();

  // bands
  ctx.strokeStyle = '#006b8a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(centerX, bucketY + bucketHeight * 0.35, bucketWidth / 2 - 3, 4, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(centerX, bucketY + bucketHeight * 0.7, bucketWidth / 2 - 4, 4, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.closePath();

  // handle
  ctx.beginPath();
  ctx.arc(centerX, bucketY + 6, bucketWidth / 2 + 4, Math.PI * 0.15, Math.PI * 0.85);
  ctx.strokeStyle = '#004a63';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.closePath();

  // water fill
  if (player.bucket > 0) {
    const fillHeight = (bucketHeight - 8) * (player.bucket / player.bucketMax);
    ctx.beginPath();
    ctx.ellipse(
      centerX,
      bucketY + bucketHeight - fillHeight / 2,
      bucketWidth / 2 - 4,
      fillHeight / 2,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = '#00e5ff';
    ctx.globalAlpha = 0.8;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.closePath();
  }
}

function drawTanks() {
  ctx.fillStyle = '#2962ff';
  ctx.fillRect(tanks.left.x, tanks.left.y, tanks.left.width, tanks.left.height);
  ctx.fillRect(tanks.right.x, tanks.right.y, tanks.right.width, tanks.right.height);
}

function draw() {
  drawBackground();
  drawClouds();
  drawRain();
  drawTanks();
  drawPlayer();
}

function gameLoop() {
  if (!gameActive) return;
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Initial static frame with start overlay visible
(function init() {
  draw();
  overlay.style.display = 'flex';
})();

