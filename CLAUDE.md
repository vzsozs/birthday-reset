FONTOS: A TESZTELÉSEKET MEGCSINÁLOM ÉN, csak írd le röviden mit. !!!

# Project: Birthday Reset — kontextus Claude Code-nak

Ez egy kb. 10 perces, egyszemélyes böngészős játék, amit egy apa csinál a fiának a 13. szülinapjára. Deltarune/Undertale-stílusú, ACT-alapú harcrendszer, saját sztorival.
Vibecodolt, nem kereskedelmi termék — nincs deadline-nyomás, de a hangulat és a tónus
szigorúan számít (lásd lejjebb).

A teljes forgatókönyv/design-dokumentum a `DESIGN.md`-ben van. **Olvasd el azt is**,
mielőtt tartalmat (szöveget, zónát, karaktert) írsz — ez a fájl inkább a technikai
állapotot és a fejlesztési konvenciókat írja le.

## A legfontosabb szabály: tónus

- **Ne legyen tanmese.** Senki ne mondja ki explicit módon, hogy "a Roblox rossz" vagy
  hogy "túl sokat játszol vele". A Roblox-elemek vizuális/hangulati poénok, nem ítélet.
- **Rövid szövegek.** Egy karakter egyszerre max 1-2 mondatot mondjon. Semmi hosszú,
  magyarázó dialógus.
- **A négy zóna egyenlő súlyú**, a Roblox csak a 4. (utolsó) zónában tömény.
- A cél: **közös nevetés az apa és a fia között, nem lecke.**

Ha bizonytalan vagy egy szövegnél, hogy túl "kioktató"-e, inkább húzd rövidebbre vagy
hagyd ki.

## Jelenlegi állapot

**Teljes végigjátszható lánc, Deltarune-szerű overworlddel.** A flow:

cím-képernyő → **bejárható szoba** (a gyerek szobája, `bazsa_szoba.png` háttér,
szabad mozgás nyilakkal/WASD-vel) → a számítógéphez érve (interakció-hotspot,
Enter/kattintás) egy **narrációs választó-doboz** ("uhh, ma még nem
játszottam...", START / INKÁBB KIMEGYEK APÁHOZ — ez utóbbi Tenna majd Queen
vicces beszólását hozza be, végül a gomb magától Startra vált) → **glitch-átmenet**
(többlépcsős, ld. "Képernyő-átmenetek" lejjebb) → **oldalra scrollozó folyosó**
(kamera követi a játékost). A folyosón Kecske egy a játékost követő NPC (ld.
"Az overworld-jelenetek hangolása" lejjebb) — hozzá odamenve Enterrel/kattintással rövid,
opcionális, lapozható beszólás ugrik fel. A zóna-ellenfél sprite-jához
(szintén hotspot, de **automatikus**: nem kell Enter, elég odasétálni) érve
egy sima elsötétedéssel indul a harc, nem egy láthatatlan "ajtóval" — **kivéve
az 1. zónát**, aminek az ajtaja egy külön kis bevezető szobába visz
(`isaac_room.png`, ld. `buildIsaacRoomScene()` a `js/main.js`-ben) — ott áll
a zóna ellenfele saját (szintén automatikus) hotspotként, és csak alul, egy
külön ajtón át lehet visszajutni a folyosóra; a macska (follower) nem követ
be ebbe a szobába, mert a scene-configjának nincs `follower` mezője. A
másik 3 zóna ajtaja változatlanul közvetlenül a harcba visz. (Tenna/
Queen korábban szintén megjelentek a folyosón külön hotspotként — ez
egyelőre ki van kapcsolva, ld. "Ismert korlátok".) 1. "A Sírás"
(Könny-lény, +DRY EYES) → 2. "A Cirkusz" (Bohóc-NPC, +TOO MUCH FUN) → 3. "A
Csövek" (Cső-Automata, +OVERCLOCKED) → 4. "A Roblox-lerakat" (Blokkfejű
Véghiba, +CUBED) → Tenna kapunyitása + Asgore-jelenet → vég-képernyő ("HAPPY
13TH BIRTHDAY!"). Az 1-3. zóna után a játék visszatér a folyosóra és
folytatódik a séta a következő ellenfél-hotspotig; a 4. zóna után egyenesen a
vég-képernyő jön.

A teljes játék egy **fix 800×640-es virtuális felbontásra** épül (mint
Undertale/Deltarune), amit a `main.js` `updateScale()`-je felskáláz az
ablakmérethez, letterboxolva — böngésző-keret/címsor maradhat látható, de a
játék-tartalom kitölti az ablakot.

**Nyitott pont:** a 4. zóna `victoryLines`-ában (`js/zones.js`, `ZONE_4`) van egy
`[SZERKESZTENDŐ: ...]` jelölt placeholder-sor Asgore szövegében — ez a DESIGN.md-ben
említett privát, csak apa-fiú közötti poén/közös program helye. Ezt érdemes lecserélni
a végleges verzió előtt, mert ez egy személyes tartalmi döntés, nem valami, amit
automatikusan ki lehet találni.

Irányítás már most is teljesen billentyűzettel is működik: nyilak/WASD a mozgáshoz és
az ACT-menü navigációjához, Enter/szóköz a megerősítéshez/dialógus-továbbléptetéshez,
kattintás mindenhol alternatívaként is működik.

## Architektúra

```
index.html            - #game-viewport (teljes ablak) > #game-stage (fix 800x640,
                        ide jon a scale() a main.js-bol) > a kepernyok (title/
                        overworld/game/end), scripteket sorrendben tolti be.
                        Minden asset-hivatkozas (script/link/kep) `?v=N`
                        cache-busting query-vel van ellatva -- fejlesztes
                        kozben bovitsd a szamot, ha a bongeszo regi valtozatot
                        gyorsitotarazna.
style.css             - fekete-fehér, Undertale-stílusú doboz-UI, nincs framework.
                        A szoveg globalisan a bekotott Minecraft fontot hasznalja
                        (`@font-face`, `assets/Font/*.otf`).
js/engine.js          - ÚJRAFELHASZNÁLHATÓ dodge-motor: SOUL mozgatás, lövedék-spawn/
                        ütközés, HP callback, canvas rajzolás. Nincs benne zóna-specifikus
                        tartalom, semmilyen szöveg vagy karakternév.
js/battle.js          - a köráltalános harc-folyamat: gépelős dialógus-doboz, ACT-menü
                        (egér + billentyűzet, valodi Deltarune-ikonnal), kör-logika
                        (player turn -> ACT -> reakció -> ellenfél támad -> dodge ->
                        ismét, amíg egy "endsFight" ACT-ot nem választanak vagy el nem
                        fogy a HP), Game Over felvillanas. Szintén generikus,
                        zoneData objektumot kap paraméterként.
js/overworld.js       - EGYETLEN, ÚJRAFELHASZNÁLHATÓ DOM-alapú szabad-mozgas motor,
                        amit MINDKÉT overworld-jelenet (szoba ÉS folyosó) használ
                        (felváltja a korábbi, kettévált room.js+corridor.js párost,
                        ami majdnem szó szerint duplikált mozgás-kódot tartalmazott).
                        Egy scene-configot kap (`Overworld.start(scene)`): háttérkép,
                        jarhato hatarok (`walkBounds`), spawn-pont, `hotspots` lista,
                        opcionális `decorations` (statikus/animált díszek) és
                        opcionális `follower` (a játékost követő NPC, ld. "Az
                        overworld-jelenetek hangolása" lejjebb). **A fájl tetején lévő nagy
                        docblock a forrás-igazság** minden scene-config mezőre
                        (`bgSrc`, `walkBounds`, `playerScale`, `Hotspot`,
                        `Decoration`, `follower`) -- itt csak a lényeg, a
                        pontos mezőneveket/alapértelmezéseket ott ellenőrizd,
                        mielőtt módosítasz, hogy ne menjen szét a kettő.
                        A `bgSrc` egyetlen kép-útvonal VAGY (a
                        folyosónál) ilyen útvonalak tömbje lehet -- tömb esetén a
                        képek egymás mellé illesztve (mindegyik a stage magasságára
                        skálázva, saját oldalarányát megtartva) alkotják a világot,
                        lásd `loadBackground()`/`placeBgSegments()`. Ez teszi
                        lehetővé, hogy a folyosó háttere zónánként külön fájlban
                        legyen (`corridor_zoneN_bg_placeholder.png`), így egy zóna
                        hátterének későbbi lecserélése nem érinti a többit. A világ
                        szélességét mindig a betöltött háttér(ek) tényleges
                        méretezett szélessége adja -- ha az pontosan a stage-et
                        tölti ki (szoba), nincs kamera-eltolás; ha szélesebb
                        (folyosó), a kamera követi a játékost. Egy hotspot
                        `{ id, xFrac, yFrac, radius, prompt, sprite?, auto?, onInteract }`
                        -- ha van `sprite`, egy NPC/ellenfél-kepet is megjelenit
                        ott, a `radius`-on belul kozeledve felugrik a `prompt`,
                        Enter/kattintasra az `onInteract()` fut le. A `sprite` sajat
                        `xFrac`/`yFrac`-a fuggetlenul allithato a hotspot interakcios
                        teruletetol (pl. a karakter kicsit odebb allhat, mint ahol az
                        Enter aktivalodik); `sprite.matchPlayerSize`/`noFloat` a
                        jatekos-mererthez igazitja/kikapcsolja a lebego animaciot
                        (ld. a Kecske-hotspotot `js/main.js`-ben). Az `auto: true`
                        hotspotnak nincs felirata/Entere -- pusztan odasetalva
                        magatol lefut az `onInteract()` (ezt hasznalja a zona-
                        belepesi "ajto"). `Overworld.pause()`/
                        `resume()` fuggeszti fel a mozgast egy modalis interakcio
                        (pl. a szamitogep valaszto-doboza) idejere.
                        `Overworld.showCornerPopup(portrait, text, onDone, variant?, opts?)`
                        a kozos, ujrafelhasznalt sarok-buborek mind a szoba, mind a
                        folyoso rovid NPC-beszolasaihoz -- a szoveg gepelve jelenik
                        meg (mindig hanggal), Enter/szokoz/kattintas eloszor kiirja a
                        teljes (aktualis oldalnyi) szoveget, majd tovabblapoz a
                        kovetkezo oldalra, ha a `text` tomb (tobb "oldal"), vagy --
                        az utolso oldalon -- bezarja a buborekot. Az opcionalis
                        `opts: {boxWidth?, portraitSize?}` soronkent felulirhatja a
                        doboz/portré CSS-alapertelmezett meretet (300px/40px), pl.
                        egy szokasosnal hosszabb sornal (ld. `js/zones.js` ZONE_1
                        Kecske-soranak `boxWidth`/`portraitSize` mezoit). A
                        `variant:"room"` a `.corner-popup-room` CSS-modositot
                        kapcsolja be (a "Speech Bubbles_rooms.png" buborek-hatter,
                        nagyobb portré jobb-alul, szoveg balra) -- ezt hasznalja a
                        szoba Tenna/Queen beszolasa (`js/main.js`), a folyoso NPC-i
                        tovabbra is a sima (variant nelkuli) kinezetet kapjak, ahol a
                        portré alapbol FELUL igazitott (a room-variansnal alul
                        marad). Fejlesztoi debug-kapcsolok a fajl tetejen
                        (`DEBUG_WALKBOUNDS`, `DEBUG_HOTSPOTS`, mindketto jelenleg
                        `true`) -- zold keret a jarhato teruletnek, piros kor a
                        hotspotok aktivalasi sugaranak, csak kodbol kapcsolhatoak.
                        Nem nyul a battle.js/engine.js-hez.
js/zones.js           - AZ EGYETLEN hely, ahol tényleges harc-tartalom van: szövegek,
                        ACT-ok, ellenfél-adatok, a `background` (zona-hatterkep) ES a
                        `companionChat` (a folyoson az adott zona elott felszedhetot
                        Kecske/Tenna/Queen rovid beszolasai) zónánként. **Jelenleg
                        csak a `companionChat[0]` (Kecske) sora jelenik meg
                        ténylegesen a folyosón** -- a Tenna/Queen bejegyzések
                        (`companionChat[1]`/`[2]`) tartalmilag megvannak, de nincs
                        hozzájuk sprite/hotspot a `js/main.js` `buildCorridorScene()`-
                        jében (ld. ott a megjegyzést). A ZONES tömb sorolja fel a
                        zónákat sorrendben.
js/main.js            - DOM-elemek összekötése, asset-betöltés, a fix-felbontas
                        skalazasa (updateScale()), a szoba- es folyoso-jelenet
                        scene-configjainak osszeallitasa (ROOM_SCENE,
                        buildCorridorScene(), buildIsaacRoomScene() -- az 1.
                        zona kulon bevezeto szobaja, ld. "Jelenlegi allapot"
                        fentebb) es Overworld.start()-tal valo elinditasuk, a
                        szamitogep valaszto-doboz allapotgepe (openComputerChoice
                        es a hozza tartozo gombok), a kepernyo-atmenetek
                        (`enterGlitchWorld()`, `enterZoneWithFade()`,
                        `fadeToScene()` -- utobbi az enterZoneWithFade()-hez
                        hasonlo sima elsotetedes, de kepernyovaltas nelkul,
                        pusztan az Overworld belso jelenetenek cserejehez,
                        pl. folyoso <-> isaac-szoba -- ld. "Kepernyo-atmenetek"
                        lejjebb), zóna-belepes (`enterZone(zoneIndex)` -- ez
                        futtatja Battle.start-ot a zona hattereevel, es a
                        zona vegeztevel vagy visszater a folyosora, vagy
                        (utolso zona utan) megmutatja a veg-kepernyot).
assets/sprites/*.png  - ideiglenes, generált placeholder grafika (lásd tools/gen_assets.py),
                        KIVÉVE a `bazsa_szoba.png`-t, ami egy kézzel készített, végleges
                        szoba-háttérkép (nem placeholder, nem a gen_assets.py generálja).
assets/sprites/ui/*.png - VALÓDI, kibányászott Deltarune UI-elemek (HP-csík keret,
                        párbeszéd-doboz keret, ACT-ikon, SOUL-sziv, lövedék,
                        beszéd-buborék) -- ezeket a `tools/slice_ui_assets.py`
                        vágja ki és tisztítja meg (szín-kulcsolással) a nyers,
                        `assets/sprites/HUD.png`/`Battle Menu.png`/`Soul.png`/
                        `Speech Bubbles.png` és `assets/UI/UI icons.png`
                        forrás-lapokból. FONTOS: a "HUD.png" és a "Battle Menu.png"
                        FÁJLNEVEI FEL VANNAK CSERÉLVE A TARTALMUKHOZ KÉPEST (ld. a
                        script tetején lévő megjegyzéseket) -- ez a beszerzéskor
                        történt, nem elírás a kódban.
assets/sfx/*.wav      - ideiglenes, generált placeholder hangeffektek (a
                        `assets/Sounds/`/`assets/music/` mappákban valódi,
                        beszerzett Deltarune-hangok és zene várnak beépítésre --
                        ld. "Hátralévő munka").
tools/gen_assets.py   - Python script (Pillow + wave modul), ami az összes placeholder
                        sprite-ot, zona-/folyoso-hatteret es hangot legeneralja. Ha uj
                        zonahoz kell uj placeholder kep, bovitsd ezt a scriptet es
                        futtasd ujra, ne kezzel rajzolgass binaris fajlt.
tools/slice_ui_assets.py - Python script, ami a valodi UI-assetek (ld. fent)
                        kivagasat/tisztitasat vegzi. Ujra lefuttathato, mindig
                        felulirja az assets/sprites/ui/ tartalmat.
```

## Karakter-sprite-ok (vizuál fázis, folyamatban)

A `KECSKE`/`TENNA`/`QUEEN`/`ASGORE` portrék és a `player_room_placeholder.png`
overworld-sprite mostantól **kézzel kivágott, egyetlen-kockás képkockák** egy-egy
nagy, sokkockás sprite-lapból (`assets/sprites/Erik.png`, `Tenna.png`, `Queen.png`,
`Apa.png`, `Bazsa.png`) — ezek a lapok magukban is bent maradtak az
`assets/sprites/`-ban (más kockák kivágásához később), de a játék csak a
kivágott, `*_placeholder.png` néven mentett kockákat használja. Mivel ezek a
sprite-lapok más forrásból (nem a te saját rajzod) származnak, ez felülírja a
korábbi elvet, hogy "nem másolunk kész sprite-okat" — ez tudatos döntés volt,
lásd a beszélgetés-előzményt.

Fontos technikai részlet: a `#portrait`, `#corner-popup img` és `.overworld-npc`
CSS-szabályok `object-fit: contain`-t használnak, mert ezek a valódi karakter-
kockák nem négyzet alakúak (a régi generált blob-placeholderek azok voltak) —
enélkül torzulva, nyújtva jelennének meg a fix méretű dobozokban. Ha új kockát
vágsz ki és cserélsz be, ügyelj erre.

A jatekos overworld-sprite-ja **irany- ES lepes-fuggo**: iranyonkent 2-2 kep
(`assets/sprites/Bazsa_placeholder_down/up/left/right.png` = allo kocka,
`_down_1/up_1/left_1/right_1.png` = lepes-kocka — a fajlnevekben `_top` az
"up" iranyhoz), a `js/overworld.js` `DIRECTION_SPRITES` map-je (`irany: [allo,
lepes]` tomb-parok) allitja be `dom.player`-en beluli `<img>` `src`-jet:
alláskor mindig a [0] (allo) kocka latszik, mozgas kozben a ket kocka
`WALK_FRAME_MS` (160ms) ütemben valtakozik, es a mozgas-iranyhoz igazodik
(atlos mozgasnal a vizszintes irany elvez, allva a legutobb hasznalt irany
marad). Ha tobb lepes-kockaval bovited (pl. 4 fazisu animacio), ez a map es a
`walkFrame`/`WALK_FRAME_MS` logika az elso hely, ahol bovitheted. A
`PLAYER_W`/`PLAYER_H` konstansok az aktualis kepek oldalaranyahoz (kb. 25×43)
lettek hangolva, 100px magassagra felskalazva (58×100 — a szoba butoraihoz
kepest ez lett a jol lathato meret) — ha ujra csereled a kepeket maskkora
oldalaranyra, vagy megint nem stimmel a butorokhoz kepest, ellenorizd ujra
ezt a helyet. Egy scene-config opcionalis `playerScale`-jevel (alapertelmezett
1) ez a meret jelenetenkent felul-szorozhato -- pl. a folyoson `playerScale:
0.75` (ld. `buildCorridorScene()` a `js/main.js`-ben) egy kicsit kisebb
szereplot ad, tavlati-erzetet keltve. A jatekos DOM-elem `width`/`height`-jet
`start()` allitja be inline stilussal a tenyleges (skalazott) meretre, nem a
CSS-ben van fixen megadva.

## Harci dialógus: arcváltás időzítése és gépelés-hang

Egy dialógus-sor (`js/zones.js`-ben egy `{ speaker, text, portrait }` objektum)
alapból **egyetlen** portrét mutat a sor teljes ideje alatt (`portrait`
mező). Ha egy karakter egy soron _belül_, a gépelés közben vált arcot (pl.
meglepődik egy adott szónál), ahhoz két dolog kell ugyanabban az objektumban:

1. `faces: { kulcsNev: "utvonal/kepe.png", ... }` — a lehetséges extra
   arcok, tetszőleges kulcsnévvel.
2. A `text` mezőben egy `{{kulcsNev}}` jelölő pontosan azon a ponton, ahol a
   váltásnak meg kell történnie — a jelölő maga nem jelenik meg a
   kiírt szövegben, csak jelzi a gépelős animációnak (`js/battle.js`
   `typeText()`/`parseFaceMarkers()`), hogy odaérve cserélje le a portrét.

Példa (`js/zones.js`, `ZONE_1.intro`):

```js
{
  speaker: "KECSKE",
  text: "Ez a padló... szerintem sír. {{meglepett}}Az még jó, vagy ez most baj?",
  portrait: "assets/sprites/kecske_placeholder.png",
  faces: { meglepett: "assets/sprites/kecske_placeholder_talk.png" },
}
```

Itt a sor `kecske_placeholder.png`-vel kezdődik, majd a "{{meglepett}}" jelölő
helyén (ami nem jelenik meg) átvált `kecske_placeholder_talk.png`-re, és az
marad, amíg a következő dialógus-sor be nem állítja a saját `portrait`-ját.
Egy soron belül tetszőleges számú `{{kulcs}}` jelölő elhelyezhető, akár
ugyanarra a kulcsra visszaváltva is. A `*_talk.png` fájlok jelenleg tükrözött
teszt-képek (ideiglenesek) — ha elkészülnek a végleges, több kifejezést mutató
rajzaid, csak ezekre a fájlnevekre (vagy a `faces`-ben megadott bármilyen
névre) kell cserélni őket.

A gépelés közben megszólaló hang (`assets/Sounds/snd_txtasg.wav`) a
`js/main.js`-ben van betöltve (`Engine.loadSound("type", ...)`), és a
`js/battle.js` `typeText()`-je minden ki nem hagyott (nem szóköz) karakternél
lejátssza (`Engine.playSound("type")`). Egyelőre minden karakternél ugyanaz a
hang szól — ha később karakterenként eltérő gépelés-hangot szeretnél, ide
(`typeText()` hívása a `showSequence()`-ben) kell egy `line.typingSound`-szerű
mezőt bevezetni, ami felülírja az alapértelmezett `"type"` hangnevet.

## Az overworld-jelenetek (szoba + folyosó) hangolása

Mindkét jelenet ugyanazt a `js/overworld.js`-t használja, a `js/main.js`-ben
összeállított scene-config objektumokkal:

- `ROOM_SCENE` (`js/main.js`): `walkBounds` és a `hotspots` lista (`computer`,
  `shelf`, `tv`) `xFrac`/`yFrac`/`radius` értékei a `#overworld-stage` méretéhez
  (640×480) viszonyított arányok/px-ek, szemre belőve a `bazsa_szoba.png`-hez.
- `buildCorridorScene()` (`js/main.js`): a `DOOR_FRACTIONS` (a 4 zóna-belépési
  pont közepe a teljes világ-szélesség arányában) és az ehhez képest eltolt
  Kecske-hotspot (jelenleg az egyetlen folyosói kísérő-NPC, ld. lejjebb)
  pozíciók pontosan a
  `CORRIDOR_ZONE_BACKGROUNDS` (`corridor_zone1_bg_placeholder.png` ...
  `corridor_zone4_bg_placeholder.png`, lásd `tools/gen_assets.py`
  `corridor_bg()`) 4 egyenlő szélességű szakaszához igazodnak. A folyosó
  háttere **4 külön fájl**, nem egy összefűzött kép -- az `Overworld`
  (`bgSrc` tömb, ld. fent) egymás mellé illeszti őket. Ez azért fontos, mert
  ha a 4 zóna közül csak egyhez készül el saját (kézzel rajzolt) háttér, azt
  elég a megfelelő `corridor_zoneN_bg_placeholder.png` néven lecserélni --
  nem kell újragenerálni vagy összefűzni a többivel. **Figyelem:** a
  `DOOR_FRACTIONS` egyenletes negyedelése csak addig stimmel, amíg a 4 kép
  kb. egyenlő szélességű; ha a végleges rajzok ettől eltérő (pl. zónánként
  változó) szélességűek lesznek, ezt az értéket manuálisan újra kell
  hangolni.

Ha egy háttérkép változik, vagy a pozíció nem stimmel vizuálisan, ezeket a
konstansokat kell újrahangolni — nincs pixel-pontos ütközésvizsgálat
bútoronként/objektumonként, szándékosan egyszerű kör-alapú hotspot-hatarok
vannak (a vibecodolt-prototípus szellemében, nem egy teljes overworld-motor).

A `walkBounds` NEM csak egyetlen téglalap lehet: ha egy scene-config
`walkBounds`-jába egy `{xMin,xMax,yMin,yMax}` objektum HELYETT egy ilyen
objektumokból álló **tömböt** adsz meg, a járható terület ezek uniója lesz
(pl. egy L-alakú szobához két téglalap) — lásd `js/overworld.js`
`isInsideWalkBounds()`. A mozgás tengelyenként (x és y külön) próbálja a
lépést, így a terület szélén szépen végigcsúszik a játékos, nem akad meg egy
sarokban.

A tisztán vizuális, nem interaktív díszeknek külön `decorations` lista való
egy scene-configban — `xFrac`/`yFrac`/`w`/`h` mezőkkel, mint a hotspot-
sprite-oknál, plusz egy `frames` tömbbel (ha körkörösen animálódó, több
kockás sprite-ról van szó) és egy `frameMs` időzítéssel. A `js/overworld.js`
`spawnDecorations()`-je rajzolja ki és animálja őket. Feki, a macska ilyen
dekorációként ül az ablakban a `ROOM_SCENE`-ben (`js/main.js`) — a
szobában NEM mozog, NEM követi a játékost, ez szándékos (a folyosón viszont
igen, ld. lejjebb).

**A folyosón Feki egy a játékost követő NPC** (`scene.follower`, ld. a
`js/overworld.js` elején a dokumentációt és a `spawnFollower()`/
`updateFollower()` függvényeket, beállítva a `buildCorridorScene()`
visszatérési értékében). Egy `follower`-nek négy sprite-készlete van:
`sitFrames` (ülő idle-hurok, ugyanaz a 4 kocka, mint a szobai ablakpárkány-
dekorációnál), `runFrames`/`jumpFrames` (a `assets/sprites/cat/` mappában,
`feki_run_0N.png`/`feki_jump_0N.png`) és egy `spawn` kezdőpozíció (lehet
`{xFrac,yFrac}` VAGY egy függvény, mint a `scene.spawn` -- a folyosón a
játékos aktuális belépési pontjához képest kicsit hátrébb számítódik ki,
ld. `buildCorridorScene()`). Viselkedése: ha a játékostól mért távolság
`FOLLOWER_KEEP_DISTANCE`-nál (50px) nagyobb, egy véletlenszerű
(`FOLLOWER_WAKE_MIN_MS`..`MAX_MS`, 300-900ms) reakció-késés után elindul
utána (`runFrames`-szel animálva, a `scene.walkBounds`-t tiszteletben
tartva, mint a játékos), utolérve megáll a `FOLLOWER_KEEP_DISTANCE`
tartásával (nem tapad rá), követés közben ritkán, véletlenszerűen beugrik
egy rövid `jumpFrames`-animációt (`FOLLOWER_JUMP_PROBABILITY`), és csak
akkor ül le újra (`sitFrames`, ciklikusan), ha a játékos már
`FOLLOWER_SIT_IDLE_MS`-nél (3s) régebben mozdulatlan. Ezek a konstansok
mind a `js/overworld.js` tetején vannak. Egyszerre csak egy `follower`
támogatott jelenetenként; a `ROOM_SCENE`-nek nincs `follower` mezője (ott a
`decorations`-beli statikus Feki van).

**Ismert hiba, harmadik javítási kísérlet (státusz: felhasználói
megerősítésre vár):** a follower-logikát korábban két körben javítottuk (ld.
`osszefoglalo-260710.md` 5. szakasza) — a játékos idle-detektálását a nyers
billentyű-bemenet helyett a tényleges pozícióváltozásra állítottuk át, és a
"beragadás"-észlelőt fix px-epsilon helyett a szándékolt lépés arányára. Ezek
után a felhasználó megerősítette a pontos tünetet (lásd alább kérdés-válasz):
**"a macska szinte állandóan ott lóg közvetlenül mellettem/mögöttem, alig
marad le, nincs látható futás-animáció — mintha csak a pozíciómat másolná".**
Ez rávilágított az igazi okra: a `FOLLOWER_KEEP_DISTANCE` egyetlen közös
határ volt mind az "induljon el utolérni", mind a "itt álljon meg" döntéshez
— emiatt a `FOLLOWER_SPEED`/játékos-`SPEED` közelsége (160 vs 140) miatt a
kísérő gyakorlatilag lépéstartásban, egy állandó szűk távolságon "ragadt"
mozgott a játékossal, sosem esett le tőle látványosan, hogy aztán érdemben
utána fusson. **Javítás (`js/overworld.js` `updateFollower()`):**
hiszterezis két külön határral — `FOLLOWER_CHASE_TRIGGER_DISTANCE` (140px,
ENNYIRE kell lemaradnia, hogy egyáltalán elinduljon utolérni) és
`FOLLOWER_KEEP_DISTANCE` (60px, EDDIG fut, itt áll meg) —, plusz
`FOLLOWER_SPEED` felemelve 160→230-ra, hogy az utolérés egy gyors, jól
látható "beérős" mozdulat legyen, ne araszolás. **A tesztelést a
felhasználó végzi saját maga (ld. a fájl tetején lévő szabály) — ne
tekintsd megoldottnak, amíg vissza nem jelez.**

## Képernyő-átmenetek

A `js/main.js`-ben egy közös `#scene-fade` fedő (`index.html`, `style.css`)
szolgál minden jelenetváltás elfedésére -- egy `#game-viewport` gyerek,
teljes képernyős fekete `div`, alapból `opacity:0`. Két, egymástól eltérő
karakterű átmenet használja, más-más CSS-osztályokkal:

- **`enterGlitchWorld()`** (szoba → folyosó, a számítógépes választás
  után): 1) `worldGlitch` CSS-animáció a `#game-viewport`-on (torzulás/
  RGB-szétcsúszás/`clip-path`-sávok, `GLITCH_SHAKE_MS`=900ms, a végén már
  majdnem fekete) -- FONTOS, hogy ez NEM a `#game-stage`-en fut, mert annak
  már van egy inline `transform:scale()`-je (`updateScale()`), amit egy rá
  kerülő CSS-animáció felülírna, kizoomolva a játékot; 2) a `#scene-fade`
  azonnal (átmenet nélkül, `scene-fade-black` osztály) teljesen feketére
  vált, és `GLITCH_BLACK_HOLD_MS`=500ms-ig így marad -- eközben cserélődik
  a jelenet a fekete mögött; 3) a `#scene-fade` opacity-átmenettel
  (`scene-fade-in` osztály, `GLITCH_FADE_MS`=500ms) eltűnik, felfedve a
  folyosót. Jump-cut jellegű, "ugrás a feketébe" hangulat.
- **`enterZoneWithFade()`** (folyosón az `auto` ajtó-hotspothoz sétálva, a
  harc indítása előtt): sokkal egyszerűbb és lágyabb -- a `#scene-fade`
  `scene-fade-out` osztállyal SIMA, átmenetes elsötétedéssel (nem
  ugrásszerűen, `ZONE_FADE_OUT_MS`=400ms) vált feketére, a jelenet
  cserélődik, majd `scene-fade-in`-nel (500ms) fel is fedi a harc-
  képernyőt. Szándékosan más karakterű, mint a glitch-átmenet -- ez egy
  nyugodt "besétálsz a harcba" pillanat, nem egy "megszakad a valóság"
  pillanat.

Ha egy harmadik, hasonló átmenetre lenne szükség, a `#scene-fade`
CSS-osztályai (`scene-fade-black`/`scene-fade-in`/`scene-fade-out`,
`style.css`) újrahasznosíthatók -- ne hozz létre új fedő-elemet, hacsak nem
kell egyszerre két independens fade-hatás.

## Hogyan adj hozzá egy új zónát

Nézd meg a `js/zones.js`-ben a `ZONE_1` objektumot — ez a minta. Egy új zóna ugyanígy
épül fel:

```js
const ZONE_2 = {
  id: "zone2_cirkusz",
  intro: [ { speaker, text, portrait? }, ... ],
  enemy: {
    name, sprite,
    introLines: [...],
    attackLines: [...],
  },
  dodge: { duration, rate, speed, size: [min, max] },
  acts: [
    { id, label, repeatable: false, reactionLines: [...], endsFight: false },
    { id, label, repeatable: false, reactionLines: [...], endsFight: true },
  ],
  styleTag: "+VALAMI",
  victoryLines: [...],
};
```

Utána vedd fel a `ZONES` tömbbe (`const ZONES = [ZONE_1, ZONE_2];`) ÉS a
`js/main.js` `DOOR_FRACTIONS` tömbébe egy új belépési-pozíciót (ha uj zona-
belepesi pontot is akarsz a folyosora), a `main.js` `enterZone()` függvénye a
`zoneIndex` alapján automatikusan futtatja, a `buildCorridorScene()` pedig
magától felveszi az új zóna ellenfél-sprite-ját hotspotként. **Ne kelljen a
`battle.js`-t, `engine.js`-t vagy `overworld.js`-t módosítani új zóna
felvételekor** (csak a `DOOR_FRACTIONS` bővítése) — ha mégis szükséges lenne,
az azt jelzi, hogy valami nem generikus a motorban, azt érdemes inkább ott
javítani.

Legalább egy `endsFight: true` ACT-nak kell lennie minden zónában, különben a harc
végtelenítve marad.

## Ismert korlátok / amire figyelni kell (még nem tesztelt / hiányos)

- A teljes játék fix 800×640 belső felbontásra épül, amit a `main.js` felskáláz
  az ablakmérethez (letterboxolva) — ez szándékos (Undertale/Deltarune-minta),
  nem hiba, ha oldalt/felül-alul fekete sáv látszik.
- A halál/újraindítás ág (`gameOver()` a battle.js-ben) implementálva van, de a
  fejlesztő playteszt során nem sikerült ténylegesen meghalni (a dodge-fázis rövid és
  könnyű) — érdemes explicit letesztelni, mielőtt a végleges verzióba kerül.
- A `js/main.js`-ben összeállított overworld-hotspotok (szoba + folyosó)
  pozíciója szemre van belőve a jelenlegi háttérképekhez — ha a
  `bazsa_szoba.png`-t vagy a `corridor_zoneN_bg_placeholder.png` fájlok
  egyikét lecseréled/módosítod,
  ellenőrizd/hangold újra a `ROOM_SCENE`/`buildCorridorScene()` `xFrac`/`yFrac`/
  `radius` értékeit.
- A `assets/sfx/menu_move.wav` fájl generálva van, de jelenleg csak az ACT-menü
  billentyűs navigációjakor szól.
- Az overworld-mozgás automatizált, nem fókuszált böngésző-fülben (pl. CDP-s
  headless teszt-eszközök) erősen le lehet lassulva, mert a `requestAnimationFrame`
  háttérben futó lapokon throttle-ölve van — ez tesztelési-környezeti korlát, nem
  hiba a mozgás-kódban (éles, fókuszált böngészőben nem jelentkezik).
- **A folyosói Feki-követő (`scene.follower`) hiszterezis-javítása
  felhasználói megerősítésre vár** (a "rátapad, nem fut utánam" tünetre —
  ld. részletesen az "Az overworld-jelenetek hangolása" szakaszban fentebb).
  NE feltételezd, hogy ez meg van oldva, amíg a felhasználó nem erősíti meg.

## Hátralévő munka (a DESIGN.md fejlesztési fázisai alapján)

**Jelenleg folyamatban / a legutóbbi menetek óta aktuális feladat:** lásd
`osszefoglalo-260710.md` (több menet összefoglalója egy fájlban, dátum
szerint bővül) a részletes történetért. Rövid összegzés:

- A nyitó jelenet (cím → szoba → gép-választás → glitch-átmenet) kész.
- A folyosó háttere zónánkénti külön fájlokra lett bontva
  (`corridor_zoneN_bg_placeholder.png`, ld. "Az overworld-jelenetek
  hangolása"), és **az 1. zóna háttere már kézzel rajzolt, végleges**
  (nem placeholder) — a 2-4. zónáé még a generált placeholder.
- A folyosón most Kecske egy a játékost követő NPC, automatikus (Enter
  nélküli) zóna-belépéssel és több lépcsős képernyő-átmenetekkel (ld.
  "Képernyő-átmenetek"), lapozható NPC-beszólásokkal.
- **Nyitott hiba:** a Feki-követő időnként még bugos élesben — ld. "Az
  overworld-jelenetek hangolása" szakasz vége.

1. ~~Motor-prototípus~~ — kész (1. zóna)
2. ~~Tartalom~~ — kész (mind a 4 zóna megírva, lásd `js/zones.js`)
3. **Vizuál** (folyamatban): a placeholder zóna-hátterek/folyosó-háttér/
   ellenfél-sprite-ok lecserélése saját rajzokra (ugyanazokkal a
   fájlnevekkel az `assets/sprites/` mappában, akkor semmit nem kell
   kódban módosítani — legfeljebb a `ROOM_SCENE`/`buildCorridorScene()`
   hotspot-pozíciókat a `main.js`-ben). A folyosó 1. zónás szakasza
   (`corridor_zone1_bg_placeholder.png`) már kész, végleges rajz — a 2-4.
   zónáé még hátravan. A harc-képernyő UI-ja (HP-csík, ACT-doboz, párbeszéd-keret, SOUL, Game
   Over) már valódi, kibányászott Deltarune-assetekkel megy (lásd
   `tools/slice_ui_assets.py`) — ide tartozó, még kihasznált stretch goal: a
   `Battle Box`/`Battleback` animáció-sorozatok (jelenleg csak statikus
   kockaként/nem használva) pop-in/animált háttérré alakítása.
4. **Hang**: a generált beep-ek lecserélése a beszerzett valódi zenére/
   effektekre (`assets/music/`, `assets/Sounds/`) — ezek még nincsenek bekötve.
5. ~~Összefűzés~~ — kész (cím → szoba → gép-választás → folyosó → mind a 4 zóna
   → Asgore-zárás → vég-képernyő, egyben, teljesképernyős skálázással)
6. **Polish**: átmenetek zónák között, finomítás, a `ZONE_4` `[SZERKESZTENDŐ]`
   placeholder-sorának lecserélése a saját apa-fiú poénra/közös programra
7. **Teszt**: teljes végigjátszás, ideális esetben tényleges böngészőben, más gépen is

## Futtatás / tesztelés

Nincs build lépés, nincs szerver szükséges: `index.html` megnyitása böngészőben elég.
Fejlesztés közben `node --check js/*.js`-sel érdemes szintaxist ellenőrizni módosítás
után, mielőtt böngészőben tesztelsz.
