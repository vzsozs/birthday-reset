FONTOS: A TESZTELÉSEKET MEGCSINÁLOM ÉN, csak írd le röviden mit. !!!

FONTOS: Ha bármi nem egyértelmű (dizájn-döntés, hogyan tovább, melyik megoldást
válaszd), **KÉRDEZZ VISSZA eldöntendő/választós kérdésekkel**, mielőtt
nekiállnál kitalálni. Ezt a funkciót szeretem, használd sűrűbben — inkább
kérdezz egyet többször, mint hogy rossz irányba fuss bele egy feltételezésbe.

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
be ebbe a szobába, mert a scene-configjának nincs `follower` mezője. **Az 1.
zóna harca mostantól egy saját, fordulós FIGHT/ACT/SPARE rendszer** (a 3-4.
zóna változatlanul a régi, egyszerű ACT-listás motort használja) — ld. "Az
1. zóna FIGHT/ACT/SPARE harca" lejjebb. **A 2. zóna (Cirkusz, Bubble) is
ugyanezt a fordulós rendszert kapta**, közvetlenül a folyosóról (nincs
külön bevezető szobája, mint az 1. zónának) — ld. "A 2. zóna FIGHT/ACT/
SPARE harca (Bubble)" lejjebb a teljes leírásért. Ha a harc FIGHT-kimenetellel zárul,
a legyőzött ellenfél sprite-ja tartós díszként ottmarad az Isaac-szobában,
és a játék még egyszer visszatér oda (nem egyenesen a folyosóra) mielőtt a
játékos kisétál; SPARE-kimenetel esetén nincs ilyen azonnali kitérő,
egyenesen a folyosóra tér vissza a játék -- de ha a játékos utólag
visszasétál a szobába, a Könny-lény még ott áll, és egy rövid, baráti
"viszontlátás"-jelenetet ad (harc nélkül) -- ld. "SPARE utáni viszontlátás
(Isaac-szoba)" lejjebb. A
szobának saját háttérzenéje van (`isaacMusic`, ld. `js/main.js` a
`roomMusic` deklarációja mellett) — belépéskor a `roomMusic` `pause()`-ol
(a `currentTime`-ja megmarad), kilépéskor/a zóna1 harc győzelme után pedig
pontosan onnan folytatódik, ahol abbamaradt. A
3-4. zóna ajtaja változatlanul közvetlenül a harcba visz. A 2. zóna ajtaja
ELSŐRE szintén közvetlenül a harcba visz, de győzelem/kegyelem UTÁN már nem
(ld. "A 2. zóna FIGHT/ACT/SPARE harca (Bubble)" lejjebb — a hotspot vagy
teljesen megszűnik, vagy Enter-es "viszontlátássá" alakul). (Tenna/
Queen korábban szintén megjelentek a folyosón külön hotspotként — ez
egyelőre ki van kapcsolva, ld. "Ismert korlátok".) 1. "A Sírás"
(Könny-lény, +DRY EYES) → 2. "A Cirkusz" (Bubble, +TOO MUCH FUN) → 3. "A
Csövek" (Cső-Automata, +OVERCLOCKED) → 4. "A Roblox-lerakat" (Blokkfejű
Véghiba, +CUBED) → Tenna kapunyitása + Asgore-jelenet → vég-képernyő ("HAPPY
13TH BIRTHDAY!"). **Ez a sorrend/lista hamarosan változni fog, ld. "Hátralévő
munka": a felhasználó kérésére a 3. zóna kikerül, a 4. zóna lesz a záró,
Minecraft-témájú zóna.** Az 1-3. zóna után a játék visszatér a folyosóra és
folytatódik a séta a következő ellenfél-hotspotig; a 4. zóna után egyenesen a
vég-képernyő jön.

A teljes játék egy **fix 800×640-es virtuális felbontásra** épül (mint
Undertale/Deltarune), amit a `main.js` `updateScale()`-je felskáláz az
ablakmérethez, letterboxolva — böngésző-keret/címsor maradhat látható, de a
játék-tartalom kitölti az ablakot.

**Nyitott pont — MÁR MEGOLDVA, de még nincs kódba átültetve:** a 4. zóna
`victoryLines`-ában (`js/zones.js`, `ZONE_4`) lévő `[SZERKESZTENDŐ: ...]`
placeholder-sor helyére a felhasználó megadta a végleges, kész apa-fiú
poént/közös programot, méghozzá egy jóval nagyobb, teljes záró-jelenet
részeként (ami a 4. zóna Minecraft-témájúra váltásával és a 3. zóna
kivételével jár együtt) — ld. "Hátralévő munka" a szó szerinti szövegért.
Ez már NEM nyitott tartalmi kérdés, csak megvalósítandó munka.

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
                        gyorsitotarazna. A game-screen (harc-kepernyo) BELUL
                        egy `#battle-stage` dobozba van csomagolva (fix
                        640x480, 3px feher keret, ld. style.css) -- ez
                        MERETBEN es keretben szandekosan MEGEGYEZIK az
                        overworld-screen `#overworld-stage`-jevel (kulso
                        keret > "Mozgas harcban: ..." hint-szoveg > belso
                        keret > tenyleges harc-UI). FONTOS ELTERES: nincs
                        rajta `overflow:hidden` (az overworld-stage-en van),
                        mert a harc-tartalom (dodge-canvas 300px + hp-row +
                        dialogue-box egyszerre lathato) legrosszabb esetben
                        (egy 3 sorra tordelodo tamado-sor) magassaga
                        MEGHALADJA a 480px-t -- overflow:hidden mellett ez
                        levagna/elrejtene a dialogue-box aljat, igy inkabb
                        egyszeruen tulnyulik a kereten, ha nagyon hosszu egy
                        sor. Ha ez zavaro lesz, a canvas/dialogue-box meretet
                        vagy a zona-szovegek hosszat kell csokkenteni, nem az
                        overflow-t visszaallitani hidden-re.
style.css             - fekete-fehér, Undertale-stílusú doboz-UI, nincs framework.
                        A szoveg globalisan a bekotott Minecraft fontot hasznalja
                        (`@font-face`, `assets/Font/*.otf`).
js/engine.js          - ÚJRAFELHASZNÁLHATÓ dodge-motor: SOUL mozgatás, lövedék-spawn/
                        ütközés, HP callback, canvas rajzolás. Nincs benne zóna-specifikus
                        tartalom, semmilyen szöveg vagy karakternév. A dodge-config
                        opcionális `pattern` mezővel három lövedék-mintázatot tud:
                        `"rain"` (alapértelmezett, egyenesen lefele hulló), `"bounce"`
                        (a doboz faláiról visszaverődő, `life` ms után eltűnő "gumi-
                        könnyek", ld. Isaac), `"spiral"` (a doboz közepéből korbeforgó
                        lövedék-karok, `spiralStep`/`arms` finomhangolható; a SOUL ennél
                        a mintázatnál a doboz also harmadaban spawnol, nem kozepen, ld.
                        `resetSoul()`) -- a felhasznalo kerese szerint a "spiral"
                        lovedekek IS visszapattannak a falakrol (`bounce:true`,
                        ugyanaz a `life`-alapu eltunes, mint a "bounce"-nal), ld. a 2.
                        zona reszet lejjebb. A dodge-config opcionalis `tearImage`
                        mezovel felulirhato, melyik betoltott lovedek-textura
                        hasznalodik (alapertelmezett `"tear"`, ld. `js/main.js`
                        `Engine.loadImage()` hivasait) -- ezt hasznalja az 1. zona a
                        "vörösre váltanak" utan piros konnyekre valto `"tearRed"`
                        textura bekapcsolasahoz (`js/battle.js` `tearsAreRed`). Egy
                        MASIK, altalanosabb opcionalis mezo, `tearImages: {small,
                        normal, large}`, lovedekenkent (a `b.r` sugara es a config
                        `size` tartomanya alapjan, also/kozepso/felso harmad szerint)
                        valaszt kepet -- ezt hasznalja a 2. zona a harom
                        `bubbles-bulett-*.png` meret szerinti buborek-texturahoz
                        (ld. `draw()`/`tearImageFor()` a fajlban). Ha egy dodge-config
                        egyszerre adna meg `tearImage`-et es `tearImages`-t, az utobbi
                        elsobbseget elvez soronkent, ha talal ra illo kepet.
js/battle.js          - a koraltalanos harc-folyamat: gepelos parbeszed-doboz, ACT-menu
                        (eger + billentyuzet, valodi Deltarune-ikonnal), Game Over
                        felvillanas. KET utvonala van, a `Battle.start(zoneData, cb)`
                        elagazik a `zoneData.rounds` mezo alapjan:
                        (1) "legacy" -- a 3-4. zona hasznalja, a regi lapos ACT-listas
                        kor-logika (player turn -> ACT -> reakcio -> ellenfel tamad ->
                        dodge -> ismet, amig egy "endsFight" ACT-ot nem valasztanak
                        vagy el nem fogy a HP);
                        (2) "rounds" -- az 1. ES 2. zona hasznalja, ld. "Az 1. zona
                        FIGHT/ACT/SPARE harca" es "A 2. zona FIGHT/ACT/SPARE harca
                        (Bubble)" lejjebb a teljes leirasert. Ket, a 2. zona miatt
                        ALTALANOSITOTT mechanizmus (mindketto visszafele kompatibilis,
                        az 1. zonat nem erinti):
                        - `round.preLinesByChoice: {fight?, [actId]: [...]}` -- az
                          egyszerubb `preLinesIfPrevFight`-nal (csak FIGHT/nem-FIGHT
                          kulonbseget lat) altalanosabb: az ELOZO fordulo PONTOS
                          valasztasa (barmelyik ACT-id vagy "fight") szerint valaszt
                          bevezeto-sorokat, ld. `runRound()`.
                        - `zoneData.ending.preLinesByMercy: {peaceful, aggressive,
                          mixed}` -- a zaro FIGHT/SPARE-menu ELE opcionalisan beszurt
                          bevezeto, a felgyult `mercy` alapjan valasztva (>=100 / <=0 /
                          kozte), ld. `resolveEnding()`. Fontos technikai reszlet: e
                          sor(ok) megjelenitese UTAN a dialogue-box explicit elrejtodik,
                          mielott a menu megjelenne -- kulonben (hosszu, tobbsoros
                          szoveg eseten) a dinamikus menu-pozicionalas atfedhetne.
                        - `zoneData.gameOverLines` (opcionalis) felulirja a
                          `DEFAULT_GAMEOVER_LINES`-t (Queen+Kecske ket sora) -- a 2.
                          zona pl. csak Queen-t, mas szoveggel szolaltatja meg, ld.
                          `gameOver()`.
                        A `showSequence()`/`typeText()` egy opcionalis `target` DOM-
                        keszlettel parameterezheto (alapertelmezetten a fo parbeszed-
                        doboz elemei) -- ezt hasznalja a `showCornerBanter()` is, ami
                        a harc-kepernyo sajat sarok-buborekjebe (`#battle-corner-popup`)
                        ir ugyanazzal a gepelos logikaval, az Overworld-modultol
                        fuggetlenul.
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
                        `Overworld.removeFollower()` -- uj, altalanos fuggveny: azonnal
                        eltunteti a kovető NPC-t (ha van) a JELENLEGI jelenetbol (nem
                        kell megvarni egy kovetkező `start()`-ot). A hivo felelossege,
                        hogy a scene-config `follower` mezojet is torolje/felulirja a
                        kovetkező `buildX Scene()`-hivasokban, kulonben az visszahozna --
                        ezt hasznalja a 2. zona "Feki-vesztes" mechanikaja (ld. lejjebb).
js/zones.js           - AZ EGYETLEN hely, ahol tényleges harc-tartalom van: szövegek,
                        ACT-ok, ellenfél-adatok, a `background` (zona-hatterkep) ES a
                        `companionChat` (a folyoson az adott zona elott felszedhetot
                        Kecske/Tenna/Queen rovid beszolasai) zónánként. **Jelenleg
                        csak a `companionChat[0]` (Kecske) sora jelenik meg
                        ténylegesen a folyosón** -- a Tenna/Queen bejegyzések
                        (`companionChat[1]`/`[2]`) tartalmilag megvannak, de nincs
                        hozzájuk sprite/hotspot a `js/main.js` `buildCorridorScene()`-
                        jében (ld. ott a megjegyzést). A ZONES tömb sorolja fel a
                        zónákat sorrendben. **A ZONE_1 kivétel**: nincs `intro`/`acts`/
                        `dodge`/`victoryLines` mezője, helyette `cornerIntro`/`rounds`/
                        `ending` -- ld. "Az 1. zóna FIGHT/ACT/SPARE harca" lejjebb. A
                        ZONE_2..4 változatlanul a régi (itt a "Hogyan adj hozzá egy új
                        zónát" szakaszban dokumentált) lapos formátumot használja.
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
                        `flavorPopup(portrait, text)` egyetlen-beszelos,
                        `showOverworldDialogue(lines, onDone)` tobb,
                        valtakozo-beszelos (portrait-onkent kulon) sor
                        lancolt lejatszasa `Overworld.showCornerPopup()`-on
                        keresztul -- ez utobbit hasznalja a SPARE-utani
                        Konny-leny "viszontlatas" (`KONNYLENY_REUNION_LINES`,
                        `zone1Spared`), ld. "SPARE utáni viszontlátás
                        (Isaac-szoba)" lejjebb.
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

## Az 1. zóna FIGHT/ACT/SPARE harca

Az 1. zóna (Könny-lény) a felhasználó kifejezett forgatókönyve alapján egy
sajátos, csak rá jellemző harc-rendszert kapott (a 2-4. zóna változatlanul a
régi, egyszerű ACT-listás motort használja -- ld. "Hogyan adj hozzá egy új
zónát"). A teljes adatformátum a `js/zones.js` `ZONE_1` objektumában van, a
folyamat maga a `js/battle.js` `startRoundBattle()`/`runRound()`/
`resolveEnding()`-ben.

- **`cornerIntro`**: a harc legelején lejátszódó, rövid Queen+Tenna
  sarok-buborék-beszólás (`showCornerBanter()`, a `#battle-corner-popup`
  DOM-elemben, jobb-alul -- ugyanaz a vizuális nyelv, mint a szoba/folyosó
  `#corner-popup`-ja, de szándékosan önálló implementáció, nem az
  Overworld-modult használja). Ez után jön `enemy.introLines` (a szokásos
  párbeszéd-dobozos bevezető), majd az 1. forduló.
- **`rounds`**: tömb, fordulónként `{ preLines?, preLinesIfPrevFight?,
  enemyLine?, enemyLineRequiresPrevChoice?, dodge:{...,pattern},
  options:[...] }`. Fordulónként a játékos EGY opciót választ egy menüből
  -- `{ type:"fight", label, reactionLines?, enemyPortraitAfter?,
  enemyFieldAfter? }` vagy `{ type:"act", id, label, reactionLines?,
  mercy? }`. A FIGHT mindig azonnal "talál" (nincs külön mini-játék,
  szándékos egyszerűsítés a rövid játék tempójához) -- nincs látható
  ellenfél-HP-sáv sem, az eszkalációt a KÖVETKEZŐ forduló objektíve
  nehezebb dodge-mintázata adja (rain → bounce → spiral), nem szám szerű
  véd/sebzés-logika. Fordulónként szabadon lehet váltani FIGHT és ACT
  között.
  - **Fordulók közti tartalmi elágazás** (a felhasználó konkrét kérésére):
    egy forduló `preLinesIfPrevFight`-ja felülírja az alapértelmezett
    `preLines`-t, ha az ELŐZŐ fordulóban FIGHT-ot választott a játékos
    (`js/battle.js` modul-állapot: `lastChoiceType`); egy forduló
    `enemyLine`-ja pedig csak akkor jelenik meg, ha
    `enemyLineRequiresPrevChoice` pontosan egyezik az előző forduló
    választott ACT-jának `id`-jével (`lastChoiceId`) -- pl. a 3. forduló
    "Lehet, hogy... nem vagyok egyedül a szerveren?" sora csak akkor
    hangzik el, ha a 2. fordulóban a `roblox_tanc` ACT-ot választották.
  - **Két FÜGGETLEN ellenfél-kép-állapot**: `enemyPortraitAfter` a
    dialogue-boxban "beszélő" arcképet (`enemyPortrait` modul-állapot,
    alapból `zoneData.enemy.talkSprite`) cseréli, `enemyFieldAfter` pedig a
    képernyő közepén ÁLLANDÓAN látható, "harci mezőn álló" sprite-ot
    (`centerEnemySprite`, ld. lejjebb `#battle-enemy-sprite`, alapból
    `zoneData.enemy.sprite`) -- ez a két kép SZÁNDÉKOSAN két külön
    asset-sorozat (`_talk-dying-01/02` vs sima `-dying-01/02/die`), mert a
    dialogue-box egy közeli "beszélő" arcot mutat, a középső sprite pedig a
    "testi" állapotot.
  - **`mercy` ÖSSZEADÓDIK, nem felülírja** a korábbi értéket (`mercy =
    Math.min(100, mercy + chosen.mercy)`, ld. `runRound()`) -- a felhasználó
    kérésére: pl. a 2. forduló ROBLOX TÁNC-ja (+50) és a 3. forduló OOF
    KÓRUS-a (+50) EGYÜTT éri el a 100-at (a "Spare" barát-mérőt, `#mercy-row`,
    sárga sáv a HP-sáv alatt -- csak ekkor látható); ha a játékos csak az
    egyiket választja, csak 50-nél áll meg.
  - **`tearsAreRed`**: ha a játékos PONT az 1. fordulóban választja a
    FIGHT-ot ("A könnyei hirtelen vörösre váltanak."), onnantól minden
    következő forduló dodge-fázisa a piros `tearRed` lövedék-texturát
    használja (`js/engine.js` `spawnConfig.tearImage`, ld. fent) a normál
    kék helyett -- ez a `js/battle.js` `tearsAreRed` modul-állapot, ami a
    harc végéig megmarad, ha egyszer igazra vált.
- **`ending`**: a rounds után egy záró FIGHT/SPARE-választás (nincs újabb
  támadás) -- `{ spare:{ lines, failLines }, fight:{ lines, enemyPortrait,
  enemyField, roomDecoration } }` (az `enemyField` az `enemyFieldAfter`
  párja, ld. fent). SPARE csak akkor sikerül, ha a mercy már elérte a
  100-at (`resolveEnding()`); ha nem, a `failLines` után a FIGHT-
  kimenetellel zárul. A `Battle.start()`-nak átadott `doneCallback` egy
  `{ outcome: "spare"|"fight", roomDecoration }` objektumot kap -- ezt a
  `js/main.js` `enterZone()`-ja használja: `roomDecoration:true` (FIGHT)
  esetén beállítja a `zone1Defeated` modul-szintű flaget és
  `buildIsaacRoomScene()`-re fadel vissza (a legyőzött ellenfél-hotspot
  ekkor egy statikus `die`-sprite decorationná válik); `outcome==="spare"`
  esetén a `zone1Spared` flaget állítja be és egyenesen a folyosóra tér
  vissza -- ld. lejjebb "SPARE utáni viszontlátás".
- **Halál/újrapróbálkozás**: a `gameOver()` fordulós módban NEM az egész
  harcot indítja újra, hanem `runRound()`-ot hívja meg -- ez a HALÁLKOR
  AKTUÁLIS fordulót próbálja újra a dodge-fázistól (a `mercy`/`tearsAreRed`/
  HP-n kívüli állapot, pl. az addig elért `enemyPortrait`/`centerEnemySprite`,
  megmarad). Ezt élesben letesztelve (böngészőben, `Battle.start()`-ot
  közvetlenül meghívva) a retry helyesen működik.
- Ha egy harmadik zóna is hasonló FIGHT/ACT/SPARE rendszert kapna, ezt a
  formátumot érdemes általánosítani -- jelenleg szándékosan zóna1-specifikus
  maradt (kisebb kockázat egy menetben), ld. "Hátralévő munka".

### Harc-UI: fix pozíciók, automatikus arckép-kitöltés, harci mező-sprite

A felhasználó több körben, konkrét (screenshotokkal alátámasztott)
visszajelzések alapján finomította a harc-képernyő kinézetét, hogy jobban
hasonlítson a valódi Deltarune-ra (ld. `osszefoglalo-260712.md`):

- **Nincs beszélő-név sehol a `#dialogue-box`-ban**: a `#speaker-name` elem
  a DOM-ban marad (`js/battle.js` `typeText()` továbbra is írhat bele), de
  `style.css`-ben `display:none` -- szándékosan nem törölt funkció, csak
  véglegesen elrejtett, mert a felhasználó ezt kérte.
- **`#battle-corner-popup` (Queen/Tenna beugrás a harc alatt) MINDIG a
  "room"-nézetet használja** (`Speech Bubbles_rooms.png` háttér, nagyobb
  portré jobb-alul) -- ugyanaz, mint a Bazsa-szoba Tenna/Queen beszólásai,
  és ugyanazokat a `Queen_room.png`/`Tenna_room.png` portrékat használja
  (NEM a `_talk.png` változatot -- ezek külön, a "room"-doboz méretéhez
  illő crop-ok). `style.css`-ben saját, nem class-toggle-lt szabály, a
  plain `#corner-popup`-tól függetlenül, `z-index:2`-vel (mert a
  `#dialogue-box`/`#menu-box` is fix pozícióban van és térben átfedheti,
  ld. lejjebb). `showCornerBanter()` a saját fázisa alatt teljesen elrejti
  a `#dialogue-box`-ot (`classList.add("hidden")`), hogy csak a buborék
  látsszon, a fázis végén pedig visszaadja (`classList.remove("hidden")`).
- **`#dialogue-box` és `#menu-box` fix (`position:absolute`) pozícióban
  vannak a `#battle-stage` alján, DINAMIKUSAN igazodva egymáshoz**
  (ahelyett hogy a flex-flow-ban "ugrálnának" attól függően, mi látható még
  felettük):
  - A `#dialogue-box` (`bottom:8px`) CSAK akkor látható, ha ténylegesen van
    friss, ki nem olvasott szöveg -- `js/battle.js` `showSequence()` MINDEN
    híváskor automatikusan felfedi (`classList.remove("hidden")`) a dobozt,
    mielőtt írna bele; a dodge-fázis KEZDETEKOR viszont explicit elrejtik
    (`enemyAttack()`/`runRound()`), és utána SZÁNDÉKOSAN nem állítják
    vissza automatikusan -- így egy dodge-fázis/menü után nem marad ott a
    régi, már elolvasott szöveg, amíg nincs új mondanivaló.
  - A `#menu-box` `bottom`-ja `js/battle.js` `showActMenu()`-ben
    DINAMIKUSAN dől el: ha a `#dialogue-box` éppen látható (van friss
    szöveg -- pl. a záró FIGHT/SPARE-menünél, ahol az előző reakció-sor még
    kint van), a menü a doboz teteje fölé zár (`240px`, elég hely egy 3
    sorra tördelődő -- a CLAUDE.md "Ismert korlátok" szerinti legrosszabb
    esetű, kb. 208px magas -- szöveg fölött is); ha a dialogue-box rejtve
    van (pl. közvetlenül egy dodge-fázis után, mielőtt a játékos választana),
    a menü lehúzódik a képernyő aljához közel (`16px`).
  - Ugyanez a grid-oszlopszám is dinamikus: `showActMenu()` `acts.length`
    alapján 1-3 opciónál egy sorba rendezi őket (`repeat(N, 1fr)`), 3-nál
    többnél visszaáll a régi 2-oszlopos tördelésre.
- **`#battle-enemy-sprite`**: a felhasználó kérésére új, állandó "a
  képernyő közepén álló ellenfél" kép (`index.html`/`style.css`,
  `top:100px`, magasság 160px, `object-fit:contain`, `pointer-events:none`)
  -- a fordulós harc legelejétől (a cornerIntro-val egy időben) folyamatosan
  látszik, és a fenti `centerEnemySprite`-tal együtt vált FIGHT-onként.
  Jelenleg csak a fordulós (1. zóna) harc kapcsolja be; a legacy zónák nem
  használják.
- **Minden dialógus-sor, aminek nincs saját `portrait`-ja, de a `speaker`
  ismert (nevesített) karakter, automatikusan kap egy alapértelmezett
  arcképet** -- `js/battle.js` `resolvePortrait()`, amit a `showSequence()`
  minden híváskor lefuttat. Ez NEM ír felül már megadott `portrait`-okat,
  csak a hiányzókat tölti ki. Két forrásból dolgozik:
  - `zoneData.speakerPortraits` -- egy zónánként megadott (de ténylegesen
    egy közös `RECURRING_SPEAKER_PORTRAITS` konstansra mutató, ld.
    `js/zones.js` teteje) `{KECSKE, QUEEN, TENNA, ASGORE} -> _talk.png`
    térkép a visszatérő kísérőkhöz/ellenfelekhez.
  - `zoneData.enemy.talkSprite` (ha van) vagy `zoneData.enemy.sprite`
    (fallback) az adott zóna ellenfelére, `line.speaker === zoneData.enemy.name`
    egyezés esetén. Fordulós módban (1. zóna) a már elért `enemyPortrait`
    állapot (talk-dying-01/02, ld. fent) elsőbbséget élvez a talkSprite
    felett. **A ZONE_1 `enemy.talkSprite`-ja a felhasználó kifejezett
    kérésére `enemy_konnyleny_placeholder_talk.png`-re van állítva** --
    ez méretben (38×43px) és stílusban (szürkeárnyalatos koponya) eltér a
    többi (128×154px, kék) Könny-lény-sprite-tól, de ez SZÁNDÉKOS (a
    felhasználó jóváhagyta, és két további, ugyanilyen stílusú
    `_talk-dying-01/02.png` variánst is adott hozzá az `enemyPortraitAfter`
    progresszióhoz), nem hiba.
  - A ZONE_2 ellenfelének `name` mezője `"TÚLBOLDOG BOHÓC-NPC"`-ről
    `"BOHÓC-NPC"`-re lett javítva, mert nem egyezett a dialógus-sorok
    `speaker`-ével -- emiatt a `resolvePortrait()` korábban nem ismerte fel
    az ellenfél saját sorait. A másik 3 zóna `enemy.name`-je már eleve
    pontosan egyezett a `speaker`-rel.
  - A BOHÓC-NPC/CSŐ-AUTOMATA/BLOKKFEJŰ VÉGHIBA ellenfeleknek nincs
    `talkSprite`-juk (nincs hozzájuk `_talk` asset) -- ezeknél a fallback
    egyszerűen a sima (gen_assets.py-generált placeholder) `sprite`-ra esik
    vissza, ami "csak" annyit tud, hogy legyen valamilyen kép a semminél.
  - Ez a viselkedés SZÁNDÉKOSAN korlátozott hatókörű: csak a korábban
    portré NÉLKÜLI sorokat tölti ki, a zónákban már explicit módon (akár
    talk, akár nem-talk) megadott portrékat nem írja felül -- ha a
    felhasználó azt szeretné, hogy MINDEN névvel ellátott karakter-sor
    mindig a `_talk` változatot mutassa (a már megírt, explicit portrékat
    is beleértve), az egy külön, nagyobb (a 4 zóna nagy részét érintő)
    átalakítás lenne.

### SPARE utáni viszontlátás (Isaac-szoba)

A felhasználó kérésére, ha az 1. zóna harca SPARE-kimenetellel zárul, és a
játékos utólag visszasétál a folyosóról az Isaac-szobába, a Könny-lény NEM
tűnik el, de már NEM indítható vele harc -- csak egy rövid, baráti
"viszontlátás"-jelenetet ad, aztán a játékos szabadon tovább mozoghat:

- `js/main.js` `zone1Spared` modul-szintű flag (a FIGHT-kimenetelű
  `zone1Defeated` párja), az `enterZone()` callback-jében áll be, ha
  `result.outcome === "spare"`.
- `buildIsaacRoomScene()`-ben, ha `zone1Spared && !zone1Defeated`, az
  `isaac-room-enemy` hotspot MEGMARAD (a sima, sértetlen `enemy.sprite`-tal),
  de már NEM `auto` -- Enter kell hozzá (mint egy sima NPC-beszélgetéshez,
  `prompt: "▶ Enter: odaszólsz a Könny-lénynek"`), és az `onInteract` a harc
  helyett a `showOverworldDialogue()`-t indítja.
- `showOverworldDialogue(lines, onDone)` (`js/main.js`, `flavorPopup()`
  mellett) egy ÚJ, általános segédfüggvény: `Overworld.showCornerPopup()`
  egymás utáni, láncolt hívásaival játszik le TÖBB, VÁLTAKOZÓ beszélős
  (soronként külön `portrait`) sort -- minden `lines[i]` egy `{portrait,
  text}` objektum, a `portrait` lehet `null` a "TE" (játékos) soroknál,
  mint a harci dialógusban. Minden egyes `text` maga is lehet tömb (több
  "oldal", lapozható), mint a `companionChat`-nál.
- A konkrét szöveg (`KONNYLENY_REUNION_LINES`, `js/main.js`) a felhasználó
  saját, kész forgatókönyve -- egyszerű, mindig ugyanaz a beszélgetés,
  valahányszor a játékos megszólítja (nincs "csak egyszer" logika, ahogy a
  többi ismétlődő NPC-flavor-szöveg sem egyszeri).

## A 2. zóna FIGHT/ACT/SPARE harca (Bubble)

A 2. zóna (Cirkusz) a felhasználó kifejezett kérésére szintén megkapta az 1.
zónás fordulós FIGHT/ACT/SPARE rendszert (nem a 3-4. zóna régi, egyszerű
ACT-listás motorját) — de a saját bevezető szoba (mint az 1. zóna Isaac-
szobája) NÉLKÜL: a harc közvetlenül a fő folyosóról indul. A teljes adat a
`js/zones.js` `ZONE_2` objektumában van. Ehhez a battle.js rounds-motorja két
generikus mezővel bővült (`preLinesByChoice`, `ending.preLinesByMercy`, ld.
fent az Architektúra `js/battle.js` bejegyzését) — ezek NEM zóna2-specifikus
hackek, bármelyik jövőbeli rounds-zóna használhatja őket.

- **Ellenfél: BUBBLE** (`enemy_bubble_placeholder.png`, `talkSprite:
  enemy_bubble_placeholder_talk.png`). Szándékosan NINCS dying-progresszió
  (a felhasználó választása: "csak egy egyszerű placeholder egyelőre") — a
  FIGHT-opciók nem állítanak be `enemyPortraitAfter`/`enemyFieldAfter`-t.
- **2 forduló, majd záró FIGHT/SPARE** (nem 3, mint az 1. zónánál):
  - **1. forduló**: Kecske+Tenna kommentál (Bubble még nem támad), dodge
    `pattern:"bounce"`, **`life: Infinity`** (a felhasználó kérésére a
    pattogó buborékok SOSEM tűnnek el, nem a szokásos ~2600ms után).
    3 opció: FIGHT, `koszonj_vissza` (ACT, **mercy: 50**), `szurd_meg` (ACT,
    mercy nélkül).
  - **2. forduló**: bevezetője `preLinesByChoice`-szal 3-felé ágazik az 1.
    forduló PONTOS választása szerint (`fight`/`koszonj_vissza`/`szurd_meg`
    kulcsok). Dodge `pattern:"spiral"` — **a felhasználó kérésére a spiral-
    lövedékek is visszapattannak** (ld. az Architektúra `js/engine.js`
    bejegyzését), ugyanazzal a `tearImages`-sel. 3 opció: FIGHT, `enekelj`
    (ACT, **mercy: 50**), és egy korai `korai_spare` ACT ("SPARE" címkével,
    de a felhasználó döntése szerint NINCS külön SPARE-ikonja — sima
    ACT-cimke) — ennek nincs hatása, csak egy elutasító reakció-sor, a harc
    NEM ér véget tőle.
  - **Záró FIGHT/SPARE**: `ending.preLinesByMercy` — "peaceful" (mercy
    100, azaz mindkét béke-ACT-ot választották), "aggressive" (mercy 0) vagy
    "mixed" (mercy 50) bevezetővel. SPARE csak `mercy>=100`-nál sikerül
    (ugyanaz a szabály, mint az 1. zónánál).
- **Meret szerinti lövedék-textúra**: mindkét forduló dodge-configja
  `tearImages: {small:"bubbleSmall", normal:"bubbleNormal",
  large:"bubbleLarge"}`-t ad meg — a három betöltött kép
  (`bubbles-bulett-small/normal/large.png`, ld. `js/main.js`
  `Engine.loadImage()`) lövedékenként, a saját sugaruk alapján.
- **Kipukkanás → tócsa, NEM eltűnés**: a felhasználó eredetileg úgy kérte,
  hogy FIGHT-győzelemnél a Bubble egyszerűen tűnjön el, majd korrigálta:
  **legyen belőle `puddle.png` (egy tócsa)**, ami MÁR a harc közben,
  pontosan a `+TOO MUCH FUN` stílus-felirat megjelenésekor becserélődik
  (`ZONE_2.ending.fight.enemyPortrait`/`enemyField`, ld. `finishZone()`
  sorrendjét — ezek a mezők a `showStyleTag()` ELŐTT állítódnak be). A
  folyosón visszatérve ugyanez a kép marad, most már `decorations`-ként
  (NEM hotspot-sprite-ként — ez fontos, mert a `.overworld-decor` CSS-
  osztálynak, ellentétben a hotspot-sprite-okkal, nincs `npcFloat`
  lebegő-animációja, így a tócsa nem mozog fel-le, ld. `js/main.js`
  `buildCorridorScene()` `zone2Defeated` ága).
- **SPARE utáni viszontlátás**, ugyanaz a minta, mint az 1. zónánál: ha
  `zone2Spared`, a Bubble-hotspot megmarad, de már nem `auto` — Enterrel egy
  rövid, harc nélküli búcsú-beszélgetést ad (`BUBBLE_REUNION_LINES`,
  `js/main.js`, `[SZERKESZTENDŐ]`-vel jelölve, mert a felhasználó nem adott
  meg konkrét szöveget, csak hogy legyen ilyen).
- **Egyéni Game Over-szöveg**: `ZONE_2.gameOverLines` csak Queen-t
  szólaltatja meg, más szöveggel, mint az alapértelmezett (Queen+Kecske) —
  a felhasználó szintén nem adott konkrét szöveget, ez is
  `[SZERKESZTENDŐ]`.
- **Player spawn-pozíció javítva**: a folyosó `playerSpawn()`-ja `yFrac:
  0.78`-ról `0.82`-re változott, mert a 2. zóna ajtaja körüli (kézzel írt,
  4-5 téglalapos) `walkBounds`-sávban a releváns téglalap `yMin`-je 0.8 —
  0.78-nál a harc utáni visszatérés a járható területen KÍVÜLRE spawnolt
  volna vissza.

### Caine és a szülinapi ajándék-keresés (folyosó, nem harc)

A 2. zóna folyosó-szakaszán Caine (placeholder, `caine_placeholder.png`,
`talkSprite`-ja `enemy_bohoc_placeholder_talk.png` — a régi Bohóc-NPC
`_talk` assetjének újrahasznosítása, amíg nincs saját Caine-arckép) KÉT
külön hotspotot kap (`ZONE2_LAYOUT.companionXFrac`/`giftXFrac`, 100px-re
egymástól) — DE a felhasználó kérésére **nincs saját álló-sprite-ja**
(a háttérgrafikán már rajta van), csak a hozzá tartozó interakciós terület.

- **Sorrend-független tartalom, NEM pozíció-függő**: mivel a játékos
  bármelyik hotspothoz érhet elsőként, `js/main.js` `handleCaineHotspot(id)`
  dönt: amelyik hotspotot ELŐSZÖR szólítja meg a játékos, az adja a
  bevezető beszélgetést (`CAINE_DIALOGUE_LINES` — "Hölgyeim és uraim...");
  a MÁSIK (még nem használt) hotspot adja a szülinapi ajándék-beszélgetést
  (`CAINE_GIFT_DIALOGUE_LINES` — "Ó, hallom ez egy különleges 13-as
  szám!...") és utána a visszaszámlálót. Mindkét beszélgetésben egy Jax
  nevű, saját sprite/portré NÉLKÜLI szereplő is megszólal ("Valahonnan a
  háttérből, Jax: ...") — mivel portré nélkül nem lenne megkülönböztethető
  a játékos ("TE") soraitól, a szöveg elején egy rövid attribúció jelzi, ki
  beszél; portréja `enemy_jax_placeholder_talk.png`.
- **Egyszeri esemény mindkét irányban** (a felhasználó kifejezett döntése):
  ha egy hotspotot már "felhasznált" (megadta a bevezetőt VAGY lezajlott
  az ajándék-keresés), újbóli megszólításkor már csak egy rövid, lezáró sor
  jön (`CAINE_INTRO_REPEAT_LINE` / `CAINE_GIFT_WON_LINE` /
  `CAINE_GIFT_LOST_LINE`), nem ismétlődik a teljes beszélgetés.
- **Ajándék-visszaszámláló minijáték** (`startGiftCountdown()`,
  `js/main.js`): a `CAINE_GIFT_DIALOGUE_LINES` végén (onDone) indul, egy új
  UI-doboz jelenik meg középen (`#gift-countdown-box`, `index.html`/
  `style.css`) `GIFT_COUNTDOWN_START` (32) másodperccel, másodpercenként
  csökken és `"coin"` hangot játszik. A "MEGVAN!" gombra kattintva (VAGY
  Enter/szóközzel — a visszaszámlálás alatt egy ideiglenes
  `window.keydown`-listener a gombra kattint, `finish()`-ben leválasztva)
  győzelem (`"won"` hang, `zone2GiftOutcome="won"`); ha lejár az idő,
  vesztés (`"awkward"` hang, `zone2GiftOutcome="lost"`, ÉS **Feki, a
  folyosó követő macskája VÉGLEG eltűnik**: `Overworld.removeFollower()`
  azonnal a jelenlegi jelenetből, `fekiGone` flag pedig minden KÉSŐBBI
  `buildCorridorScene()`-hívásból is kihagyja a `follower` mezőt).
- Mind a Caine-beszélgetések, mind a Feki-vesztés/ajándék-siker szövege a
  felhasználó saját, kész szövege (nem placeholder) — kivéve a `[SZERKESZTENDŐ]`-vel
  jelölt üres reakció-helyeket (2. forduló "ÉNEKELJ EGY CIRKUSZI DALT"
  ACT-jának reakciója, a korai SPARE-próbálkozás Bubble-elutasítása, és a
  záró forduló SPARE-sikertelenség-sora), amiket a felhasználó nem adott
  meg konkrétan.

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

**Javítva, felhasználó megerősítette ("Most jónak néz ki, köszi").** A
follower-logikát korábban két körben javítottuk sikertelenül (ld.
`osszefoglalo-260710.md` 5. szakasza) — a játékos idle-detektálását a nyers
billentyű-bemenet helyett a tényleges pozícióváltozásra állítottuk át, és a
"beragadás"-észlelőt fix px-epsilon helyett a szándékolt lépés arányára. A
harmadik körben a felhasználó megerősítette a pontos tünetet: **"a macska
szinte állandóan ott lóg közvetlenül mellettem/mögöttem, alig marad le,
nincs látható futás-animáció — mintha csak a pozíciómat másolná".** Ez
rávilágított az igazi okra: a `FOLLOWER_KEEP_DISTANCE` egyetlen közös határ
volt mind az "induljon el utolérni", mind a "itt álljon meg" döntéshez —
emiatt a `FOLLOWER_SPEED`/játékos-`SPEED` közelsége (160 vs 140) miatt a
kísérő gyakorlatilag lépéstartásban, egy állandó szűk távolságon "ragadt"
mozgott a játékossal, sosem esett le tőle látványosan, hogy aztán érdemben
utána fusson. **Javítás (`js/overworld.js` `updateFollower()`):**
hiszterezis két külön határral — `FOLLOWER_CHASE_TRIGGER_DISTANCE` (140px,
ENNYIRE kell lemaradnia, hogy egyáltalán elinduljon utolérni) és
`FOLLOWER_KEEP_DISTANCE` (60px, EDDIG fut, itt áll meg) —, plusz
`FOLLOWER_SPEED` felemelve 160→230-ra, hogy az utolérés egy gyors, jól
látható "beérős" mozdulat legyen, ne araszolás. Ez oldotta meg végleg —
**tanulság:** a korábbi két kör kódolvasásból levezetett, plauzibilis
hipotézisekre épült, de csak a pontos, felhasználó által leírt tünet vezetett
el a valódi okhoz. Hasonló, nehezen reprodukálható hibáknál előbb kérdezz
vissza a pontos tünetre, ne találgass tovább kódból.

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

Ha egy zóna fordulós FIGHT/ACT/SPARE rendszert kap (mint az 1. és 2. zóna),
nézd meg mindkettőt mintaként — a `ZONE_1` az "egyszerűbb" eset (3 forduló,
`preLinesIfPrevFight`/`enemyLineRequiresPrevChoice` a bináris elágazásokhoz),
a `ZONE_2` pedig a többszörös elágazást igénylő eset (`preLinesByChoice`,
`ending.preLinesByMercy` — ld. "A 2. zóna FIGHT/ACT/SPARE harca (Bubble)").

## Ismert korlátok / amire figyelni kell (még nem tesztelt / hiányos)

- A teljes játék fix 800×640 belső felbontásra épül, amit a `main.js` felskáláz
  az ablakmérethez (letterboxolva) — ez szándékos (Undertale/Deltarune-minta),
  nem hiba, ha oldalt/felül-alul fekete sáv látszik.
- A halál/újraindítás ág (`gameOver()` a battle.js-ben) az 1. zóna fordulós
  harcában már élesben letesztelve (böngészőben, a dodge-fázis nehézségét
  ideiglenesen felturbózva, hogy tényleg elfogyjon a HP) — a retry helyesen
  a haláleset szerinti fordulót próbálja újra, ld. "Az 1. zóna FIGHT/ACT/
  SPARE harca". A 2-4. zóna régi (legacy) ACT-listás halál-ága még
  változatlanul leteszteletlen (a dodge-fázis ott rövid és könnyű).
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
- A `#battle-stage` (harc-képernyő belső kerete) fix 640×480 méretű,
  `overflow` nélkül — egy nagyon hosszú, 3 sorra törő támadó-sor a
  dodge-fázissal egyszerre elméletileg kilóghat a keretből (ld. az
  Architektúra `index.html` bejegyzését fentebb). Nem konfirmált éles hiba,
  csak egy ismert, szándékosan vállalt kompromisszum.

## Hátralévő munka (a DESIGN.md fejlesztési fázisai alapján)

**Az 1. ÉS 2. zóna KÉSZ, a felhasználó mindkettőt kifejezetten megerősítette**
("Szuper az első két résszel megvagyunk, Bazsa szoba és Isaac room." — majd
a 2. zóna teljes, több lépésben finomított kidolgozása után: "Szuper, készen
van a 2. zóna is köszi szépen."). Minden idevágó részlet a fenti "Az 1. zóna
FIGHT/ACT/SPARE harca", "SPARE utáni viszontlátás (Isaac-szoba)", "A 2. zóna
FIGHT/ACT/SPARE harca (Bubble)" és "Caine és a szülinapi ajándék-keresés"
szakaszokban, a menetek teljes története `osszefoglalo-260712.md`-ben.

**Következő kör (a felhasználó kifejezett kérése): a 3. zóna kivétele, a 4.
zóna lesz a záró, Minecraft-témájú zóna.** Szó szerint: *"A harmadik zónát ki
kell venni, a 4 zóna legyen a záró minecraftos zóna. Ahol a végével
lezárjuk."* Ez két nagy változást jelent:

1. **A 3. zóna ("A Csövek", Cső-Automata, +OVERCLOCKED) teljesen kikerül** a
   játékból — a jelenlegi 4 zónás lánc (1. Sírás → 2. Cirkusz → 3. Csövek →
   4. Roblox-lerakat) 3 zónássá rövidül (1. Sírás → 2. Cirkusz → 4.
   [most Minecraft-témájú zóna, ami a lánc UTOLSÓ tagja marad]).
2. **A 4. zóna Minecraft-témájúra vált** (a jelenlegi Roblox/"BLOKKFEJŰ
   VÉGHIBA" tartalom helyett), és ITT kapja meg a játék a teljes zárójelenetet
   — a felhasználó ehhez már kész, végleges szöveget adott (nem
   placeholder), ami a `ZONE_4.victoryLines`-ban lévő `[SZERKESZTENDŐ]`
   placeholdert is felváltja/kibővíti. **A felhasználó SZÓ SZERINTI
   forgatókönyve** (ezt pontosan így vidd át, ne parafrazáld):

   ```
   KECSKE: „Minecraft? Komolyan? Már csak egy zombi hiányzik, aki megpróbál
   megenni, miközben próbálom megérteni a 'kocka-logikát'.”
   TENNA: „Ez már nem a Wi-Fi. Ez a rendszer alaprétege. Valaki nagyon
   szereti a retro voxel-stílust... várj, figyelj!”

   APA: (snd_heavydamage.wav) „BUMM. Drámai belépő, a sors elkerülhetetlen
   végzete... még mindig működik, vagy már túl öreg vagyok ehhez a digitális
   bohóckodáshoz?”
   TE: „Apa? Miért vagy... kocka alakú?”
   TE: "Nahh jó, ezt nem hagyom..."
   Megjelenik egy Kép a képernyő közepén kint van 2mp-ig (4finger_placeholder.png).
   Utána: Stílus-felirat győzelemnél: +APPPAAAAAAA (Ha lehet ezt több ideig kitartva)
   APA: Ha HA HAAAA - pukk eltűnik és megjelenik helyette APA2
   APA2: „Tudom, tudom. A világok, a harcok, a szép grafikák. De figyelj...”
   Kivilágosodik a kép (snd_won.wav) és középen feketével megjelenik:
   System Reset: Happy 13th Birthday! + (snd_splat.wav)
   Egy kis hatásszünet aztán alatta:
   APA2: „A szülinapi ajándékot nem a szerverekben kell keresni, Tökös.
   Reseteljük ezt a borzalmat, és menjünk inkább medencézni. A valódi víznek
   legalább nincsenek textúrahibái.”

   (A képernyő elsötétül. Egy utolsó, kattanó hang hallatszik (snd_step2.wav),
   majd a játék az elejére ugrik.)
   ```

   Fontos: az "APA" itt ugyanaz a szereplő, mint amit a `js/zones.js`/
   `DESIGN.md` eddig "ASGORE"-ként nevesített (Asgore = a szülő, ld.
   DESIGN.md "Szereplők" szakasza) — feltehetően csak a megszólítás/`speaker`
   változik "ASGORE"-ról "APA"-ra, de ezt **kérdezz vissza**, mielőtt
   átnevezed (lásd lejjebb).

**Mielőtt nekiállnál, kérdezz vissza** (ld. a fájl tetején lévő szabályt) —
ez egy jelentős szerkezeti változás, több nyitott technikai kérdéssel:

- **`speaker` átnevezés**: az "ASGORE" nevet mindenhol (kód, `RECURRING_SPEAKER_PORTRAITS`,
  `asgore_placeholder*.png` fájlnevek) "APA"-ra kell cserélni, vagy csak a
  MEGJELENÍTETT szöveg változik, a belső kulcs/fájlnevek maradnak "ASGORE"?
- **Zóna-kivétel mechanikája**: a `ZONES` tömbből egyszerűen törlődik a
  `ZONE_3`, vagy megmarad a kódban (kikommentelve/kikapcsolva), csak nincs
  bekötve? A `js/main.js` `DOOR_FRACTIONS`/`CORRIDOR_ZONE_BACKGROUNDS`
  tömbjei 4-ről 3 elemre csökkennek — ez újra kiszámolt ajtó-pozíciókat
  jelent (ld. "A 2. zóna FIGHT/ACT/SPARE harca" szakasz hasonló
  CORRIDOR_SEGMENT_WIDTHS-számítását), és a `corridor_zone3_bg_placeholder.png`
  fájl innentől nem használt.
- **APA1→APA2 arckép-váltás**: a szövegben "pukk eltűnik és megjelenik
  helyette APA2" egy portré-váltás EGY dialógus-soron belül (vagy két sor
  között) — ez a meglévő `faces`/`{{kulcs}}` mechanizmussal (ld. "Harci
  dialógus: arcváltás időzítése" szakasz) MÁR megoldható lenne, ha a váltás
  egy string-en belül történik; ha viszont a "pukk" hanggal/effekttel
  egybekötött, külön vizuális esemény, az új, egyedi kódot igényel.
- **`4finger_placeholder.png` még nem létezik** — le kell generálni
  (`tools/gen_assets.py` mintájára) vagy a felhasználónak kell pótolnia.
  Ugyanígy nincs még "APA2" külön portré-fájl.
- **`+APPPAAAAAAA` stílus-felirat "több ideig kitartva"**: a jelenlegi
  `showStyleTag()` (`js/battle.js`) fix ~1100ms-ig tartja a feliratot — ez a
  konkrét sor kérése szerint HOSSZABB kitartást igényelne, tehát vagy egy
  `showStyleTag()`-paraméterezés (időtartam felülírható), vagy egy
  zóna/eset-specifikus külön hívás kell.
- **Fényesedő képernyő + fekete szöveg + hatásszünet + elsötétülés**: ez a
  jelenlegi vég-képernyő (`#end-screen`, statikus "HAPPY 13TH BIRTHDAY!"
  szöveg) helyett/előtt egy ÚJ, több lépéses animált átvezetést igényel —
  hasonló szellemben, mint a meglévő `#scene-fade` (ld. "Képernyő-átmenetek"
  szakasz), de saját, egyedi lépésekkel (kivilágosodás, majd elsötétülés,
  köztes szöveg-becsúszás, hangok időzítve). Érdemes megnézni, mennyi
  újrahasznosítható a `#scene-fade` CSS-osztályaiból, mielőtt új elemet
  hoznál létre.
- **"a játék az elejére ugrik"**: ez a `restartBtn`-nel megegyező viselkedés
  (vissza a címképernyőre), vagy szó szerint automatikus, felhasználói
  interakció (gombnyomás) nélküli újraindítás?

**Ne felejtsd el**: a fenti forgatókönyv KÉSZ, végleges szöveg — ne írj hozzá
sem rövidítést, sem saját poént, csak a technikai megvalósítást kérdezd
vissza, a TARTALMAT vidd át pontosan.

**Jelenleg folyamatban / a legutóbbi menetek óta aktuális feladat:** lásd
`osszefoglalo-260710.md`/`osszefoglalo-260711.md`/`osszefoglalo-260712.md`
(több menet összefoglalója, dátum szerint bővül) a részletes történetért.
Rövid összegzés (ez a lista a legutóbbi menetek — köztük a jelen menet —
végén friss):

- A nyitó jelenet (cím → szoba → gép-választás → glitch-átmenet) kész.
- A folyosó háttere zónánkénti külön fájlokra lett bontva
  (`corridor_zoneN_bg_placeholder.png`, ld. "Az overworld-jelenetek
  hangolása"), és **az 1. zóna háttere már kézzel rajzolt, végleges**
  (nem placeholder) — a 2-4. zónáé még a generált placeholder.
- A folyosón most Kecske egy a játékost követő NPC, automatikus (Enter
  nélküli) zóna-belépéssel és több lépcsős képernyő-átmenetekkel (ld.
  "Képernyő-átmenetek"), lapozható NPC-beszólásokkal.
- **A Feki-követő "rátapad" hibája javítva és felhasználó által
  megerősítve** — ld. "Az overworld-jelenetek hangolása" szakasz vége.
- **Új: az 1. zóna ajtaja egy külön bevezető szobába (`isaac_room.png`,
  `buildIsaacRoomScene()`) visz**, ahol a zóna ellenfele saját hotspotként
  áll, és csak alul lehet kijönni — ld. "Jelenlegi állapot". A szobának
  saját háttérzenéje van, ami a `roomMusic`-kal vált (pause/resume,
  megtartva a lejátszási pozíciót).
- **Új: a harc-képernyőnek (`#game-screen`) is van már belső kerete**
  (`#battle-stage`, fix 640×480, ugyanaz a vizuális nyelv, mint az
  overworld-stage-é), plusz a "Mozgás harcban: ..." hint-szöveg, amit eddig
  csak a címképernyőn lehetett látni — ld. az Architektúra `index.html`
  bejegyzését.
- **Új: az 1. zóna harca mostantól egy saját FIGHT/ACT/SPARE, fordulós
  rendszer** a felhasználó konkrét forgatókönyve alapján — ld. "Az 1. zóna
  FIGHT/ACT/SPARE harca". Ehhez kapcsolódóan: `js/engine.js` három
  dodge-mintázatot tud (`rain`/`bounce`/`spiral`), új `fight_icon.png`/
  `spare_icon.png` UI-ikon lett kivágva (`tools/slice_ui_assets.py`), és a
  legyőzött Könny-lény FIGHT-kimenetel esetén tartós díszként marad az
  Isaac-szobában (`zone1Defeated`, `js/main.js`).
- **Új (`osszefoglalo-260712.md`): az 1. zóna harca a felhasználó több
  körös, konkrét (screenshotos) visszajelzései alapján véglegesítve** --
  ld. "Az 1. zóna FIGHT/ACT/SPARE harca", "Harc-UI" és "SPARE utáni
  viszontlátás (Isaac-szoba)" szakaszokat a teljes részletekért. Röviden:
  fordulók közti tartalmi elágazás (`preLinesIfPrevFight`,
  `enemyLineRequiresPrevChoice`), összeadódó Spare-mérő, két független
  ellenfél-kép-állapot (dialogue-box "beszélő" arc vs `#battle-enemy-sprite`
  közepső harci sprite), piros könnyek FIGHT után (`tearsAreRed`), a
  spiral-mintázat SOUL-spawnja áthelyezve az alsó harmadba és a kísérleti
  "óriás könny" placeholder eltávolítva, MINDIG "room"-stílusú
  Queen/Tenna sarok-buborék a harcban, dinamikusan (a dialogue-box
  láthatóságától függően) pozicionált ACT/FIGHT/SPARE-menü, nincs
  beszélő-név a dialogue-boxban, és egy SPARE után elérhető, harc nélküli
  "viszontlátás"-beszélgetés a Könny-lénnyel.
- **Új: a 2. zóna (Cirkusz, Bubble) teljesen egyedivé/kész lett** — a
  felhasználó több lépésben, konkrét visszajelzésekkel finomította, végül
  megerősítette ("Szuper, készen van a 2. zóna is köszi szépen"). Ld. "A 2.
  zóna FIGHT/ACT/SPARE harca (Bubble)" és "Caine és a szülinapi
  ajándék-keresés" szakaszokat a teljes részletekért. Röviden: saját
  rounds/ending-tartalom (`preLinesByChoice`/`preLinesByMercy`, két új,
  ÁLTALÁNOS battle.js-mezo), meret szerinti buborek-lövedék-textúrák
  (`tearImages`), visszapattanó spiral-lövedékek, kipukkanás után `puddle.png`
  (nem eltűnés), egyéni Game Over-szöveg (`gameOverLines`), Caine két
  sorrend-független hotspotja (`handleCaineHotspot()`) egy beépített
  szülinapi ajándék-visszaszámláló minijátékkal (Enter/szóköz-
  billentyűzet-támogatással), és egy Feki-vesztés mechanika
  (`Overworld.removeFollower()`, `fekiGone`).
- **A `bazsa_szoba.png` (a gyerek szobája), az Isaac-szoba/Könny-lény harc ÉS
  a 2. zóna (Cirkusz/Bubble) a felhasználó szerint EBBEN A FORMÁJÁBAN KÉSZ**
  -- a következő menet a 3. zóna kivétele és a 4. zóna Minecraft-témájú
  záró-jelenetté alakítása, ld. "Hátralévő munka" a fájl elején (a
  felhasználó kész, végleges záró-szövegével).

1. ~~Motor-prototípus~~ — kész (1. zóna)
2. ~~Tartalom~~ — kész (mind a 4 zóna megírva, lásd `js/zones.js`, bár a 3.
   zóna hamarosan kikerül és a 4. Minecraft-témájúra vált, ld. "Hátralévő
   munka" a fájl elején); **az 1. ÉS 2. zóna harca a felhasználó konkrét
   forgatókönyve alapján kibővült egy-egy FIGHT/ACT/SPARE rendszerré** (ld.
   "Az 1. zóna..." és "A 2. zóna FIGHT/ACT/SPARE harca (Bubble)") — a 3-4.
   zóna egyelőre a régi, egyszerűbb formátumon marad (a 4. zóna úgyis
   újraíródik a következő menetben).
3. **Vizuál** (folyamatban): a placeholder zóna-hátterek/folyosó-háttér/
   ellenfél-sprite-ok lecserélése saját rajzokra (ugyanazokkal a
   fájlnevekkel az `assets/sprites/` mappában, akkor semmit nem kell
   kódban módosítani — legfeljebb a `ROOM_SCENE`/`buildCorridorScene()`
   hotspot-pozíciókat a `main.js`-ben). A folyosó 1. ÉS 2. zónás szakasza
   (`corridor_zone1_bg_placeholder.png`, `corridor_zone2_bg_placeholder.png`)
   már kész, végleges rajz — a 3-4. zónáé még hátravan (de a 3. úgyis
   kikerül, a 4. újraíródik). A harc-képernyő UI-ja (HP-csík, ACT-doboz, párbeszéd-keret, SOUL, Game
   Over) már valódi, kibányászott Deltarune-assetekkel megy (lásd
   `tools/slice_ui_assets.py`) — ide tartozó, még kihasznált stretch goal: a
   `Battle Box`/`Battleback` animáció-sorozatok (jelenleg csak statikus
   kockaként/nem használva) pop-in/animált háttérré alakítása.
4. **Hang**: a szoba/folyosó és az Isaac-szoba háttérzenéje már be van kötve
   (`roomMusic`/`isaacMusic`, ld. "Jelenlegi állapot"), néhány effekt is
   (gépelés, zóna-indítás, glitch, joker-nevetés, flavor-szöveg, a 2. zóna
   ajándék-visszaszámlálója — ld. `js/main.js` `Engine.loadSound()`
   hívásait) — de a legtöbb generált beep (`assets/sfx/*.wav`) még cserére
   vár a beszerzett valódi `assets/Sounds/`-beli hangokra, és a 2-4.
   zónának nincs saját háttérzenéje. A tervezett 4. zónás zárójelenet
   (ld. "Hátralévő munka") több konkrét hangot is megnevez
   (`snd_heavydamage.wav`, `snd_won.wav`, `snd_splat.wav`, `snd_step2.wav`
   — ezek már megvannak az `assets/Sounds/`-ban), amiket még be kell kötni.
5. ~~Összefűzés~~ — kész (cím → szoba → gép-választás → folyosó → mind a 4 zóna
   → Asgore-zárás → vég-képernyő, egyben, teljesképernyős skálázással)
6. **Polish**: átmenetek zónák között, finomítás. A `ZONE_4` `[SZERKESZTENDŐ]`
   placeholder-sora **innentől MEGVAN** — a felhasználó megadta a végleges
   apa-fiú poént/közös programot a teljes záró-jelenettel együtt, ld.
   "Hátralévő munka" a fájl elején a szó szerinti szövegért és a hozzá
   tartozó (még megvalósítandó) technikai kérdésekért.
7. **Teszt**: teljes végigjátszás, ideális esetben tényleges böngészőben, más gépen is

## Futtatás / tesztelés

Nincs build lépés, nincs szerver szükséges: `index.html` megnyitása böngészőben elég.
Fejlesztés közben `node --check js/*.js`-sel érdemes szintaxist ellenőrizni módosítás
után, mielőtt böngészőben tesztelsz.
