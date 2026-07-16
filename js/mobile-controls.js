/*
 * mobile-controls.js
 * Erintos joystick + Enter gomb erintokepes eszkozokhoz. NEM ismeri a jatek
 * belso allapotat (overworld/harc/menu) -- kizarolag szintetikus
 * KeyboardEvent-eket general a window-ra (nyilak a joystickbol, Enter a
 * gombbol), amiket az osszes meglevo billentyu-figyelo (overworld.js
 * mozgas, engine.js dodge-fazis, battle.js ACT-menu/dialogus-lapozas,
 * main.js valaszto-dobozok/ajandek-visszaszamlalo) mar amugy is figyel a
 * window-on -- igy semelyik masik fajlt nem kellett modositani ehhez.
 */
(() => {
  const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (!isTouchDevice) return;
  document.documentElement.classList.add("touch-device");

  const joystick = document.getElementById("mobile-joystick");
  const knob = document.getElementById("mobile-joystick-knob");
  const enterBtn = document.getElementById("mobile-enter-btn");
  if (!joystick || !knob || !enterBtn) return;

  const MAX_RADIUS = 42; // px, a knob legnagyobb elmozdulasa a bazis kozepetol
  const DEAD_ZONE_RATIO = 0.35; // MAX_RADIUS aranyaban -- ez alatt nincs iranyjelzes

  const DIR_KEYS = { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" };
  const pressedDirs = { up: false, down: false, left: false, right: false };
  let joystickPointerId = null;
  let baseCenter = null;

  function dispatchKey(type, key) {
    window.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true, cancelable: true }));
  }

  function setDir(dir, active) {
    if (pressedDirs[dir] === active) return;
    pressedDirs[dir] = active;
    dispatchKey(active ? "keydown" : "keyup", DIR_KEYS[dir]);
  }

  function releaseAllDirs() {
    Object.keys(pressedDirs).forEach((dir) => setDir(dir, false));
  }

  // A joystick digitalis (nem analog sebesseg-erzekeny) iranyokat kuld, mert
  // a jatek mozgas-logikaja is csak "nyomva van / nincs nyomva" allapotokkal
  // dolgozik (ld. overworld.js/engine.js `keys[...]`) -- atlos iranynal
  // (pl. jobb-fent) EGYSZERRE ket irany aktivalodik, ugyanugy, mintha a
  // jatekos ket nyilat tartana lenyomva.
  function updateFromDelta(dx, dy) {
    const dist = Math.min(Math.hypot(dx, dy), MAX_RADIUS);
    const angle = Math.atan2(dy, dx);
    const knobX = Math.cos(angle) * dist;
    const knobY = Math.sin(angle) * dist;
    knob.style.transform = `translate(${knobX}px, ${knobY}px)`;

    const threshold = MAX_RADIUS * DEAD_ZONE_RATIO;
    setDir("left", dx < -threshold);
    setDir("right", dx > threshold);
    setDir("up", dy < -threshold);
    setDir("down", dy > threshold);
  }

  function resetKnob() {
    knob.style.transform = "translate(0, 0)";
    releaseAllDirs();
  }

  joystick.addEventListener("pointerdown", (e) => {
    if (joystickPointerId !== null) return;
    joystickPointerId = e.pointerId;
    joystick.setPointerCapture(e.pointerId);
    const rect = joystick.getBoundingClientRect();
    baseCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    updateFromDelta(e.clientX - baseCenter.x, e.clientY - baseCenter.y);
    e.preventDefault();
  });

  joystick.addEventListener("pointermove", (e) => {
    if (e.pointerId !== joystickPointerId || !baseCenter) return;
    updateFromDelta(e.clientX - baseCenter.x, e.clientY - baseCenter.y);
    e.preventDefault();
  });

  function endJoystick(e) {
    if (e.pointerId !== joystickPointerId) return;
    joystickPointerId = null;
    baseCenter = null;
    resetKnob();
  }
  joystick.addEventListener("pointerup", endJoystick);
  joystick.addEventListener("pointercancel", endJoystick);

  // Enter gomb -- lenyomasra keydown, elengedesre keyup (mint egy valodi
  // billentyu), hogy a mar meglevo, `keys["enter"]`-t is figyelo logikak
  // (ha lennenek) ugyanugy mukodjenek, mint a kattintas/Enter-alapuak.
  let enterPointerId = null;
  enterBtn.addEventListener("pointerdown", (e) => {
    if (enterPointerId !== null) return;
    enterPointerId = e.pointerId;
    enterBtn.setPointerCapture(e.pointerId);
    enterBtn.classList.add("pressed");
    dispatchKey("keydown", "Enter");
    e.preventDefault();
  });

  function releaseEnter(e) {
    if (e.pointerId !== enterPointerId) return;
    enterPointerId = null;
    enterBtn.classList.remove("pressed");
    dispatchKey("keyup", "Enter");
  }
  enterBtn.addEventListener("pointerup", releaseEnter);
  enterBtn.addEventListener("pointercancel", releaseEnter);
})();
