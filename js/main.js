window.addEventListener("DOMContentLoaded", async () => {
  const gameStage = document.getElementById("game-stage");
  const gameViewport = document.getElementById("game-viewport");
  const sceneFade = document.getElementById("scene-fade");
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
  // A felhasznalo kerese szerint a "Mozgás: nyilak / WASD..." hint-szoveg
  // MOST MAR csak a Bazsa-szobaban lathato -- a folyoso/isaac-szoba mar nem
  // mutatja (a cimkepernyo es a harc-kepernyo sajat hint-szoveget pedig
  // teljesen toroltuk). Elrejtve az enterGlitchWorld()-ben, amikor a
  // jatekos elhagyja a szobat -- a jatek soha nem ter vissza ROOM_SCENE-be,
  // igy nincs szukseg arra, hogy valaha ujra megjelenjen.
  const roomHint = document.getElementById("room-hint");

  const choiceBox = document.getElementById("computer-choice-box");
  const choiceText = document.getElementById("choice-text");
  const choiceStart = document.getElementById("choice-start");
  const choiceDad = document.getElementById("choice-dad");

  const giftCountdownBox = document.getElementById("gift-countdown-box");
  const giftCountdownNumber = document.getElementById("gift-countdown-number");
  const giftCountdownButton = document.getElementById("gift-countdown-button");

  // A zaro (Minecraft-temaju) zona folyoson lejatszodo jelenetehez -- ld.
  // playZone4Finale(). A js/battle.js showSequence()/showCenterImage()/
  // showStyleTag()/playFinalCinematic()-jat hasznaljuk ujra, de ezekkel a
  // sajat (nem a harc-kepernyos) dom-elemekkel, ld. index.html/style.css.
  // A felhasznalo kifejezett kerese szerint a beszelgetesek a MEGSZOKOTT,
  // dialogue_box_frame.png-s dobozban jelenjenek meg, ne a kisebb
  // corner-popup buborekban -- ld. overworldDialogueBox/overworldDialogueTarget.
  const overworldImageFlash = document.getElementById("overworld-image-flash");
  const overworldStyleTag = document.getElementById("overworld-style-tag");
  const overworldEndingDom = {
    overlay: document.getElementById("overworld-ending-overlay"),
    heading: document.getElementById("overworld-ending-heading"),
    finalLine: document.getElementById("overworld-ending-final-line"),
    continueHint: document.getElementById("overworld-ending-continue-hint"),
    guy: document.getElementById("overworld-ending-guy"),
  };
  const overworldDialogueBox = document.getElementById("overworld-dialogue-box");
  // Az APA->APA2 atvaltast a folyoson allo Apa-sprite-on (nem csak a
  // dialogus-doboz portrejan) is eltakarja egy 8-kockas animacio -- KULON
  // fajlkeszlet, a felhasznalo kifejezett kerese szerint, hogy a ket
  // animacio (doboz vs vilag-sprite) fuggetlenul cserelheto legyen kesz
  // rajzra. `onTransitionFrame` a js/battle.js showSequence()/
  // playTransitionAnim() altal minden kockavaltaskor meghivott hook (ld.
  // ott) -- igy a ket animacio pontosan szinkronban fut. `onTransitionEnd`
  // a transitionAnim vegen fut le EGYSZER, es a vegleges "APA2 vilag-sprite"
  // kepre valt (nem hagyja az utolso atmenet-kockan allva) -- ld.
  // js/battle.js showSequence() `target.onTransitionEnd` hivasat.
  const APA_WORLD_TRANSITION_FRAMES = [
    "assets/sprites/apa_world_transition_01.png",
    "assets/sprites/apa_world_transition_02.png",
    "assets/sprites/apa_world_transition_03.png",
    "assets/sprites/apa_world_transition_04.png",
    "assets/sprites/apa_world_transition_05.png",
    "assets/sprites/apa_world_transition_06.png",
    "assets/sprites/apa_world_transition_07.png",
    "assets/sprites/apa_world_transition_08.png",
  ];
  // Az allo Apa/Apa2 vilag-sprite MERETE -- ez az EGYETLEN hely, ahol ez
  // allithato (ld. playZone4Finale() Overworld.addSprite()-hivasat lejjebb).
  // A felhasznalo kerese szerint a 8-kockas atmenet-animacio ENNEL
  // LATHATOAN NAGYOBB legyen (ZONE4_APA_TRANSITION_SCALE-lel felszorozva),
  // majd az atmenet vegen (onTransitionEnd) visszaall erre az alapmeretre --
  // mindkettot ugyanaz az also-kozeppont (xFrac/yFrac) rogziti, ld.
  // Overworld.updateSprite() sizeOpts-dokumentaciojat (js/overworld.js),
  // igy a novekedes/zsugorodas a lab magassagabol, kozepre igazitva
  // tortenik, nem "ugorva".
  const ZONE4_APA_SIZE = { w: 91, h: 104 };
  const ZONE4_APA_TRANSITION_SCALE = 1.48;
  const ZONE4_APA_TRANSITION_SIZE = {
    w: Math.round(ZONE4_APA_SIZE.w * ZONE4_APA_TRANSITION_SCALE),
    h: Math.round(ZONE4_APA_SIZE.h * ZONE4_APA_TRANSITION_SCALE),
  };
  // A confetti-effekt (ld. onTransitionAdvance lejjebb) a felhasznalo
  // kerese szerint 3x akkora, mint az allo Apa2-kep, de ugyanaz az
  // also-kozeppont (xFrac/yFrac) rogziti -- ld. ZONE4_APA_SIZE megjegyzeset.
  // `offsetY` (px, lejjebb = pozitiv) a felhasznalo kerese szerint kb. 100px-
  // szel lejjebb tolja a confettit az allo Apa2-kephez kepest.
  const ZONE4_CONFETTI_SIZE = { w: ZONE4_APA_SIZE.w * 3, h: ZONE4_APA_SIZE.h * 3, offsetY: 100 };
  // A confetti.gif egy 59 kockas, orokre hurkolodo (loop=0) animacio, 30ms/
  // kocka -- azaz egy teljes lejatszas kb. 1770ms. Mivel a felhasznalo
  // kerese szerint az animacio CSAK EGYSZER jatszodjon le (ne loopoljon),
  // ennyi ido utan egy statikus, az utolso kockabol kiexportalt kepre
  // (confetti_still.png, ld. eloallitasat a git-tortenetben/a menetben
  // hasznalt egyszeri Python-parancsban) valtunk, ami "megfagyasztja" a
  // gif-et a sajat utolso allapotaban ahelyett, hogy ujraindulna.
  const CONFETTI_LOOP_MS = 1770;
  const overworldDialogueTarget = {
    dialogueText: document.getElementById("overworld-dialogue-text"),
    portrait: document.getElementById("overworld-portrait"),
    continueHint: document.getElementById("overworld-continue-hint"),
    onTransitionFrame: (i) =>
      Overworld.updateSprite("zone4-apa", APA_WORLD_TRANSITION_FRAMES[i], ZONE4_APA_TRANSITION_SIZE),
    // Az atmenet vegen (meg a "Tudom, tudom..." sor gepelese ELOTT) a
    // folyoson allo vilag-sprite a vegleges, valodi APA2-kepre valt.
    onTransitionEnd: () =>
      Overworld.updateSprite("zone4-apa", "assets/sprites/apa2_placeholder.png", ZONE4_APA_SIZE),
    // A felhasznalo kerese szerint a confetti.gif csak AZUTAN jelenik meg,
    // hogy a "Tudom, tudom..." sort mar elolvasta es tovabblepett (Enter/
    // kattintas) -- ld. js/battle.js showSequence() onTransitionAdvance
    // hivasat. 3x meret, 100px-el lejjebb tolva (ZONE4_CONFETTI_SIZE
    // offsetY-ja), a "chainExtend" hang PONTOSAN akkor szol, amikor a gif
    // megjelenik. Egy Promise-t ad vissza, amit showSequence() megvar -- igy
    // a sprite csak a teljes loop (CONFETTI_LOOP_MS) lejatszasa utan
    // (statikus kepre fagyva) tavolittatik el a playZone4Finale() kovetkezo
    // lepeseben (Overworld.removeSprite()), nem "vagja el" idejekorán a gifet.
    onTransitionAdvance: () => {
      Overworld.updateSprite("zone4-apa", "assets/sprites/confetti.gif", ZONE4_CONFETTI_SIZE);
      Engine.playSound("chainExtend");
      return new Promise((resolve) =>
        setTimeout(() => {
          Overworld.updateSprite("zone4-apa", "assets/sprites/confetti_still.png", ZONE4_CONFETTI_SIZE);
          resolve();
        }, CONFETTI_LOOP_MS)
      );
    },
  };

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
    mercyRow: document.getElementById("mercy-row"),
    mercyFill: document.getElementById("mercy-fill"),
    mercyText: document.getElementById("mercy-text"),
    battleWrap: document.getElementById("battle-wrap"),
    styleTag: document.getElementById("style-tag"),
    gameoverOverlay: document.getElementById("gameover-overlay"),
    battleCornerPopup: document.getElementById("battle-corner-popup"),
    battleCornerPortrait: document.getElementById("battle-corner-popup-portrait"),
    battleCornerText: document.getElementById("battle-corner-popup-text"),
    battleEnemySprite: document.getElementById("battle-enemy-sprite"),
    imageFlash: document.getElementById("battle-image-flash"),
    endingOverlay: document.getElementById("ending-overlay"),
    endingHeading: document.getElementById("ending-heading"),
    endingFinalLine: document.getElementById("ending-final-line"),
    endingContinueHint: document.getElementById("ending-continue-hint"),
    endingGuy: document.getElementById("ending-guy"),
    overworldDialogueBox: document.getElementById("overworld-dialogue-box"),
    overworldEndingOverlay: document.getElementById("overworld-ending-overlay"),
  });

  Engine.init(canvas, boxBounds, Battle.onHit);
  await Promise.all([
    Engine.loadImage("heart", "assets/sprites/ui/soul_heart_red.png"),
    Engine.loadImage("tear", "assets/sprites/tear_bullet.png"),
    Engine.loadImage("tearRed", "assets/sprites/tear_bullet-red.png"),
    // A 2. zona (Cirkusz) meret szerint valasztott lovedek-texturai --
    // ld. js/zones.js ZONE_2.rounds[*].dodge.tearImages es js/engine.js
    // draw()/tearImageFor().
    Engine.loadImage("bubbleSmall", "assets/sprites/bubbles-bulett-small.png"),
    Engine.loadImage("bubbleNormal", "assets/sprites/bubbles-bulett-normal.png"),
    Engine.loadImage("bubbleLarge", "assets/sprites/bubbles-bulett-large.png"),
    // Elore betoltve (nem hasznalt a canvas-motorban, csak a bongeszo
    // kep-gyorsitotaraba kerul) -- kulonben a zaro zona onTransitionAdvance()
    // hivasakor a meg le nem toltott/dekodolt gif helyett egy pillanatra a
    // regi apa2_placeholder.png latszott, felnagyitva az uj (3x-os)
    // doboz-meretre, amig a confetti.gif be nem toltott.
    Engine.loadImage("confetti", "assets/sprites/confetti.gif"),
    // A "System Reset..." kepernyon 5mp utan felbukkano guy-poen 3 kockaja
    // -- ld. js/battle.js playGuyGag().
    Engine.loadImage("guy1", "assets/sprites/disappearing-guy-01.png"),
    Engine.loadImage("guy2", "assets/sprites/disappearing-guy-02.png"),
    Engine.loadImage("guy3", "assets/sprites/disappearing-guy-03.png"),
  ]);
  Engine.loadSound("blip", "assets/sfx/menu_blip.wav");
  Engine.loadSound("move", "assets/sfx/menu_move.wav");
  Engine.loadSound("hit", "assets/sfx/hit.wav");
  Engine.loadSound("style", "assets/sfx/style_point.wav");
  Engine.loadSound("victory", "assets/sfx/victory.wav");
  // Gepeles-hang -- egyelore mindenkinel ugyanaz, kesobb karakterenkent
  // valtoztathato (pl. line.typingSound tamogatasaval, ha szukseg lesz ra).
  Engine.loadSound("type", "assets/Sounds/snd_txtsans.wav");
  Engine.loadSound("zoneStart", "assets/Sounds/snd_item.wav");
  Engine.loadSound("glitchZap", "assets/Sounds/snd_error.wav");
  Engine.loadSound("jokerLaugh", "assets/Sounds/snd_joker_laugh1.wav");
  Engine.loadSound("flavorText", "assets/Sounds/snd_text.wav?v=2");
  // A 2. zona ajandek-visszaszamlalo minijatekahoz (ld. startGiftCountdown()).
  Engine.loadSound("coin", "assets/Sounds/snd_coin.wav");
  Engine.loadSound("won", "assets/Sounds/snd_won.wav");
  Engine.loadSound("awkward", "assets/Sounds/snd_awkward.wav");
  // A zaro (Minecraft-) zona forgatokonyvehez -- Apa dramai belepoje, majd
  // a playFinalCinematic() harom hangja (ld. js/battle.js es js/zones.js
  // ZONE_4.finalCinematic). A "won" mar be van toltve (fent).
  Engine.loadSound("heavydamage", "assets/Sounds/snd_heavydamage.wav");
  Engine.loadSound("splat", "assets/Sounds/snd_splat.wav");
  Engine.loadSound("step2", "assets/Sounds/snd_step2.wav");
  // Az APA->APA2 arcvaltashoz (ZONE_4.victoryLines) es a 4finger_placeholder
  // felvillanasahoz (ZONE_4.fightImage) -- ld. js/zones.js.
  Engine.loadSound("vaporized", "assets/Sounds/snd_vaporized.wav");
  Engine.loadSound("ultraswing", "assets/Sounds/snd_ultraswing.wav");
  // A confetti-effekt megjelenesekor szolo hang (ld. onTransitionAdvance
  // fentebb) -- a felhasznalo visszajelzese szerint alig hallhato volt az
  // alapertelmezett 0.6-os hangeronel, ezert itt a natív <audio> maximumara
  // (1.0) van allitva, ld. Engine.loadSound() opcionalis volume-parametere.
  Engine.loadSound("chainExtend", "assets/Sounds/snd_chain_extend.wav", 1.0);
  // A "System Reset..." kepernyon 5mp utan felbukkano guy-poen hangja --
  // ld. js/battle.js playGuyGag().
  Engine.loadSound("helloEverybody", "assets/Sounds/Hello-Everybody-My-Name-Is.wav");
  // Karakterenkent kulon gepeles-hang -- ld. js/zones.js
  // RECURRING_SPEAKER_TYPE_SOUNDS es a hasznalatat js/battle.js
  // typeText()-jeben / js/overworld.js typeCornerText()-jeben. Az itt fel
  // nem sorolt beszelok ("TE", "APA", "APA2") tovabbra is a mar betoltott
  // "type" hangot hasznaljak (snd_txtasg.wav, ld. lejjebb).
  Engine.loadSound("type_jax", "assets/Sounds/snd_txtral.wav");
  Engine.loadSound("type_caine", "assets/Sounds/snd_txtsus.wav");
  Engine.loadSound("type_bubble", "assets/Sounds/snd_txtund.wav");
  Engine.loadSound("type_kecske", "assets/Sounds/snd_txtnoe.wav");
  Engine.loadSound("type_queen", "assets/Sounds/snd_txtber.wav");
  Engine.loadSound("type_tenna", "assets/Sounds/snd_txtlan.wav");
  Engine.loadSound("type_konnyleny", "assets/Sounds/snd_text.wav");

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

  // Tobb, valtakozo beszelos (portrait-onkent kulon) sor egymas utan, egy
  // Overworld.showCornerPopup()-lancolassal -- ld. flavorPopup() az egyetlen-
  // beszelos valtozatert. Minden `lines[i]` egy { portrait, text, sound?,
  // speaker? } objektum (a `portrait` lehet null, ha "TE" beszelsz -- akkor
  // nincs kep, mint a harci dialogus TE-sorainal). `line.sound` (opcionalis)
  // egy Engine-hangnevet jatszik le a sor felugrasa elott -- ld. js/battle.js
  // showSequence() `line.sound`-jat, ugyanaz a mintazat, csak itt az
  // overworld-dialogushoz. `line.speaker` (opcionalis) a karakterenkenti
  // gepeles-hangot valasztja ki (ld. js/overworld.js showCornerPopup()
  // opts.speaker-jet es js/zones.js RECURRING_SPEAKER_TYPE_SOUNDS-ot).
  // `onDone` a teljes sorozat vegen fut le.
  function showOverworldDialogue(lines, onDone) {
    Overworld.pause();
    Engine.playSound("flavorText");
    let i = 0;
    function next() {
      if (i >= lines.length) {
        Overworld.resume();
        if (onDone) onDone();
        return;
      }
      const line = lines[i];
      i++;
      if (line.sound) Engine.playSound(line.sound);
      Overworld.showCornerPopup(line.portrait, line.text, next, undefined, { speaker: line.speaker });
    }
    next();
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
        "room",
        { speaker: "TENNA" }
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
        "room",
        { speaker: "QUEEN" }
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
        onInteract: () => flavorPopup(null, "A polcon még ott lapulnak a régi társasjátékok."),
      },
      {
        id: "tv",
        xFrac: 0.5,
        yFrac: 0.5,
        radius: 50,
        prompt: "▶ Enter: megnézed a tévét",
        onInteract: () => flavorPopup(null, "A tévé már vagy 3 éve ugyanazt a port gyűjti."),
      },
    ],
    decorations: [
      {
        // Feki, a macska -- az ablakparkanyon ul, 4 kockas korkoros animacioval.
        // (A folyoson viszont mar egy kovető NPC, ld. buildCorridorScene().)
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

  // A folyoso hattere zonankent kulon fajl (nem egy osszefuzott kep) -- ld.
  // tools/gen_assets.py corridor_bg() es a CLAUDE.md. Az Overworld egymas
  // mella illeszti oket, a stage magassagara (480px) skalazva, sajat
  // oldalaranyat megtartva -- igy a vilag-szelesseg kepenkent elter, ha a
  // kepek nem egyenlo szelesseguek. A 2. zona hattere (corridor_zone2_bg_placeholder.png)
  // mar a vegleges, kezzel/AI-jal keszult "Cirkusz"-rajz (1302px szeles),
  // a 3. zona (Csovek) kikerult a jatekbol (ld. CLAUDE.md "Hatralevo munka"),
  // a 4. (immar utolso) zona hattere pedig mar szinten a vegleges, kezzel
  // elhelyezett Minecraft-rajz (1024px szeles) -- egyik sem egyenlo
  // szelessegu, ezert a DOOR_FRACTIONS ertekei alant a TENYLEGES (osszeadott)
  // szelessegekbol vannak ujraszamolva, nem egyszeru harmadolassal. Ha egy
  // tovabbi zona hattere is lecserelodik maskkora szelessegure, ezt a
  // tombot (es a ZONE2_LAYOUT-hoz hasonlo, uj zona-specifikus felulirast,
  // ha kell) ujra kell hangolni.
  const CORRIDOR_ZONE_BACKGROUNDS = [
    "assets/sprites/corridor_zone1_bg_placeholder.png",
    "assets/sprites/corridor_zone2_bg_placeholder.png",
    "assets/sprites/corridor_zone4_bg_placeholder.png",
  ];
  const CORRIDOR_SEGMENT_WIDTHS = [1100, 1302, 1024];
  const CORRIDOR_TOTAL_WIDTH = CORRIDOR_SEGMENT_WIDTHS.reduce((a, b) => a + b, 0);
  const CORRIDOR_SEGMENT_OFFSETS = CORRIDOR_SEGMENT_WIDTHS.reduce((offsets, w, i) => {
    offsets.push(i === 0 ? 0 : offsets[i - 1] + CORRIDOR_SEGMENT_WIDTHS[i - 1]);
    return offsets;
  }, []);
  // Zonankent a sajat szegmensenek (lokalis) kozeppontja -- ez a zona1/3/4
  // meg placeholder hattereinel (tools/gen_assets.py corridor_bg()) pontosan
  // ott van, ahol az a generikus ajto rajzolva van (seg_w//2).
  const DOOR_FRACTIONS = CORRIDOR_SEGMENT_OFFSETS.map(
    (offset, i) => (offset + CORRIDOR_SEGMENT_WIDTHS[i] / 2) / CORRIDOR_TOTAL_WIDTH
  );
  // A 2. zona (Cirkusz) uj hatterehez kezzel hangolt overworld-pozicio --
  // a generikus doorFrac-bol szarmaztatott -0.06/-0.095-os eltolas (ld.
  // lejjebb a fo ciklusban) csak a regi, szimmetrikus placeholder-ajtohoz
  // illett; ez a rajz zsufoltabb (korhinta a kozepen, ket ajtonyilas
  // oldalt), ezert a Bohoc-NPC/Kecske/"minecraft" hotspotok sajat,
  // kulon eltalalt xFrac/yFrac-ot kapnak. Mind vilag-fraction (a teljes,
  // 4 kepbol osszeillesztett folyoso szelessegehez viszonyitva) -- ld.
  // buildCorridorScene() `layout` valtozojat. A Bohoc-NPC a korhinta
  // mellett all (a "attrakcio" resze), Kecske/a minecraft-beszolas tole
  // balra, a belepesi oldal fele, ugyanazon a padlo-szinten (yFrac 0.79,
  // ami ennel a rajznal jobban illik, mint a tobbi zona 0.62/0.7/0.65-e).
  // companionPrompt/minecraftPrompt: a 2. zona folyoso-szakaszan NEM
  // Kecske (Erik) all a szokasos "kecske${i}" hotspoton, hanem Caine --
  // NINCS kulon allo-sprite-ja (a hattergrafikan mar rajta van, ld. lejjebb
  // a hotspot-epitesnel), csak a nevehez tartozo interakcios terulet
  // (prompt+radius) marad meg ezen a poziciodon. Beszelgetes: CAINE_DIALOGUE_LINES.
  // A "minecraft${i}" nema beszolas szovege is csere (ld. minecraftPrompt),
  // a pozicioja valtozatlan maradt.
  const ZONE2_LAYOUT = {
    doorXFrac: (CORRIDOR_SEGMENT_OFFSETS[1] + 660) / CORRIDOR_TOTAL_WIDTH,
    doorYFrac: 0.90,
    companionXFrac: (CORRIDOR_SEGMENT_OFFSETS[1] + 540) / CORRIDOR_TOTAL_WIDTH,
    companionYFrac: 0.65,
    companionPrompt: "▶ Enter: odaszólsz Caine-nek",
    minecraftXFrac: (CORRIDOR_SEGMENT_OFFSETS[1] + 252) / CORRIDOR_TOTAL_WIDTH,
    minecraftYFrac: 0.79,
    minecraftPrompt: "* Bubble Fight... \n ezaz buborékokat pukkasztunk! :)",
    // A masodik Caine-hotspot (ajandek-visszaszamlalo bevezetoje) -- a
    // felhasznalo kerese szerint pontosan 100px-szel jobbra a companion-
    // hotspottol, ugyanazon a padlo-szinten (yFrac valtozatlan).
    giftXFrac: (CORRIDOR_SEGMENT_OFFSETS[1] + 540 + 220) / CORRIDOR_TOTAL_WIDTH,
    giftYFrac: 0.65,
    giftPrompt: "▶ Enter: odaszólsz Caine-nek",
  };

  // Caine (2. zona) bevezeto beszelgetese -- tobb, valtakozo beszelos sor,
  // ld. showOverworldDialogue()/KONNYLENY_REUNION_LINES mintajat. Caine
  // sorai a placeholder portrejat kapjak (meg mindig nincs vegleges "_talk"
  // kepe), a jatekos ("TE") es Jax sorai portrait nelkul jelennek meg --
  // Jax-nal, mivel nincs sajat portreja/allo-sprite-ja es nem a jatekos
  // beszel, a szoveg elejen egy rovid attribúcio jelzi, ki szolal meg.
  const CAINE_DIALOGUE_LINES = [
    {
      speaker: "CAINE",
      portrait: "assets/sprites/enemy_bohoc_placeholder_talk.png",
      text: [
        "Hölgyeim és uraim, illetve te: ISTEN HOZOTT A DIGITÁLIS CIRKUSZBAN!",
        "Egy olyan helyen, ahol a szórakozásnak soha nem szakad vége!",
        "És amikor azt mondom, soha, akkor úgy értem, hogy a Kernel már régen törölte a kijáratot! Hahaha!",
      ],
    },
    { portrait: null, text: "Szia Caine, ugye ki tudunk jutni Fekivel ebből a világból? Nekem szeptembertől suli." },
    {
      speaker: "CAINE",
      portrait: "assets/sprites/enemy_bohoc_placeholder_talk.png",
      text: "Suli? Suli?! Ó, te édes! Itt a Digitális Cirkuszban a tanulásnak is megvan a maga... kreatív módja!",
    },
    {
      portrait: null,
      text: [
        "Suli... komolyan Caine, nem akarok itt megkattani teljesen az elkövetkező tízmilliárd évben.",
        "A matekóra gondolom itt úgy néz ki, hogy megpróbáljuk kitalálni, melyik textúra nem fog megölni, ha hozzáérsz.",
      ],
    },
    {
      speaker: "CAINE",
      portrait: "assets/sprites/enemy_bohoc_placeholder_talk.png",
      text: [
        "Ne aggódj kölyök a suli miatt!",
        "Itt nincsenek osztályzatok, csak válságok, amikért nem jár év végi bizonyítvány.",
        "Viszont lesz egy örökös glitch a szemed sarkában!",
        "Itt minden nap egy Absztrakciós Tanévnyitó!",
      ],
    },
    {
      speaker: "JAX",
      portrait: "assets/sprites/enemy_jax_placeholder_talk.png",
      text: [
        "* Valahonnan a háttérből: Én passzolom. Inkább nézem, ahogy az új gyerek megpróbálja...",
        "...megoldani a másodfokú egyenletet egy Abstract Horror elől menekülve. Ez a kedvenc 'tantárgyam'!",
      ],
    },
    { portrait: null, text: "...Asszem inkább mégiscsak maradok a sima matekóránál, na sziasztok." },
  ];

  // A masodik Caine-hotspot (ld. ZONE2_LAYOUT giftXFrac/giftYFrac) --
  // Caine bejelenti a szulinapi ajandekot, majd a beszelgetes vegen
  // (onDone) inditja a startGiftCountdown() minijatekot. `zone2GiftOutcome`
  // egyszeri esemenykent zarja le a keresest (ld. lejjebb) -- ujboli
  // odalepeskor mar csak egy rovid, lezaro sor jon (CAINE_GIFT_WON_LINE /
  // CAINE_GIFT_LOST_LINE), nem indul ujra a visszaszamlalas.
  const CAINE_GIFT_DIALOGUE_LINES = [
    {
      speaker: "CAINE",
      portrait: "assets/sprites/enemy_bohoc_placeholder_talk.png",
      text: [
        "Ó, hallom ez egy különleges 13-as szám!",
        "A bűvös, a misztikus, a... kódolt balszerencse!",
        "Boldog születésnapot, kis user!",
      ],
    },
    { portrait: null, text: "Köszi, Caine! Remélem, az ajándék nem egy újabb krízis." },
    {
      speaker: "CAINE",
      portrait: "assets/sprites/enemy_bohoc_placeholder_talk.png",
      text: [
        "Ne légy már ilyen low hangulatban!",
        "Eldugtam neked egy ajándékot a szobádban, egy nagy zöld dobozban. Keresd meg!",
        "De vigyázz: ha rossz helyre nyúlsz, a 13-as szám törvénye szerint...",
        "...a szobád textúrája átvált egy végtelen, hústorony-labirintusba!",
      ],
    },
    {
      speaker: "JAX",
      portrait: "assets/sprites/enemy_jax_placeholder_talk.png",
      text: [
        "*Jax: Ne is figyeld, csak próbálja beállítani a nehézséget.",
        "Ha megtalálod, talán nem omlik össze a valóság. De ne fogadj rá nagy tétben!",
      ],
    },
    {
      speaker: "CAINE",
      portrait: "assets/sprites/enemy_bohoc_placeholder_talk.png",
      text: [
        "TIK-TAK, KÖLYÖK! Visszaszámlálás elindult, és ha nem találod meg fél \"stack\" másodperc alatt...",
        "..az ajándékod helyett egy absztrakciós tortát kapsz, ami... nos, te is tudod...",
        "...mi történik azokkal, akik túl sokat falatoznak belőle!",
        "JÓ VADÁSZATOT!",
      ],
    },
  ];
  const CAINE_GIFT_WON_LINE = {
    speaker: "CAINE",
    portrait: "assets/sprites/enemy_bohoc_placeholder_talk.png",
    text: "Az ajándékod már megvan, kölyök. Mit akarsz még tőlem?",
  };
  const CAINE_GIFT_LOST_LINE = {
    speaker: "CAINE",
    portrait: "assets/sprites/enemy_bohoc_placeholder_talk.png",
    text: "Feki most már az enyém. Ne is próbáld visszaszerezni!",
  };
  // A CAINE_DIALOGUE_LINES-t (bevezeto) adó hotspot ujboli megszolitasakor
  // ez a rovid "lezaro" sor jon, ahelyett hogy ujra lejatszana a teljes
  // bevezetot -- a CAINE_GIFT_WON_LINE/CAINE_GIFT_LOST_LINE parja, ld.
  // handleCaineHotspot().
  const CAINE_INTRO_REPEAT_LINE = {
    speaker: "CAINE",
    portrait: "assets/sprites/enemy_bohoc_placeholder_talk.png",
    text: "Nahh mivan, meguntad a sulit?",
  };
  // A 2. zonaban KET Caine-hotspot van (companion + gift, ld. ZONE2_LAYOUT),
  // de a jatekos nem tudhatja elore, melyiket eri el eloszor setalva --
  // ezert NEM a fizikai pozicio donti el, melyik beszelgetes jon, hanem a
  // SORREND: amelyik hotspotot a jatekos ELSOKENT szolitja meg, az adja a
  // bevezeto beszelgetest (CAINE_DIALOGUE_LINES), a MASIK (meg nem
  // hasznalt) hotspot pedig a szulinapi ajandek-beszelgetest + visszaszamlalot
  // (CAINE_GIFT_DIALOGUE_LINES/startGiftCountdown). Ugyanannak a hotspotnak
  // ujboli megszolitasa mar csak egy rovid, lezaro sort ad (ld. fent/lejjebb).
  let caineIntroHotspotId = null;
  function handleCaineHotspot(hotspotId) {
    if (caineIntroHotspotId === null) {
      caineIntroHotspotId = hotspotId;
      showOverworldDialogue(CAINE_DIALOGUE_LINES);
      return;
    }
    if (hotspotId === caineIntroHotspotId) {
      corridorFlavor(CAINE_INTRO_REPEAT_LINE.portrait, CAINE_INTRO_REPEAT_LINE.text, { speaker: "CAINE" });
      return;
    }
    if (zone2GiftOutcome === "won") {
      corridorFlavor(CAINE_GIFT_WON_LINE.portrait, CAINE_GIFT_WON_LINE.text, { speaker: "CAINE" });
    } else if (zone2GiftOutcome === "lost") {
      corridorFlavor(CAINE_GIFT_LOST_LINE.portrait, CAINE_GIFT_LOST_LINE.text, { speaker: "CAINE" });
    } else {
      showOverworldDialogue(CAINE_GIFT_DIALOGUE_LINES, startGiftCountdown);
    }
  }
  const GIFT_COUNTDOWN_START = 32;
  // null (meg nincs eldontve) | "won" | "lost" -- ld. startGiftCountdown().
  let zone2GiftOutcome = null;
  // Igazra valtozik, ha a jatekos elveszti az ajandek-keresest -- Feki
  // (a folyoso kovető NPC-je) ekkor VEGLEGESEN eltunik: azonnal a
  // jelenlegi jelenetbol (Overworld.removeFollower()) ES minden kesobbi
  // buildCorridorScene()-bol is (ld. a scene.follower felteteles
  // hozzaadasat lejjebb).
  let fekiGone = false;
  let giftCountdownTimer = null;

  // A 2. zona ajandek-visszaszamlalo minijateka -- a CAINE_GIFT_DIALOGUE_LINES
  // vegen (onDone) indul. GIFT_COUNTDOWN_START mp-rol indul, masodpercenkent
  // csokken es "coin" hangot jatszik. A "MEGVAN!" gombra kattintva gyozelem
  // ("won" hang, zone2GiftOutcome="won"), ha lejar az ido, vesztes ("awkward"
  // hang, zone2GiftOutcome="lost", Feki azonnal es vegleg eltunik).
  function startGiftCountdown() {
    Overworld.pause();
    let remaining = GIFT_COUNTDOWN_START;
    giftCountdownNumber.textContent = String(remaining);
    giftCountdownBox.classList.remove("hidden");

    // Enter/szokoz is megnyomja a "MEGVAN!" gombot, nem csak kattintas --
    // csak a visszaszamlalas aktiv ideje alatt figyelunk erre a billentyure,
    // finish()-ben levesszuk, nehogy kesobb (mas kepernyon) is elsuljon.
    function handleKey(e) {
      const k = e.key.toLowerCase();
      if (k === "enter" || k === " ") {
        e.preventDefault();
        giftCountdownButton.click();
      }
    }
    window.addEventListener("keydown", handleKey);

    function finish(outcome) {
      window.removeEventListener("keydown", handleKey);
      clearInterval(giftCountdownTimer);
      giftCountdownTimer = null;
      giftCountdownBox.classList.add("hidden");
      zone2GiftOutcome = outcome;
      if (outcome === "won") {
        Engine.playSound("won");
        Overworld.resume();
      } else {
        Engine.playSound("awkward");
        fekiGone = true;
        // A felhasznalo kerese szerint Feki csak AKKOR tunjen el (a
        // szoba->folyoso atvezetesnel mar hasznalt glitch-hangulattal, ld.
        // Overworld.removeFollowerWithEffect() es a followerGlitch
        // keyframes-t style.css-ben), amikor a "GAME OVER..." uzenetet mar
        // elolvasta es Enterrel/kattintassal bezarta a jatekos -- nem
        // korabban, egyideju timerrel (az elozo valtozat ezt probalta, de a
        // popup esetleg eltakarta/elvonta a figyelmet Feki poziciojarol,
        // mielott a glitch lezajlott volna). A popup bezarasa UTAN is meg
        // 1000ms-et var, hogy eszreveheto legyen a pillanat, amikor Feki
        // "utoljara" meg ott all/kovet, mielott elkezdene glitchelni.
        Overworld.showCornerPopup(
          "assets/sprites/enemy_bohoc_placeholder_talk.png",
          "GAME OVER, KÖLYÖK: mostantól az én digitális háziállatom Feki.",
          () => {
            Overworld.removeFollowerWithEffect(1000);
            Overworld.resume();
          },
          undefined,
          { speaker: "CAINE" }
        );
      }
    }

    giftCountdownButton.onclick = () => {
      if (giftCountdownTimer == null) return;
      finish("won");
    };

    giftCountdownTimer = setInterval(() => {
      remaining--;
      Engine.playSound("coin");
      giftCountdownNumber.textContent = String(remaining);
      if (remaining <= 0) finish("lost");
    }, 1000);
  }

  // opts = { boxWidth?, portraitSize? } -- tovabbadva az Overworld.showCornerPopup()-nak,
  // ld. ott. Egy companionChat-bejegyzes (js/zones.js) sajat boxWidth/portraitSize
  // mezojevel kerulhet be ide, ld. a kecske${i} hotspot onInteract()-jet lejjebb.
  function corridorFlavor(portraitSrc, text, opts) {
    Overworld.pause();
    Overworld.showCornerPopup(portraitSrc, text, () => Overworld.resume(), undefined, opts);
  }

  // A `roomMusic` hangerejet fokozatosan 0-ra viszi `ms` alatt, majd
  // szuneteltet -- ld. playZone4Finale() (a felhasznalo kerese szerint a
  // "System Reset..." felirat megjelenesekor kell elkezdenie halkulni).
  function fadeOutMusic(audio, ms) {
    const startVolume = audio.volume;
    const startTime = performance.now();
    function step(now) {
      const t = Math.min(1, (now - startTime) / ms);
      audio.volume = startVolume * (1 - t);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        audio.pause();
      }
    }
    requestAnimationFrame(step);
  }

  // A zaro (Minecraft-temaju) zona teljes jelenete -- a felhasznalo kerese
  // szerint a folyoson ("az alaphelyen") jatszodik le, NEM a harc-
  // kepernyon: Kecske+Tenna beszol, aztan Apa dramai belepovel felbukkan a
  // folyoson (Overworld.addSprite()), a tobbi parbeszed utana jon (nincs
  // kulon "FIGHT" menu-valasztas, a "Nahh jó, ezt nem hagyom..." TE-sor
  // utan kozvetlenul jon a kepfelvillanas -- a dobozt elotte explicit
  // elrejtjuk, hogy a szereplok/kep lathatok maradjanak). A beszelgetesek a
  // MEGSZOKOTT, dialogue_box_frame.png-s dobozban jelennek meg
  // (`overworldDialogueBox`/`overworldDialogueTarget`, ld. fent, FELUL
  // pozicionalva -- ld. style.css #overworld-dialogue-box -- hogy ne
  // takarja ki a szereplo-sprite-okat), NEM a kisebb corner-popup
  // buborekban -- a felhasznalo kifejezett kerese szerint, jobb
  // olvashatosag miatt. Ehhez a js/battle.js showSequence()-et hivjuk
  // ujra (exportalva a Battle publikus API-jan), a sajat dobozunkkal --
  // ugyanaz a gepelos logika/kattintasos-tovabblepes, mint a harci
  // dialogusban (ld. js/battle.js initDom() `overworldDialogueBox`
  // click-listenerjet). A jatekos mozgasa a teljes jelenet alatt
  // Overworld.pause()-zal zarolva marad (nem kell ujra meghivni szakaszok
  // kozott, mert showSequence() -- ellentetben a korabban hasznalt
  // showOverworldDialogue()-vel -- nem resume()-ol soha). A vegen a
  // js/battle.js showCenterImage()/showStyleTag()/playFinalCinematic()-jat
  // is ujrahasznaljuk, a sajat overworld-dom-elemekkel. A `playFinalCinematic()`
  // zaro sora utan (a felhasznalo kerese szerint) Enterrel/kattintassal kell
  // tovabblepni, majd a teljes oldal ujratoltodik (window.location.reload())
  // -- ez NEM csak a cimkepernyot mutatja meg ujra, hanem a bongeszo-oldalt
  // is teljesen ujrainditja, igy minden JS-allapot (zone1Defeated,
  // zone2Spared, stb.) es a lejatszott zene is friss/nullazott lesz,
  // ugyanugy, mintha a jatekos manualisan frissitette volna az oldalt.
  async function playZone4Finale(zone, apaXFrac, apaYFrac) {
    Overworld.pause();

    await Battle.showSequence(zone.intro, overworldDialogueTarget, overworldDialogueBox);

    // ZONE4_APA_SIZE (fent) az allo Apa/Apa2 alapmerete -- a nyolc
    // `apa_world_transition_0N.png` kocka ALATTA a dialogus-tartas kozben
    // (`onTransitionFrame`) a nagyobb `ZONE4_APA_TRANSITION_SIZE`-ra no,
    // majd az atvaltas vegen (`onTransitionEnd`) visszaall erre az
    // alapmeretre -- ld. a fenti konstans-blokk megjegyzeset. `noFloat:
    // true`, hogy NE lebegjen fel-le (ld. .overworld-npc npcFloat-
    // animaciojat) -- Apa "dramai belepoje" alljon stabilan, ne bobbing-
    // oljon, mint egy sima NPC.
    Overworld.addSprite("zone4-apa", {
      src: zone.enemy.sprite,
      xFrac: apaXFrac,
      yFrac: apaYFrac,
      w: ZONE4_APA_SIZE.w,
      h: ZONE4_APA_SIZE.h,
      noFloat: true,
    });
    await Battle.showSequence(zone.enemy.introLines, overworldDialogueTarget, overworldDialogueBox);

    overworldDialogueBox.classList.add("hidden");
    await Battle.showCenterImage(overworldImageFlash, zone.fightImage.src, zone.fightImage.duration, zone.fightImage.sound);
    await Battle.showStyleTag(overworldStyleTag, zone.styleTag, zone.styleTagDuration);

    await Battle.showSequence(zone.victoryLines, overworldDialogueTarget, overworldDialogueBox);
    overworldDialogueBox.classList.add("hidden");
    Overworld.removeSprite("zone4-apa");

    // A felhasznalo kerese szerint a "System Reset..." felirat
    // megjelenesevel egy idoben (kb. 2mp alatt) elhalkul a hatterzene.
    await new Promise((resolve) =>
      Battle.playFinalCinematic(overworldEndingDom, zone.finalCinematic, resolve, () => fadeOutMusic(roomMusic, 2000))
    );

    window.location.reload();
  }

  function buildCorridorScene(spawnAfterDoorIndex) {
    const hotspots = [];
    const decorations = [];
    ZONES.forEach((zone, i) => {
      const doorFrac = DOOR_FRACTIONS[i];
      // A 2. zona (Cirkusz) uj hattere zsufoltabb/aszimmetrikus, sajat
      // kezzel hangolt pozicio-keszlettel (ZONE2_LAYOUT) -- a masik harom
      // zona valtozatlanul a generikus doorFrac-bol szarmaztatott
      // eltolast hasznalja (ld. lejjebb).
      const layout = i === 1 ? ZONE2_LAYOUT : null;
      const chat = zone.companionChat || [];
      // Egyelore csak Kecske all a folyoson zonankent -- Tenna/Queen
      // hotspotja ideiglenesen ki van veve (osszevisszasag lett volna
      // tobb NPC-vel egy helyen), a companionChat[1]/[2] szoveguk
      // (js/zones.js) valtozatlanul megvan, csak jelenleg nincs hozza
      // sprite/hotspot a folyoson. Ha visszateszed oket, a fenti (mar
      // torolt) tenna${i}/queen${i} blokkok mintajat kovetheted.
      if (chat[0]) {
        const companionXFrac = layout ? layout.companionXFrac : doorFrac - 0.06;
        const companionYFrac = layout ? layout.companionYFrac : 0.7;
        const companionPrompt = layout ? layout.companionPrompt : "▶ Enter: odaszólsz Eriknek";
        const companionHotspot = {
          id: `kecske${i}`,
          // Ez az INTERAKCIOS terulet kozeppontja (radius, prompt-felugras)
          // -- nem feltetlenul ugyanott van, ahol Kecske ALL, ld. lejjebb.
          xFrac: companionXFrac,
          yFrac: companionYFrac,
          radius: 45,
          prompt: companionPrompt,
        };
        if (layout) {
          // A 2. zonaban Caine mar ott van a hattergrafikan -- nincs kulon
          // allo-sprite, csak ez a nevehez tartozo interakcios terulet
          // marad meg itt. Melyik beszelgetes jon (bevezeto vagy ajandek),
          // azt a handleCaineHotspot() donti el a megszolitas SORRENDJE
          // alapjan, nem ez a konkret hotspot -- ld. ott.
          companionHotspot.onInteract = () => handleCaineHotspot(companionHotspot.id);
        } else {
          companionHotspot.sprite = {
            src: "assets/sprites/kecske_placeholder.png",
            // matchPlayerSize: ugyanakkora, mint a jatekos-sprite (ld.
            // overworld.js); noFloat: nem lebeg fel-le (nincs npcFloat
            // animacio) -- ld. Hotspot-dokumentacio az overworld.js elejen.
            matchPlayerSize: true,
            noFloat: true,
            // A KARAKTER TENYLEGES, RAJZOLT POZICIOJA -- EZT allitsd, ha
            // csak azt akarod mozgatni, hogy Kecske hol all a folyoson (a
            // fenti xFrac/yFrac addig valtozatlan maradhat, az csak az
            // interakcios teruletet mozgatja).
            xFrac: companionXFrac,
            yFrac: companionYFrac,
          };
          // A chat[0].boxWidth/portraitSize (ha meg van adva a js/zones.js-ben)
          // ennel a konkret sornal szelesebb dobozt/nagyobb portrét ad --
          // ld. Overworld.showCornerPopup() opts-dokumentaciojat.
          companionHotspot.onInteract = () =>
            corridorFlavor("assets/sprites/kecske_placeholder_talk.png", chat[0].text, {
              boxWidth: chat[0].boxWidth,
              portraitSize: chat[0].portraitSize,
              speaker: "KECSKE",
            });
        }
        hotspots.push(companionHotspot);

        hotspots.push({
          id: `minecraft${i}`,
          // Ez az INTERAKCIOS terulet kozeppontja (radius, prompt-felugras)
          // -- nem feltetlenul ugyanott van, ahol Kecske ALL, ld. lejjebb.
          xFrac: layout ? layout.minecraftXFrac : doorFrac - 0.13,
          yFrac: layout ? layout.minecraftYFrac : 0.65,
          radius: 45,
          prompt: layout ? layout.minecraftPrompt : "* Minecraft... mi más :)",
        });
      }
      if (layout) {
        // Masodik Caine-hotspot, csak a 2. zonaban -- ld. handleCaineHotspot()
        // a bevezeto/ajandek-beszelgetes sorrend-fuggo eldontesehez.
        const giftHotspotId = `caine_gift${i}`;
        hotspots.push({
          id: giftHotspotId,
          xFrac: layout.giftXFrac,
          yFrac: layout.giftYFrac,
          radius: 45,
          prompt: layout.giftPrompt,
          onInteract: () => handleCaineHotspot(giftHotspotId),
        });
      }
      // A 2. zona (Cirkusz) Bubble-je mar legyozve (kipukkant) -- nincs
      // tobbe hotspot/harc itt, csak egy statikus tocsa-diszites
      // (puddle.png) marad a helyen, ugyanaz a kep, mint amire a harc
      // vegen (ZONE_2.ending.fight.enemyField) valt. A `decorations`
      // (nem hotspot-sprite) SZANDEKOSAN nem lebeg -- ld. .overworld-decor
      // a style.css-ben, nincs npcFloat-animacioja.
      if (i === 1 && zone2Defeated) {
        decorations.push({
          xFrac: layout.doorXFrac,
          yFrac: layout.doorYFrac,
          w: 140,
          h: 57,
          src: "assets/sprites/puddle.png",
        });
        return;
      }
      const doorHotspot = {
        id: `door${i}`,
        xFrac: layout ? layout.doorXFrac : doorFrac + 0.005,
        yFrac: layout ? layout.doorYFrac : 0.62,
        radius: 35,
        // auto: true -- nincs Enter/felirat, a puszta odasetalas belepteti
        // a jatekost a zonaba, egy elsotetedes-atmenettel (ld.
        // enterZoneWithFade()). Ld. meg overworld.js Hotspot-dokumentaciojat.
        auto: true,
      };
      if (i === 0) {
        // Az 1. zona ajtaja NEM kozvetlenul a harcba visz, hanem egy kulon
        // bevezeto szobaba (isaac_room.png, ld. buildIsaacRoomScene()) --
        // ott all kulon hotspotkent a zona ellenfele, onnan indul a
        // tenyleges harc, es a macska (follower) sem kovet be oda. A
        // tobbi zona ajtaja valtozatlanul kozvetlenul a harcba visz.
        doorHotspot.onInteract = () => {
          Overworld.pause();
          roomMusic.pause();
          isaacMusic.currentTime = 0;
          isaacMusic.play().catch(() => {});
          fadeToScene(buildIsaacRoomScene());
        };
      } else if (i === 1 && zone2Spared) {
        // A 2. zona SPARE-utani viszontlatasa -- mar nem `auto`, kell hozza
        // Enter (mint egy sima NPC-beszelgetesnel), es NEM inditja ujra a
        // harcot (ld. zone1 hasonlo mintajat az isaac-szobaban).
        doorHotspot.auto = false;
        doorHotspot.prompt = "▶ Enter: odaszólsz Bubble-nek";
        doorHotspot.sprite = { src: zone.enemy.sprite, w: 48 };
        doorHotspot.onInteract = () => {
          showOverworldDialogue(BUBBLE_REUNION_LINES);
        };
      } else if (i === 1) {
        // A 2. zona (Cirkusz, Bubble) ajtaja -- meg fegyvertelen/nem
        // spared allapotban -- ugyanugy zenet valt, mint az 1. zona
        // Isaac-szoba-ajtaja (ld. fent), csak roomMusic->bubbleMusic
        // iranyban. Az enterZone() callback-je valtja vissza a harc utan.
        doorHotspot.sprite = { src: zone.enemy.sprite, w: 48 };
        doorHotspot.onInteract = () => {
          Overworld.pause();
          roomMusic.pause();
          bubbleMusic.currentTime = 0;
          bubbleMusic.play().catch(() => {});
          enterZoneWithFade(i);
        };
      } else if (i === ZONES.length - 1) {
        // A zaro (Minecraft-temaju) zona MAR NEM a harc-kepernyore visz --
        // a felhasznalo kerese szerint az egesz zaro-jelenet a folyoson
        // ("az alaphelyen") jatszodik le, ld. playZone4Finale(). Nincs allo
        // ellenfel-sprite a hotspoton (Apa "dramai belepoje" dinamikusan
        // bukkan fel a jelenet kozepen, nem all mar ott a jatekos
        // belepese elott). Az id szandekosan "final" (nem a generikus
        // `door${i}`), hogy a felhasznalo kerese szerint egyedi es
        // konnyen visszakereshetó legyen a kodban. Az xFrac/yFrac/radius
        // is szandekosan sajat (KULON a fenti alapertelmezett
        // doorFrac+0.005/0.62/35-tol, amit kulonben az 1. zona ajtaja is
        // hasznalna) -- igy szabadon hangolhato anelkul, hogy barmelyik
        // masik zona ajtajat erintene.
        doorHotspot.xFrac = doorFrac - 0.03;
        doorHotspot.yFrac = 0.82;
        doorHotspot.radius = 55;
        doorHotspot.id = "final";
        doorHotspot.onInteract = () => {
          Overworld.pause();
          playZone4Finale(zone, doorHotspot.xFrac, doorHotspot.yFrac);
        };
      } else {
        doorHotspot.sprite = { src: zone.enemy.sprite, w: 48 };
        doorHotspot.onInteract = () => {
          Overworld.pause();
          enterZoneWithFade(i);
        };
      }
      hotspots.push(doorHotspot);
    });

    const playerSpawn = () => ({
      xFrac: spawnAfterDoorIndex == null ? 0.03 : Math.min(0.7, DOOR_FRACTIONS[spawnAfterDoorIndex] + 0.005),
      // 0.78 -> 0.82: a 2. zona ajtaja korul (xFrac ~0.39) a walkBounds
      // egyetlen ide vonatkozo savja (xMin 0.258-0.45) yMin-je 0.8, tehat
      // 0.78-nal a jatekos a savon KIVUL spawnolt volna vissza a harc utan
      // -- ld. a walkBounds tombot lejjebb.
      yFrac: 0.82,
    });

    const scene = {
      bgSrc: CORRIDOR_ZONE_BACKGROUNDS,
      // A szobahoz kepest kicsit kisebb jatekos-sprite a folyoson (ld.
      // overworld.js scene.playerScale) -- tavlati-erzetet ad, es jobban
      // illeszkedik a folyoso tagasabb, "kifele vezeto" hangulatahoz.
      playerScale: 0.75,
      walkBounds: [
      // A lenti fraction-ertekek a regi, 4-zonas (3. zona meg benne volt)
      // vilaghoz voltak szemre hangolva, ABSZOLUT pixel-pozicioként ertve
      // (fraction * regi 4526px-es osszszelesseg). A 3. zona kivetelekor a
      // vilag 1100px-szel rovidult, ES a teljes-szelesseg (a nevezo) is
      // megvaltozott -- ezert nem lehetett egyszeruen megtartani a regi
      // tortszamokat: mindegyiket ujraszamoltuk (regi_fraction*4526px,
      // majd -- ha a 3. zona utani, azaz a regi 4. zona teruleten volt --
      // -1100px a kiesett szegmensert, vegul /3426px, az uj osszszelesseg)
      // ugy, hogy az 1-2. zonan beluli falak/oszlopok UGYANOTT maradjanak
      // (azok nem valtoztak), a 4. (immar utolso) zona pedig kozvetlenul a
      // 2. zona utan kovetkezzen. Ha a zona-hatterek szelessege megint
      // valtozik, ezt ujra kell hangolni.
      { xMin: 0.001, xMax: 0.342, yMin: 0.7, yMax: 0.88 },
      // Keskeny "felvezeto sav" az 1. zona ajtajahoz (yFrac 0.62), ami a
      // fenti fo sav (yMin 0.7) felett van -- DOOR_FRACTIONS[0]-hoz kepest
      // relativ eltolassal szamolva, hogy a zona1 ajtaja korul maradjon,
      // barhogy is alakul a tobbi zona hattereinek szelessege (ld. fent).
      { xMin: DOOR_FRACTIONS[0] - 0.002, xMax: DOOR_FRACTIONS[0] + 0.01, yMin: 0.65, yMax: 0.8 },
      { xMin: 0.341, xMax: 0.594, yMin: 0.8, yMax: 0.88 },
      { xMin: 0.454, xMax: 0.473, yMin: 0.65, yMax: 0.88 },
      { xMin: 0.542, xMax: 0.575, yMin: 0.65, yMax: 0.88 },
      { xMin: 0.581, xMax: 0.95, yMin: 0.8, yMax: 0.88 },
      { xMin: 0.65, xMax: 0.95, yMin: 0.6, yMax: 0.85 },
      ],
      spawn: playerSpawn,
      hotspots,
      decorations,
    };
    // Feki a folyoson kovető NPC-kent jelenik meg (a szobaban viszont
    // csak statikusan ul az ablakban, ld. ROOM_SCENE.decorations) --
    // ld. overworld.js scene.follower dokumentaciojat. A kezdopozicioja
    // egy kicsit a jatekos spawn-pontja mogott van, nem pontosan azon.
    // Ha `fekiGone` igaz (a jatekos elvesztette a 2. zona ajandek-
    // keresset), a follower mezo teljesen KIMARAD -- innentol egyetlen
    // buildCorridorScene()-hivas sem hozza vissza Fekit (ld. CLAUDE.md).
    if (!fekiGone) {
      scene.follower = {
        spawn: () => {
          const s = playerSpawn();
          return { xFrac: Math.max(0, s.xFrac - 0.02), yFrac: s.yFrac };
        },
        // A doboz merete a legnagyobb (jump, 34x26) kockahoz igazitva, kicsit
        // ranyagva -- a kisebb kockak (ulo 24x24, futo 32x24) object-fit:
        // contain-nel, torzitas nelkul, aljra igazitva fernek bele.
        w: 34,
        h: 30,
        sitFrames: [
          "assets/sprites/cat/feki_01.png",
          "assets/sprites/cat/feki_02.png",
          "assets/sprites/cat/feki_03.png",
          "assets/sprites/cat/feki_04.png",
        ],
        runFrames: [
          "assets/sprites/cat/feki_run_01.png",
          "assets/sprites/cat/feki_run_02.png",
          "assets/sprites/cat/feki_run_03.png",
          "assets/sprites/cat/feki_run_04.png",
        ],
        jumpFrames: [
          "assets/sprites/cat/feki_jump_01.png",
          "assets/sprites/cat/feki_jump_02.png",
          "assets/sprites/cat/feki_jump_03.png",
          "assets/sprites/cat/feki_jump_04.png",
        ],
      };
    }
    return scene;
  }

  // Az 1. zona bevezeto kis-szobaja (isaac_room.png) -- a folyoso 1. zona
  // ajtajan belepve ide jutunk (ld. buildCorridorScene() door0 hotspotjat),
  // nem kozvetlenul a harcba. Egyetlen kepernyot toltő szoba, mint a
  // ROOM_SCENE -- csak alul, a bejarati ajton keresztul lehet visszajutni a
  // folyosora. Szandekosan NINCS `follower` mezoje, igy a macska nem kovet
  // be ide (ld. overworld.js scene.follower dokumentaciojat -- follower
  // hianyaban egyszeruen nincs kovető NPC). Az xFrac/yFrac ertekek szemre
  // vannak belőve a kep sarokban lévő ajtonyilasahoz -- ha a kep valtozik,
  // ellenorizd ujra (ld. CLAUDE.md "Ismert korlatok").
  // Igazra valtozik, ha az 1. zona harca FIGHT-kimenetellel zarult (ld. az
  // enterZone() callback-jenek result.roomDecoration agat) -- ekkor a
  // Konny-leny "marad utana" (ld. js/zones.js ZONE_1.ending.fight), es a
  // buildIsaacRoomScene() ujboli meghivasakor (akar a folyoso ajtajan
  // visszalepve is) mar nem az elo ellenfel-hotspot, hanem egy statikus
  // "die" sprite-diszites jelenik meg a helyen.
  let zone1Defeated = false;
  // Igazra valtozik, ha az 1. zona harca SPARE-kimenetellel zarult (ld. az
  // enterZone() callback-jenek result.outcome agat) -- ekkor a Konny-leny
  // tovabbra is ott all a szobaban, de mar csak egy rovid, baratsagos
  // "viszontlatas" beszelgetest ad (KONNYLENY_REUNION_LINES), harc nelkul.
  let zone1Spared = false;

  // A 2. zona (Cirkusz) Bubble-hotspotjahoz -- ugyanaz a mintazat, mint
  // zone1Defeated/zone1Spared, de itt a folyoso FO ajtoja (nem egy kulon
  // szoba) valtozik: ld. buildCorridorScene() `i === 1` aganak
  // hotspot-epitesét. `zone2Defeated` eseten a Bubble-sprite/hotspot
  // teljesen eltunik (kipukkant); `zone2Spared` eseten megmarad, de mar
  // nem `auto` -- Enter-re egy rovid, harc nelkuli viszontlatast ad
  // (BUBBLE_REUNION_LINES).
  let zone2Defeated = false;
  let zone2Spared = false;

  // A SPARE utan visszatero jatekost fogado, egyszeri "viszontlatas"-jelenet
  // -- ld. buildIsaacRoomScene() isaac-room-enemy hotspotjat. Valtakozo
  // beszelok: a Konny-leny sorai kapnak portrét, a jatekos ("TE") sorai nem,
  // ugyanugy, mint a harci dialogusban.
  const KONNYLENY_REUNION_LINES = [
    {
      speaker: "KÖNNY-LÉNY",
      portrait: "assets/sprites/enemy_konnyleny_placeholder.png",
      text: "Te... te vagy az Bazsa. Azt hittem, a múltkori Combat után törlődtél, vagy legalábbis visszakerültem a Baseplate-re.",
    },
    {
      portrait: null,
      text: "Nyugi, nem jöttem harcolni. Csak... erre jártam. Emlékszem a múltkorira. Nem akartam, hogy a Debris alatt végezd.",
    },
    {
      speaker: "KÖNNY-LÉNY",
      portrait: "assets/sprites/enemy_konnyleny_placeholder.png",
      text: [
        "Jól bántál velem. Pedig akkor a Health pontjaim a nullához konvergáltak. Senki sem állt még meg így... mindenki csak a robuxot hajszolja.",
        "Te viszont adtál nekem egy kis vidámságot. Köszönöm. Azt a szintet... azt a közös Sessiont sosem felejtem el. Felvidítottál, pedig már majdnem kiakadtam.",
      ],
    },
    {
      portrait: null,
      text: "Örülök, hogy segített. Tudod, néha csak egy kis jófejség kell.",
    },
    {
      speaker: "KÖNNY-LÉNY",
      portrait: "assets/sprites/enemy_konnyleny_placeholder.png",
      text: [
        "Megyek, a Server Console jelzi, hogy lejár a limit, restartol a map. Vigyázz magadra!",
        "Remélem, legközelebb nem PvP módban találkozunk, hanem csak simán Social közegben. Köszi még egyszer, majd találkozunk!",
      ],
    },
  ];

  // A 2. zona SPARE-kimenetele utani, harc nelkuli viszontlatas -- ld.
  // zone2Spared/buildCorridorScene() `i === 1` aga. [SZERKESZTENDŐ]: a
  // felhasznalo csak annyit kert, hogy "legyen egy lezáró beszélgetés",
  // konkret szoveget nem adott meg, ez helyettesito.
  const BUBBLE_REUNION_LINES = [
    {
      speaker: "BUBBLE",
      portrait: "assets/sprites/enemy_bubble_placeholder_talk.png",
      text: "Ó, ismét ti vagytok! Nem pukkantam ki, ha esetleg aggódtatok -- csak egy kicsit lazulok itt tovább.",
    },
    { portrait: null, text: "Örülünk, hogy jól vagy, Bubble." },
    {
      speaker: "BUBBLE",
      portrait: "assets/sprites/enemy_bubble_placeholder_talk.png",
      text: "A rendszerfrissítés még mindig fut valahol a háttérben, de engem már nem zavar annyira. Jó utat a további zónákhoz!",
    },
  ];

  function buildIsaacRoomScene() {
    const zone = ZONES[0];
    const hotspots = [
      {
        id: "isaac-room-exit",
        xFrac: 0.5,
        yFrac: 0.96,
        radius: 28,
        auto: true,
        onInteract: () => {
          Overworld.pause();
          isaacMusic.pause();
          roomMusic.play().catch(() => {});
          fadeToScene(buildCorridorScene(0));
        },
      },
    ];
    if (!zone1Defeated && zone1Spared) {
      // A SPARE utani viszontlatas -- mar nem `auto`, kell hozza Enter (mint
      // egy sima NPC-beszelgetesnel), es NEM inditja ujra a harcot.
      hotspots.push({
        id: "isaac-room-enemy",
        xFrac: 0.5,
        yFrac: 0.25,
        radius: 40,
        prompt: "▶ Enter: odaszólsz a Könny-lénynek",
        sprite: { src: zone.enemy.sprite, w: 60 },
        onInteract: () => {
          showOverworldDialogue(KONNYLENY_REUNION_LINES);
        },
      });
    } else if (!zone1Defeated) {
      hotspots.push({
        id: "isaac-room-enemy",
        xFrac: 0.5,
        yFrac: 0.25,
        radius: 40,
        auto: true,
        sprite: { src: zone.enemy.sprite, w: 60 },
        onInteract: () => {
          Overworld.pause();
          enterZoneWithFade(0);
        },
      });
    }
    return {
      bgSrc: "assets/sprites/isaac_room.png",
      walkBounds: [
        { xMin: 0.12, xMax: 0.88, yMin: 0.2, yMax: 0.9 },
        { xMin: 0.46, xMax: 0.56, yMin: 0.86, yMax: 0.97 },
      ],
      // A spawn szandekosan JOVAL messzebb van az alabbi kilepo hotspottol,
      // mint annak radius-a -- kulonben belepeskor a jatekos mar eleve a
      // kilepo hotspot aktivalasi sugaraban allna, es az `auto` azonnal
      // (ugyanabban a kepkockaban) visszakuldene a folyosora, mielott
      // barmit lathatna a szobabol.
      spawn: { xFrac: 0.5, yFrac: 0.78 },
      hotspots,
      decorations: zone1Defeated
        ? [{ xFrac: 0.5, yFrac: 0.25, w: 70, h: 70, src: "assets/sprites/enemy_konnyleny_placeholder-die.png" }]
        : [],
    };
  }

  // --- Kepernyo-atmenetek -------------------------------------------------

  // Halk hatterzene a szoba-jelenethez -- a cimkepernyo START-gombjara indul
  // el (ez mar valodi felhasznaloi interakcio, nem utkozik a bongeszo
  // autoplay-szabalyaival), es hurokban szol.
  const roomMusic = new Audio("assets/music/DELTARUNE-Chapter-5_Media_KTOreU_aOr4_009_128k.mp3");
  roomMusic.loop = true;
  roomMusic.volume = 0.25;

  // Az Isaac-szoba (buildIsaacRoomScene()) sajat zeneje -- a szobaba
  // belepve leallitjuk (pause, NEM stop) a roomMusic-ot, es ezt inditjuk
  // el helyette; kilepeskor forditva. A `pause()` megtartja a `currentTime`-ot,
  // igy a roomMusic a kilepeskor pontosan onnan folytatodik, ahol
  // abbamaradt, kulon allapot-kezeles nelkul.
  const isaacMusic = new Audio("assets/music/Isaac_Innocence-Glitched-Binding-of-Isaac.mp3");
  isaacMusic.loop = true;
  isaacMusic.volume = 0.25;

  // A 2. zona (Cirkusz, Bubble) sajat zeneje -- ugyanaz a pause/resume
  // mintazat, mint az Isaac-szobanal (ld. fent): a 2. zona ajtajanal
  // (buildCorridorScene() `i === 1` aga) leallitjuk a roomMusic-ot es ezt
  // inditjuk el, a harc vegen (enterZone() callback-je) forditva.
  const bubbleMusic = new Audio("assets/music/The-Amazing-Digital-Circus-Main-Theme.mp3");
  bubbleMusic.loop = true;
  bubbleMusic.volume = 0.25;

  startBtn.addEventListener("click", () => {
    titleScreen.classList.add("hidden");
    overworldScreen.classList.remove("hidden");
    Overworld.start(ROOM_SCENE);
    roomMusic.play().catch(() => {});
  });

  // A glitch-atvezetes harom szakaszbol all, a style.css worldGlitch
  // keyframes-enek hosszahoz (GLITCH_SHAKE_MS) igazodva:
  //   1) szetesik/torodik a kep (worldGlitch animacio a #game-viewport-on --
  //      FONTOS: nem a #game-stage-en, annak mar van egy inline
  //      transform:scale()-je (updateScale()), amit egy ra kerulo
  //      CSS-animacio felulirna amig fut, es a jatek kizoomolna), a vegen
  //      mar majdnem fekete (brightness(0)).
  //   2) a #scene-fade fedo azonnal (atmenet nelkul) teljesen feketere
  //      valt, es ezt GLITCH_BLACK_HOLD_MS-ig tartja -- eközben csereli a
  //      JS a jelenetet a fekete mogott, lathatatlanul.
  //   3) a #scene-fade opacity-atmenettel (GLITCH_FADE_MS) eltunik, felfedve
  //      az uj (folyoso-)jelenetet.
  const GLITCH_SHAKE_MS = 900;
  const GLITCH_BLACK_HOLD_MS = 500;
  const GLITCH_FADE_MS = 500;

  function enterGlitchWorld() {
    Engine.playSound("glitchZap");
    gameViewport.classList.add("screen-glitch");
    setTimeout(() => Engine.playSound("zoneStart"), 550);
    setTimeout(() => {
      gameViewport.classList.remove("screen-glitch");
      sceneFade.classList.remove("scene-fade-in");
      sceneFade.classList.add("scene-fade-black");
      setTimeout(() => {
        roomHint.classList.add("hidden");
        Overworld.start(buildCorridorScene(null));
        sceneFade.classList.remove("scene-fade-black");
        sceneFade.classList.add("scene-fade-in");
        setTimeout(() => sceneFade.classList.remove("scene-fade-in"), GLITCH_FADE_MS);
      }, GLITCH_BLACK_HOLD_MS);
    }, GLITCH_SHAKE_MS);
  }

  restartBtn.addEventListener("click", () => {
    endScreen.classList.add("hidden");
    titleScreen.classList.remove("hidden");
  });

  // Az ajtohoz (zona-belepesi ponthoz) automatikusan odasetalva (ld. a
  // `door${i}` hotspot `auto:true`-ja a buildCorridorScene()-ben) ez a
  // fuggveny egy sima, atmenetes elsotetedessel (nem a glitch-atvezetes
  // "ugras a feketebe" jellegevel) valtja a folyosot a harc-kepernyore:
  // a #scene-fade opacity-atmenettel feketere valt (ZONE_FADE_OUT_MS),
  // eközben cserelodik a jelenet, majd ugyanugy opacity-atmenettel
  // (GLITCH_FADE_MS-t ujrahasznalva) fel is fedi a harcot.
  const ZONE_FADE_OUT_MS = 400;

  function enterZoneWithFade(zoneIndex) {
    sceneFade.classList.remove("scene-fade-in", "scene-fade-black");
    sceneFade.classList.add("scene-fade-out");
    setTimeout(() => {
      enterZone(zoneIndex);
      sceneFade.classList.remove("scene-fade-out");
      sceneFade.classList.add("scene-fade-in");
      setTimeout(() => sceneFade.classList.remove("scene-fade-in"), GLITCH_FADE_MS);
    }, ZONE_FADE_OUT_MS);
  }

  // Ugyanaz a sima elsotetedes-jelleg, mint enterZoneWithFade()-nel, de nem
  // valt kepernyot (az overworld-screen lathato marad) -- csak az Overworld
  // belso jelenete cserelodik a fekete mogott. Ezt hasznalja pl. a folyoso
  // <-> isaac-szoba valtas (ld. buildIsaacRoomScene()).
  function fadeToScene(sceneConfig) {
    sceneFade.classList.remove("scene-fade-in", "scene-fade-black");
    sceneFade.classList.add("scene-fade-out");
    setTimeout(() => {
      Overworld.start(sceneConfig);
      sceneFade.classList.remove("scene-fade-out");
      sceneFade.classList.add("scene-fade-in");
      setTimeout(() => sceneFade.classList.remove("scene-fade-in"), GLITCH_FADE_MS);
    }, ZONE_FADE_OUT_MS);
  }

  function enterZone(zoneIndex) {
    overworldScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    zoneBg.src = ZONES[zoneIndex].background || "";
    // Az enterZone()-t immar csak zone0 (1. zona, Isaac-szoba) es zone1 (2.
    // zona, Cirkusz) hivja -- a zaro (Minecraft-temaju, immar utolso) zona
    // mar nem megy at a Battle.start()-on/harc-kepernyon, ld. playZone4Finale()
    // a buildCorridorScene() dontesenel. Emiatt itt nincs tobbe "utolso zona
    // -> vég-képernyő" elagazas sem -- ha valaha egy jovobeli, tenylegesen
    // Battle.start()-tal zaro utolso zona kellene, ezt az agat vissza kell
    // tenni (ld. git-elozmeny).
    Battle.start(ZONES[zoneIndex], (result) => {
      gameScreen.classList.add("hidden");
      // A zona0 (1. zona) harca az Isaac-szobabol indult, sajat zeneevel --
      // gyozelem utan altalaban a folyosora terunk vissza, nem oda, ugyhogy
      // itt is vissza kell valtani a roomMusic-ra (ld. a door0/isaac-room-exit
      // hotspotok onInteract()-jenel levo megjegyzest).
      if (zoneIndex === 0) {
        isaacMusic.pause();
        roomMusic.play().catch(() => {});
        if (result && result.outcome === "spare") {
          zone1Spared = true;
        }
        if (result && result.roomDecoration) {
          // FIGHT-kimenetel: a Konny-leny "marad utana" -- meg egyszer
          // visszaterunk az Isaac-szobaba (a die-sprite statikus diszkent
          // latszik az egykori hotspot helyen), a jatekos onnan a mar
          // meglevo also kijarat-hotspoton keresztul setal ki a folyosora
          // (ld. buildIsaacRoomScene()).
          zone1Defeated = true;
          overworldScreen.classList.remove("hidden");
          Overworld.start(buildIsaacRoomScene());
          return;
        }
      }
      // A 2. zona (Cirkusz) harca a fo folyosorol indul (nincs kulon
      // bevezeto szobaja, mint az 1. zonanak) -- a kimenetel csak azt
      // dontii el, hogy a buildCorridorScene() legkozelebbi ujraepitesekor
      // a Bubble-hotspot eltunik-e (defeated) vagy megmarad-e, mar nem
      // auto-harccal (spared), ld. ott. A bubbleMusic-ot is itt valtjuk
      // vissza roomMusic-ra, ugyanugy, mint az 1. zona Isaac-szobajanal.
      if (zoneIndex === 1) {
        bubbleMusic.pause();
        roomMusic.play().catch(() => {});
        if (result) {
          if (result.outcome === "spare") zone2Spared = true;
          if (result.outcome === "fight") zone2Defeated = true;
        }
      }
      overworldScreen.classList.remove("hidden");
      Overworld.start(buildCorridorScene(zoneIndex));
    });
  }
});
