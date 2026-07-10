# Project: Birthday Reset — összefoglaló (2026-07-10)

Ez a fájl egy pillanatkép: mit csináltunk ebben a menetben (a nyitó jelenet —
cím-képernyő → gyerekszoba → gép-választás → glitch-átmenet — teljes
kidolgozása), és mi a következő szakasz feladata. A technikai/architektúra
részletekért lásd a `CLAUDE.md`-t — **azt olvasd el elsőként**, ez a fájl csak
a "hol tartunk" gyors összefoglalója és a következő lépés ismertetője.

---

## 1. Ebben a menetben elkészült dolgok

A menet fókusza: **a nyitó jelenet (szoba) végigvitele placeholder-szintről
majdnem-kész állapotba.** Nagyobb tételek:

**Harc-képernyő valódi UI-ra cserélve** (`tools/slice_ui_assets.py` vágja ki
a beszerzett Deltarune-lapokból):

- valódi HP-csík keret, párbeszéd-doboz keret (sarok-csillagos, kereten
  kívül átlátszó), ACT-gomb ikon, SOUL-szív, lövedék, Game Over felvillanás
- gépelős szöveg mindenhol **`*`-al kezdődik**, karakterenként hangot ad
  (`snd_txtasg.wav`)
- soronkénti **arcváltás időzíthető** kézzel: `{{kulcsnév}}` jelölő a
  szövegben + `faces: {...}` mező a dialógus-objektumon (lásd `js/zones.js`
  ZONE_1 KECSKE-sora, és a CLAUDE.md "Harci dialógus" szakasza)

**Egységes overworld-motor**: a korábbi, duplikált `room.js`+`corridor.js`
helyett egyetlen `js/overworld.js`, hotspot- és decoration-rendszerrel,
L-alakú (több téglalapból álló) `walkBounds`-szal — lásd CLAUDE.md.

**A szoba-jelenet konkrétan:**

- a játékos-sprite **irány- és lépésfüggő** (4 irány × 2 fázis, `Bazsa_placeholder_*`),
  mérete a bútorokhoz igazítva (58×100)
- Feki, a macska ül az ablakpárkányon (4 kockás animáció, `decorations` rendszer)
- Tenna overworld-sprite-ja lecserélve a helyes oldalarányú képre
- a "Bekapcsolom a gépet" / "Inkább kimegyek apához" választás **Undertale-stílusú
  szöveges menüvé** alakítva: nincs gombkeret, a kijelölt sárga + SOUL-szív
  előtte, nyilakkal/Enterrel/szóközzel navigálható
- Tenna/Queen sarok-beszólása: valódi buborék-grafika (`Speech Bubbles_rooms.png`),
  a portréjuk (`Tenna_room.png`/`Queen_room.png`) jobbra lent, a szöveg tőle
  balra, **gépelve jelenik meg**, Space/Enter/kattintás lépteti tovább
  (nincs többé időzített eltűnés)
- 3 új hangeffekt bekötve: `zoneStart` (gép bekapcsolásakor), `jokerLaugh`
  (a "dupla START" felbukkanásakor), `flavorText` (polc/tévé-nézésnél —
  ez utóbbi fájl kb. 13x túl halk volt, felerősítettem)
- halk háttérzene (`DELTARUNE-Chapter-5_Media_...mp3`, hurokban, a START
  gombra indul)

**Két kör hibajavítás** (ugyanaz a gyökér-ok, két helyen bukkant fel): ha egy
Enter-lenyomás egyszerre nyitott meg egy modális dobozt ÉS az a doboz saját
billentyű-kezelése is ugyanabban a billentyű-eseményben lefutott, a játék
egyből átugrott a következő jelenetbe. Megoldás: az `Overworld.tryInteract()`
és a `dismissCornerPopup()` is egy tick-kel késlelteti a callback-jét, hogy a
megnyíló doboz csak a _következő_ gombnyomásra reagáljon.

---

## 2. Jelenlegi állapot

A **cím-képernyő → szoba → gép-választás → glitch-átmenet** rész alaposan
leteszteltem (billentyűzettel is), stabil, jónak tűnik.

Ami ezután jön (folyosó, mind a 4 zóna, Asgore-zárás, vég-képernyő) **még a
korábbi placeholder-szinten van** — sem vizuálisan, sem az imént felsorolt
polish-szinten nem lett még megcsinálva. Ez a következő szakasz.

---

## 3. Következő szakasz — ha új session-t nyitsz, ez a feladat

**Cél:** a szobából a folyosóra (a "számítógépes játékvilágba") való átlépés
kidolgozása — átvezető animáció + a folyosó háttereinek felépítésének
megkezdése.

**Konkrét feladatok:**

1. **Átvezető animáció** a szoba → folyosó váltásnál. Jelenleg ez csak egy
   nagyon egyszerű, 0.5 másodperces CSS-villanás (`enterGlitchWorld()` a
   `js/main.js`-ben, `body.screen-glitch` + `roomGlitch` keyframes a
   `style.css`-ben — invert/kontraszt-villogás). Ezt kellene látványosabbá,
   a "glitch a valóságban" hangulathoz jobban illővé tenni.
2. **A folyosó háttereinek felépítésének megkezdése.** Jelenleg
   `assets/sprites/corridor_bg_placeholder.png`, egy generált, névvel jelzett
   placeholder (`tools/gen_assets.py` `corridor_bg()` csinálja). Erről lásd
   a CLAUDE.md "Az overworld-jelenetek hangolása" szakaszát is: a folyosó 4
   egyenlő szakaszra van felosztva, mindegyikben egy zóna-belépési ponttal.

**Megkötések, amiket tarts szem előtt:**

- A `CLAUDE.md` elején lévő **tónus-szabályok** (ne legyen tanmese, rövid
  szövegek, a 4 zóna egyenlő súlyú) továbbra is érvényesek.
- Ne nyúlj a `js/zones.js` sztori-tartalmához vagy a harc-rendszerhez
  (`battle.js`/`engine.js`) — ez a szakasz **kifejezetten a folyosó
  vizuáljáról/átmenetéről** szól, hacsak a felhasználó explicit mást nem kér.
- A meglévő `js/overworld.js` hotspot- és `decorations`-rendszerét kell
  újrahasznosítani (ld. CLAUDE.md) — ne írj új mozgás- vagy interakció-motort,
  ha a jelenlegi már megoldja a feladatot.
- Kezdd a `CLAUDE.md` elolvasásával, utána ezt a fájlt — a technikai
  konvenciók ott vannak, nem itt.
- A felhasználó saját maga teszteli a böngészőben (ez korábbi menetekben
  explicit kérés volt) — ha külön kéri, hogy a preview-eszközökkel élőben
  ellenőrizd a változásokat akkor tedd meg.

---

## 4. Ugyanennek a napnak (2026-07-10) egy későbbi menetében elkészült

**Glitch-átmenet látványosabbá tétele:** a korábbi 0.5s-os, egyszerű
invert/kontraszt-villogás (`body.screen-glitch` + `roomGlitch`) helyett egy
0.9s-os, jump-cut jellegű `worldGlitch` animáció (`style.css`), ami most
kizárólag a `#game-stage`-en fut (nem a `body`-n, hogy a letterbox-keret
nyugodt maradjon). RGB-szétcsúszás (`drop-shadow`), `clip-path`-alapú
sáv-eltolások és egy `snd_error.wav` "torzulás"-hang + a korábbi `zoneStart`
jingle egymás után indul, a jelenetváltás pedig csak az animáció végén
(amikor a kép már majdnem fekete) történik — lásd `enterGlitchWorld()` a
`js/main.js`-ben.

**Folyosó-háttér: technikai előkészítés a zónánkénti cserére** (a felhasználó
explicit ezt az irányt választotta 4 opcióból): a korábbi egyetlen,
összefűzött `corridor_bg_placeholder.png` (4400×480, 4×1100px szakasz)
helyett **4 külön fájl**, `corridor_zone1_bg_placeholder.png` ...
`corridor_zone4_bg_placeholder.png` (`tools/gen_assets.py` `corridor_bg()`
generálja). Ehhez az `Overworld` motor is bővült: `scene.bgSrc` mostantól
egyetlen kép-útvonal *vagy* egy ilyen útvonalakból álló tömb lehet — tömb
esetén a képek egymás mellé illesztve (mindegyik a stage magasságára
skálázva) alkotják a világot (`loadBackground()`/`placeBgSegments()` az
`overworld.js`-ben). Ez azért fontos, mert így **egy-egy zóna folyosó-
szakaszának későbbi lecserélése saját rajzra nem érinti a másik hármat** —
csak a megfelelő `corridor_zoneN_bg_placeholder.png` fájlt kell felülírni.
A `DOOR_FRACTIONS` (`js/main.js`) egyenletes negyedelése egyelőre stimmel
(mind a 4 generált kép egyenlő szélességű), de ha a végleges rajzok ettől
eltérő szélességűek lesznek, ezt kézzel újra kell hangolni — ez a CLAUDE.md-be
is bekerült.

**Amit ez a menet NEM csinált meg:** a folyosó tényleges, kézzel rajzolt
háttérképét egyik zónához sem készítette el — a 4 fájl továbbra is a
generált, "PLACEHOLDER" feliratos, egyszínű blokk. A vizuál-fázis (DESIGN.md
3. fázis) innen folytatódik, zónánként egy-egy fájl cseréjével.

**Nem lett tesztelve böngészőben ebben a menetben, mielőtt a felhasználó
átvette** — a CLAUDE.md szabálya szerint a tesztelés a felhasználó dolga.

**Finomítás a felhasználó visszajelzése alapján:** a glitch-átmenet szét-
esős/torzulós szakasza tetszett, de a fekete pillanat után egyből, ugrás-
szerűen jelent meg a folyosó. Ezt három lépésre bontottam: (1) a `worldGlitch`
keyframes már nem tér vissza a végén `filter:none`-ra (korábban 774-900ms
között visszavillant volna a régi szoba-kép), hanem `brightness(0)`-ban marad;
(2) egy új, dedikált `#scene-fade` fekete fedő (`index.html`/`style.css`) a
`screen-glitch` animáció végén azonnal (átmenet nélkül) teljesen fekete lesz,
és 0.5 másodpercig (`GLITCH_BLACK_HOLD_MS`) így is marad -- eközben cserélődik
a jelenet a DOM-ban, láthatatlanul; (3) utána a fedő `opacity` `transition`-nel
(0.5s, `scene-fade-in` osztály) tűnik el, felfedve a folyosót. Lásd
`enterGlitchWorld()` a `js/main.js`-ben, a pontos időzítések a
`GLITCH_SHAKE_MS`/`GLITCH_BLACK_HOLD_MS`/`GLITCH_FADE_MS` konstansokban.
