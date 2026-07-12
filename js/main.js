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
  });

  Engine.init(canvas, boxBounds, Battle.onHit);
  await Promise.all([
    Engine.loadImage("heart", "assets/sprites/ui/soul_heart_red.png"),
    Engine.loadImage("tear", "assets/sprites/tear_bullet.png"),
    Engine.loadImage("tearRed", "assets/sprites/tear_bullet-red.png"),
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

  // Tobb, valtakozo beszelos (portrait-onkent kulon) sor egymas utan, egy
  // Overworld.showCornerPopup()-lancolassal -- ld. flavorPopup() az egyetlen-
  // beszelos valtozatert. Minden `lines[i]` egy { portrait, text } objektum
  // (a `portrait` lehet null, ha "TE" beszelsz -- akkor nincs kep, mint a
  // harci dialogus TE-sorainal). `onDone` a teljes sorozat vegen fut le.
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
      Overworld.showCornerPopup(line.portrait, line.text, next);
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

  // A folyoso hattere zonankent kulon fajl (nem egy osszefuzott kep) -- ld.
  // tools/gen_assets.py corridor_bg() es a CLAUDE.md. Az Overworld egymas
  // mella illeszti oket, a stage magassagara (480px) skalazva, sajat
  // oldalaranyat megtartva -- igy a vilag-szelesseg kepenkent elter, ha a
  // kepek nem egyenlo szelesseguek. A 2. zona hattere (corridor_zone2_bg_placeholder.png)
  // mar a vegleges, kezzel/AI-jal keszult "Cirkusz"-rajz (1260px szeles),
  // NEM ugyanolyan szelessegu, mint a masik harom (1100px) meg placeholder
  // kep -- ezert a DOOR_FRACTIONS ertekei alant a TENYLEGES (osszeadott)
  // szelessegekbol vannak ujraszamolva, nem egyszeru negyedelessel. Ha egy
  // tovabbi zona hattere is lecserelodik maskkora szelessegure, ezt a
  // tombot (es a ZONE2_LAYOUT-hoz hasonlo, uj zona-specifikus felulirast,
  // ha kell) ujra kell hangolni.
  const CORRIDOR_ZONE_BACKGROUNDS = [
    "assets/sprites/corridor_zone1_bg_placeholder.png",
    "assets/sprites/corridor_zone2_bg_placeholder.png",
    "assets/sprites/corridor_zone3_bg_placeholder.png",
    "assets/sprites/corridor_zone4_bg_placeholder.png",
  ];
  const CORRIDOR_SEGMENT_WIDTHS = [1100, 1260, 1100, 1100];
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
  // companionSprite/companionPrompt/minecraftPrompt: a 2. zona folyoso-
  // szakaszan NEM Kecske (Erik) all a szokasos "kecske${i}" hotspoton,
  // hanem egy uj, egyelore csak PLACEHOLDER szereplo, "Caine" (ld.
  // assets/sprites/caine_placeholder.png, tools/gen_assets.py) -- se
  // vegleges nev, se vegleges parbeszed, se sajat "_talk" portre meg
  // nincs, ezert a companionSprite-ot hasznaljuk a beszed-buborek
  // portrejakent is (nincs kulon "beszelo" kockaja). A "minecraft${i}"
  // nema beszolas szovege is csere (ld. minecraftPrompt), a pozicioja
  // valtozatlan maradt.
  const ZONE2_LAYOUT = {
    doorXFrac: (CORRIDOR_SEGMENT_OFFSETS[1] + 680) / CORRIDOR_TOTAL_WIDTH,
    doorYFrac: 0.79,
    companionXFrac: (CORRIDOR_SEGMENT_OFFSETS[1] + 540) / CORRIDOR_TOTAL_WIDTH,
    companionYFrac: 0.65,
    companionSprite: "assets/sprites/caine_placeholder.png",
    companionPrompt: "▶ Enter: odaszólsz Caine-nek",
    minecraftXFrac: (CORRIDOR_SEGMENT_OFFSETS[1] + 252) / CORRIDOR_TOTAL_WIDTH,
    minecraftYFrac: 0.79,
    minecraftPrompt: "* Bubble Fight... mi más :)",
  };

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
        // A 2. zonaban Caine (placeholder) all itt Kecske helyett -- ld.
        // ZONE2_LAYOUT megjegyzeset. Nincs kulon "_talk" portreja, a
        // sima allo-kepet hasznaljuk a beszed-buborekban is.
        const companionSprite = layout ? layout.companionSprite : "assets/sprites/kecske_placeholder.png";
        const companionTalkSprite = layout ? layout.companionSprite : "assets/sprites/kecske_placeholder_talk.png";
        const companionPrompt = layout ? layout.companionPrompt : "▶ Enter: odaszólsz Eriknek";
        hotspots.push({
          id: `kecske${i}`,
          // Ez az INTERAKCIOS terulet kozeppontja (radius, prompt-felugras)
          // -- nem feltetlenul ugyanott van, ahol Kecske ALL, ld. lejjebb.
          xFrac: companionXFrac,
          yFrac: companionYFrac,
          radius: 45,
          prompt: companionPrompt,
          sprite: {
            src: companionSprite,
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
          },
          // A chat[0].boxWidth/portraitSize (ha meg van adva a js/zones.js-ben)
          // ennel a konkret sornal szelesebb dobozt/nagyobb portrét ad --
          // ld. Overworld.showCornerPopup() opts-dokumentaciojat.
          onInteract: () =>
            corridorFlavor(companionTalkSprite, chat[0].text, {
              boxWidth: chat[0].boxWidth,
              portraitSize: chat[0].portraitSize,
            }),
        });

        hotspots.push({
          id: `minecraft${i}`,
          // Ez az INTERAKCIOS terulet kozeppontja (radius, prompt-felugras)
          // -- nem feltetlenul ugyanott van, ahol Kecske ALL, ld. lejjebb.
          xFrac: layout ? layout.minecraftXFrac : doorFrac - 0.095,
          yFrac: layout ? layout.minecraftYFrac : 0.65,
          radius: 45,
          prompt: layout ? layout.minecraftPrompt : "* Minecraft... mi más :)",
        });
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
      { xMin: 0.001, xMax: 0.259, yMin: 0.7, yMax: 0.88 },
      // Keskeny "felvezeto sav" az 1. zona ajtajahoz (yFrac 0.62), ami a
      // fenti fo sav (yMin 0.7) felett van -- DOOR_FRACTIONS[0]-hoz kepest
      // relativ eltolassal szamolva, hogy a zona1 ajtaja korul maradjon,
      // barhogy is alakul a tobbi zona hattereinek szelessege (ld. fent).
      { xMin: DOOR_FRACTIONS[0] - 0.002, xMax: DOOR_FRACTIONS[0] + 0.01, yMin: 0.65, yMax: 0.8 },
      { xMin: 0.258, xMax: 0.45, yMin: 0.8, yMax: 0.88 },
      { xMin: 0.344, xMax: 0.358, yMin: 0.65, yMax: 0.88 },
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

  // A SPARE utan visszatero jatekost fogado, egyszeri "viszontlatas"-jelenet
  // -- ld. buildIsaacRoomScene() isaac-room-enemy hotspotjat. Valtakozo
  // beszelok: a Konny-leny sorai kapnak portrét, a jatekos ("TE") sorai nem,
  // ugyanugy, mint a harci dialogusban.
  const KONNYLENY_REUNION_LINES = [
    {
      portrait: "assets/sprites/enemy_konnyleny_placeholder.png",
      text: "Te... te vagy az Bazsa. Azt hittem, a múltkori Combat után törlődtél, vagy legalábbis visszakerültem a Baseplate-re.",
    },
    {
      portrait: null,
      text: "Nyugi, nem jöttem harcolni. Csak... erre jártam. Emlékszem a múltkorira. Nem akartam, hogy a Debris alatt végezd.",
    },
    {
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
      portrait: "assets/sprites/enemy_konnyleny_placeholder.png",
      text: [
        "Megyek, a Server Console jelzi, hogy lejár a limit, restartol a map. Vigyázz magadra!",
        "Remélem, legközelebb nem PvP módban találkozunk, hanem csak simán Social közegben. Köszi még egyszer, majd találkozunk!",
      ],
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
    Battle.start(ZONES[zoneIndex], (result) => {
      if (zoneIndex + 1 >= ZONES.length) {
        Engine.playSound("victory");
        gameScreen.classList.add("hidden");
        endScreen.classList.remove("hidden");
        return;
      }
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
      overworldScreen.classList.remove("hidden");
      Overworld.start(buildCorridorScene(zoneIndex));
    });
  }
});
