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

---

## 5. Ugyanennek a napnak egy még későbbi menetében elkészült

Ez a szakasz jó pár apró, egymásra épülő felhasználói kérést fog össze.
Technikai részletek mindenhol a `CLAUDE.md`-ben (ez csak a "mi történt és
miért" napló).

**Folyosói karakter-méret:** `scene.playerScale` (alapértelmezett 1) —
a folyosón `0.75`, kicsit kisebb, távlati-érzetet keltő szereplő. Ld.
"Karakter-sprite-ok" a CLAUDE.md-ben.

**Fejlesztői debug-kapcsolók** (`js/overworld.js` teteje): `DEBUG_WALKBOUNDS`
(zöld keret a járható területnek) és `DEBUG_HOTSPOTS` (piros kör a hotspotok
aktiválási sugarának) — mindkettő jelenleg `true`, csak kódból kapcsolható,
tesztelés utáni visszaállítás a felhasználó dolga.

**Zóna-belépés automatikussá tétele:** a folyosón az ajtó-hotspot mostantól
`auto: true` — nem kell Enter, a puszta odasétálás indítja a harcot, egy
sima, átmenetes elsötétedéssel (`enterZoneWithFade()`, `js/main.js`) —
szándékosan más karakterű, mint a glitch-átvezetés "ugrás a feketébe"
jellege. Ld. "Képernyő-átmenetek" a CLAUDE.md-ben.

**Hotspot-sprite pozíció leválasztva az interakciós területről:** egy
hotspot `sprite.xFrac`/`sprite.yFrac`-a mostantól függetlenül állítható a
hotspot saját (interakciós/aktiválási) `xFrac`/`yFrac`-ától. Emellett
`sprite.matchPlayerSize`/`noFloat` is bekerült (a karakter mérete pontosan
a játékoséhoz igazodjon / ne lebegjen fel-le). Ezekkel lett átalakítva a
folyosói Kecske-hotspot.

**Csak Kecske maradt a folyosón:** a felhasználó kérésére a Tenna/Queen
folyosói hotspotja (sprite+beszólás) el lett távolítva (túl zsúfolt volt
egy helyen) — a `companionChat[1]`/`[2]` szövegük a `js/zones.js`-ben
változatlanul megvan, csak jelenleg nincs hozzájuk sprite/hotspot.

**Sarok-buborék lapozása + méret-felülbírálás:** `Overworld.showCornerPopup()`
`text` paramétere mostantól lehet sztringtömb is (több "oldal",
Enter/szóköz/kattintással lapozva) — ezt használja a `ZONE_1` hosszú
Kecske-sora (`js/zones.js`). Kapott egy `opts: {boxWidth?, portraitSize?}`
paramétert is, amivel egyetlen konkrét sor kaphat szélesebb dobozt/nagyobb
portrét a CSS-alapértelmezett helyett. A gépelés-hang mostantól mindig szól
(korábban csak a szoba "room" variánsánál szólt). A lapozás-jelző "▶" nyilat
menet közben kivettük (a felhasználó nem kérte, zavaró volt), és a sima
(nem "room") variáns portréja mostantól felül igazított (korábban alul,
mint a "room" variáns, ami maradt alul-igazított).

**Feki (a macska) mint követő NPC — ez volt a menet legnagyobb tétele.**
A `assets/sprites/cat/` mappa bővült `feki_run_0N.png`/`feki_jump_0N.png`
kockákkal (a meglévő `feki_0N.png` ülő-animáció mellé). Ebből épült egy
általános `scene.follower` motor-funkció (`js/overworld.js`): egy NPC, ami
késleltetve (véletlenszerű reakció-idővel) elindul a játékos után, ha a
távolság megnő, futás-animációval követi, ritkán ugrik egyet
változatosságért, és leül, ha a játékos régóta mozdulatlan.

Első nekifutásra rossz helyre (a szobába) került — a felhasználó jelezte,
hogy **fordítva kellene**: a szobában Feki maradjon egyszerű, statikus
ablakpárkány-dekoráció (ahogy addig is volt), a follower-viselkedés pedig
a **folyosóra** kerüljön. Ez át lett rakva (`ROOM_SCENE.decorations` vs.
`buildCorridorScene().follower`).

Utána **három kör hibajavítás** volt szükséges, mert a follower élesben
furán viselkedett:

1. Futás-animáció beragadt (a kovető sosem ért utol semmit, örökké futott
   helyben) → egy "beragadás-észlelő" biztosíték: ha `walkBounds` miatt
   érdemi elmozdulás nélkül telik az idő, inkább leül.
2. Folyamatos játékos-mozgásnál "megindul-leül-megindul-leül" ciklusban
   ragadt → kiderült, hogy a véletlen reakció-késés minden egyes
   utolérésnél újraindult, még ha a kovető csak épp pillanatnyi "stand"
   (álló, még nem ülő) állapotba került. Javítás: a késés csak valódi
   (régóta tartó) "sit"-ből való ébredéskor jár, "stand"-ből azonnal
   folytatódik a követés.
3. A felhasználó jelezte, hogy ez **rosszabb** lett: fél perc után beragad,
   utána folyamatosan a játékosra tapad. **Ezúttal a felhasználó kérésére
   én magam is teszteltem** a preview-eszközökkel (statikus szerver +
   szimulált billentyű-események + `Overworld.__debugFollower()` ideiglenes
   debug-hook a belső állapot közvetlen kiolvasásához, utólag eltávolítva).
   Két valódi hibát találtam és javítottam:
   - a "jár-e a játékos" jelzés a NYERS billentyű-bemenetet nézte, nem a
     tényleges pozícióváltozást — ha a játékos egy falnak nyomva tartotta
     az irányt, a kovető sosem jutott el a valódi "leülésig", örökre az
     "utolért, de még nem ült le" pózban ragadt, közvetlenül a játékos
     mellett (ez volt a "rám van tapadva" panasz oka);
   - a "beragadás-észlelő" saját maga is hibás volt: fix 1.5px-es
     küszöbbel dolgozott, ami képkocka-sebesség-függő -- bizonyos
     helyzetekben egy akadálytalan lépés is e alá esett, és idő előtt
     leültette a kovető-t, még ha messze volt is. Javítás: a szándékolt
     lépés ARÁNYÁT nézi mostantól (blokkoltnak csak akkor számít, ha a
     tervezett lépés felénél kevesebbet sikerült csak megtennie).

   Mindkét javítást élesben leteszteltem (nem csak kód-olvasással) --
   falnak nyomva tartva a játékost most kb. 3mp valódi mozdulatlanság
   után ül csak le a kovető, utána pedig azonnal felkel és követ, ha a
   játékos újra elindul.

**A felhasználó szerint azonban ÉLESBEN JÁTSZVA A KÖVETÉS MÉG MINDIG
BUGOS**, a saját preview-teszt ellenére. A pontos reprodukálási lépéseket
nem ismerjük — a felhasználó kifejezetten kérte, hogy **ezt most hagyjuk
annyiban** (ne próbáljunk tovább vakon javítgatni), csak a dokumentáció
legyen naprakész. **Ha legközelebb ezzel foglalkozol, először kérdezd meg a
felhasználót, pontosan mikor/hogyan látta hibásnak** (merre mozgott, mennyi
ideig, mit csinált közben) — ez minden eddigi javítás kiindulópontja volt,
és a jelenség valószínűleg valami olyat takar, amit puszta preview-
teszteléssel (billentyű-szimuláció, néhány perces megfigyelés) nem sikerült
eddig reprodukálni.
