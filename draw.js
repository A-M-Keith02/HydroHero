// Draw background (already handled by canvas background in CSS)

// Draw clouds
ctx.fillStyle = '#fff';
ctx.beginPath();
ctx.ellipse(100, 50, 60, 30, 0, 0, Math.PI * 2);
ctx.ellipse(200, 40, 50, 25, 0, 0, Math.PI * 2);
ctx.ellipse(350, 60, 70, 35, 0, 0, Math.PI * 2);
ctx.fill();

// Draw player (red man)
ctx.fillStyle = '#e53935';
ctx.fillRect(player.x, player.y, player.width, player.height);
// Optionally, add eyes or arms for more character

// Draw rain (blue droplets)
ctx.fillStyle = '#03a9f4';
rainDrops.forEach(drop => {
    ctx.beginPath();
    ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
    ctx.fill();
});