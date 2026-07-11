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
        xFrac: 0.5,
        yFrac: 0.5,
        radius: 50,
        prompt: "▶ Enter: megnézed a tévét",
        onInteract: () => flavorPopup(null, "A tévé már vagy tíz éve ugyanazt a port gyűjti."),
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

  // opts = { boxWidth?, portraitSize? } -- tovabbadva az Overworld.showCornerPopup()-nak,
  // ld. ott. Egy companionChat-bejegyzes (js/zones.js) sajat boxWidth/portraitSize
  // mezojevel kerulhet be ide, ld. a kecske${i} hotspot onInteract()-jet lejjebb.
  function corridorFlavor(portraitSrc, text, opts) {
    Overworld.pause();
    Overworld.showCornerPopup(portraitSrc, text, () => Overworld.resume(), undefined, opts);
  }

  function buildCorridorScene(spawnAfterDoorIndex) {
    const hotspots = [];
    ZONES.forEach((zone, i) => {
      const doorFrac = DOOR_FRACTIONS[i];
      const chat = zone.companionChat || [];
      // Egyelore csak Kecske all a folyoson zonankent -- Tenna/Queen
      // hotspotja ideiglenesen ki van veve (osszevisszasag lett volna
      // tobb NPC-vel egy helyen), a companionChat[1]/[2] szoveguk
      // (js/zones.js) valtozatlanul megvan, csak jelenleg nincs hozza
      // sprite/hotspot a folyoson. Ha visszateszed oket, a fenti (mar
      // torolt) tenna${i}/queen${i} blokkok mintajat kovetheted.
      if (chat[0]) {
        hotspots.push({
          id: `kecske${i}`,
          // Ez az INTERAKCIOS terulet kozeppontja (radius, prompt-felugras)
          // -- nem feltetlenul ugyanott van, ahol Kecske ALL, ld. lejjebb.
          xFrac: doorFrac - 0.06,
          yFrac: 0.7,
          radius: 45,
          prompt: "▶ Enter: odaszólsz Eriknek",
          sprite: {
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
            xFrac: doorFrac - 0.06,
            yFrac: 0.7,
          },
          // A chat[0].boxWidth/portraitSize (ha meg van adva a js/zones.js-ben)
          // ennel a konkret sornal szelesebb dobozt/nagyobb portrét ad --
          // ld. Overworld.showCornerPopup() opts-dokumentaciojat.
          onInteract: () =>
            corridorFlavor("assets/sprites/kecske_placeholder_talk.png", chat[0].text, {
              boxWidth: chat[0].boxWidth,
              portraitSize: chat[0].portraitSize,
            }),
        });

        hotspots.push({
          id: `minecraft${i}`,
          // Ez az INTERAKCIOS terulet kozeppontja (radius, prompt-felugras)
          // -- nem feltetlenul ugyanott van, ahol Kecske ALL, ld. lejjebb.
          xFrac: doorFrac - 0.095,
          yFrac: 0.65,
          radius: 45,
          prompt: "* Minecraft... mi más :)",
        });
      }
      const doorHotspot = {
        id: `door${i}`,
        xFrac: doorFrac + 0.005,
        yFrac: 0.62,
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
      yFrac: 0.78,
    });

    return {
      bgSrc: CORRIDOR_ZONE_BACKGROUNDS,
      // A szobahoz kepest kicsit kisebb jatekos-sprite a folyoson (ld.
      // overworld.js scene.playerScale) -- tavlati-erzetet ad, es jobban
      // illeszkedik a folyoso tagasabb, "kifele vezeto" hangulatahoz.
      playerScale: 0.75,
      walkBounds: [
      { xMin: 0.001, xMax: 0.99, yMin: 0.7, yMax: 0.88 },
      { xMin: 0.123, xMax: 0.135, yMin: 0.65, yMax: 0.8 },
      ],
      spawn: playerSpawn,
      // Feki a folyoson kovető NPC-kent jelenik meg (a szobaban viszont
      // csak statikusan ul az ablakban, ld. ROOM_SCENE.decorations) --
      // ld. overworld.js scene.follower dokumentaciojat. A kezdopozicioja
      // egy kicsit a jatekos spawn-pontja mogott van, nem pontosan azon.
      follower: {
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
      },
      hotspots,
    };
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
  function buildIsaacRoomScene() {
    const zone = ZONES[0];
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
      hotspots: [
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
        {
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
        },
      ],
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
    Battle.start(ZONES[zoneIndex], () => {
      if (zoneIndex + 1 >= ZONES.length) {
        Engine.playSound("victory");
        gameScreen.classList.add("hidden");
        endScreen.classList.remove("hidden");
        return;
      }
      gameScreen.classList.add("hidden");
      overworldScreen.classList.remove("hidden");
      // A zona0 (1. zona) harca az Isaac-szobabol indult, sajat zeneevel --
      // gyozelem utan a folyosora terunk vissza, nem oda, ugyhogy itt is
      // vissza kell valtani a roomMusic-ra (ld. a door0/isaac-room-exit
      // hotspotok onInteract()-jenel levo megjegyzest).
      if (zoneIndex === 0) {
        isaacMusic.pause();
        roomMusic.play().catch(() => {});
      }
      Overworld.start(buildCorridorScene(zoneIndex));
    });
  }
});
