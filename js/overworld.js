/*
 * overworld.js
 * Egysenes, DOM-alapu szabad-mozgas motor a szobahoz ES a folyosohoz is --
 * felvaltja a korabbi kulon room.js/corridor.js parost, mert azok mozgas-
 * logikaja majdnem szo szerint duplikalt volt.
 *
 * Egy "jelenet" (scene) konfiguraciot kap: hatterkep, jarhato hatarok,
 * spawn-pont, es egy hotspot-lista. A vilag szelesseget mindig a hatterkep
 * tenyleges (lerenderelt) szelessege adja -- ha a hatter pontosan a stage-et
 * tolti ki (mint a szoba), nincs kamera-eltolas; ha szelesebb (mint a
 * folyoso), a kamera koveti a jatekost.
 *
 * scene.bgSrc lehet egyetlen kep-utvonal VAGY ilyen utvonalak tombje -- ha
 * tomb, a kepek egymas mella illesztve alkotjak a vilagot (mindegyik a
 * stage magassagara skalazva, sajat oldalaranyat megtartva), ld.
 * loadBackground(). Ezt hasznalja a folyoso, zonankent kulon fajlban (lasd
 * CLAUDE.md) -- igy egy-egy zona hatterenek kesobbi lecserelese nem
 * erinti a tobbi zona kepet.
 *
 * walkBounds: egyetlen { xMin, xMax, yMin, yMax } (aranyok 0..1) VAGY ilyen
 * objektumok tombje, ha a jarhato terulet nem egy egyszeru teglalap (pl.
 * L-alaku szoba) -- lasd isInsideWalkBounds().
 *
 * Hotspot = { id, xFrac, yFrac, radius, prompt, sprite:{src,w,h}?, onInteract }
 *   - xFrac: a vilag-szelesseg aranyaban (0..1)
 *   - yFrac: a stage-magassag aranyaban (0..1)
 *   - radius: px, ekkora tavolsagon belul aktivalodik a prompt
 *   - sprite: ha van, egy kepet is megjelenit a hotspot helyen (NPC-k,
 *     zona-ellenfelek) -- ha nincs, a hotspot lathatatlan terulet (pl. gep)
 *   - onInteract(): Enter/kattintasra fut le. A hivo felelossege, hogy
 *     Overworld.pause()/resume()-t hasznaljon, ha a mozgast fel kell
 *     fuggeszteni a interakcio idejere.
 *
 * Decoration = { xFrac, yFrac, w, h?, frames:[...] | src, frameMs? }
 *   - tisztan vizualis, nem interaktiv elem (pl. macska az ablakparkanyon).
 *     xFrac/yFrac/w/h ugyanugy mukodik, mint a hotspot sprite-jainal. Ha
 *     `frames` tobb kepet tartalmaz, korkoros animaciokent valtakoznak
 *     `frameMs`-enkent (alapertelmezett 220ms); egyetlen kephez eleg az
 *     `src` mezo.
 *
 * Nem nyul a battle.js/engine.js-hez.
 */
const Overworld = (() => {
  let dom = {};
  let active = false;
  let paused = false;
  let keys = {};
  let pos = { x: 0, y: 0 };
  let stageW = 0;
  let stageH = 0;
  let worldW = 0;
  let lastTime = 0;
  let scene = null;
  let npcEls = [];
  let decorEls = [];
  let decorTimers = [];
  let bgSegmentEls = [];
  let activeHotspot = null;

  const SPEED = 140;
  const PLAYER_W = 58;
  const PLAYER_H = 100;

  // Irany-fuggo jatekos-sprite-ok, 2 fazisu lepes-animacioval -- [0] az allo
  // (nyugalmi) kocka, [1] a lepes-kocka. Allva mindig [0] latszik, mozgas
  // kozben a ketto valtakozik WALK_FRAME_MS-enkent. A jatekos mindig az
  // utoljara nyomott mozgas-iranyt mutatja (allva is megtartja, amig masik
  // iranyba nem indul). Atloson mozgasnal a vizszintes irany elvez.
  const DIRECTION_SPRITES = {
    down: ["assets/sprites/Bazsa_placeholder_down.png", "assets/sprites/Bazsa_placeholder_down_1.png"],
    up: ["assets/sprites/Bazsa_placeholder_top.png", "assets/sprites/Bazsa_placeholder_top_1.png"],
    left: ["assets/sprites/Bazsa_placeholder_left.png", "assets/sprites/Bazsa_placeholder_left_1.png"],
    right: ["assets/sprites/Bazsa_placeholder_right.png", "assets/sprites/Bazsa_placeholder_right_1.png"],
  };
  const WALK_FRAME_MS = 160;
  let facing = "down";
  let walkFrame = 0;
  let walkTimer = 0;
  let playerImg = null;
  let currentPlayerSrc = "";

  function setPlayerSprite(src) {
    if (currentPlayerSrc === src) return;
    currentPlayerSrc = src;
    playerImg.src = src;
  }

  function init(elements) {
    dom = elements; // { stage, world, bg, player, prompt, npcLayer }
    playerImg = dom.player.querySelector("img");
    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("keyup", handleKeyup);
    dom.prompt.addEventListener("click", tryInteract);
    dom.cornerPopup.addEventListener("click", advanceCornerPopup);
  }

  function handleKeydown(e) {
    if (!dom.cornerPopup.classList.contains("hidden") && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      advanceCornerPopup();
      return;
    }
    if (!active || paused) return;
    const k = e.key.toLowerCase();
    const moveKeys = ["arrowleft", "arrowright", "arrowup", "arrowdown", "w", "a", "s", "d"];
    if (moveKeys.includes(k)) {
      keys[k] = true;
      e.preventDefault();
    } else if (k === "enter" || k === " ") {
      e.preventDefault();
      tryInteract();
    }
  }

  function handleKeyup(e) {
    keys[e.key.toLowerCase()] = false;
  }

  function tryInteract() {
    if (!active || paused || !activeHotspot) return;
    const hotspot = activeHotspot;
    // Egy tick-kel kesleltetve hivjuk meg -- ha az onInteract egy modalis
    // dobozt (pl. a szamitogep valaszto-doboza) nyit meg, ami maga is
    // figyeli ugyanazt az Enter/szokoz billentyut, akkor ne ugyanaz a
    // lenyomas dolgozza fel azt is (kulonben ugyanaz az Enter azonnal meg
    // is nyomna a doboz alapertelmezett gombjat).
    setTimeout(() => hotspot.onInteract(), 0);
  }

  function pause() {
    paused = true;
    keys = {};
    dom.prompt.classList.add("hidden");
  }

  function resume() {
    paused = false;
  }

  function spawnHotspotSprites() {
    npcEls.forEach((el) => el.remove());
    npcEls = [];
    scene.hotspots.forEach((h) => {
      if (!h.sprite) return;
      const img = document.createElement("img");
      img.src = h.sprite.src;
      img.className = "overworld-npc";
      img.style.width = h.sprite.w + "px";
      img.style.height = (h.sprite.h || h.sprite.w) + "px";
      img.style.left = h.xFrac * worldW - h.sprite.w / 2 + "px";
      img.style.top = h.yFrac * stageH - (h.sprite.h || h.sprite.w) + "px";
      dom.npcLayer.appendChild(img);
      npcEls.push(img);
    });
  }

  function spawnDecorations() {
    decorEls.forEach((el) => el.remove());
    decorEls = [];
    decorTimers.forEach((t) => clearInterval(t));
    decorTimers = [];
    (scene.decorations || []).forEach((d) => {
      const frames = d.frames || [d.src];
      const w = d.w;
      const h = d.h || d.w;
      const img = document.createElement("img");
      img.className = "overworld-decor";
      img.style.width = w + "px";
      img.style.height = h + "px";
      img.style.left = d.xFrac * worldW - w / 2 + "px";
      img.style.top = d.yFrac * stageH - h + "px";
      img.src = frames[0];
      dom.npcLayer.appendChild(img);
      decorEls.push(img);
      if (frames.length > 1) {
        let idx = 0;
        const timer = setInterval(() => {
          idx = (idx + 1) % frames.length;
          img.src = frames[idx];
        }, d.frameMs || 220);
        decorTimers.push(timer);
      }
    });
  }

  // scene.bgSrc egyetlen kep-utvonalat vagy (a folyosonal) tobb, egymas
  // mella illesztendo utvonalat tartalmazhat -- lasd a fajl elejen levo
  // megjegyzest. `callback(worldWidthPx)` fut le, amikor a hatter(ek)
  // betoltodtek es a vilag-szelesseg ismertte valt.
  function loadBackground(callback) {
    bgSegmentEls.forEach((el) => el.remove());
    bgSegmentEls = [];
    const srcs = Array.isArray(scene.bgSrc) ? scene.bgSrc : [scene.bgSrc];

    if (srcs.length === 1) {
      dom.bg.classList.remove("hidden");
      dom.bg.src = srcs[0];
      const done = () => callback(dom.bg.clientWidth || stageW);
      if (dom.bg.complete) done();
      else dom.bg.onload = done;
      return;
    }

    dom.bg.classList.add("hidden");
    dom.bg.removeAttribute("src");
    let loaded = 0;
    const probes = srcs.map((src) => {
      const probe = new Image();
      probe.src = src;
      return probe;
    });
    probes.forEach((probe) => {
      probe.onload = () => {
        loaded++;
        if (loaded === probes.length) placeBgSegments(probes, callback);
      };
    });
  }

  function placeBgSegments(probes, callback) {
    let offset = 0;
    probes.forEach((probe) => {
      const w = probe.naturalWidth * (stageH / probe.naturalHeight);
      const el = document.createElement("img");
      el.className = "overworld-bg-segment";
      el.src = probe.src;
      el.style.left = offset + "px";
      el.style.width = w + "px";
      dom.world.insertBefore(el, dom.npcLayer);
      bgSegmentEls.push(el);
      offset += w;
    });
    callback(offset);
  }

  function start(sceneConfig) {
    active = false; // barmilyen korabbi, meg futo loop() a kovetkezo keretben leall
    scene = sceneConfig;
    keys = {};
    paused = false;
    activeHotspot = null;
    facing = "down";
    walkFrame = 0;
    walkTimer = 0;
    setPlayerSprite(DIRECTION_SPRITES.down[0]);
    dom.prompt.classList.add("hidden");

    stageW = dom.stage.clientWidth;
    stageH = dom.stage.clientHeight;

    loadBackground((w) => {
      worldW = w || stageW;

      spawnHotspotSprites();
      spawnDecorations();

      const spawn = typeof scene.spawn === "function" ? scene.spawn() : scene.spawn;
      pos.x = worldW * spawn.xFrac;
      pos.y = stageH * spawn.yFrac;

      updatePositions();
      active = true;
      lastTime = performance.now();
      requestAnimationFrame(loop);
    });
  }

  // scene.walkBounds lehet egyetlen { xMin, xMax, yMin, yMax } vagy ilyen
  // teglalapok tombje -- utobbival L-alaku (vagy barmilyen, teglalapokbol
  // osszerakhato) jarhato terulet is kirajzolhato, ha egy szimpla teglalap
  // nem eleg (ld. CLAUDE.md).
  function isInsideWalkBounds(x, y) {
    const rects = Array.isArray(scene.walkBounds) ? scene.walkBounds : [scene.walkBounds];
    return rects.some(
      (wb) => x >= worldW * wb.xMin && x <= worldW * wb.xMax && y >= stageH * wb.yMin && y <= stageH * wb.yMax
    );
  }

  function loop(t) {
    if (!active) return;
    const dt = Math.min(0.05, (t - lastTime) / 1000);
    lastTime = t;
    if (!paused) update(dt);
    requestAnimationFrame(loop);
  }

  function update(dt) {
    let dx = 0,
      dy = 0;
    if (keys["arrowleft"] || keys["a"]) dx -= 1;
    if (keys["arrowright"] || keys["d"]) dx += 1;
    if (keys["arrowup"] || keys["w"]) dy -= 1;
    if (keys["arrowdown"] || keys["s"]) dy += 1;

    const newFacing = dx < 0 ? "left" : dx > 0 ? "right" : dy < 0 ? "up" : dy > 0 ? "down" : null;
    if (newFacing && newFacing !== facing) {
      facing = newFacing;
    }

    const moving = dx !== 0 || dy !== 0;
    if (moving) {
      walkTimer += dt * 1000;
      if (walkTimer >= WALK_FRAME_MS) {
        walkTimer -= WALK_FRAME_MS;
        walkFrame = walkFrame === 0 ? 1 : 0;
      }
    } else {
      walkFrame = 0;
      walkTimer = 0;
    }
    setPlayerSprite(DIRECTION_SPRITES[facing][walkFrame]);

    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    // Kulon-kulon probaljuk az x es y tengelyt: ha az uj pozicio barmelyik
    // walkBounds-teglalapba beleesik, engedjuk azt a tengelyt mozogni, ha
    // egybe sem, az a tengely a jelenlegi ertekén marad -- igy L-alaku (vagy
    // tobb teglalapbol allo) jarhato terulet szelen szepen "vegigcsuszik" a
    // jatekos, nem akad meg teljesen egy sarokban.
    const newX = pos.x + dx * SPEED * dt;
    const newY = pos.y + dy * SPEED * dt;
    if (isInsideWalkBounds(newX, pos.y)) pos.x = newX;
    if (isInsideWalkBounds(pos.x, newY)) pos.y = newY;

    updatePositions();
    checkHotspots();
  }

  function updatePositions() {
    dom.player.style.transform = `translate(${pos.x - PLAYER_W / 2}px, ${pos.y - PLAYER_H}px)`;

    const cameraX = Math.max(0, Math.min(worldW - stageW, pos.x - stageW / 2));
    dom.world.style.transform = `translateX(${-cameraX}px)`;

    const promptX = pos.x - cameraX;
    dom.prompt.style.transform = `translate(calc(${promptX}px - 50%), calc(${pos.y - PLAYER_H - 14}px - 100%))`;
  }

  function checkHotspots() {
    let nearest = null;
    let nearestDist = Infinity;
    for (const h of scene.hotspots) {
      const hx = h.xFrac * worldW;
      const hy = h.yFrac * stageH;
      const dist = Math.hypot(pos.x - hx, pos.y - hy);
      if (dist <= h.radius && dist < nearestDist) {
        nearest = h;
        nearestDist = dist;
      }
    }
    if (nearest !== activeHotspot) {
      activeHotspot = nearest;
      if (activeHotspot) {
        dom.prompt.textContent = activeHotspot.prompt || "▶ Enter";
        dom.prompt.classList.remove("hidden");
      } else {
        dom.prompt.classList.add("hidden");
      }
    }
  }

  let cornerDismiss = null;
  let cornerTyping = false;
  let cornerSkipRequested = false;
  let cornerReadyToClose = false;
  let cornerTypeTimer = null;

  // Gepelos szoveg a sarok-buborekban -- Space/Enter/kattintas eloszor
  // kiirja a teljes szoveget (ha meg gepel), majd (ujabb Space/Enter/
  // kattintasra) bezarja a buborekot. Nincs automatikus, idozitett bezaras.
  function typeCornerText(text, playTypeSound) {
    dom.cornerText.textContent = "";
    cornerTyping = true;
    cornerSkipRequested = false;
    cornerReadyToClose = false;
    let i = 0;
    const speed = 24;
    function step() {
      if (cornerSkipRequested) {
        dom.cornerText.textContent = text;
        cornerTyping = false;
        cornerReadyToClose = true;
        return;
      }
      if (i < text.length) {
        dom.cornerText.textContent += text[i];
        if (playTypeSound && text[i] !== " ") Engine.playSound("type");
        i++;
        cornerTypeTimer = setTimeout(step, speed);
      } else {
        cornerTyping = false;
        cornerReadyToClose = true;
      }
    }
    step();
  }

  function showCornerPopup(portraitSrc, text, onDone, variant) {
    if (cornerTypeTimer) clearTimeout(cornerTypeTimer);
    if (portraitSrc) {
      dom.cornerPortrait.src = portraitSrc;
      dom.cornerPortrait.classList.remove("hidden");
    } else {
      dom.cornerPortrait.classList.add("hidden");
    }
    dom.cornerPopup.classList.toggle("corner-popup-room", variant === "room");
    dom.cornerPopup.classList.remove("hidden");
    cornerDismiss = onDone;
    // A gepeles-hang egyelore csak a "room" variansnal (Tenna/Queen szoba-
    // beszolasai) szol, a folyoso-NPC-k es a polc/teve-beszolasok csendben
    // gepelodnek -- ld. a hivast a main.js-ben.
    typeCornerText(text, variant === "room");
  }

  function advanceCornerPopup() {
    if (dom.cornerPopup.classList.contains("hidden")) return;
    if (cornerTyping) {
      cornerSkipRequested = true;
      return;
    }
    if (!cornerReadyToClose) return;
    dismissCornerPopup();
  }

  function dismissCornerPopup() {
    if (!cornerDismiss) return;
    if (cornerTypeTimer) clearTimeout(cornerTypeTimer);
    dom.cornerPopup.classList.add("hidden");
    const cb = cornerDismiss;
    cornerDismiss = null;
    // Egy tick-kel kesleltetve hivjuk meg -- ha a callback egy masik, szinten
    // Enter/szokozt figyelo dobozt nyit meg ujra (pl. a valaszto-dobozt),
    // ne ugyanaz a billentyu-lenyomas dolgozza fel azt is (ugyanaz a hiba,
    // mint a tryInteract()-nel -- ld. az ottani megjegyzest).
    setTimeout(cb, 0);
  }

  return { init, start, pause, resume, showCornerPopup, dismissCornerPopup };
})();
