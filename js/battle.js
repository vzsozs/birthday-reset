/*
 * battle.js
 * Parbeszed-doboz (gepelos szoveg), ACT menu es a kor-korre (turn-based)
 * harc-folyamat. A tenyleges zona-tartalmat (szovegek, ellenfel, ACT-ok)
 * a zones.js adja at a Battle.start(zoneData) hivasban.
 */
const Battle = (() => {
  let dom = {};
  let hp = 5;
  const maxHp = 5;
  let skipRequested = false;
  let typing = false;

  // Az 1. zona fordulos FIGHT/ACT/SPARE harcahoz -- ld. startRoundBattle().
  // A 2-4. zona valtozatlanul a legacy (lapos ACT-listas) folyamatot hasznalja,
  // ld. start() elagazasat.
  let battleMode = "legacy"; // "legacy" | "rounds"
  let mercy = 0; // 0-100, a "Spare" barat-mero -- csak a rounds-modban hasznalt
  let enemyPortrait = null; // a dialogue-boxban lathato KÖNNY-LÉNY-arckep (talk/talk-dying-01/02), FIGHT-tal valtozhat
  let centerEnemySprite = null; // a kepernyo kozepen allando ellenfel-sprite (sprite/dying-01/02/die), fuggetlenul valtozik az enemyPortrait-tol
  let lastChoiceType = null; // az elozo fordulon valasztott opcio tipusa ("fight"|"act") -- a kovetkezo fordulo preLines-at agazhatja el, ld. runRound()
  let lastChoiceId = null; // az elozo fordulon valasztott ACT konkret id-je (pl. "roblox_tanc") -- a kovetkezo fordulo enemyLine-jat felteteshez kotheti, ld. runRound()
  let tearsAreRed = false; // igazra valtozik, ha az 1. fordulban FIGHT-ot valasztott a jatekos ("A könnyei hirtelen vörösre váltanak.") -- ettol kezdve a tovabbi fordulok dodge-fazisai a piros konny-textura hasznaljak, ld. runRound()
  let currentRoundZone = null;
  let currentRoundIndex = 0;

  // ACT-menu billentyuzetes navigacio allapota
  let menuActive = false;
  let menuCols = 2;
  let selectedIndex = 0;
  let currentMenuButtons = [];
  let currentMenuActs = [];
  let currentMenuChoose = null;

  function initDom(elements) {
    dom = elements;
    dom.dialogueBox.addEventListener("click", advanceOrSkip);
    dom.battleCornerPopup.addEventListener("click", advanceOrSkip);
    // Az overworld-kepernyo sajat, dialogue_box_frame.png-s doboza (a zaro,
    // Minecraft-temaju zona hasznalja, ld. js/main.js playZone4Finale()) --
    // ugyanazt az advanceOrSkip()-et hasznalja, mint a harc-kepernyo dobozai,
    // mert a typing/advanceCallback allapot a Battle-modulon belul kozos,
    // fuggetlenul attol, melyik dobozba irt eppen a typeText().
    dom.overworldDialogueBox.addEventListener("click", advanceOrSkip);
    // A zaro-animacio (playFinalCinematic()) vegso sora is kattintassal/
    // Enterrel lepteto -- ld. ott.
    dom.endingOverlay.addEventListener("click", advanceOrSkip);
    dom.overworldEndingOverlay.addEventListener("click", advanceOrSkip);
    window.addEventListener("keydown", handleKeydown);
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function handleKeydown(e) {
    const key = e.key.toLowerCase();
    if (menuActive) {
      const count = currentMenuButtons.length;
      const rows = Math.ceil(count / menuCols);
      let row = Math.floor(selectedIndex / menuCols);
      let col = selectedIndex % menuCols;
      let handled = true;

      if (key === "arrowleft" || key === "a") col = Math.max(0, col - 1);
      else if (key === "arrowright" || key === "d") col = Math.min(menuCols - 1, col + 1);
      else if (key === "arrowup" || key === "w") row = Math.max(0, row - 1);
      else if (key === "arrowdown" || key === "s") row = Math.min(rows - 1, row + 1);
      else if (key === "enter" || key === " ") {
        e.preventDefault();
        const act = currentMenuActs[selectedIndex];
        if (act && currentMenuChoose) currentMenuChoose(act);
        return;
      } else {
        handled = false;
      }

      if (handled) {
        e.preventDefault();
        let newIndex = row * menuCols + col;
        if (newIndex >= count) newIndex = count - 1;
        if (newIndex !== selectedIndex) {
          selectedIndex = newIndex;
          highlightSelection();
          Engine.playSound("move");
        }
      }
    } else if (key === " " || key === "enter") {
      e.preventDefault();
      advanceOrSkip();
    }
  }

  function highlightSelection() {
    currentMenuButtons.forEach((b, i) => {
      b.classList.toggle("act-btn-selected", i === selectedIndex);
    });
  }

  let advanceCallback = null;
  function advanceOrSkip() {
    if (typing) {
      skipRequested = true;
    } else if (advanceCallback) {
      const cb = advanceCallback;
      advanceCallback = null;
      cb();
    }
  }

  // Arcvaltas idozitese egy szovegen belul: a szoveg-string kozepebe irt
  // "{{kulcs}}" jelolo a gepeles ezen pontjan (es csak akkor) lecsereli a
  // portret a `line.faces.kulcs` utvonalra -- a jelolo maga nem jelenik meg.
  // Lasd js/zones.js egy peldaert es a CLAUDE.md "Arcvaltas idozitese"
  // szakaszat a hasznalatrol.
  const FACE_MARKER = /\{\{(\w+)\}\}/g;

  function parseFaceMarkers(text) {
    const changes = [];
    let clean = "";
    let lastEnd = 0;
    let match;
    FACE_MARKER.lastIndex = 0;
    while ((match = FACE_MARKER.exec(text))) {
      clean += text.slice(lastEnd, match.index);
      changes.push({ index: clean.length, key: match[1] });
      lastEnd = match.index + match[0].length;
    }
    clean += text.slice(lastEnd);
    return { clean, changes };
  }

  // `target` opcionalisan felulirja, hova irjon a gepeles -- alapertelmezetten
  // a fo parbeszed-doboz elemeire (dom.*), de a harc-sarok-buborek
  // (showCornerBanter()) ugyanezt a gepelos logikat hasznalja a sajat
  // (battleCorner*) elemeire irva. { speakerName?, dialogueText, portrait,
  // continueHint? } -- a speakerName/continueHint elhagyhato (nincs neve/
  // "tovabb" jelzese a sarok-buboreknak).
  function defaultTarget() {
    return {
      speakerName: dom.speakerName,
      dialogueText: dom.dialogueText,
      portrait: dom.portrait,
      continueHint: dom.continueHint,
    };
  }

  // A felhasznalo kerese szerint karakterenkent kulon gepeles-hang szol --
  // `RECURRING_SPEAKER_TYPE_SOUNDS` (js/zones.js) egy kozos, mindket
  // gepelos-implementacio (ez itt es js/overworld.js typeCornerText()-je)
  // szamara elerheto terkep. Ha a `speaker` nincs benne (pl. "TE", "APA",
  // "APA2"), az alapertelmezett "type" hang szol tovabbra is.
  function typingSoundFor(speaker) {
    return (typeof RECURRING_SPEAKER_TYPE_SOUNDS !== "undefined" && RECURRING_SPEAKER_TYPE_SOUNDS[speaker]) || "type";
  }

  function typeText(speaker, text, portrait, faces, target) {
    target = target || defaultTarget();
    return new Promise((resolve) => {
      if (target.speakerName) target.speakerName.textContent = speaker || "";
      target.dialogueText.textContent = "";
      typing = true;
      skipRequested = false;
      const rawText = text.startsWith("*") ? text : "*" + text;
      const { clean: displayText, changes: faceChanges } = parseFaceMarkers(rawText);
      let i = 0;
      const speed = 24;

      function applyFaceChangesUpTo(index) {
        if (!faces) return;
        for (const change of faceChanges) {
          if (change.index <= index && faces[change.key]) {
            target.portrait.src = faces[change.key];
          }
        }
      }

      function step() {
        if (skipRequested) {
          target.dialogueText.textContent = displayText;
          applyFaceChangesUpTo(displayText.length);
          typing = false;
          finish();
          return;
        }
        if (i < displayText.length) {
          target.dialogueText.textContent += displayText[i];
          if (displayText[i] !== " ") Engine.playSound(typingSoundFor(speaker));
          applyFaceChangesUpTo(i);
          i++;
          setTimeout(step, speed);
        } else {
          typing = false;
          finish();
        }
      }
      function finish() {
        if (target.continueHint) target.continueHint.style.visibility = "visible";
        advanceCallback = () => {
          if (target.continueHint) target.continueHint.style.visibility = "hidden";
          resolve();
        };
      }
      step();
    });
  }

  function activeZoneData() {
    return battleMode === "rounds" ? currentRoundZone : currentZone;
  }

  // Ha egy sor nem ad meg sajat `portrait`-ot, de a `speaker` egy ismert
  // (nevesitett) karakter, ez adja meg az alapertelmezett arckepet -- mindig
  // a "_talk" valtozatot preferalva, ha van ilyen (ld. CLAUDE.md "Mindig
  // legyen arckep" dontest). MAR MEGADOTT portrait-ot soha nem ir felul,
  // csak a hianyzokat tolti ki -- a mar megirt zona-dialogusok tudatosan
  // valasztott (nem-talk) portreit ez nem valtoztatja meg.
  function resolvePortrait(line) {
    if (line.portrait) return line.portrait;
    if (!line.speaker) return null;
    const zoneData = activeZoneData();
    if (!zoneData) return null;
    if (zoneData.enemy && line.speaker === zoneData.enemy.name) {
      // Fordulos modban a mar elert allapot (dying-01/02/die, ld.
      // enemyPortraitAfter) elsobbseget elvez a talk-arckep felett.
      if (battleMode === "rounds" && enemyPortrait) return enemyPortrait;
      return zoneData.enemy.talkSprite || zoneData.enemy.sprite;
    }
    if (zoneData.speakerPortraits && zoneData.speakerPortraits[line.speaker]) {
      return zoneData.speakerPortraits[line.speaker];
    }
    return null;
  }

  // Egy kepet villant fel `imgEl`-ben `ms` ideig, ahelyett hogy szoveget
  // gepelne -- ld. showSequence() `line.image` tamogatasat. `imgEl`
  // explicit parameter (nem mindig dom.imageFlash), mert a zaro
  // (Minecraft-temaju) zona MOST MAR az overworld-kepernyon fut le, sajat
  // (#overworld-image-flash) elemmel -- ld. js/main.js playZone4Finale().
  // `sound` (opcionalis): egy Engine-hangnevet jatszik le, amint a kep
  // felvillan -- a `showSequence()`-en keresztuli `line.image`-hez ez NEM
  // kell (ott a `line.sound` mar korabban, generikusan lejatszodik, ld.
  // showSequence()), csak a kozvetlen, allo-alapu hivasoknal (pl.
  // zone.fightImage, ld. js/zones.js ZONE_4).
  function showCenterImage(imgEl, src, ms, sound) {
    return new Promise((resolve) => {
      imgEl.src = src;
      imgEl.classList.remove("hidden");
      if (sound) Engine.playSound(sound);
      setTimeout(() => {
        imgEl.classList.add("hidden");
        resolve();
      }, ms || 2000);
    });
  }

  // Egy N-kockas atmenet-animaciot jatszik le a PORTRE-ELEM HELYEN, mielott
  // egy sor tenyleges portreja megjelenne -- pl. hogy eltakarjon egy
  // hirtelen karakter-valtast (ld. showSequence() `line.transitionAnim`
  // tamogatasat es js/zones.js ZONE_4 "APA->APA2" atvaltasat). `anim =
  // {frames: [...], frameMs?}` (alapertelmezett frameMs: 150). Az utolso
  // kocka az utolso `frameMs`-ig kitart, mielott a hivo folytatna (igy nem
  // "ugrik at" azonnal a valodi portrera) -- altalanos/ujrafelhasznalhato,
  // barmelyik dialogus-sor hasznalhatja, nem zona-specifikus. `onFrame(i)`
  // (opcionalis): minden kockavaltaskor lefut a kocka-indexszel -- ezt
  // hasznalja a ZONE_4 zaro-jelenete arra, hogy UGYANEZZEL az utemezessel,
  // de SAJAT (kulon fajlokbol allo) kockakkal a folyoson allo Apa-sprite-ot
  // is animalja (ld. js/main.js `overworldDialogueTarget.onTransitionFrame`)
  // -- a battle.js szandekosan nem nyul kozvetlenul az Overworld-modulhoz,
  // ezert ez a hivo felelossege a callback-en keresztul.
  function playTransitionAnim(imgEl, anim, onFrame) {
    return new Promise((resolve) => {
      const frames = anim.frames;
      const frameMs = anim.frameMs || 150;
      imgEl.style.display = "block";
      let i = 0;
      function step() {
        imgEl.src = frames[i];
        if (onFrame) onFrame(i);
        i++;
        setTimeout(i < frames.length ? step : resolve, frameMs);
      }
      step();
    });
  }

  // `box` (opcionalis, alapertelmezett dom.dialogueBox): melyik doboz-elemet
  // fedje fel/hasznalja -- a zaro (Minecraft-temaju) zona az overworld-
  // kepernyo sajat dobozat adja at (`overworldDialogueBox`, ld. js/main.js
  // playZone4Finale()), ugyanazzal a gepelos logikaval. Barmilyen uj szoveg
  // kiirasa elott biztositja, hogy a doboz lathato legyen -- igy a dodge-
  // fazis/menu utan NEM marad ott regi, mar elolvasott szoveg: a doboz
  // csak akkor jelenik meg ujra, amikor tenylegesen van mit kiirni.
  async function showSequence(lines, target, box) {
    target = target || defaultTarget();
    box = box || dom.dialogueBox;
    box.classList.remove("hidden");
    for (const line of lines) {
      // line.sound: opcionalis hangeffekt, ami a sor elott/kozben szol (pl.
      // a script "(snd_heavydamage.wav)"-szeru jelolesei) -- generikus,
      // barmelyik dialogus-sorra rakhato, nem csak a ZONE_4-re.
      if (line.sound) Engine.playSound(line.sound);
      // line.image: sima szoveg helyett egy kepet villant fel `line.duration`
      // ms-ig (alapertelmezett 2000), aztan folytatja a sorozatot -- ld.
      // showCenterImage().
      if (line.image) {
        await showCenterImage(dom.imageFlash, line.image, line.duration);
        continue;
      }
      // line.transitionAnim: ld. playTransitionAnim() -- a sor SAJAT
      // portreja/szovege csak EZUTAN jelenik meg. target.onTransitionFrame
      // (opcionalis, ld. playTransitionAnim()) engedi a hivonak, hogy egy
      // MASIK elemet (pl. az Overworld-vilag Apa-sprite-jat) is
      // szinkronban animaljon ugyanezzel az utemezessel. A felhasznalo
      // kerese szerint az animacio inditasa elott van egy rovid, 500ms-es
      // szunet (miutan a jatekos mar tovabblepett az elozo soron) -- igy
      // van egy eszreveheto pillanat-megallas, mielott a karakter-valtas
      // elkezdodne, nem azonnal, ugrasszeruen indul.
      if (line.transitionAnim) {
        await wait(500);
        await playTransitionAnim(target.portrait, line.transitionAnim, target.onTransitionFrame);
      }
      const portrait = resolvePortrait(line);
      if (portrait) {
        target.portrait.src = portrait;
        target.portrait.style.display = "block";
      } else {
        target.portrait.style.display = "none";
      }
      // target.onTransitionEnd (opcionalis): pontosan akkor fut le, amikor
      // az atmenet-animacio utan a VALODI (vegleges) portre mar be van
      // allitva -- ezt hasznalja a ZONE_4, hogy ugyanekkor a folyoson allo
      // Apa-sprite-ot is a vegleges "APA2" kepre valtsa (ld. js/main.js
      // playZone4Finale() `onTransitionEnd` hivasat), ne csak az utolso
      // atmenet-kockan maradjon.
      if (line.transitionAnim && target.onTransitionEnd) target.onTransitionEnd();
      await typeText(line.speaker, line.text, portrait, line.faces, target);
    }
  }

  // A harc-kepernyo sajat sarok-buboreke (Queen/Tenna rovid beugrasaihoz a
  // harc alatt) -- ld. Overworld.showCornerPopup() az overworld-valtozatert;
  // ez itt szandekosan onallo (nem hasznalja az overworld.js-t, ld. annak
  // dokumentaciojat: "Nem nyul a battle.js/engine.js-hez"), de ugyanazt a
  // gepelos typeText()-et hasznalja a target-parameterrel.
  async function showCornerBanter(lines) {
    if (!lines || !lines.length) return;
    // A felhasznalo kerese szerint a fo #dialogue-box (a keret-kepevel
    // egyutt) ilyenkor teljesen eltunik -- csak a sarok-buborek latszik,
    // nincs ures/felesleges doboz a hattereben.
    dom.dialogueBox.classList.add("hidden");
    dom.battleCornerPopup.classList.remove("hidden");
    const target = {
      speakerName: null,
      dialogueText: dom.battleCornerText,
      portrait: dom.battleCornerPortrait,
      continueHint: null,
    };
    for (const line of lines) {
      dom.battleCornerPortrait.src = line.portrait;
      dom.battleCornerPortrait.classList.remove("hidden");
      await typeText(line.speaker, line.text, line.portrait, line.faces, target);
    }
    dom.battleCornerPopup.classList.add("hidden");
    dom.dialogueBox.classList.remove("hidden");
  }

  function setHpDisplay() {
    const pct = Math.max(0, (hp / maxHp) * 100);
    dom.hpFill.style.width = pct + "%";
    dom.hpText.textContent = `HP  ${Math.max(0, hp)} / ${maxHp}`;
  }

  const ACT_ICON = "assets/sprites/ui/act_icon.png";
  const FIGHT_ICON = "assets/sprites/ui/fight_icon.png";
  const SPARE_ICON = "assets/sprites/ui/spare_icon.png";

  function setMercyDisplay() {
    const pct = Math.max(0, Math.min(100, mercy));
    dom.mercyFill.style.width = pct + "%";
    dom.mercyText.textContent = `SPARE  ${pct}%`;
  }

  function showActMenu(acts) {
    return new Promise((resolve) => {
      dom.menuBox.innerHTML = "";
      dom.menuBox.style.display = "grid";
      // 3 (vagy kevesebb) opcio egy sorban fer el egymas mellett; tobbnel
      // (jelenleg nem hasznalt eset) visszaall a ket-oszlopos tordelesre.
      menuCols = acts.length <= 3 ? acts.length : 2;
      dom.menuBox.style.gridTemplateColumns = `repeat(${menuCols}, 1fr)`;
      // A menu mindig alulra zar: ha a dialogue-box eppen lathato (van meg
      // friss szoveg raita), a doboz teteje folott all meg -- ha a
      // dialogue-box rejtve van (pl. kozvetlenul egy dodge-fazis utan, ahol
      // nincs uj szoveg), a menu maga huzodik le a kepernyo aljahoz kozel.
      const dialogueVisible = !dom.dialogueBox.classList.contains("hidden");
      dom.menuBox.style.bottom = dialogueVisible ? "240px" : "16px";
      currentMenuButtons = [];
      currentMenuActs = acts;
      selectedIndex = 0;
      menuActive = true;

      const choose = (act) => {
        menuActive = false;
        Engine.playSound("blip");
        dom.menuBox.style.display = "none";
        resolve(act);
      };
      currentMenuChoose = choose;

      acts.forEach((act) => {
        const btn = document.createElement("button");
        btn.className = "act-btn";
        const icon = document.createElement("img");
        icon.className = "act-icon";
        icon.src = act.icon || ACT_ICON;
        icon.alt = "";
        const label = document.createElement("span");
        label.textContent = act.label;
        btn.appendChild(icon);
        btn.appendChild(label);
        btn.addEventListener("click", () => choose(act));
        btn.addEventListener("mouseenter", () => {
          selectedIndex = currentMenuButtons.indexOf(btn);
          highlightSelection();
        });
        dom.menuBox.appendChild(btn);
        currentMenuButtons.push(btn);
      });
      highlightSelection();
    });
  }

  // tagEl: explicit parameter (nem mindig dom.styleTag), ugyanazon okbol,
  // mint showCenterImage()-nel -- a zaro zona sajat (#overworld-style-tag)
  // elemet hasznalja, ld. js/main.js playZone4Finale(). holdMs (opcionalis):
  // a CSS .style-pop animacio alapertelmezett hossza 1.1s -- ha egy zona
  // kepe (pl. ZONE_4 styleTagDuration) tovabb akarja kitartani a feliratot,
  // ide adhato at ms-ben. Inline animation-duration-t allitunk be, ami
  // felulirja a .style-pop shorthandjenek idotartam-reszet (ld. style.css).
  function showStyleTag(tagEl, text, holdMs) {
    return new Promise((resolve) => {
      tagEl.textContent = text;
      tagEl.classList.remove("style-pop");
      tagEl.style.animationDuration = holdMs ? holdMs + "ms" : "";
      void tagEl.offsetWidth; // reflow, hogy ujra tudjon animalni
      tagEl.classList.add("style-pop");
      Engine.playSound("style");
      setTimeout(resolve, holdMs || 1100);
    });
  }

  async function enemyAttack(zoneData) {
    await showSequence(zoneData.enemy.attackLines);
    dom.dialogueBox.classList.add("hidden");
    dom.battleWrap.style.display = "block";
    return new Promise((resolve) => {
      Engine.startDodgePhase(zoneData.dodge.duration, zoneData.dodge, () => {
        dom.battleWrap.style.display = "none";
        // A dialogue-box szandekosan rejtve marad -- csak a kovetkezo
        // showSequence()-hivas fedi fel ujra (ld. annak megjegyzeset),
        // nehogy a mar elolvasott regi szoveg latszodjon az ACT-menu mogott.
        resolve();
      });
    });
  }

  function onHit() {
    hp -= 1;
    setHpDisplay();
    if (hp <= 0) {
      Engine.stopDodgePhase();
      gameOver();
    }
  }

  let onCompleteZone = null;

  function flashGameOver() {
    return new Promise((resolve) => {
      dom.gameoverOverlay.classList.remove("hidden");
      setTimeout(() => {
        dom.gameoverOverlay.classList.add("hidden");
        resolve();
      }, 1400);
    });
  }

  const DEFAULT_GAMEOVER_LINES = [
    { speaker: "QUEEN", text: "Ó, remek. ELVESZTETTED. Ez... technikailag is kínos volt." },
    { speaker: "KECSKE", text: "Semmi baj, újratöltjük. Ez van, ha rossz a frissítés." },
  ];

  async function gameOver() {
    dom.battleWrap.style.display = "none";
    await flashGameOver();
    // A showSequence() maga gondoskodik a dialogue-box ujra-felfedeserol
    // (ld. annak megjegyzeset), fuggetlenul attol, hogy a halal a dodge-fazis
    // kozben tortent-e, meg mielott annak sajat befejezo-callbackje lefutna.
    // zoneData.gameOverLines (opcionalis) zonankent felulirhatja ezt az
    // alapertelmezett ket-szereplos sort -- ld. js/zones.js ZONE_2 pelda
    // (ott csak Queen beszel, mas szoveggel).
    const zoneData = activeZoneData();
    await showSequence((zoneData && zoneData.gameOverLines) || DEFAULT_GAMEOVER_LINES);
    hp = maxHp;
    setHpDisplay();
    if (battleMode === "rounds") {
      // Ugyanazt a fordulot probalja ujra (a halal a dodge-fazisban tortent,
      // meg a menu elott -- ld. runRound()), nem az egesz harcot az elejetol.
      runRound();
    } else {
      startPlayerTurn(currentZone);
    }
  }

  let currentZone = null;

  async function startPlayerTurn(zoneData) {
    currentZone = zoneData;
    const act = await showActMenu(zoneData.acts.filter((a) => !usedActs.has(a.id) || a.repeatable));
    usedActs.add(act.id);
    await showSequence(act.reactionLines);

    if (act.endsFight) {
      await victory(zoneData, act);
      return;
    }
    await enemyAttack(zoneData);
    if (hp > 0) {
      await startPlayerTurn(zoneData);
    }
  }

  async function victory(zoneData, act) {
    await showStyleTag(dom.styleTag, zoneData.styleTag || "+STYLE", zoneData.styleTagDuration);
    await showSequence(zoneData.victoryLines);
    // Tartalek-ag egy jovobeli, tenylegesen harc-kepernyos zaro-jelenethez
    // -- a jelenlegi zaro (Minecraft-temaju) zona MAR NEM megy at a
    // Battle.start()-on (ld. js/main.js playZone4Finale()), ezert ez az ag
    // jelenleg nem fut le semelyik zonanal.
    if (zoneData.finalCinematic) {
      const endingDom = {
        overlay: dom.endingOverlay,
        heading: dom.endingHeading,
        finalLine: dom.endingFinalLine,
        continueHint: dom.endingContinueHint,
      };
      await playFinalCinematic(endingDom, zoneData.finalCinematic, () => onCompleteZone({ finalReset: true }));
      return;
    }
    if (onCompleteZone) onCompleteZone();
  }

  // A jatek teljesen egyedi zaro-animacioja (jelenleg a zaro,
  // Minecraft-temaju zona hasznalja, az overworld-kepernyon, ld.
  // js/main.js playZone4Finale() es js/zones.js ZONE_4.finalCinematic) --
  // a script szerint: kivilagosodik a kep (snd_won), kozepen feketevel
  // megjelenik egy felirat (snd_splat), hatasszunet, alatta egy utolso sor
  // (tipeText()-tel gepelve, majd a felhasznalo kerese szerint Enterrel/
  // kattintassal tovabblepteve -- NEM automatikusan), majd a kep elsotetul
  // (snd_step2) es `onDone()` fut le. `domTarget = {overlay, heading,
  // finalLine, continueHint}` -- explicit parameter (nem mindig a
  // battle-kepernyo dom.ending*-je), ugyanazon okbol, mint
  // showCenterImage()-nel. Onallo fedot hasznal (NEM a megosztott
  // #scene-fade-et) -- az utobbi csak fekete fedesre kepes, ez a jelenet
  // viszont elobb KIVILAGOSODIK (feher), csak a legvegen valt feketere.
  // `onHeadingShown` (opcionalis): pontosan akkor fut le, amikor a `cfg.heading`
  // felirat megjelenik -- a felhasznalo kerese szerint ekkor kell elkezdeni
  // elhalkitani a hatterzenet (ld. js/main.js playZone4Finale()
  // fadeOutMusic()-hivasat), de ez a zene-kezeles maga a Battle-modulon
  // KIVUL, main.js-ben tortenik (a Battle nem ismeri a roomMusic-ot).
  async function playFinalCinematic(domTarget, cfg, onDone, onHeadingShown) {
    domTarget.overlay.classList.remove("ending-blackout");
    domTarget.heading.textContent = "";
    domTarget.finalLine.textContent = "";
    domTarget.overlay.classList.add("ending-visible");
    Engine.playSound("won");
    await wait(1400); // a CSS opacity-atmenet hossza, ld. style.css
    domTarget.heading.textContent = cfg.heading;
    Engine.playSound("splat");
    if (onHeadingShown) onHeadingShown();
    await wait(1200); // "hatasszunet"
    await typeText(null, cfg.finalLine, null, null, {
      dialogueText: domTarget.finalLine,
      continueHint: domTarget.continueHint,
    });
    domTarget.overlay.classList.add("ending-blackout");
    Engine.playSound("step2");
    await wait(1200);
    if (onDone) onDone();
  }

  let usedActs = new Set();

  async function start(zoneData, doneCallback) {
    if (zoneData.rounds) {
      await startRoundBattle(zoneData, doneCallback);
      return;
    }
    battleMode = "legacy";
    currentZone = zoneData;
    hp = maxHp;
    usedActs = new Set();
    onCompleteZone = doneCallback;
    setHpDisplay();
    dom.mercyRow.classList.add("hidden");
    dom.battleWrap.style.display = "none";
    dom.menuBox.style.display = "none";

    await showSequence(zoneData.intro);
    await showSequence(zoneData.enemy.introLines);
    startPlayerTurn(zoneData);
  }

  // --- Fordulos FIGHT/ACT/SPARE harc (jelenleg csak az 1. zona hasznalja,
  // ld. js/zones.js ZONE_1.rounds/ending) ---------------------------------
  //
  // zoneData.cornerIntro: rovid Queen/Tenna sarok-buborek-beszolas a harc
  //   legelejen (ld. showCornerBanter()).
  // zoneData.enemy.introLines: a szokasos parbeszed-dobozos bevezeto sor(ok),
  //   a cornerIntro utan, meg az 1. fordulo elott.
  // zoneData.rounds: [{ preLines?, preLinesIfPrevFight?, preLinesByChoice?,
  //   enemyLine?, dodge:{...,pattern}, options:[
  //   { type:"fight", label, reactionLines?, enemyPortraitAfter? } |
  //   { type:"act", id, label, reactionLines?, mercy? }
  // ] }, ...] -- fordulonkent a jatekos EGY opciot valaszt egy menubol; a
  //   FIGHT mindig azonnal "talal" (nincs kulon mini-jatek), a valasztott
  //   opciotol fuggetlenul a KOVETKEZO fordulo dodge-mintazata objektíve
  //   nehezebb (ez adja az eszkalaciot, nem szamszeru elonf/vedekezes-logika).
  //   A `preLines` a bevezeto/alapertelmezett sor(ok) a fordulo dodge-fazisa
  //   elott. Ha az ELOZO fordulban valasztott opcio alapjan mas bevezeto
  //   kell, KET mechanizmus kozul valaszthatsz (a masodik altalanosabb):
  //   - `preLinesIfPrevFight` -- csak azt kulonbozteti meg, hogy az elozo
  //     valasztas FIGHT volt-e (ld. ZONE_1.rounds[1] pelda).
  //   - `preLinesByChoice: { fight?: [...], [actId]: [...] }` -- az ELOZO
  //     fordulo PONTOS valasztasa szerint (barmennyi ACT-id kulonboztetheto
  //     meg, nem csak FIGHT/nem-FIGHT), ld. ZONE_2.rounds[1] pelda. Ha mindket
  //     mezo hianyzik, vagy nincs talalat egyikben sem, az alap `preLines` jon.
  // zoneData.ending: { preLinesByMercy?: { peaceful, aggressive, mixed },
  //   spare: { lines, failLines }, fight: { lines, enemyPortrait,
  //   roomDecoration? } } -- az utolso (4.) "fordulo" mar nem tamad, csak egy
  //   FIGHT/SPARE zaro-valasztas: SPARE csak akkor sikerul, ha `mercy` mar
  //   elerte a 100-at, kulonben rovid failLines utan a FIGHT-kimenetellel
  //   zarul (ld. resolveEnding()). Az opcionalis `preLinesByMercy` a zaro-menu
  //   ELOTT jelenik meg, a felgyult `mercy` alapjan valasztva: "peaceful" ha
  //   mercy>=100, "aggressive" ha mercy<=0, kulonben "mixed" -- ld. ZONE_2.ending
  //   pelda (a "beke/agressziv/vegyes" elozmenytol fuggo bevezeto).

  async function startRoundBattle(zoneData, doneCallback) {
    battleMode = "rounds";
    hp = maxHp;
    mercy = 0;
    enemyPortrait = zoneData.enemy.talkSprite || zoneData.enemy.sprite;
    centerEnemySprite = zoneData.enemy.sprite;
    lastChoiceType = null;
    lastChoiceId = null;
    tearsAreRed = false;
    onCompleteZone = doneCallback;
    currentRoundZone = zoneData;
    currentRoundIndex = 0;
    setHpDisplay();
    setMercyDisplay();
    dom.mercyRow.classList.remove("hidden");
    dom.battleWrap.style.display = "none";
    dom.menuBox.style.display = "none";

    // Az ellenfel harci sprite-ja a kepernyo kozepen -- folyamatosan
    // lathato marad, amig a harc menete mashogy nem kivanja (ld.
    // CLAUDE.md "Harc-UI" szakaszat). Fuggetlenul valtozik az enemyPortrait-
    // tol (ami a dialogue-box "beszelo" arckepe): ez a "sima" dying-01/02/die
    // sorozatot hasznalja, nem a "_talk-dying" valtozatot.
    dom.battleEnemySprite.src = centerEnemySprite;
    dom.battleEnemySprite.classList.remove("hidden");

    await showCornerBanter(zoneData.cornerIntro);
    await showSequence(zoneData.enemy.introLines);
    await runRound();
  }

  async function runRound() {
    const zoneData = currentRoundZone;
    while (currentRoundIndex < zoneData.rounds.length) {
      const round = zoneData.rounds[currentRoundIndex];
      // Melyik preLines-valtozat jon: `preLinesByChoice` (altalanosabb, az
      // elozo fordulo PONTOS valasztasa -- "fight" vagy egy ACT-id -- szerint
      // kulonbozteti meg), majd ha az nincs (vagy nincs benne talalat) a
      // regebbi `preLinesIfPrevFight` (csak FIGHT/nem-FIGHT), vegul az
      // alapertelmezett `preLines` -- ld. a startRoundBattle() elotti
      // dokumentaciot.
      let preLines = round.preLines;
      if (round.preLinesByChoice) {
        const choiceKey = lastChoiceType === "fight" ? "fight" : lastChoiceId;
        if (round.preLinesByChoice[choiceKey]) preLines = round.preLinesByChoice[choiceKey];
      } else if (lastChoiceType === "fight" && round.preLinesIfPrevFight) {
        preLines = round.preLinesIfPrevFight;
      }
      if (preLines) await showSequence(preLines);
      // `enemyLineRequiresPrevChoice` (ha meg van adva) csak akkor engedi
      // megjelenni az enemyLine-t, ha az elozo fordulban PONT azt a
      // konkret ACT-ot valasztotta a jatekos (id szerint) -- ld.
      // js/zones.js ZONE_1.rounds[2] peldat.
      const enemyLineAllowed = !round.enemyLineRequiresPrevChoice || round.enemyLineRequiresPrevChoice === lastChoiceId;
      if (round.enemyLine && enemyLineAllowed) await showSequence([round.enemyLine]);

      dom.dialogueBox.classList.add("hidden");
      dom.battleWrap.style.display = "block";
      // Ha az 1. fordulban FIGHT-ot valasztotta a jatekos ("A könnyei
      // hirtelen vörösre váltanak."), a tovabbi fordulok konnyei is pirosak
      // maradnak -- ld. tearsAreRed.
      const dodgeConfig = tearsAreRed ? { ...round.dodge, tearImage: "tearRed" } : round.dodge;
      await new Promise((resolve) => {
        Engine.startDodgePhase(dodgeConfig.duration, dodgeConfig, () => {
          dom.battleWrap.style.display = "none";
          // Nem allitjuk vissza a dialogue-box lathatosagat itt -- a menu
          // (ld. lejjebb) most mar magatol, dialogue-box nelkul jelenik meg,
          // csak a kovetkezo showSequence() (a valasztott opcio reactionLines-a)
          // fedi fel ujra, friss szoveggel.
          resolve();
        });
      });
      // Ha elfogyott a HP, az onHit() mar elinditotta a gameOver()-t, ami
      // (feltoltott HP-val) ujra meghivja ezt a fuggvenyt -- itt csak
      // kilepunk, nehogy ketszer fusson tovabb a fordulo.
      if (hp <= 0) return;

      const options = round.options.map((opt) => ({
        ...opt,
        icon: opt.type === "fight" ? FIGHT_ICON : ACT_ICON,
      }));
      const chosen = await showActMenu(options);
      if (currentRoundIndex === 0 && chosen.type === "fight") {
        tearsAreRed = true;
      }
      lastChoiceType = chosen.type;
      lastChoiceId = chosen.id || null;
      if (chosen.type === "fight" && chosen.enemyPortraitAfter) {
        enemyPortrait = chosen.enemyPortraitAfter;
      }
      if (chosen.type === "fight" && chosen.enemyFieldAfter) {
        centerEnemySprite = chosen.enemyFieldAfter;
        dom.battleEnemySprite.src = centerEnemySprite;
      }
      if (typeof chosen.mercy === "number") {
        // Osszeadodik a korabban mar megszerzett mercy-vel (nem felulirja) --
        // pl. ROBLOX TÁNC (+50) + OOF KÓRUS (+50) egyutt adja ki a 100-at.
        mercy = Math.min(100, mercy + chosen.mercy);
        setMercyDisplay();
      }
      if (chosen.reactionLines) {
        await showSequence(chosen.reactionLines);
      }

      currentRoundIndex++;
    }
    await resolveEnding();
  }

  async function resolveEnding() {
    const zoneData = currentRoundZone;
    // Opcionalis, a felgyult mercy alapjan valasztott bevezeto a zaro FIGHT/
    // SPARE-menu elott -- "peaceful" ha mercy mar elerte a 100-at, "aggressive"
    // ha meg 0-n all, kulonben "mixed" (ld. ZONE_2.ending.preLinesByMercy pelda).
    if (zoneData.ending.preLinesByMercy) {
      const bucket = mercy >= 100 ? "peaceful" : mercy <= 0 ? "aggressive" : "mixed";
      const lines = zoneData.ending.preLinesByMercy[bucket];
      if (lines) {
        await showSequence(lines);
        // A jatekos mar elolvasta/eldismisselte a sort (showSequence
        // megvarja az Entert/kattintast) -- most elrejtjuk a dialogue-boxot,
        // kulonben a (tobbnyire tobbsoros) szoveg meg lathato maradna, es a
        // showActMenu() dinamikus pozicionalasa emiatt eltakarhatna a menut.
        dom.dialogueBox.classList.add("hidden");
      }
    }
    const options = [
      { type: "fight", label: "FIGHT", icon: FIGHT_ICON },
      { type: "spare", label: "SPARE", icon: SPARE_ICON },
    ];
    const chosen = await showActMenu(options);
    if (chosen.type === "spare" && mercy >= 100) {
      await finishZone("spare");
      return;
    }
    if (chosen.type === "spare") {
      await showSequence(zoneData.ending.spare.failLines);
    }
    await finishZone("fight");
  }

  async function finishZone(outcome) {
    const zoneData = currentRoundZone;
    const branch = zoneData.ending[outcome];
    if (branch.enemyPortrait) enemyPortrait = branch.enemyPortrait;
    if (branch.enemyField) {
      centerEnemySprite = branch.enemyField;
      dom.battleEnemySprite.src = centerEnemySprite;
    }
    await showStyleTag(dom.styleTag, zoneData.styleTag || "+STYLE");
    await showSequence(branch.lines);
    dom.mercyRow.classList.add("hidden");
    if (onCompleteZone) onCompleteZone({ outcome, roomDecoration: !!branch.roomDecoration });
  }

  // showSequence/showCenterImage/showStyleTag/playFinalCinematic exportalva
  // -- ezeket a zaro (Minecraft-temaju) zona az overworld-kepernyon hasznalja
  // ujra, sajat dom-elemekkel, ld. js/main.js playZone4Finale().
  return { initDom, start, onHit, showSequence, showCenterImage, showStyleTag, playFinalCinematic };
})();
