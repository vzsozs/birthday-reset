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
  let soundVolumes = {};
  let spawnTimer = 0;
  let spawnConfig = null;
  let elapsed = 0;
  let dodgeDuration = 0;
  let onDodgeComplete = null;
  let spiralAngle = 0;

  function loadImage(name, src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve(); // ne akadjon el placeholder hianyaban sem
      img.src = src;
      images[name] = img;
    });
  }

  // `volume` (opcionalis, alapertelmezett 0.6): a legtobb hangeffekt jo
  // ezen az alapertelmezett szinten, de nehany (pl. egy rovid, halkabbnak
  // erzekelt effekt) egyedileg felulirhatja -- ld. js/main.js "chainExtend"
  // hivasat (1.0, a natív <audio> maximuma).
  function loadSound(name, src, volume) {
    const audio = new Audio(src);
    audio.preload = "auto";
    sounds[name] = audio;
    soundVolumes[name] = volume != null ? volume : 0.6;
  }

  function playSound(name) {
    const s = sounds[name];
    if (!s) return;
    try {
      const clone = s.cloneNode(true);
      clone.volume = soundVolumes[name] != null ? soundVolumes[name] : 0.6;
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
    // "spiral" mintazatnal a doboz also harmadaban indul a szeretet-szikra,
    // nem a kozepen -- a spiral pontosan a kozepbol lo ki, igy kozepen
    // indulva a jatekos rogton az emitter mellett allna.
    soul.y = spawnConfig && spawnConfig.pattern === "spiral" ? box.y + (box.h * 5) / 6 : box.y + box.h / 2;
    soul.invuln = 0;
  }

  // spawnConfig: { rate: ms kozotti spawn, speed: px/s, size: [min,max],
  // pattern?: "rain" (alapertelmezett, egyenesen lefele hullo lovedekek) |
  // "bounce" (a doboz falairol visszaverodo lovedekek, lassan kifulladva a
  // `life` ms utan) | "spiral" (a doboz kozepebol korbeforgo karokban
  // kilott lovedekek, `spiralStep`/`arms` finomhangolhato), tearImage?:
  // az `images`-ben betoltott lovedek-textura neve (alapertelmezett "tear")
  // -- pl. "tearRed" a versrol vorosre valtott konnyekhez. }
  function startDodgePhase(duration, config, completeCallback) {
    bullets = [];
    spawnTimer = 0;
    elapsed = 0;
    spiralAngle = 0;
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
    const pattern = spawnConfig.pattern || "rain";
    const speed = spawnConfig.speed || 90;

    if (pattern === "bounce") {
      // Isaac-stilusu "gumi-konny": lefele indul kis oldalirany-szorassal,
      // majd a doboz falairol visszaverodik ahelyett, hogy egyszer atesne
      // rajta -- update()-ben kezelve. `life` ms utan eltunik.
      const spread = (Math.random() - 0.5) * 1.4; // kb. +-40 fok az egyenes-le iranytol
      bullets.push({
        x: box.x + Math.random() * box.w,
        y: box.y - 10,
        vx: Math.sin(spread) * speed,
        vy: Math.cos(spread) * speed,
        r: size,
        bounce: true,
        life: spawnConfig.life || 2600,
      });
    } else if (pattern === "spiral") {
      // A doboz kozepebol korbeforgo lovedek-karok -- a jatekosnak korbe
      // kell mozognia a szivvel a tulelshez. A visszapattanas (bounce) a
      // spawnConfig.bounce mezotol fugg (alapertelmezetten NEM pattan
      // vissza, hanem egyszeruen tovabbmegy a falon at es a margin-alapu
      // kilepesi logikaval tunik el, ld. update()) -- a 2. zona (Cirkusz)
      // kerte kifejezetten a visszapattanast (`dodge.bounce: true`, ugyanaz
      // a `life`-alapu eltunes, mint a "bounce" mintazatnal), az 1. zona
      // viszont NEM (a felhasznalo kerese szerint ott a lovedekek csak
      // tovabbmennek a falon at).
      spiralAngle += spawnConfig.spiralStep || 0.5;
      const armCount = spawnConfig.arms || 1;
      for (let a = 0; a < armCount; a++) {
        const angle = spiralAngle + (a * (Math.PI * 2)) / armCount;
        bullets.push({
          x: box.x + box.w / 2,
          y: box.y + box.h / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: size,
          bounce: !!spawnConfig.bounce,
          life: spawnConfig.life || 2600,
        });
      }
    } else {
      bullets.push({
        x: box.x + Math.random() * box.w,
        y: box.y - 10,
        vx: 0,
        vy: speed,
        r: size,
      });
    }
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
      b.x += (b.vx || 0) * dt;
      b.y += b.vy * dt;

      if (b.bounce) {
        b.life -= dt * 1000;
        if (b.x - b.r < box.x) {
          b.x = box.x + b.r;
          b.vx = Math.abs(b.vx);
        } else if (b.x + b.r > box.x + box.w) {
          b.x = box.x + box.w - b.r;
          b.vx = -Math.abs(b.vx);
        }
        if (b.y - b.r < box.y) {
          b.y = box.y + b.r;
          b.vy = Math.abs(b.vy);
        } else if (b.y + b.r > box.y + box.h) {
          b.y = box.y + box.h - b.r;
          b.vy = -Math.abs(b.vy);
        }
        if (b.life <= 0) {
          bullets.splice(i, 1);
          continue;
        }
      } else {
        const margin = 20;
        if (
          b.x < box.x - margin ||
          b.x > box.x + box.w + margin ||
          b.y < box.y - margin ||
          b.y > box.y + box.h + margin
        ) {
          bullets.splice(i, 1);
          continue;
        }
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

    // lovedekek. spawnConfig.tearImages (opcionalis): { small, normal, large }
    // -- ha meg van adva, lovedekenkent a sajat sugara (b.r) es a config
    // size-tartomanya alapjan valasztja ki, melyik betoltott kepet hasznalja
    // (also/kozepso/felso harmad), igy tobb meretu lovedek-textura is
    // lehetseges egy dodge-fazison belul. Ha nincs `tearImages`, a regi,
    // egyetlen `tearImage`-es viselkedes marad (alapertelmezett "tear").
    const defaultTearImg = images[(spawnConfig && spawnConfig.tearImage) || "tear"];
    function tearImageFor(b) {
      if (spawnConfig && spawnConfig.tearImages) {
        const range = spawnConfig.size || [b.r, b.r];
        const span = range[1] - range[0] || 1;
        const t = (b.r - range[0]) / span;
        const key = t < 1 / 3 ? "small" : t < 2 / 3 ? "normal" : "large";
        const img = images[spawnConfig.tearImages[key]];
        if (img) return img;
      }
      return defaultTearImg;
    }
    for (const b of bullets) {
      const tearImg = tearImageFor(b);
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
