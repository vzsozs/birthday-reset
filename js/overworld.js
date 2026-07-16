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
 * scene.playerScale (opcionalis, alapertelmezett 1): a jatekos-sprite
 * alapmeretenek (58x100, ld. PLAYER_W/PLAYER_H) szorzoja -- pl. a folyoson
 * kicsit 1-nel kisebb ertekkel kisebbnek/tavolabbinak hat a szereplo, mint a
 * szobaban. Ld. start().
 *
 * Hotspot = { id, xFrac, yFrac, radius, prompt, sprite:{src,w,h,xFrac?,yFrac?,noFloat?,matchPlayerSize?}?, auto?, onInteract }
 *   - xFrac: a vilag-szelesseg aranyaban (0..1) -- az INTERAKCIOS terulet
 *     (radius, prompt-felugras, `auto` aktivalas) kozeppontja.
 *   - yFrac: a stage-magassag aranyaban (0..1) -- ua., mint xFrac.
 *   - radius: px, ekkora tavolsagon belul aktivalodik a prompt
 *   - sprite: ha van, egy kepet is megjelenit a hotspot helyen (NPC-k,
 *     zona-ellenfelek) -- ha nincs, a hotspot lathatatlan terulet (pl. gep).
 *     `w`/`h` a megjelenitett kep merete pixelben (h hianyaban w-vel
 *     negyzetes); `noFloat: true` kikapcsolja az alapertelmezett lebego
 *     (`npcFloat`) animaciot; `matchPlayerSize: true` eseten a `w`/`h`
 *     figyelmen kivul marad, es a sprite pontosan akkora lesz, mint az
 *     aktualis (playerScale-lel mar szorzott) jatekos-sprite. `sprite.xFrac`/
 *     `sprite.yFrac`: ha meg vannak adva, KULON allithato velük a KARAKTER
 *     RAJZOLT POZICIOJA a hotspot sajat xFrac/yFrac-atol fuggetlenul (pl.
 *     hogy a interakcios terulet az ajto kozeleben maradjon, de a szereplo
 *     kicsit odebb alljon) -- hianyukban a sprite a hotspot xFrac/yFrac-an
 *     jelenik meg (korabbi viselkedes).
 *   - auto: ha true, nincs felirat/Enter -- a hotspot legkozelebb-eses
 *     pillanataban (mihelyt a jatekos a radius-on belulre er ES ez a
 *     legkozelebbi hotspot) magatol lefut az onInteract(), egyszer, ld.
 *     checkHotspots(). Ilyenkor a `prompt` mezo figyelmen kivul marad.
 *   - onInteract(): Enter/kattintasra (vagy `auto` eseten automatikusan)
 *     fut le. A hivo felelossege, hogy Overworld.pause()/resume()-t
 *     hasznaljon, ha a mozgast fel kell fuggeszteni a interakcio idejere.
 *
 * Decoration = { xFrac, yFrac, w, h?, frames:[...] | src, frameMs? }
 *   - tisztan vizualis, nem interaktiv elem (pl. macska az ablakparkanyon).
 *     xFrac/yFrac/w/h ugyanugy mukodik, mint a hotspot sprite-jainal. Ha
 *     `frames` tobb kepet tartalmaz, korkoros animaciokent valtakoznak
 *     `frameMs`-enkent (alapertelmezett 220ms); egyetlen kephez eleg az
 *     `src` mezo.
 *
 * scene.follower = { spawn:{xFrac,yFrac}|fn, w, h?, sitFrames:[...], runFrames:[...], jumpFrames:[...] }
 *   - opcionalis, egyetlen "kovető" NPC (pl. Feki, a macska a folyoson --
 *     a szobaban Feki egyszerű `decorations`-bejegyzes, statikusan ul az
 *     ablakban, nincs kovető viselkedese ott), ami a
 *     jatekost koveti, de nem tapad ra: ket KULON hatarral (hiszterezis,
 *     FOLLOWER_CHASE_TRIGGER_DISTANCE / FOLLOWER_KEEP_DISTANCE, ld.
 *     updateFollower() elejen levo megjegyzest) hagyja magat erdemben
 *     lemaradni, mielott (veletlenszeru FOLLOWER_WAKE_MIN_MS..MAX_MS
 *     reakcio-keses utan) elindul utolerni (runFrames-szel animalva, a
 *     jatekosnal erezhetoen gyorsabb FOLLOWER_SPEED-del) -- igy latvanyos,
 *     latszik-hogy-fut utoleres, nem allando lepestartas/"ratapadas". Utolerve
 *     megall egy kis "szemelyes teret" tartva (FOLLOWER_KEEP_DISTANCE), es
 *     csak akkor ul le (sitFrames-szel, ciklikusan), ha a jatekos mar regota
 *     (FOLLOWER_SIT_IDLE_MS) all.
 *     Kovetes kozben ritkan (veletlenszeruen) beugrik egy rovid jumpFrames-
 *     animaciot valtozatossagert. A jatekoshoz hasonloan tiszteletben
 *     tartja a scene.walkBounds-t (isInsideWalkBounds()) -- ha emiatt
 *     erdemi elmozdulas nelkul "futna a helyben" (FOLLOWER_STUCK_MS-nel
 *     tovabb), inkabb leul, nem ragad be a futas-animacioban. Ld.
 *     spawnFollower()/updateFollower(). Csak egyszerre egy follower tamogatott jelenetenkent;
 *     ha a scene-nek nincs `follower` mezoje, nincs kovető (pl. a folyoso).
 *
 * Overworld.addSprite(id, {src, xFrac, yFrac, w, h?, noFloat?, offsetY?}) /
 * Overworld.updateSprite(id, src, sizeOpts?) / Overworld.removeSprite(id) --
 * altalanos, DINAMIKUS (a scene-config-tol fuggetlen, JELENET KOZBEN
 * barmikor hivhato) sprite-kezeles egy egyszeru id-kulcsu terkeppel. Erre
 * akkor van szukseg, ha egy NPC/szereplo nem a jelenet BETOLTESEKOR mar ott
 * all (mint a hotspot.sprite/decorations), hanem egy esemeny/dialogus
 * kozepén "bukkan fel" -- pl. Apa dramai belepoje a zaro (Minecraft-temaju)
 * zona folyoso-jelenetében. Ugyanazt a `.overworld-npc` CSS-osztalyt
 * hasznalja (lebego `npcFloat`-animacio, `object-fit:contain`), mint a
 * hotspot-sprite-ok, hacsak `noFloat` nincs true-ra allitva. `updateSprite()`
 * alapbol csak a kepet cserelji (poziciot/meretet nem), de egy opcionalis
 * harmadik `sizeOpts:{w,h?}` parameterrel a doboz MERETE is ujraallithato
 * hivasonkent -- ilyenkor a doboz also-kozeppontja (a `xFrac`/`yFrac`, amit
 * `addSprite()`-nal adtal meg) VALTOZATLAN marad, csak a szelesseg/magassag
 * no vagy csokken korule (also szel rogzitve, vizszintesen kozeppontositva)
 * -- ezt hasznalja pl. a zaro zona, hogy az APA->APA2 atmenet-animacio
 * lathatoan NAGYOBB legyen, mint az allo Apa/Apa2 kep, majd az atmenet
 * vegen visszaalljon az eredeti meretre (ld. CLAUDE.md "A záró (Minecraft)
 * zóna"). Az opcionalis `offsetY` (addSprite()-nal VAGY sizeOpts-ban) tovabbi
 * fuggoleges px-eltolast ad az also-kozepponthoz (pozitiv = lejebb) -- ezt
 * hasznalja pl. a confetti-effektus, hogy lejebb jelenjen meg, mint az allo
 * Apa2-kep, anelkul hogy a kozos xFrac/yFrac-horgonyt megváltoztatná.
 * `removeSprite()` eltunteti. Mindegyik NO-OP-kent viselkedik, ha a
 * jelenet kozben scene-valtas (start()) tortent -- a `dynamicSprites` terkep
 * minden start()-nal kiurul.
 *
 * Nem nyul a battle.js/engine.js-hez.
 */
// Fejlesztoi debug-kapcsolok: allitsd true-ra barmelyiket, hogy a
// megfelelo terulet(ek) kirajzolodjanak a jelenetben -- hasznos uj
// hotspot/walkBounds hangolasakor. Csak kodbol kapcsolhatoak, nincs hozzajuk
// kulon UI (szandekosan, ezek fejlesztoi eszkozok, nem jatek-elemek).
const DEBUG_WALKBOUNDS = false; // halvany neonzold keret a jarhato teruletnek
const DEBUG_HOTSPOTS = false; // piros kor a hotspotok aktivalasi sugaranak (radius)

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
  let debugEls = [];
  let debugHotspotEls = [];
  let activeHotspot = null;
  let triggeredAutoIds = new Set();
  // Dinamikusan (jelenet kozben) hozzaadott sprite-ok id -> <img> terkepe --
  // ld. addSprite()/updateSprite()/removeSprite() a fajl elejen levo
  // dokumentacioban.
  let dynamicSprites = {};

  // Kovető NPC (pl. Feki) allapota -- ld. a fajl elejen a "scene.follower"
  // dokumentaciot es a spawnFollower()/updateFollower() fuggvenyeket.
  let follower = null;
  let followerCfg = null;
  let followerPos = { x: 0, y: 0 };
  let followerState = "sit"; // "sit" | "stand" | "follow" | "jump"
  let followerFacing = 1; // 1 = jobbra nez (alapertelmezett sprite-irany), -1 = tukrozve
  let followerAnimFrame = 0;
  let followerAnimTimer = 0;
  let followerCurrentSrc = "";
  let followerWakeTimer = 0; // ms, hany ido mulva "veszi eszre", hogy kovetnie kell
  let followerJumpTimer = 0; // ms, meddig tart meg a folyamatban levo ugras
  let followerNextJumpCheck = 0; // ms, mikor probalkozzunk legkozelebb veletlenszeru ugrassal
  let playerIdleTimer = 0; // ms, mioata a jatekos nem probal mozogni
  let followerStuckTimer = 0; // ms, mioata nem halad erdemben "follow"/"jump" allapotban (ld. lejjebb)

  const FOLLOWER_SPEED = 230; // erezhetoen gyorsabb a jatekosnal (SPEED), hogy az utoleres egy latvanyos, gyors "beeresztos" legyen, ne csak lassan araszoljon utana
  const FOLLOWER_CHASE_TRIGGER_DISTANCE = 140; // px, csak EKKORA lemaradas utan kezd el futni utolerni -- ld. hiszterezis megjegyzest updateFollower()-nel
  const FOLLOWER_KEEP_DISTANCE = 60; // px, addig fut az utoleres, amig ennyire nem er a jatekoshoz -- utana megall/leul, nem tapad ra
  const FOLLOWER_WAKE_MIN_MS = 300;
  const FOLLOWER_WAKE_MAX_MS = 900;
  const FOLLOWER_SIT_IDLE_MS = 3000; // ennyi ideig mozdulatlan jatekos utan ul le a mar utolert kovető
  const FOLLOWER_JUMP_CHECK_MS = 2200; // korulbelul ennyi idonkent probalkozik veletlenszeru ugrassal kovetes kozben
  const FOLLOWER_JUMP_PROBABILITY = 0.2;
  const FOLLOWER_JUMP_DURATION_MS = 480;
  const FOLLOWER_ANIM_FRAME_MS = 120; // futas/ugras kocka-sebesseg
  const FOLLOWER_SIT_FRAME_MS = 260; // ulo idle kocka-sebesseg (a regi dekoracios animacio utemezese)
  // Ha "follow"/"jump" allapotban a kovető egy adott ideig (STUCK_MS)
  // a szandekolt lepesenek kevesebb mint felet tudja csak megtenni --
  // pl. mert a walkBounds nem engedi at a jatekos aktualis helyere --,
  // akkor ne fusson a helyben vegtelenul: inkabb uljon le. Ld. updateFollower().
  const FOLLOWER_STUCK_MS = 450;

  const SPEED = 140;
  // Alap jatekos-meret (a szoba butoraihoz hangolva, ld. CLAUDE.md). Egy
  // scene-config opcionalis `playerScale`-jevel (pl. a folyoson, hogy a
  // tavlati-erzet miatt kicsit kisebbnek hasson) felul-szorozhato -- ld.
  // start() es a lejjebbi playerW/playerH allapotot, amit updatePositions()
  // hasznal a fix PLAYER_W/PLAYER_H helyett.
  const PLAYER_W = 58;
  const PLAYER_H = 100;
  let playerW = PLAYER_W;
  let playerH = PLAYER_H;

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
      // matchPlayerSize: a jelenlegi (mar playerScale-lel szorzott)
      // jatekos-meretet hasznalja w/h helyett -- ld. Hotspot dokumentacio.
      const w = h.sprite.matchPlayerSize ? playerW : h.sprite.w;
      const spriteH = h.sprite.matchPlayerSize ? playerH : h.sprite.h || h.sprite.w;
      // sprite.xFrac/yFrac: ha meg vannak adva, a KARAKTER RAJZOLT
      // POZICIOJAT ezek hatarozzak meg, a hotspot sajat xFrac/yFrac-a
      // (fent) pedig csak az interakcios/aktivalasi terulet (radius,
      // prompt) kozeppontja marad -- igy a ketto fuggetlenul allithato.
      // Ha nincsenek megadva, a sprite ugyanott jelenik meg, mint a
      // hotspot (a korabbi viselkedes).
      const spriteXFrac = h.sprite.xFrac != null ? h.sprite.xFrac : h.xFrac;
      const spriteYFrac = h.sprite.yFrac != null ? h.sprite.yFrac : h.yFrac;
      img.style.width = w + "px";
      img.style.height = spriteH + "px";
      img.style.left = spriteXFrac * worldW - w / 2 + "px";
      img.style.top = spriteYFrac * stageH - spriteH + "px";
      // noFloat: kikapcsolja az alapertelmezett lebego (npcFloat) animaciot
      // -- ld. Hotspot dokumentacio.
      if (h.sprite.noFloat) img.style.animation = "none";
      dom.npcLayer.appendChild(img);
      npcEls.push(img);
    });
  }

  // Kozos pozicionalo: also-kozeppontot (xFrac/yFrac) rogzitve allitja be a
  // doboz meretet/helyet -- w/h valtoztatasakor a doboz ALJA es VIZSZINTES
  // KOZEPE marad helyben, csak felfele/oldalra no vagy zsugorodik. Ld.
  // updateSprite() sizeOpts hasznalatat.
  function positionSprite(img, xFrac, yFrac, w, h, offsetY) {
    img.style.width = w + "px";
    img.style.height = h + "px";
    img.style.left = xFrac * worldW - w / 2 + "px";
    img.style.top = yFrac * stageH - h + (offsetY || 0) + "px";
  }

  // Ld. a fajl elejen levo dokumentaciot. `opts.w` kotelezo, `opts.h`
  // hianyaban negyzetes (mint a hotspot-sprite-oknal/dekoracioknal). Az
  // xFrac/yFrac-ot (es az opcionalis offsetY-t) elmentjuk az elemen
  // (dataset), hogy updateSprite() kesobb, meretvaltaskor is ugyanahhoz az
  // also-kozepponthoz tudjon igazitani.
  function addSprite(id, opts) {
    removeSprite(id);
    const w = opts.w;
    const h = opts.h || opts.w;
    const img = document.createElement("img");
    img.className = "overworld-npc";
    img.dataset.xFrac = opts.xFrac;
    img.dataset.yFrac = opts.yFrac;
    img.dataset.offsetY = opts.offsetY || 0;
    positionSprite(img, opts.xFrac, opts.yFrac, w, h, opts.offsetY);
    img.src = opts.src;
    if (opts.noFloat) img.style.animation = "none";
    dom.npcLayer.appendChild(img);
    dynamicSprites[id] = img;
    return img;
  }

  // sizeOpts (opcionalis): {w, h?, offsetY?} -- ha `w` meg van adva, a doboz
  // meretet is ujraallitja (ld. positionSprite()), az addSprite()-nal
  // elmentett xFrac/yFrac also-kozeppont korul. `offsetY` (ha meg van adva)
  // felulirja/elmenti a tovabbi fuggoleges px-eltolast a kesobbi hivasokra is
  // (ld. a confetti-effektust, ami a normal Apa2-kepnel lejebb jelenik meg).
  // sizeOpts nelkul csak a kep cserelodik, a meret/pozicio valtozatlan marad
  // (korabbi viselkedes).
  //
  // FONTOS: ha EGYSZERRE valtozik a `src` ES a meret (sizeOpts.w), a
  // meret-valtast megvarjuk, amig az UJ kep ténylegesen dekodolodik
  // (img.decode()) -- kulonben a bongeszo meg a REGI kepet rajzolja ki, csak
  // mar az UJ (pl. 3x nagyobb) dobozmeretben, ami egy pillanatra
  // felnagyitott regi-kep-villanaskent latszik (ezt a felhasznalo eszrevette
  // a zaro zona confetti-atmeneteneл). Ha csak a `src` valtozik (nincs
  // `sizeOpts.w`), nincs ilyen kockazat, a valtas azonnal tortenik.
  function updateSprite(id, src, sizeOpts) {
    const img = dynamicSprites[id];
    if (!img) return;
    if (sizeOpts && sizeOpts.offsetY != null) img.dataset.offsetY = sizeOpts.offsetY;
    function applySize() {
      if (sizeOpts && sizeOpts.w) {
        const w = sizeOpts.w;
        const h = sizeOpts.h || sizeOpts.w;
        positionSprite(
          img,
          parseFloat(img.dataset.xFrac),
          parseFloat(img.dataset.yFrac),
          w,
          h,
          parseFloat(img.dataset.offsetY) || 0
        );
      }
    }
    if (src && sizeOpts && sizeOpts.w) {
      img.src = src;
      if (img.decode) {
        img.decode().then(applySize).catch(applySize);
      } else {
        img.onload = applySize;
      }
    } else {
      if (src) img.src = src;
      applySize();
    }
  }

  function removeSprite(id) {
    if (dynamicSprites[id]) {
      dynamicSprites[id].remove();
      delete dynamicSprites[id];
    }
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

  function setFollowerSprite(src) {
    if (followerCurrentSrc === src) return;
    followerCurrentSrc = src;
    follower.src = src;
  }

  // Azonnal eltunteti a kovető NPC-t (ha van) a JELENLEGI jelenetbol, ugy
  // hogy ne varjunk meg egy kovetkezo Overworld.start()-ot -- pl. ha egy
  // esemeny hatasara a kovető vegleg eltunik a jatekbol (ld. CLAUDE.md,
  // Feki-vesztes a 2. zonaban). A `scene.follower` config a HIVO scene-
  // objektumaban is torlendo/felulirando, kulonben a kovetkező
  // Overworld.start()-nal ujra megjelenne.
  function removeFollower() {
    if (follower) {
      follower.remove();
      follower = null;
    }
    followerCfg = null;
  }

  // removeFollower() lathato atmenet nelkuli, azonnali valtozata -- a
  // felhasznalo kerese szerint (Feki-vesztes a 2. zonaban) inkabb
  // ESZREVEHETO legyen: `delayMs` ideig Feki tovabbra is rendesen
  // viselkedik (kovet/ul, ld. updateFollower()) -- ez ido alatt pl. egy
  // ugyanekkor felugro parbeszed-buborek szovege mar olvashato legyen,
  // mielott a jatekos figyelme Fekire terelodik --, majd egy SAJAT
  // `followerGlitch` CSS-animaciot (ld. style.css -- NEM a `worldGlitch`-et,
  // ld. lejjebb miert) jatssza le KOZVETLENUL a kovető sprite-jan
  // (`.follower-glitch-out`), es csak ennek vegen tavolitja el tenylegesen
  // a DOM-bol. A `followerCfg` csak a glitch-animacio KEZDETEKOR nullazodik
  // (nem mar a hivaskor) -- igy updateFollower() a delayMs alatt meg
  // tovabbra is frissiti a pozicio-transformot, es csak a glitch idejere
  // all le.
  //
  // FONTOS: a poziciot NEM a sima inline `style.transform` adja tovabb a
  // CSS-animacio alatt, hanem egy `--glitch-base-transform` CSS-valtozo,
  // amit PONTOSAN a glitch-inditas pillanataban rogzitunk a mar befagyott
  // `style.transform` ertekebol. Ha a keyframes kozvetlenul a `transform`
  // property-t animalna, akkor MINDEN keyframe teljesen FELULIRNA (nem
  // hozzaadna) az inline erteket, es Feki minden kockavaltasnal a doboz
  // also-felso sarkaba (a `top:0;left:0` alapallasba) "ugrana" -- ez a
  // korabbi valtozat hibaja volt (a felhasznalo szerint "1-2px arrebb
  // ugrik, aztan hirtelen eltunik"). A `var(--glitch-base-transform)`
  // keyframe-ekben valo hasznalataval a JS-beli pozicio MINDIG resze marad
  // az animalt transformnak, a keyframe-ek csak egy kis, SZANDEKOS
  // "reszkeles"-t adnak hozza tetejere -- igy a remegesnek latszania kell,
  // nem veletlen pozicio-ugrasnak. Az animacio vegen `opacity:0`-ra is
  // fade-el (nem csak `filter:brightness(0)`-ra, ami a szinatmenetes PNG
  // ALFA-csatornajat nem erinti, csak fekete sziluettet hagyna) -- igy az
  // `el.remove()` mar egy teljesen lathatatlan elemet tavolit el, nem
  // "pukkan el" lathatoan.
  const FOLLOWER_GLITCH_MS = 900;
  function removeFollowerWithEffect(delayMs) {
    if (!follower) {
      followerCfg = null;
      return;
    }
    const el = follower;
    setTimeout(() => {
      if (follower !== el) return; // kozben mar mashogy eltavolitottak/lecserelodott
      followerCfg = null;
      el.style.setProperty("--glitch-base-transform", el.style.transform || "none");
      el.classList.add("follower-glitch-out");
      setTimeout(() => {
        el.remove();
        if (follower === el) follower = null;
      }, FOLLOWER_GLITCH_MS);
    }, delayMs || 0);
  }

  // scene.follower (opcionalis, ld. a fajl elejen a dokumentaciot) -- ha
  // nincs megadva, nincs kovető NPC (pl. a szobaban, ahol Feki statikus
  // dekoraciokent ul az ablakban -- ld. scene.decorations).
  function spawnFollower() {
    if (follower) {
      follower.remove();
      follower = null;
    }
    followerCfg = scene.follower;
    if (!followerCfg) return;

    // followerCfg.spawn lehet egyszeru {xFrac,yFrac} objektum VAGY
    // fuggveny (mint a scene.spawn), pl. hogy a folyoson a jatekos
    // aktualis belepesi pontjahoz kepest szamitodjon ki.
    const followerSpawn = typeof followerCfg.spawn === "function" ? followerCfg.spawn() : followerCfg.spawn;
    followerPos.x = followerSpawn.xFrac * worldW;
    followerPos.y = followerSpawn.yFrac * stageH;
    followerState = "sit";
    followerFacing = 1;
    followerAnimFrame = 0;
    followerAnimTimer = 0;
    followerCurrentSrc = "";
    followerWakeTimer = 0;
    followerJumpTimer = 0;
    followerNextJumpCheck = FOLLOWER_JUMP_CHECK_MS * (0.6 + Math.random() * 0.8);
    followerStuckTimer = 0;
    playerIdleTimer = 0;

    follower = document.createElement("img");
    follower.className = "overworld-follower";
    follower.style.width = followerCfg.w + "px";
    follower.style.height = (followerCfg.h || followerCfg.w) + "px";
    dom.npcLayer.appendChild(follower);
    setFollowerSprite(followerCfg.sitFrames[0]);
    updateFollowerVisualPosition();
  }

  // dt masodpercben, playerMoving = a jatekos ebben a keretben TENYLEGESEN
  // elmozdult-e (pos.x/y valtozott-e, ld. update() -- szandekosan NEM a
  // nyers billentyu-bemenet, mert az fal neki nyomva is "igaz" maradna).
  // Allapotgep: "sit" (regota
  // mozdulatlan jatekos mellett ulve) <-> "stand" (utolerte, de a jatekos
  // meg nem volt eleg regen mozdulatlan) <-> "follow" (a tavolsag
  // FOLLOWER_CHASE_TRIGGER_DISTANCE fole nott, kesleltetve elindul) <->
  // "jump" (kovetes kozbeni, ritka, veletlenszeru valtozatossag).
  //
  // Hiszterezis KET kulon hatarral (FOLLOWER_CHASE_TRIGGER_DISTANCE=140 es
  // FOLLOWER_KEEP_DISTANCE=60), NEM egyetlen kozos hatarral: ha csak egy
  // hatar lenne, a kovető minden egyes kepkockaban azonnal ujraindulna a
  // jatekos mogott, mihelyt az akar 1px-t is lep, es folyamatos jatekos-
  // mozgasnal soha nem esne le erdemben a jatekos mogott -- a ket sebesseg
  // (FOLLOWER_SPEED vs SPEED) kozelsege miatt gyakorlatilag lepestartva,
  // egy allando (szuk) tavolsagon "ragadt" mozogna a jatekossal, ami
  // pontosan ugy nez ki, mintha ratapadna, nem pedig ugy, hogy utolerte
  // volna (ld. felhasznaloi visszajelzes). A ket kulon hatarral ehelyett
  // a kovető hagyja magat erdemben lemaradni (a CHASE_TRIGGER hatarig), majd
  // egy latvanyos, gyors futassal utoleri (KEEP_DISTANCE-ig), es csak OTT
  // all meg -- ez ad valodi "utanam szalad" erzetet lepestartas helyett.
  function updateFollower(dt, playerMoving) {
    if (!followerCfg) return;

    if (playerMoving) {
      playerIdleTimer = 0;
    } else {
      playerIdleTimer += dt * 1000;
    }

    const dx = pos.x - followerPos.x;
    const dy = pos.y - followerPos.y;
    const dist = Math.hypot(dx, dy);
    const isChasing = followerState === "follow" || followerState === "jump";
    const shouldChase = isChasing ? dist > FOLLOWER_KEEP_DISTANCE : dist > FOLLOWER_CHASE_TRIGGER_DISTANCE;

    if (shouldChase) {
      if (followerState === "sit") {
        // A veletlenszeru reakcio-keses CSAK igazi (regota) ulesbol valo
        // "felebredeskor" jar -- ha a kovető csak epp az imenti korben ert
        // utol (allapot: "stand", meg nem ult le igazan), a jatekos
        // folyamatos mozgasa eseten azonnal folytassa a kovetest, ne
        // kezdjen minden egyes alkalommal ujra varakozni. Ellenkezo esetben
        // (a regi viselkedes) folyamatos jatekos-mozgasnal az utolereskor
        // mindig ujraindult a veletlen keses, es a kovető latszolag
        // "leult-felallt-leult" ciklusban ragadt.
        if (followerWakeTimer <= 0) {
          followerWakeTimer = FOLLOWER_WAKE_MIN_MS + Math.random() * (FOLLOWER_WAKE_MAX_MS - FOLLOWER_WAKE_MIN_MS);
        }
        followerWakeTimer -= dt * 1000;
        if (followerWakeTimer <= 0) {
          followerState = "follow";
        }
      } else if (followerState === "stand") {
        followerState = "follow";
      }
      if (followerState === "follow" || followerState === "jump") {
        const beforeX = followerPos.x;
        const beforeY = followerPos.y;
        const speedCap = FOLLOWER_SPEED * dt;
        const proximityCap = dist - FOLLOWER_KEEP_DISTANCE;
        const moveDist = Math.min(speedCap, proximityCap);
        const stepX = (dx / dist) * moveDist;
        const stepY = (dy / dist) * moveDist;
        const newX = followerPos.x + stepX;
        const newY = followerPos.y + stepY;
        // Ugyanugy tiszteletben tartja a walkBounds-t, mint a jatekos --
        // tengelyenkent kulon, hogy a fal menten szepen vegigcsusszon.
        if (isInsideWalkBounds(newX, followerPos.y)) followerPos.x = newX;
        if (isInsideWalkBounds(followerPos.x, newY)) followerPos.y = newY;
        if (dx !== 0) followerFacing = dx > 0 ? 1 : -1;

        // "Beragadas" -eszleles: a tenyleges elmozdulast a SZANDEKOLT
        // (moveDist) ARANYABAN nezzuk, nem fix px-epsilonnal -- egy fix
        // px-hatar kepkocka-sebesseg-fuggo lenne (pl. gyors/valtozo dt
        // eseten meg egy teljesen akadalytalan lepes is essen az
        // "epsilon" ala, es tevesen beragadasnak tunne). Csak akkor
        // szamit blokkoltnak, ha erdemi lepest (moveDist) akart tenni,
        // de annak kevesebb mint felet sikerult csak megtennie -- ez
        // jelzi, hogy a walkBounds nem engedi at a jatekos aktualis
        // helyere, fuggetlenul a kepkocka-sebessegtol.
        const actuallyMoved = Math.hypot(followerPos.x - beforeX, followerPos.y - beforeY);
        const blocked = moveDist > 0.01 && actuallyMoved < moveDist * 0.5;
        if (blocked) {
          followerStuckTimer += dt * 1000;
        } else {
          followerStuckTimer = 0;
        }

        if (followerStuckTimer >= FOLLOWER_STUCK_MS) {
          followerState = "sit";
          followerAnimFrame = 0;
          followerAnimTimer = 0;
          followerStuckTimer = 0;
        } else if (followerState === "follow") {
          followerNextJumpCheck -= dt * 1000;
          if (followerNextJumpCheck <= 0) {
            followerNextJumpCheck = FOLLOWER_JUMP_CHECK_MS * (0.6 + Math.random() * 0.8);
            if (Math.random() < FOLLOWER_JUMP_PROBABILITY) {
              followerState = "jump";
              followerJumpTimer = FOLLOWER_JUMP_DURATION_MS;
              followerAnimFrame = 0;
              followerAnimTimer = 0;
            }
          }
        } else {
          followerJumpTimer -= dt * 1000;
          if (followerJumpTimer <= 0) followerState = "follow";
        }
      }
    } else {
      followerWakeTimer = 0;
      if (followerState === "follow" || followerState === "jump") {
        followerState = "stand";
        followerAnimFrame = 0;
        followerAnimTimer = 0;
      }
      if (playerIdleTimer >= FOLLOWER_SIT_IDLE_MS) {
        if (followerState !== "sit") {
          followerState = "sit";
          followerAnimFrame = 0;
          followerAnimTimer = 0;
        }
      } else if (followerState === "sit") {
        followerState = "stand";
        followerAnimFrame = 0;
        followerAnimTimer = 0;
      }
    }

    animateFollower(dt);
    updateFollowerVisualPosition();
  }

  function animateFollower(dt) {
    followerAnimTimer += dt * 1000;
    let frames = followerCfg.sitFrames;
    let frameMs = FOLLOWER_SIT_FRAME_MS;
    if (followerState === "jump") {
      frames = followerCfg.jumpFrames;
      frameMs = FOLLOWER_ANIM_FRAME_MS;
    } else if (followerState === "follow") {
      frames = followerCfg.runFrames;
      frameMs = FOLLOWER_ANIM_FRAME_MS;
    } else if (followerState === "stand") {
      // Nincs kulon "allo" kocka -- az elso ulo-kockat hasznaljuk
      // statikusan (nem ciklikusan), amig el nem dol, hogy leul-e vagy fut.
      frames = followerCfg.sitFrames.slice(0, 1);
    }
    if (followerAnimTimer >= frameMs) {
      followerAnimTimer -= frameMs;
      followerAnimFrame = (followerAnimFrame + 1) % frames.length;
    }
    setFollowerSprite(frames[followerAnimFrame % frames.length]);
  }

  function updateFollowerVisualPosition() {
    if (!follower) return;
    const w = followerCfg.w;
    const h = followerCfg.h || followerCfg.w;
    follower.style.transform = `translate(${followerPos.x - w / 2}px, ${followerPos.y - h}px) scaleX(${followerFacing})`;
  }

  // DEBUG_WALKBOUNDS true eseten kirajzolja a scene.walkBounds
  // teglalapjait (egyetlen objektum vagy tomb, ld. isInsideWalkBounds())
  // halvany neonzold kerettel -- ld. a fajl elejen levo megjegyzest.
  function spawnDebugWalkBounds() {
    debugEls.forEach((el) => el.remove());
    debugEls = [];
    if (!DEBUG_WALKBOUNDS) return;
    const rects = Array.isArray(scene.walkBounds) ? scene.walkBounds : [scene.walkBounds];
    rects.forEach((wb) => {
      const el = document.createElement("div");
      el.className = "overworld-debug-bounds";
      el.style.left = wb.xMin * worldW + "px";
      el.style.top = wb.yMin * stageH + "px";
      el.style.width = (wb.xMax - wb.xMin) * worldW + "px";
      el.style.height = (wb.yMax - wb.yMin) * stageH + "px";
      dom.world.insertBefore(el, dom.npcLayer);
      debugEls.push(el);
    });
  }

  // DEBUG_HOTSPOTS true eseten kirajzolja a scene.hotspots aktivalasi
  // sugarat (radius) piros korkent -- a hotspot pontos xFrac/yFrac
  // kozeppontja korul, ugyanugy szamolva, mint checkHotspots() a
  // tavolsagot. Ld. a fajl elejen levo megjegyzest.
  function spawnDebugHotspots() {
    debugHotspotEls.forEach((el) => el.remove());
    debugHotspotEls = [];
    if (!DEBUG_HOTSPOTS) return;
    scene.hotspots.forEach((h) => {
      const el = document.createElement("div");
      el.className = "overworld-debug-hotspot";
      el.style.left = h.xFrac * worldW - h.radius + "px";
      el.style.top = h.yFrac * stageH - h.radius + "px";
      el.style.width = h.radius * 2 + "px";
      el.style.height = h.radius * 2 + "px";
      dom.world.insertBefore(el, dom.npcLayer);
      debugHotspotEls.push(el);
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
    triggeredAutoIds = new Set();
    // Az elozo jelenetbol dinamikusan hozzaadott sprite-ok (ld. addSprite())
    // nem oroklodhetnek at egy uj scene-be -- eltavolitjuk a DOM-elemeiket,
    // majd kiuritjuk a terkepet.
    Object.keys(dynamicSprites).forEach((id) => dynamicSprites[id].remove());
    dynamicSprites = {};
    facing = "down";
    walkFrame = 0;
    walkTimer = 0;
    setPlayerSprite(DIRECTION_SPRITES.down[0]);
    dom.prompt.classList.add("hidden");

    const playerScale = scene.playerScale || 1;
    playerW = PLAYER_W * playerScale;
    playerH = PLAYER_H * playerScale;
    dom.player.style.width = playerW + "px";
    dom.player.style.height = playerH + "px";

    stageW = dom.stage.clientWidth;
    stageH = dom.stage.clientHeight;

    loadBackground((w) => {
      worldW = w || stageW;

      spawnHotspotSprites();
      spawnDecorations();
      spawnFollower();
      spawnDebugWalkBounds();
      spawnDebugHotspots();

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

  // A `paused` MAR NEM allitja meg magat az update()-et (ld. korabban:
  // `if (!paused) update(dt);`) -- az csak azt akadalyozta meg, hogy a
  // jatekos mozogjon (amit a `keys` ures allapota amugy is garantal, ld.
  // pause()/handleKeydown()), de emiatt a lepes-animacio (walkFrame) is
  // fagyva maradt, barmelyik kockan allt eppen a pause() pillanataban --
  // felhasznaloi visszajelzes szerint ez furan nezett ki (a karakter
  // "lepes kozben" allt meg). Update() mostantol MINDIG lefut, igy a
  // mozgas-animacio szepen visszaall az allo kockara (ld. update() `moving`
  // agat) -- csak a checkHotspots() marad `!paused`-hoz kotve (ld. ott),
  // hogy cutscene alatt ne ugorjon fel prompt/ne induljon ujra auto-hotspot.
  function loop(t) {
    if (!active) return;
    const dt = Math.min(0.05, (t - lastTime) / 1000);
    lastTime = t;
    update(dt);
    requestAnimationFrame(loop);
  }

  function update(dt) {
    const prevX = pos.x;
    const prevY = pos.y;
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
    // A hotspot-figyeles (prompt-felugras, auto-hotspot-inditas) tovabbra is
    // csak akkor fut, ha nincs szuneteltetve -- kulonben egy cutscene alatt
    // (pl. Overworld.pause() a playZone4Finale() elejen) veletlenul ujra
    // felugorhatna egy prompt, vagy (ha a jatekos eppen egy meg nem
    // aktivalt auto-hotspot korul all) ujra lefuthatna annak onInteract()-je.
    if (!paused) checkHotspots();
    // A kovető "jatekos-idle" eszleleset a TENYLEGES pozicio-valtozasra
    // alapozzuk, nem a nyers billentyu-bemenetre (`moving`) -- kulonben ha
    // a jatekos egy falnak/hataroknak tartva nyomva tartja az iranygombot,
    // a pozicio nem valtozik, de a `moving` flag orokre igaz maradna, es a
    // kovető sosem jutna el a valodi "sit" allapotig -- csak a "stand"
    // (allo, meg le nem ult) pozan ragadna, latszolag orokre "ratapadva" a
    // jatekosra (ld. felhasznaloi visszajelzes/teszteles).
    const playerActuallyMoved = pos.x !== prevX || pos.y !== prevY;
    updateFollower(dt, playerActuallyMoved);
  }

  function updatePositions() {
    dom.player.style.transform = `translate(${pos.x - playerW / 2}px, ${pos.y - playerH}px)`;

    const cameraX = Math.max(0, Math.min(worldW - stageW, pos.x - stageW / 2));
    dom.world.style.transform = `translateX(${-cameraX}px)`;

    const promptX = pos.x - cameraX;
    dom.prompt.style.transform = `translate(calc(${promptX}px - 50%), calc(${pos.y - playerH - 14}px - 100%))`;
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
      if (activeHotspot && activeHotspot.auto) {
        // Nincs felirat/Enter -- a sima odasetalas egyszer, magatol
        // lefuttatja az onInteract()-et (kesleltetve, ld. tryInteract()
        // fenti megjegyzeset ugyanerrol az okrol).
        dom.prompt.classList.add("hidden");
        if (!triggeredAutoIds.has(activeHotspot.id)) {
          triggeredAutoIds.add(activeHotspot.id);
          const hotspot = activeHotspot;
          setTimeout(() => hotspot.onInteract(), 0);
        }
      } else if (activeHotspot) {
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
  let cornerPages = [];
  let cornerPageIndex = 0;
  // Az aktualis sarok-buborek beszeloje (ld. showCornerPopup() opts.speaker)
  // -- csak a gepeles-hang kivalasztasahoz kell, ld. typeCornerText().
  let cornerSpeaker = null;

  // Gepelos szoveg a sarok-buborekban -- Space/Enter/kattintas eloszor
  // kiirja a teljes (aktualis oldalnyi) szoveget (ha meg gepel), majd
  // (ujabb Space/Enter/kattintasra) tovabblapoz a kovetkezo oldalra, ha
  // van, vagy -- az utolso oldalon -- bezarja a buborekot. Nincs
  // automatikus, idozitett bezaras. Minden ki nem hagyott karakternel
  // lejatssza a gepeles-hangot -- a felhasznalo kerese szerint
  // karakterenkent kulon hangot, ld. `RECURRING_SPEAKER_TYPE_SOUNDS`
  // (js/zones.js) es `cornerSpeaker` (showCornerPopup() opts.speaker-je).
  function typeCornerText() {
    const text = cornerPages[cornerPageIndex];
    dom.cornerText.textContent = "";
    cornerTyping = true;
    cornerSkipRequested = false;
    cornerReadyToClose = false;
    let i = 0;
    const speed = 24;
    const sound =
      (typeof RECURRING_SPEAKER_TYPE_SOUNDS !== "undefined" && RECURRING_SPEAKER_TYPE_SOUNDS[cornerSpeaker]) || "type";
    function finishPage() {
      cornerTyping = false;
      cornerReadyToClose = true;
    }
    function step() {
      if (cornerSkipRequested) {
        dom.cornerText.textContent = text;
        finishPage();
        return;
      }
      if (i < text.length) {
        dom.cornerText.textContent += text[i];
        if (text[i] !== " ") Engine.playSound(sound);
        i++;
        cornerTypeTimer = setTimeout(step, speed);
      } else {
        finishPage();
      }
    }
    step();
  }

  // text lehet egyetlen string VAGY tobb "oldalbol" allo tomb -- hosszu
  // szovegeknel igy Enter/szokoz/kattintassal lapozhato a buborek egyben-
  // kiirasa helyett (ld. tovabbi hasznalatot a js/zones.js companionChat
  // bejegyzeseiben es a js/main.js corridorFlavor()/flavorPopup()-jaban).
  // opts = { boxWidth?, portraitSize?, speaker? } -- boxWidth/portraitSize
  // (mindketto px) pontonkent/szovegenkent felulirja a doboz/portré
  // CSS-alapertelmezett meretet (300px / 40px), pl. egy szokasosnal
  // hosszabb sornal. `speaker` (opcionalis) a gepeles-hangot valasztja ki
  // (ld. typeCornerText()) -- hianyukban (vagy ha nincs opts) a
  // CSS-alapertelmezett meret / az alapertelmezett "type" hang ervenyesul.
  function showCornerPopup(portraitSrc, text, onDone, variant, opts) {
    if (cornerTypeTimer) clearTimeout(cornerTypeTimer);
    if (portraitSrc) {
      dom.cornerPortrait.src = portraitSrc;
      dom.cornerPortrait.classList.remove("hidden");
    } else {
      dom.cornerPortrait.classList.add("hidden");
    }
    dom.cornerPopup.classList.toggle("corner-popup-room", variant === "room");
    dom.cornerPopup.classList.remove("hidden");
    dom.cornerPopup.style.width = opts && opts.boxWidth ? opts.boxWidth + "px" : "";
    const portraitSize = opts && opts.portraitSize;
    dom.cornerPortrait.style.width = portraitSize ? portraitSize + "px" : "";
    dom.cornerPortrait.style.height = portraitSize ? portraitSize + "px" : "";
    cornerSpeaker = (opts && opts.speaker) || null;
    cornerDismiss = onDone;
    cornerPages = Array.isArray(text) ? text : [text];
    cornerPageIndex = 0;
    typeCornerText();
  }

  function advanceCornerPopup() {
    if (dom.cornerPopup.classList.contains("hidden")) return;
    if (cornerTyping) {
      cornerSkipRequested = true;
      return;
    }
    if (!cornerReadyToClose) return;
    if (cornerPageIndex < cornerPages.length - 1) {
      cornerPageIndex++;
      typeCornerText();
      return;
    }
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

  return {
    init,
    start,
    pause,
    resume,
    showCornerPopup,
    dismissCornerPopup,
    removeFollower,
    removeFollowerWithEffect,
    addSprite,
    updateSprite,
    removeSprite,
  };
})();
