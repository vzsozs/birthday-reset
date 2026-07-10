window.addEventListener("DOMContentLoaded", async () => {
  const gameStage = document.getElementById("game-stage");
  const gameViewport = document.getElementById("game-viewport");
  const STAGE_W = 800;
  const STAGE_H = 640;
  function updateScale() {
    if (!window.innerWidth || !window.innerHeight) return;
    const scale = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
    if (!scale) return;
    gameStage.style.transform = `scale(${scale})`;
  }
  updateScale();
  window.addEventListener("resize", updateScale);
  // A resize esemeny nem mindig tuzel el programozott/automatizalt
  // viewport-valtaskor (pl. teszt-eszkozok CDP-emulacioja) -- a
  // ResizeObserver a tenyleges box-meret valtozasat is elkapja.
  new ResizeObserver(updateScale).observe(document.documentElement);

  const titleScreen = document.getElementById("title-screen");
  const overworldScreen = document.getElementById("overworld-screen");
  const gameScreen = document.getElementById("game-screen");
  const endScreen = document.getElementById("end-screen");
  const startBtn = document.getElementById("start-btn");
  const restartBtn = document.getElementById("restart-btn");
  const zoneBg = document.getElementById("zone-bg");

  const choiceBox = document.getElementById("computer-choice-box");
  const choiceText = document.getElementById("choice-text");
  const choiceStart = document.getElementById("choice-start");
  const choiceDad = document.getElementById("choice-dad");

  Overworld.init({
    stage: document.getElementById("overworld-stage"),
    world: document.getElementById("overworld-world"),
    bg: document.getElementById("overworld-bg"),
    player: document.getElementById("overworld-player"),
    prompt: document.getElementById("overworld-prompt"),
    npcLayer: document.getElementById("overworld-npcs"),
    cornerPopup: document.getElementById("corner-popup"),
    cornerPortrait: document.getElementById("corner-popup-portrait"),
    cornerText: document.getElementById("corner-popup-text"),
  });

  const canvas = document.getElementById("battle-canvas");
  const boxBounds = { x: 40, y: 20, w: canvas.width - 80, h: canvas.height - 40 };

  Battle.initDom({
    dialogueBox: document.getElementById("dialogue-box"),
    speakerName: document.getElementById("speaker-name"),
    dialogueText: document.getElementById("dialogue-text"),
    continueHint: document.getElementById("continue-hint"),
    portrait: document.getElementById("portrait"),
    menuBox: document.getElementById("menu-box"),
    hpFill: document.getElementById("hp-fill"),
    hpText: document.getElementById("hp-text"),
    battleWrap: document.getElementById("battle-wrap"),
    styleTag: document.getElementById("style-tag"),
    gameoverOverlay: document.getElementById("gameover-overlay"),
  });

  Engine.init(canvas, boxBounds, Battle.onHit);
  await Promise.all([
    Engine.loadImage("heart", "assets/sprites/ui/soul_heart_red.png"),
    Engine.loadImage("tear", "assets/sprites/ui/tear_bullet_real.png"),
  ]);
  Engine.loadSound("blip", "assets/sfx/menu_blip.wav");
  Engine.loadSound("move", "assets/sfx/menu_move.wav");
  Engine.loadSound("hit", "assets/sfx/hit.wav");
  Engine.loadSound("style", "assets/sfx/style_point.wav");
  Engine.loadSound("victory", "assets/sfx/victory.wav");
  // Gepeles-hang -- egyelore mindenkinel ugyanaz, kesobb karakterenkent
  // valtoztathato (pl. line.typingSound tamogatasaval, ha szukseg lesz ra).
  Engine.loadSound("type", "assets/Sounds/snd_txtasg.wav");
  Engine.loadSound("zoneStart", "assets/Sounds/snd_item.wav");
  Engine.loadSound("glitchZap", "assets/Sounds/snd_error.wav");
  Engine.loadSound("jokerLaugh", "assets/Sounds/snd_joker_laugh1.wav");
  Engine.loadSound("flavorText", "assets/Sounds/snd_text.wav?v=2");

  // --- Szoba-jelenet -------------------------------------------------

  const NARRATION_TEXT = "* Uhh, ma még nem játszottam, pedig már reggel 7:30 van.";
  const TENNA_LINE = "Biztos hogy nem kapcsolod be a gépet? Egy jó kis játék még nem árthat...";
  const QUEEN_LINE = "SYSTEM ERROR. KOCKA VAGYOK, AKKOR IS JÁTSZOM 10 PERCET.";
  const START_LABEL = "Bekapcsolom a gépet";
  const DAD_BTN_LABEL = "Inkább kimegyek apához";
  let dadClicks = 0;

  function flavorPopup(portraitSrc, text) {
    Overworld.pause();
    Engine.playSound("flavorText");
    Overworld.showCornerPopup(portraitSrc, text, () => Overworld.resume());
  }

  // A valaszto-doboz (Bekapcsolom a gepet / kimegyek apahoz) billentyuzetes
  // navigacioja -- nyilak/A-D valt a ket opcio kozott, Enter/szokoz
  // aktivalja a kijeloltet. A kijelolt opcio sarga, es egy SOUL-sziv jelenik
  // meg elotte (ld. .choice-selected a style.css-ben).
  const choiceButtons = [choiceStart, choiceDad];
  const choiceLabels = [choiceStart.querySelector(".choice-label"), choiceDad.querySelector(".choice-label")];
  let choiceIndex = 0;

  function highlightChoice() {
    choiceButtons.forEach((b, i) => b.classList.toggle("choice-selected", i === choiceIndex));
  }

  window.addEventListener("keydown", (e) => {
    if (choiceBox.classList.contains("hidden")) return;
    const k = e.key.toLowerCase();
    if (k === "arrowleft" || k === "a" || k === "arrowright" || k === "d") {
      e.preventDefault();
      choiceIndex = choiceIndex === 0 ? 1 : 0;
      highlightChoice();
      Engine.playSound("move");
    } else if (k === "enter" || k === " ") {
      e.preventDefault();
      choiceButtons[choiceIndex].click();
    }
  });

  function openComputerChoice() {
    Overworld.pause();
    dadClicks = 0;
    choiceLabels[1].textContent = DAD_BTN_LABEL;
    choiceText.textContent = NARRATION_TEXT;
    choiceIndex = 0;
    highlightChoice();
    choiceBox.classList.remove("hidden");
  }

  choiceStart.addEventListener("click", () => {
    choiceBox.classList.add("hidden");
    enterGlitchWorld();
  });

  choiceDad.addEventListener("click", () => {
    if (dadClicks >= 2) {
      choiceBox.classList.add("hidden");
      enterGlitchWorld();
      return;
    }
    choiceBox.classList.add("hidden");
    if (dadClicks === 0) {
      Overworld.showCornerPopup(
        "assets/sprites/Tenna_room.png",
        TENNA_LINE,
        () => {
          dadClicks = 1;
          choiceIndex = 0;
          highlightChoice();
          choiceBox.classList.remove("hidden");
        },
        "room"
      );
    } else {
      Overworld.showCornerPopup(
        "assets/sprites/Queen_room.png",
        QUEEN_LINE,
        () => {
          dadClicks = 2;
          choiceLabels[1].textContent = START_LABEL;
          choiceIndex = 0;
          highlightChoice();
          choiceBox.classList.remove("hidden");
          Engine.playSound("jokerLaugh");
        },
        "room"
      );
    }
  });

  const ROOM_SCENE = {
    bgSrc: "assets/sprites/bazsa_szoba.png",
    walkBounds: [
      { xMin: 0.24, xMax: 0.9, yMin: 0.75, yMax: 0.8 },
      { xMin: 0.45, xMax: 0.7, yMin: 0.55, yMax: 0.8 },
      { xMin: 0.72, xMax: 0.85, yMin: 0.75, yMax: 0.95 },
    ],
    spawn: { xFrac: 0.8, yFrac: 0.87 },
    hotspots: [
      {
        id: "computer",
        xFrac: 0.79,
        yFrac: 0.68,
        radius: 70,
        prompt: "▶ Enter: leülsz a géphez",
        onInteract: openComputerChoice,
      },
      {
        id: "shelf",
        xFrac: 0.3,
        yFrac: 0.75,
        radius: 55,
        prompt: "▶ Enter: megnézed a polcot",
        onInteract: () => flavorPopup(null, "A polcon még ott lapul a régi Lego-doboz."),
      },
      {
        id: "tv",
        xFrac: 0.42,
        yFrac: 0.55,
        radius: 50,
        prompt: "▶ Enter: megnézed a tévét",
        onInteract: () => flavorPopup(null, "A tévé már vagy tíz éve ugyanazt a port gyűjti."),
      },
    ],
    decorations: [
      {
        // Feki, a macska -- az ablakparkanyon ul, 4 kockas korkoros animacioval.
        xFrac: 0.238,
        yFrac: 0.276,
        w: 28,
        h: 28,
        frameMs: 260,
        frames: [
          "assets/sprites/cat/feki_01.png",
          "assets/sprites/cat/feki_02.png",
          "assets/sprites/cat/feki_03.png",
          "assets/sprites/cat/feki_04.png",
        ],
      },
    ],
  };

  // --- Folyoso-jelenet -------------------------------------------------

  const DOOR_FRACTIONS = [0.125, 0.375, 0.625, 0.875];

  // A folyoso hattere zonankent kulon fajl (nem egy osszefuzott kep) -- ld.
  // tools/gen_assets.py corridor_bg() es a CLAUDE.md. Az Overworld egymas
  // mella illeszti oket; a DOOR_FRACTIONS fenti, egyenletes-negyedeles
  // ertekei addig stimmelnek, amig a 4 kep kb. egyenlo szelessegu -- ha
  // kesobb sajat rajzra cserelodnek, elteree szelessegekkel, ezeket az
  // ertekeket is at kell hangolni.
  const CORRIDOR_ZONE_BACKGROUNDS = [
    "assets/sprites/corridor_zone1_bg_placeholder.png",
    "assets/sprites/corridor_zone2_bg_placeholder.png",
    "assets/sprites/corridor_zone3_bg_placeholder.png",
    "assets/sprites/corridor_zone4_bg_placeholder.png",
  ];

  function corridorFlavor(portraitSrc, text) {
    Overworld.pause();
    Overworld.showCornerPopup(portraitSrc, text, () => Overworld.resume());
  }

  function buildCorridorScene(spawnAfterDoorIndex) {
    const hotspots = [];
    ZONES.forEach((zone, i) => {
      const doorFrac = DOOR_FRACTIONS[i];
      const chat = zone.companionChat || [];
      if (chat[0]) {
        hotspots.push({
          id: `kecske${i}`,
          xFrac: doorFrac - 0.05,
          yFrac: 0.78,
          radius: 45,
          prompt: "▶ Enter: szólsz Kecskének",
          sprite: { src: "assets/sprites/kecske_placeholder.png", w: 44 },
          onInteract: () => corridorFlavor("assets/sprites/kecske_placeholder.png", chat[0].text),
        });
      }
      if (chat[1]) {
        hotspots.push({
          id: `tenna${i}`,
          xFrac: doorFrac - 0.035,
          yFrac: 0.78,
          radius: 45,
          prompt: "▶ Enter: szólsz Tennának",
          sprite: { src: "assets/sprites/tenna_placeholder.png", w: 44 },
          onInteract: () => corridorFlavor("assets/sprites/tenna_placeholder.png", chat[1].text),
        });
      }
      if (chat[2]) {
        hotspots.push({
          id: `queen${i}`,
          xFrac: doorFrac - 0.02,
          yFrac: 0.78,
          radius: 45,
          prompt: "▶ Enter: szólsz Queennek",
          sprite: { src: "assets/sprites/queen_placeholder.png", w: 44 },
          onInteract: () => corridorFlavor("assets/sprites/queen_placeholder.png", chat[2].text),
        });
      }
      hotspots.push({
        id: `door${i}`,
        xFrac: doorFrac,
        yFrac: 0.78,
        radius: 55,
        prompt: "▶ Enter: belépés a zónába",
        sprite: { src: zone.enemy.sprite, w: 48 },
        onInteract: () => {
          Overworld.pause();
          enterZone(i);
        },
      });
    });

    return {
      bgSrc: CORRIDOR_ZONE_BACKGROUNDS,
      walkBounds: { xMin: 0.01, xMax: 0.99, yMin: 0.6, yMax: 0.92 },
      spawn: () => ({
        xFrac: spawnAfterDoorIndex == null ? 0.03 : Math.min(0.98, DOOR_FRACTIONS[spawnAfterDoorIndex] + 0.045),
        yFrac: 0.78,
      }),
      hotspots,
    };
  }

  // --- Kepernyo-atmenetek -------------------------------------------------

  // Halk hatterzene a szoba-jelenethez -- a cimkepernyo START-gombjara indul
  // el (ez mar valodi felhasznaloi interakcio, nem utkozik a bongeszo
  // autoplay-szabalyaival), es hurokban szol.
  const roomMusic = new Audio("assets/music/DELTARUNE-Chapter-5_Media_KTOreU_aOr4_009_128k.mp3");
  roomMusic.loop = true;
  roomMusic.volume = 0.25;

  startBtn.addEventListener("click", () => {
    titleScreen.classList.add("hidden");
    overworldScreen.classList.remove("hidden");
    Overworld.start(ROOM_SCENE);
    roomMusic.play().catch(() => {});
  });

  // A glitch-atvezetes idozitese a style.css worldGlitch keyframes-enek
  // hosszahoz (0.9s) igazodik: a torodo-hangeffekt azonnal indul, a
  // "belepo" jingle kicsit kesobb (mintha a folyoso csak a glitch kozepen
  // "allna ossze"), a jelenetvaltas pedig csak az animacio vegen tortenik,
  // amikor a brightness(0.1) lepes mar amugy is majdnem feketere viszi a
  // kepet -- igy a mogotte cserelodo DOM nem latszik meg. FONTOS: az
  // animacio a #game-viewport-on fut, NEM a #game-stage-en -- utobbinak
  // mar van egy inline transform:scale()-je (updateScale()), amit egy ra
  // kerulo CSS-animacio (ami szinten a transform-ot allitgatja) felulirna
  // amig fut, es a jatek kizoomolna a glitch alatt.
  function enterGlitchWorld() {
    Engine.playSound("glitchZap");
    gameViewport.classList.add("screen-glitch");
    setTimeout(() => Engine.playSound("zoneStart"), 550);
    setTimeout(() => {
      gameViewport.classList.remove("screen-glitch");
      Overworld.start(buildCorridorScene(null));
    }, 900);
  }

  restartBtn.addEventListener("click", () => {
    endScreen.classList.add("hidden");
    titleScreen.classList.remove("hidden");
  });

  function enterZone(zoneIndex) {
    overworldScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    zoneBg.src = ZONES[zoneIndex].background || "";
    Battle.start(ZONES[zoneIndex], () => {
      if (zoneIndex + 1 >= ZONES.length) {
        Engine.playSound("victory");
        gameScreen.classList.add("hidden");
        endScreen.classList.remove("hidden");
        return;
      }
      gameScreen.classList.add("hidden");
      overworldScreen.classList.remove("hidden");
      Overworld.start(buildCorridorScene(zoneIndex));
    });
  }
});
