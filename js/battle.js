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
  let enemyPortrait = null; // a KÖNNY-LÉNY sorok alapertelmezett portreja, FIGHT-tal valtozhat
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
    window.addEventListener("keydown", handleKeydown);
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
          if (displayText[i] !== " ") Engine.playSound("type");
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

  async function showSequence(lines, target) {
    target = target || defaultTarget();
    for (const line of lines) {
      if (line.portrait) {
        target.portrait.src = line.portrait;
        target.portrait.style.display = "block";
      } else {
        target.portrait.style.display = "none";
      }
      await typeText(line.speaker, line.text, line.portrait, line.faces, target);
    }
  }

  // A harc-kepernyo sajat sarok-buboreke (Queen/Tenna rovid beugrasaihoz a
  // harc alatt) -- ld. Overworld.showCornerPopup() az overworld-valtozatert;
  // ez itt szandekosan onallo (nem hasznalja az overworld.js-t, ld. annak
  // dokumentaciojat: "Nem nyul a battle.js/engine.js-hez"), de ugyanazt a
  // gepelos typeText()-et hasznalja a target-parameterrel.
  async function showCornerBanter(lines) {
    if (!lines || !lines.length) return;
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

  function showStyleTag(text) {
    return new Promise((resolve) => {
      dom.styleTag.textContent = text;
      dom.styleTag.classList.remove("style-pop");
      void dom.styleTag.offsetWidth; // reflow, hogy ujra tudjon animalni
      dom.styleTag.classList.add("style-pop");
      Engine.playSound("style");
      setTimeout(resolve, 1100);
    });
  }

  async function enemyAttack(zoneData) {
    await showSequence(zoneData.enemy.attackLines);
    dom.battleWrap.style.display = "block";
    return new Promise((resolve) => {
      Engine.startDodgePhase(zoneData.dodge.duration, zoneData.dodge, () => {
        dom.battleWrap.style.display = "none";
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

  async function gameOver() {
    dom.battleWrap.style.display = "none";
    await flashGameOver();
    await showSequence([
      { speaker: "QUEEN", text: "Ó, remek. ELVESZTETTED. Ez... technikailag is kínos volt." },
      { speaker: "KECSKE", text: "Semmi baj, újratöltjük. Ez van, ha rossz a frissítés." },
    ]);
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
    await showStyleTag(zoneData.styleTag || "+STYLE");
    await showSequence(zoneData.victoryLines);
    if (onCompleteZone) onCompleteZone();
  }

  let usedActs = new Set();

  async function start(zoneData, doneCallback) {
    if (zoneData.rounds) {
      await startRoundBattle(zoneData, doneCallback);
      return;
    }
    battleMode = "legacy";
    hp = maxHp;
    usedActs = new Set();
    onCompleteZone = doneCallback;
    setHpDisplay();
    dom.mercyRow.classList.add("hidden");
    dom.battleWrap.style.display = "none";
    dom.menuBox.style.display = "none";

    await showSequence(zoneData.intro);
    dom.portrait.style.display = "none";
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
  // zoneData.rounds: [{ preLines?, enemyLine?, dodge:{...,pattern}, options:[
  //   { type:"fight", label, reactionLines?, enemyPortraitAfter? } |
  //   { type:"act", id, label, reactionLines?, mercy? }
  // ] }, ...] -- fordulonkent a jatekos EGY opciot valaszt egy menubol; a
  //   FIGHT mindig azonnal "talal" (nincs kulon mini-jatek), a valasztott
  //   opciotol fuggetlenul a KOVETKEZO fordulo dodge-mintazata objektíve
  //   nehezebb (ez adja az eszkalaciot, nem szamszeru elonf/vedekezes-logika).
  // zoneData.ending: { spare: { lines, failLines }, fight: { lines,
  //   enemyPortrait, roomDecoration? } } -- az utolso (4.) "fordulo" mar nem
  //   tamad, csak egy FIGHT/SPARE zaro-valasztas: SPARE csak akkor sikerul,
  //   ha `mercy` mar elerte a 100-at, kulonben rovid failLines utan a FIGHT-
  //   kimenetellel zarul (ld. resolveEnding()).

  function fillEnemyPortrait(line) {
    if (line.portrait || !currentRoundZone || line.speaker !== currentRoundZone.enemy.name) return line;
    return { ...line, portrait: enemyPortrait };
  }

  async function startRoundBattle(zoneData, doneCallback) {
    battleMode = "rounds";
    hp = maxHp;
    mercy = 0;
    enemyPortrait = zoneData.enemy.sprite;
    onCompleteZone = doneCallback;
    currentRoundZone = zoneData;
    currentRoundIndex = 0;
    setHpDisplay();
    setMercyDisplay();
    dom.mercyRow.classList.remove("hidden");
    dom.battleWrap.style.display = "none";
    dom.menuBox.style.display = "none";

    await showCornerBanter(zoneData.cornerIntro);
    dom.portrait.style.display = "none";
    await showSequence(zoneData.enemy.introLines);
    await runRound();
  }

  async function runRound() {
    const zoneData = currentRoundZone;
    while (currentRoundIndex < zoneData.rounds.length) {
      const round = zoneData.rounds[currentRoundIndex];
      if (round.preLines) await showSequence(round.preLines.map(fillEnemyPortrait));
      if (round.enemyLine) await showSequence([fillEnemyPortrait(round.enemyLine)]);

      dom.battleWrap.style.display = "block";
      await new Promise((resolve) => {
        Engine.startDodgePhase(round.dodge.duration, round.dodge, () => {
          dom.battleWrap.style.display = "none";
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
      if (chosen.type === "fight" && chosen.enemyPortraitAfter) {
        enemyPortrait = chosen.enemyPortraitAfter;
      }
      if (typeof chosen.mercy === "number") {
        mercy = chosen.mercy;
        setMercyDisplay();
      }
      if (chosen.reactionLines) {
        await showSequence(chosen.reactionLines.map(fillEnemyPortrait));
      }

      currentRoundIndex++;
    }
    await resolveEnding();
  }

  async function resolveEnding() {
    const zoneData = currentRoundZone;
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
      await showSequence(zoneData.ending.spare.failLines.map(fillEnemyPortrait));
    }
    await finishZone("fight");
  }

  async function finishZone(outcome) {
    const zoneData = currentRoundZone;
    const branch = zoneData.ending[outcome];
    if (branch.enemyPortrait) enemyPortrait = branch.enemyPortrait;
    await showStyleTag(zoneData.styleTag || "+STYLE");
    await showSequence(branch.lines.map(fillEnemyPortrait));
    dom.mercyRow.classList.add("hidden");
    if (onCompleteZone) onCompleteZone({ outcome, roomDecoration: !!branch.roomDecoration });
  }

  return { initDom, start, onHit };
})();
