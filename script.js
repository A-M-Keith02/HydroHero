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
let gameActive = false; // Don't start game until countdown finishes
let countdownActive = false;
let countdownOverlay = document.getElementById('countdownOverlay');
let countdownText = document.getElementById('countdownText');

function showCountdownAndStartGame() {
  countdownActive = true;
  let steps = ["Ready?", "3", "2", "1", "GO!"];
  let i = 0;
  countdownOverlay.style.display = 'flex';
  countdownText.textContent = steps[i];
  function nextStep() {
    i++;
    if (i < steps.length) {
      countdownText.textContent = steps[i];
      setTimeout(nextStep, 800);
    } else {
      countdownOverlay.style.display = 'none';
      countdownActive = false;
      gameActive = true;
      startTimer();
      gameLoop();
    }
  }
  setTimeout(nextStep, 800);
}

// Override initial game start
function initialGameStart() {
  // Hide welcome overlay
  var overlay = document.getElementById('welcomeOverlay');
  if (overlay && overlay.style.display !== 'none') {
    overlay.style.display = 'none';
    document.removeEventListener('keydown', initialGameStart);
    // Show countdown, then start game
    showCountdownAndStartGame();
  }
}

document.removeEventListener('keydown', hideWelcome); // Remove old listener if present

document.addEventListener('keydown', initialGameStart);

// Prevent game from starting immediately
let gameStarted = false;
// Update timer every second
function startTimer() {
  if (!gameStarted) {
    gameStarted = true;
  }
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
      gameActive = false;
      gameStarted = false;
      showCountdownAndStartGame();
    } else if (e.code === 'Escape') {
      // Quit: show quit message or reload page
      overlay.style.display = 'none';
      gameActive = false;
      // Optionally, you can show a quit message or do something else here
    }
  }
});

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
  // Dimensions and anchors
  const centerX = player.x + player.width / 2;
  const headRadius = 10;
  const bodyLength = 24;
  const legLength = 18;
  const armLength = 18;
  const bodyTop = player.y + headRadius * 2;

  // Head
  ctx.beginPath();
  ctx.arc(centerX, player.y + headRadius, headRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#ffcc99';
  ctx.fill();
  ctx.closePath();

  // Cyan hat (rectangle with brim)
  ctx.fillStyle = '#00e5ff';
  ctx.fillRect(centerX - headRadius + 2, player.y + 2, headRadius * 1.6, 8);
  ctx.fillRect(centerX - headRadius - 2, player.y + 9, headRadius * 2, 4);

  // Torso (thicker stroke for visibility)
  ctx.beginPath();
  ctx.moveTo(centerX, player.y + headRadius * 2);
  ctx.lineTo(centerX, bodyTop + bodyLength);
  ctx.strokeStyle = '#cc3344';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.closePath();

  // Arms angled down toward bucket
  ctx.beginPath();
  ctx.moveTo(centerX, bodyTop + 6);
  ctx.lineTo(centerX - armLength, bodyTop + 18);
  ctx.moveTo(centerX, bodyTop + 6);
  ctx.lineTo(centerX + armLength, bodyTop + 18);
  ctx.strokeStyle = '#cc3344';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.closePath();

  // Hands (small circles)
  ctx.fillStyle = '#ffcc99';
  ctx.beginPath();
  ctx.arc(centerX - armLength, bodyTop + 18, 3, 0, Math.PI * 2);
  ctx.arc(centerX + armLength, bodyTop + 18, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();

  // Legs
  ctx.beginPath();
  ctx.moveTo(centerX, bodyTop + bodyLength);
  ctx.lineTo(centerX - 10, bodyTop + bodyLength + legLength);
  ctx.moveTo(centerX, bodyTop + bodyLength);
  ctx.lineTo(centerX + 10, bodyTop + bodyLength + legLength);
  ctx.strokeStyle = '#cc3344';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.closePath();

  // Giant barrel bucket (in front of body)
  const bucketWidth = player.width + 22; // larger than body
  const bucketHeight = 32;
  const bucketY = bodyTop + 10;

  // Body fill with subtle vertical gradient
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

  // Top rim
  ctx.beginPath();
  ctx.ellipse(centerX, bucketY + 4, bucketWidth / 2, 7, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#b3e5fc';
  ctx.globalAlpha = 0.7;
  ctx.fill();
  ctx.globalAlpha = 1.0;
  ctx.strokeStyle = '#004a63';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();

  // Barrel bands
  ctx.strokeStyle = '#006b8a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(centerX, bucketY + bucketHeight * 0.35, bucketWidth / 2 - 3, 4, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(centerX, bucketY + bucketHeight * 0.7, bucketWidth / 2 - 4, 4, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.closePath();

  // Handle connecting hands
  ctx.beginPath();
  ctx.arc(centerX, bucketY + 6, bucketWidth / 2 + 4, Math.PI * 0.15, Math.PI * 0.85);
  ctx.strokeStyle = '#004a63';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.closePath();

  // Water fill (proportional to player.bucket)
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
    ctx.globalAlpha = 1.0;
    ctx.closePath();
  }
}

function drawRain() {
  rainDrops.forEach(drop => {
    // Draw raindrop body (ellipse)
    ctx.beginPath();
    ctx.ellipse(drop.x, drop.y, drop.radius, drop.radius * 1.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#00b0ff";
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.globalAlpha = 1.0;
    ctx.closePath();

    // Draw highlight
    ctx.beginPath();
    ctx.ellipse(drop.x - drop.radius / 3, drop.y - drop.radius / 2, drop.radius / 3, drop.radius / 2.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#b3e5fc";
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = 1.0;
    ctx.closePath();
  });
}

function drawTanks() {
  ctx.fillStyle = "#2962ff";
  ctx.fillRect(tanks.left.x, tanks.left.y, tanks.left.width, tanks.left.height);
  ctx.fillRect(tanks.right.x, tanks.right.y, tanks.right.width, tanks.right.height);
}

function drawClouds() {
  ctx.fillStyle = "#b0bec5";
  ctx.font = "28px Courier New";
  ctx.fillText("☁", 70, 60);
  ctx.fillText("☁", 160, 90);
  ctx.fillText("☁", 250, 50);
  ctx.fillText("☁", 340, 80);
  ctx.fillText("☁", 430, 55);
  ctx.fillText("☁", 380, 120);

  // Optionally, draw some custom ellipse clouds for variety
  ctx.fillStyle = "#cfd8dc";
  ctx.beginPath();
  ctx.ellipse(220, 40, 40, 18, 0, 0, Math.PI * 2);
  ctx.ellipse(240, 45, 30, 14, 0, 0, Math.PI * 2);
  ctx.ellipse(200, 50, 25, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}

function draw() {
  // Draw darker stormy sky
  ctx.fillStyle = '#888a8c'; // stormy grey
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grassy hills
  ctx.beginPath();
  ctx.arc(120, canvas.height - 30, 80, Math.PI, 2 * Math.PI);
  ctx.arc(300, canvas.height - 10, 120, Math.PI, 2 * Math.PI);
  ctx.arc(450, canvas.height - 40, 70, Math.PI, 2 * Math.PI);
  ctx.fillStyle = '#43a047';
  ctx.fill();
  ctx.closePath();

  drawClouds();
  drawRain();
  drawTanks();
  drawPlayer();
}

// Render initial background and UI
window.onload = function() {
  draw();
};

function gameLoop() {
  if (!gameActive) return;
  update();
  draw();
  if (gameActive) {
    requestAnimationFrame(gameLoop);
  }
}
