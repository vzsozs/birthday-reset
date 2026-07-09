/*
 * engine.js
 * Ujrafelhasznalhato "dodge" harc-motor: SOUL doboz, mozgo lovedekek,
 * utkozesvizsgalat, HP kezeles. A battle.js hasznalja fel egy konkret
 * zona/ellenfel harcahoz.
 *
 * Semmi zona-specifikus tartalom nincs itt -- ez csak a mechanika.
 */
const Engine = (() => {
  let canvas, ctx;
  let box = { x: 0, y: 0, w: 0, h: 0 };
  let soul = { x: 0, y: 0, r: 8, speed: 160, invuln: 0 };
  let bullets = [];
  let keys = {};
  let running = false;
  let lastTime = 0;
  let onHit = null; // callback(damage)
  let images = {};
  let sounds = {};
  let spawnTimer = 0;
  let spawnConfig = null;
  let elapsed = 0;
  let dodgeDuration = 0;
  let onDodgeComplete = null;

  function loadImage(name, src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve(); // ne akadjon el placeholder hianyaban sem
      img.src = src;
      images[name] = img;
    });
  }

  function loadSound(name, src) {
    const audio = new Audio(src);
    audio.preload = "auto";
    sounds[name] = audio;
  }

  function playSound(name) {
    const s = sounds[name];
    if (!s) return;
    try {
      const clone = s.cloneNode(true);
      clone.volume = 0.6;
      clone.play().catch(() => {});
    } catch (e) {
      /* nem baj, ha a bongeszo blokkolja hang nelkuli interakcio elott */
    }
  }

  function init(canvasEl, boxBounds, hitCallback) {
    canvas = canvasEl;
    ctx = canvas.getContext("2d");
    box = boxBounds;
    onHit = hitCallback;
    soul.x = box.x + box.w / 2;
    soul.y = box.y + box.h / 2;

    const movementKeys = ["arrowleft", "arrowright", "arrowup", "arrowdown", "w", "a", "s", "d"];
    window.addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase();
      keys[k] = true;
      // ne gorgesse a lapot a nyilaknal/WASD-nel jatek kozben
      if (movementKeys.includes(k)) e.preventDefault();
    });
    window.addEventListener("keyup", (e) => {
      keys[e.key.toLowerCase()] = false;
    });
  }

  function resetSoul() {
    soul.x = box.x + box.w / 2;
    soul.y = box.y + box.h / 2;
    soul.invuln = 0;
  }

  // spawnConfig: { rate: ms kozotti spawn, speed: px/s, size: [min,max] }
  function startDodgePhase(duration, config, completeCallback) {
    bullets = [];
    spawnTimer = 0;
    elapsed = 0;
    dodgeDuration = duration;
    spawnConfig = config;
    onDodgeComplete = completeCallback;
    resetSoul();
    running = true;
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  function stopDodgePhase() {
    running = false;
    bullets = [];
  }

  function spawnBullet() {
    const size = spawnConfig.size
      ? spawnConfig.size[0] + Math.random() * (spawnConfig.size[1] - spawnConfig.size[0])
      : 6;
    bullets.push({
      x: box.x + Math.random() * box.w,
      y: box.y - 10,
      vy: spawnConfig.speed || 90,
      r: size,
    });
  }

  function loop(t) {
    if (!running) return;
    const dt = Math.min(0.05, (t - lastTime) / 1000);
    lastTime = t;
    elapsed += dt * 1000;

    update(dt);
    draw();

    if (elapsed >= dodgeDuration) {
      running = false;
      if (onDodgeComplete) onDodgeComplete();
      return;
    }
    requestAnimationFrame(loop);
  }

  function update(dt) {
    // SOUL mozgatasa (nyilak vagy WASD), a dobozon belul maradva
    let dx = 0,
      dy = 0;
    if (keys["arrowleft"] || keys["a"]) dx -= 1;
    if (keys["arrowright"] || keys["d"]) dx += 1;
    if (keys["arrowup"] || keys["w"]) dy -= 1;
    if (keys["arrowdown"] || keys["s"]) dy += 1;
    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }
    soul.x += dx * soul.speed * dt;
    soul.y += dy * soul.speed * dt;
    soul.x = Math.max(box.x + soul.r, Math.min(box.x + box.w - soul.r, soul.x));
    soul.y = Math.max(box.y + soul.r, Math.min(box.y + box.h - soul.r, soul.y));

    if (soul.invuln > 0) soul.invuln -= dt * 1000;

    // lovedekek spawnolasa
    spawnTimer -= dt * 1000;
    if (spawnTimer <= 0) {
      spawnBullet();
      spawnTimer = spawnConfig.rate || 400;
    }

    // lovedekek mozgatasa + utkozes
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.y += b.vy * dt;
      if (b.y - b.r > box.y + box.h) {
        bullets.splice(i, 1);
        continue;
      }
      const ddx = b.x - soul.x;
      const ddy = b.y - soul.y;
      const dist = Math.sqrt(ddx * ddx + ddy * ddy);
      if (dist < b.r + soul.r - 2 && soul.invuln <= 0) {
        soul.invuln = 900;
        playSound("hit");
        if (onHit) onHit(1);
        bullets.splice(i, 1);
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // doboz keret
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.strokeRect(box.x, box.y, box.w, box.h);

    // lovedekek
    const tearImg = images["tear"];
    for (const b of bullets) {
      if (tearImg && tearImg.complete && tearImg.naturalWidth) {
        ctx.drawImage(tearImg, b.x - b.r, b.y - b.r, b.r * 2, b.r * 2.2);
      } else {
        ctx.fillStyle = "#5aaaff";
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // SOUL
    const flashing = soul.invuln > 0 && Math.floor(soul.invuln / 100) % 2 === 0;
    if (!flashing) {
      const heartImg = images["heart"];
      if (heartImg && heartImg.complete && heartImg.naturalWidth) {
        ctx.drawImage(heartImg, soul.x - soul.r * 1.6, soul.y - soul.r * 1.6, soul.r * 3.2, soul.r * 3.2);
      } else {
        ctx.fillStyle = "#ff3030";
        ctx.beginPath();
        ctx.arc(soul.x, soul.y, soul.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  return {
    init,
    loadImage,
    loadSound,
    playSound,
    startDodgePhase,
    stopDodgePhase,
    resetSoul,
  };
})();
