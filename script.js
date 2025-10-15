const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player = {
  x: canvas.width / 2,
  y: canvas.height - 60,
  width: 40,
  height: 40,
  speed: 5,
  bucket: 0,
  bucketMax: 5
};

const tanks = {
  left: { x: 10, y: canvas.height - 70, width: 40, height: 60 },
  right: { x: canvas.width - 50, y: canvas.height - 70, width: 40, height: 60 }
};

const rainDrops = [];
let keys = {};
let score = 0;
let highScore = 0;
let timeLeft = 60; // seconds
let gameActive = true;

// Update timer every second
function startTimer() {
  const timerInterval = setInterval(() => {
    if (timeLeft > 0 && gameActive) {
      timeLeft--;
      document.getElementById("timer").textContent = timeLeft;
    } else {
      gameActive = false;
      clearInterval(timerInterval);
      endGame();
    }
  }, 1000);
}

function endGame() {
  // Update high score
  if (score > highScore) {
    highScore = score;
  }
  // Show game over overlay
  const overlay = document.getElementById('gameOverOverlay');
  const msg = document.getElementById('gameOverMessage');
  if (overlay && msg) {
    msg.innerHTML = `Time's up!<br>Score: ${score}<br>High Score: ${highScore}`;
    overlay.style.display = 'flex';
  }
}

// Handle replay and quit
document.addEventListener('keydown', function gameOverKeys(e) {
  const overlay = document.getElementById('gameOverOverlay');
  if (overlay && overlay.style.display === 'flex') {
    if (e.code === 'Space') {
      // Replay: reset game state
      score = 0;
      timeLeft = 60;
      player.x = canvas.width / 2;
      player.y = canvas.height - 60;
      player.bucket = 0;
      rainDrops.length = 0;
      document.getElementById('score').textContent = score;
      document.getElementById('timer').textContent = timeLeft;
      overlay.style.display = 'none';
      gameActive = true;
      startTimer();
      gameLoop();
    } else if (e.code === 'Escape') {
      // Quit: show quit message or reload page
      overlay.style.display = 'none';
      gameActive = false;
      // Optionally, you can show a quit message or do something else here
    }
  }
});

// Remove duplicate and misplaced logic above
// Handle input
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Spawn raindrops
function spawnRain() {
  const drop = {
    x: Math.random() * (canvas.width - 10),
    y: 0,
    radius: 5,
    speed: 3
  };
  rainDrops.push(drop);
}

// Check if raindrop is caught
function catchDrop(drop) {
  return (
    drop.y + drop.radius >= player.y &&
    drop.x >= player.x &&
    drop.x <= player.x + player.width &&
    player.bucket < player.bucketMax &&
    gameActive
  );
}

// Check if player is at a tank
function atTank() {
  return (
    (player.x <= tanks.left.x + tanks.left.width) ||
    (player.x + player.width >= tanks.right.x)
  );
}

function update() {
  if (!gameActive) return;
  // Player movement
  if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
  if (keys["ArrowRight"] && player.x + player.width < canvas.width) player.x += player.speed;

  // Spawn drops
  if (Math.random() < 0.03) spawnRain();

  // Move and catch rain
  for (let i = rainDrops.length - 1; i >= 0; i--) {
    const drop = rainDrops[i];
    drop.y += drop.speed;

    if (catchDrop(drop)) {
      if (player.bucket < player.bucketMax) {
        player.bucket++;
        score += 10; // Each drop is 10 points
        document.getElementById("score").textContent = score;
        rainDrops.splice(i, 1);
      }
      // If bucket is full, do not catch more drops
    } else if (drop.y > canvas.height) {
      rainDrops.splice(i, 1); // missed drop
    }
  }

  // Deposit water
  if (atTank() && player.bucket > 0) {
    player.bucket = 0;
  }
}

function drawPlayer() {
  ctx.fillStyle = "#ff1744"; // stick figure
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Bucket
  ctx.fillStyle = "#00b0ff";
  ctx.fillRect(player.x + player.width, player.y + 10, 10, 10);

  // Bucket fill level
  ctx.fillStyle = "#00e5ff";
  ctx.fillRect(player.x + player.width, player.y + 10, 10, player.bucket * 2);
}

function drawRain() {
  ctx.fillStyle = "#00b0ff";
  rainDrops.forEach(drop => {
    ctx.beginPath();
    ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawTanks() {
  ctx.fillStyle = "#2962ff";
  ctx.fillRect(tanks.left.x, tanks.left.y, tanks.left.width, tanks.left.height);
  ctx.fillRect(tanks.right.x, tanks.right.y, tanks.right.width, tanks.right.height);
}

function drawClouds() {
  ctx.fillStyle = "#607d8b";
  ctx.font = "20px Courier New";
  ctx.fillText("☁", 100, 80);
  ctx.fillText("☁", 300, 70);
  ctx.fillText("☁", 500, 90);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawClouds();
  drawRain();
  drawTanks();
  drawPlayer();
}

function gameLoop() {
  update();
  draw();
  if (gameActive) {
    requestAnimationFrame(gameLoop);
  }
}

startTimer(); // Start timer only once at game start
gameLoop();
