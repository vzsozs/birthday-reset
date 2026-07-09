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

  function typeText(speaker, text, portrait, faces) {
    return new Promise((resolve) => {
      dom.speakerName.textContent = speaker || "";
      dom.dialogueText.textContent = "";
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
            dom.portrait.src = faces[change.key];
          }
        }
      }

      function step() {
        if (skipRequested) {
          dom.dialogueText.textContent = displayText;
          applyFaceChangesUpTo(displayText.length);
          typing = false;
          finish();
          return;
        }
        if (i < displayText.length) {
          dom.dialogueText.textContent += displayText[i];
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
        dom.continueHint.style.visibility = "visible";
        advanceCallback = () => {
          dom.continueHint.style.visibility = "hidden";
          resolve();
        };
      }
      step();
    });
  }

  async function showSequence(lines) {
    for (const line of lines) {
      if (line.portrait) {
        dom.portrait.src = line.portrait;
        dom.portrait.style.display = "block";
      } else {
        dom.portrait.style.display = "none";
      }
      await typeText(line.speaker, line.text, line.portrait, line.faces);
    }
  }

  function setHpDisplay() {
    const pct = Math.max(0, (hp / maxHp) * 100);
    dom.hpFill.style.width = pct + "%";
    dom.hpText.textContent = `HP  ${Math.max(0, hp)} / ${maxHp}`;
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
        icon.src = "assets/sprites/ui/act_icon.png";
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
    startPlayerTurn(currentZone);
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
    hp = maxHp;
    usedActs = new Set();
    onCompleteZone = doneCallback;
    setHpDisplay();
    dom.battleWrap.style.display = "none";
    dom.menuBox.style.display = "none";

    await showSequence(zoneData.intro);
    dom.portrait.style.display = "none";
    await showSequence(zoneData.enemy.introLines);
    startPlayerTurn(zoneData);
  }

  return { initDom, start, onHit };
})();
