# Project: Birthday Reset — összefoglaló (2026-07-11)

Ez a fájl egy pillanatkép: mit csináltunk ebben a menetben, és mi a
következő szakasz feladata. A technikai/architektúra részletekért lásd a
`CLAUDE.md`-t — **azt olvasd el elsőként**, ez a fájl csak a "hol tartunk"
gyors összefoglalója és a következő lépés ismertetője.

---

## 1. Ebben a menetben elkészült dolgok

### A Feki-követő "rátapad" hibája — végre megoldva

Az `osszefoglalo-260710.md` 5. szakaszában leírt, akkor megoldatlanul
hagyott hiba: a felhasználó szerint a folyosón a kísérő macska "szinte
állandóan ott lóg közvetlenül mellette/mögötte, alig marad le, nincs
látható futás-animáció — mintha csak a pozícióját másolná". A korábbi két
kör (idle-detektálás, beragadás-észlelő) nem ezt az okot javította.

A pontos tünet leírása után kiderült a valódi ok: a `FOLLOWER_KEEP_DISTANCE`
egyetlen közös határ volt mind az "induljon el utolérni", mind az "itt
álljon meg" döntéshez — a kísérő sebessége (160) és a játékosé (140) közel
azonos volt, ezért a kísérő gyakorlatilag lépéstartásban, egy állandó szűk
távolságon "ragadt" mozgott, sosem esett le látványosan, hogy aztán érdemben
utána fusson.

**Javítás** (`js/overworld.js` `updateFollower()`): hiszterézis két külön
határral — `FOLLOWER_CHASE_TRIGGER_DISTANCE` (140px, ENNYIRE kell
lemaradnia, hogy egyáltalán elinduljon utolérni) és `FOLLOWER_KEEP_DISTANCE`
(60px, EDDIG fut, itt áll meg) —, plusz `FOLLOWER_SPEED` felemelve
160→230-ra, hogy az utolérés egy gyors, jól látható "beérős" mozdulat
legyen. **A felhasználó megerősítette, hogy ez megoldotta a hibát.**

Tanulság (bekerült a CLAUDE.md-be is): a korábbi két kör kódolvasásból
levezetett, plauzibilis hipotézisekre épült, de csak a pontos, felhasználó
által leírt tünet vezetett el a valódi okhoz.

### Új: az 1. zóna külön bevezető szobája (Isaac-szoba)

A felhasználó kérésére a folyosó 1. zónás ajtaja mostantól nem közvetlenül
a harcba visz, hanem egy külön kis szobába (`isaac_room.png`,
`buildIsaacRoomScene()` a `js/main.js`-ben):

- egyetlen képernyőt töltő szoba, mint a `ROOM_SCENE` (nincs kamera-eltolás)
- a zóna ellenfele (Könny-lény) saját, automatikus hotspotként áll benne —
  odasétálva indul a harc, mint eddig a folyosón
- csak alul, egy külön kilépő hotspoton át lehet visszajutni a folyosóra
- a macska (follower) **nem követ be ide** — a scene-confignak szándékosan
  nincs `follower` mezője
- saját háttérzenéje van (`isaacMusic`), ami a `roomMusic`-kal `pause()`/
  `play()`-jel vált (nem újraindítással) — kilépéskor/a zóna1 harc
  győzelme után a `roomMusic` pontosan onnan folytatódik, ahol abbamaradt

**Egy hibát menet közben találtunk és javítottunk:** a szoba `spawn`
pontja eredetileg túl közel volt a kilépő hotspot aktiválási sugarához, így
belépéskor a kilépő hotspot AZONNAL lefutott, és a játékos rögtön
visszapattant a folyosóra (ez nézett ki úgy, mintha "a folyosó közepén"
landolna). Javítás: a spawn-t messzebb toltuk a kilépő ponttól, a kilépő
hotspot sugarát pedig csökkentettük.

### Új: belső keret a harc-képernyőn is

A felhasználó kérésére a `#game-screen` (harc-képernyő) mostantól
ugyanazt a réteges szerkezetet követi, mint az `#overworld-screen`: külső
keret → "Mozgás harcban: ..." hint-szöveg (eddig csak a címképernyőn volt
látható) → belső fehér keret (`#battle-stage`) → a tényleges harc-UI.

Két kör finomítás volt szükséges:

1. Először egy rugalmas (állapotfüggő, nem fix) magasságú `#battle-stage`-t
   csináltunk, mert a harc-tartalom (dodge-canvas + dialógus-doboz
   egyszerre látható) magassága a legrosszabb esetben (egy 3 sorra törő
   támadó-sor) meghaladja a 480px-t.
2. A felhasználó kifejezetten kérte, hogy **fix méretű** legyen, pontosan
   ugyanakkora, mint az `#overworld-stage` (640×480). Ezt megcsináltuk —
   **de** nem tettünk rá `overflow:hidden`-t (ami az overworld-stage-en
   van), mert az levágná/elrejtené a dialógus-doboz alját a fent említett
   legrosszabb esetben. Így legfeljebb kilóg egy kicsit a kereten, de
   semmi sem tűnik el. Ez egy tudatosan vállalt kompromisszum, nincs
   tesztelve élesben (a felhasználó kérésére nem is teszteltük — ő nézi
   meg saját maga).

### Dokumentáció

A `CLAUDE.md` több helyen frissült ebben a menetben az összes fenti
változással, plusz egy új, a fájl tetejére került szabály: **az AI mindig
kérdezzen vissza eldöntendő/választós kérdésekkel, ha valami nem
egyértelmű** — a felhasználó ezt kifejezetten szereti, és azt kérte, hogy
gyakrabban használjuk.

---

## 2. Jelenlegi állapot

A teljes végigjátszható lánc (cím → szoba → folyosó → mind a 4 zóna →
Asgore-zárás → vég-képernyő) továbbra is megvan, plusz az 1. zónának most
már egy külön bevezető szobája is van. A folyosói macska-követő hibája
véglegesen megoldva. A harc-képernyőnek most már ugyanolyan vizuális kerete
van, mint az overworldnek.

---

## 3. Következő szakasz — ha új session-t nyitsz, ez a feladat

**A felhasználó kifejezett kérése:** az 1. zóna harcát kell
megcsinálni/kikerekíteni, és a harcrendszert (`js/battle.js`,
`js/engine.js`, esetleg a `js/zones.js` ACT/dodge-adatstruktúrája)
**kibővíteni és átalakítani**.

**Fontos: a pontos irány még nincs kitalálva.** Mielőtt bármit kódolnál,
**kérdezz vissza** a felhasználótól konkrét, eldöntendő kérdésekkel, pl.:

- Milyen jellegű új ACT-ok legyenek (több választási lehetőség, valamilyen
  új mechanika, ne csak "reakció-szöveg + endsFight")?
- A dodge-fázis maradjon a jelenlegi egyszerű "kerülgesd a lövedékeket"
  formában, vagy legyen bonyolultabb (több hullám, mintázatok, stb.)?
- Legyen-e valami új állapot/mechanika a HP/SOUL mellett (pl. speciális
  erőforrás, kombó, stb.)?
- Ez csak az 1. zónára vonatkozik-e, vagy a többi zóna harcát is át kell
  majd később alakítani ugyanígy?

**Megkötések, amiket tarts szem előtt:**

- A `CLAUDE.md` elején lévő tónus-szabályok (ne legyen tanmese, rövid
  szövegek) továbbra is érvényesek.
- A felhasználó saját maga teszteli a böngészőben — csak akkor használj
  preview-eszközöket, ha ő explicit kéri, vagy ha egy hibát reprodukálni
  próbálsz és ő már megpróbálta leírni, mit lát (ld. a Feki-követő
  tanulságát fentebb: a pontos tünet fontosabb, mint a kód alapján
  kitalált hipotézis).
- Kezdd a `CLAUDE.md` elolvasásával, utána ezt a fájlt.
