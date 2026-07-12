# Project: Birthday Reset — összefoglaló (2026-07-12)

Ez a fájl egy pillanatkép: mit csináltunk ebben a menetben, és mi a
következő szakasz feladata. A technikai/architektúra részletekért lásd a
`CLAUDE.md`-t — **azt olvasd el elsőként**, ez a fájl csak a "hol tartunk"
gyors összefoglalója és a következő lépés ismertetője.

Ez volt eddig a leghosszabb menet: az `osszefoglalo-260711.md` végén
nyitva hagyott "1. zóna harcát kell kibővíteni, de az irány még nincs
kitalálva" feladatot csináltuk végig, több körben, a felhasználó egyre
konkrétabb visszajelzései alapján finomítva. **A menet végén a felhasználó
kifejezetten megerősítette: "Szuper az első két résszel megvagyunk, Bazsa
szoba és Isaac room."**

---

## 1. Ebben a menetben elkészült dolgok

### Az 1. zóna FIGHT/ACT/SPARE harca — a felhasználó konkrét forgatókönyve alapján felépítve

A felhasználó egy teljes, fordulónkénti (4 forduló) forgatókönyvet adott
(Queen+Tenna sarok-beszólás → 3 harci forduló, mindegyikben FIGHT vagy ACT
választható → záró FIGHT/SPARE-döntés). Ebből épült fel a `js/zones.js`
`ZONE_1.rounds`/`ending` adatformátuma és a `js/battle.js`
`startRoundBattle()`/`runRound()`/`resolveEnding()` motorja — ld. a
CLAUDE.md "Az 1. zóna FIGHT/ACT/SPARE harca" szakaszát a teljes
adatformátumért. Idetartozó döntések, amiket a felhasználó választott
(AskUserQuestion-kérdésekre válaszolva):

- A FIGHT egyszerű, azonnal találó gomb, nincs külön mini-játék.
- Nincs látható ellenfél-HP-sáv, az eszkalációt a dodge-mintázat adja.
- A Spare-mérő látható és TÉNYLEGESEN számít (100% kell a sikeres SPARE-hez).
- Fordulónként szabadon lehet váltani FIGHT és ACT között.
- Sikertelen SPARE-próbálkozás → automatikusan FIGHT-zárás.
- Ez most csak az 1. zónára vonatkozik, a 2-4. zóna a régi motoron marad.
- A legyőzött ellenfél tartós dísz marad a szobában (FIGHT-kimenetel).
- A SPARE-jutalom (sárga kocka) csak hangulati, nincs mechanikai hatása.

`js/engine.js` három dodge-mintázatot kapott (`rain`/`bounce`/`spiral`),
`tools/slice_ui_assets.py` pedig két új UI-ikont vágott ki (`fight_icon.png`,
`spare_icon.png`) a valódi Deltarune-forrásból.

### Több finomítási kör a felhasználó konkrét, lépésenkénti visszajelzései alapján

Miután az alap-rendszer állt, a felhasználó screenshotokat és lépésenkénti
hibalistákat adott a valódi Deltarune-harcképernyőhöz hasonlítva. Minden
lépésnél kérdéseket tettem fel, mielőtt kódoltam (a felhasználó ezt
kifejezetten kéri). Amiben megegyeztünk és megvalósult:

1. **Queen/Tenna sarok-buborék a harcban** mostantól a szoba "room"-stílusát
   használja (`Queen_room.png`/`Tenna_room.png`, `Speech Bubbles_rooms.png`),
   nem a sima fekete-sárga dobozt.
2. **A szövegdoboz mindig alul van, sosem marad rajta régi szöveg** — a
   dodge-fázis/menü után a dialogue-box addig rejtve marad, amíg tényleg
   nincs új mondanivaló (`showSequence()` fedi fel automatikusan).
3. **A menü mindig alulra dokkol**: ha van látható (friss) szövegdoboz, a
   teteje fölé zár; ha nincs, lehúzódik a képernyő aljához.
4. **Minden névvel ellátott karakter automatikusan kap arcképet**, ha egy
   sor nem adott meg sajátot (`resolvePortrait()`), a `_talk` változatot
   preferálva — ez menet közben egy valódi hibát is feltárt: a ZONE_2
   ellenfelének `name`-je nem egyezett a `speaker`-rel, javítva.
5. **A Könny-lény sprite-ja folyamatosan látszik a képernyő közepén**
   (`#battle-enemy-sprite`) a harc alatt, függetlenül a dialogue-box
   "beszélő" arcképétől — két külön állapot (`enemyPortrait` a dialogue-
   boxnak, `centerEnemySprite` a középső sprite-nak), két külön
   asset-sorozattal (`_talk-dying-01/02` vs sima `-dying-01/02/die`).
6. **Nincs beszélő-név sehol a dialogue-boxban** (`#speaker-name` elrejtve).
7. **Fordulók közti tartalmi elágazás**: a 2. forduló bevezetője más, ha az
   1. fordulóban FIGHT-ot választott a játékos (`preLinesIfPrevFight`); a
   3. forduló bevezető sora csak akkor hangzik el, ha a 2. fordulóban PONT
   a ROBLOX TÁNC-ot választották (`enemyLineRequiresPrevChoice`).
8. **A Spare-mérő összeadódik**, nem felülír (ROBLOX TÁNC +50 és OOF KÓRUS
   +50 együtt ér 100-at, külön-külön csak 50-nél áll meg).
9. **3 választás egy sorban** jelenik meg a menüben (dinamikus
   grid-oszlopszám az opciók száma szerint), nem 2+1 tördelve.
10. **Piros könnyek FIGHT után**: ha az 1. fordulóban FIGHT-ot választja a
    játékos ("A könnyei hirtelen vörösre váltanak."), onnantól a dodge-
    fázisok piros lövedék-texturát (`tear_bullet-red.png`) használnak.
11. **A spiral-mintázat két finomítása**: a kísérleti "óriás könny"
    placeholder eltávolítva a doboz közepéről; a SOUL a doboz alsó
    harmadában spawnol, nem középen (ahol a spirál emittere van).
12. **SPARE utáni viszontlátás**: ha a játékos kegyelmet adott és utólag
    visszasétál az Isaac-szobába, a Könny-lény ott áll, Enterrel
    megszólítható, egy kész (a felhasználó által írt) búcsú-párbeszédet ad,
    és NEM indul újra harc (`zone1Spared`, `showOverworldDialogue()`,
    `KONNYLENY_REUNION_LINES` — mind `js/main.js`-ben).

Menet közben egy tényleges hibát is találtam és jeleztem a felhasználónak
(nem javítottam egyoldalúan): az `enemy_konnyleny_placeholder_talk.png`
fájl méretben/stílusban nem illett a többi Könny-lény-sprite-hoz — a
felhasználó ezt tudomásul vette, és utólag hozzáadta a hiányzó
`_talk-dying-01/02.png` variánsokat is, így ez most egy szándékos,
konzisztens külön asset-sorozat.

### Dokumentáció

A `CLAUDE.md` "Az 1. zóna FIGHT/ACT/SPARE harca" és "Harc-UI" szakaszai
teljesen frissültek/átíródtak a fenti változásokkal, plusz egy új "SPARE
utáni viszontlátás (Isaac-szoba)" szakasz került bele. A "Hátralévő munka"
elején most már egyértelműen jelzi: az 1. zóna kész, a következő fókusz a
zónák szétválasztása.

---

## 2. Jelenlegi állapot

A teljes végigjátszható lánc továbbra is megvan. **A felhasználó szerint a
játék első két nagy szakasza (Bazsa-szoba bevezető + Isaac-szoba/Könny-lény
harc) ebben a formájában kész.** Az 1. zóna saját, teljes FIGHT/ACT/SPARE
harc-rendszert kapott, valódi Deltarune-közeli UI-vel (fix pozíciók, dupla
ellenfél-sprite-állapot, dinamikus arckép-kitöltés). A 2-4. zóna
változatlanul a régi, egyszerű ACT-listás motoron és placeholder
vizuálokon van.

---

## 3. Következő szakasz — ha új session-t nyitsz, ez a feladat

**A felhasználó kifejezett kérése:** a zónák szétválasztása/egyedivé
tétele. Szó szerint: *"azzal kellene haladni, hogy le kell választani a
különböző zónákat. A 2. zónának más lesz a kinézete, máshol lesznek az
NPC-k, maga a harcrendszer hasonló lesz de más beszélgetésekkel."*

Vagyis a 2. zóna (A Cirkusz, Bohóc-NPC) a következő cél.

**Fontos: a pontos irány még nincs kitalálva.** Mielőtt bármit kódolnál,
**kérdezz vissza** a felhasználótól konkrét, eldöntendő kérdésekkel, pl.:

- A "harcrendszer hasonló lesz, de más beszélgetésekkel" azt jelenti, hogy
  a 2. zóna is megkapja az 1. zóna FIGHT/ACT/SPARE fordulós rendszerét
  (ez esetben érdemes lenne általánosítani a jelenleg zóna1-specifikus
  formátumot), vagy marad a régi, egyszerű ACT-listás motoron, csak a
  szövegek/vizuál változik?
- A "máshol lesznek az NPC-k" a folyosó 2. zónás szakaszára vonatkozik (a
  Kecske-hotspot pozíciója/megjelenő NPC-k), vagy a 2. zóna is kap egy
  saját bevezető szobát, mint az 1. zóna Isaac-szobája
  (`buildIsaacRoomScene()` mintájára)?
- Van-e már kész vizuál/asset a 2. zónához (háttér, NPC-sprite-ok), vagy
  egyelőre a placeholder marad, és csak a pozíciók/struktúra készül el?

**Megkötések, amiket tarts szem előtt:**

- A `CLAUDE.md` elején lévő tónus-szabályok (ne legyen tanmese, rövid
  szövegek) továbbra is érvényesek.
- A felhasználó saját maga teszteli a böngészőben — csak akkor használj
  preview-eszközöket, ha ő explicit kéri, vagy saját magad ellenőrzöl
  gyorsan egy változtatást, mielőtt visszaadod a szót.
- Ebben a menetben bevált minta: lépésenként, egy-egy konkrét kéréssel
  haladtunk, minden lépés után gyors visszajelzéssel — ha a felhasználó
  ismét így kezdi ("egyesével mondom, mit javítsunk"), kövesd ugyanezt a
  ritmust, ne próbálj egyszerre mindent kitalálni előre.
- Kezdd a `CLAUDE.md` elolvasásával, utána ezt a fájlt.
