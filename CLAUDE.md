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
- **A három zóna egyenlő súlyú** (a Roblox-témájú, korábbi 4. zóna kikerült a
  játékból — ld. "Hátralévő munka"/"A záró (Minecraft) zóna" lejjebb —, a
  záró zóna immár Minecraft-témájú, és nem médiakritika, hanem egy privát
  apa-fiú poén).
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
zóna harca egy saját, fordulós FIGHT/ACT/SPARE rendszer** (ld. "Az
1. zóna FIGHT/ACT/SPARE harca" lejjebb). **A 2. zóna (Cirkusz, Bubble) is
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
záró (3.) zóna ajtaja változatlanul közvetlenül a harcba visz. A 2. zóna ajtaja
ELSŐRE szintén közvetlenül a harcba visz, de győzelem/kegyelem UTÁN már nem
(ld. "A 2. zóna FIGHT/ACT/SPARE harca (Bubble)" lejjebb — a hotspot vagy
teljesen megszűnik, vagy Enter-es "viszontlátássá" alakul). (Tenna/
Queen korábban szintén megjelentek a folyosón külön hotspotként — ez
egyelőre ki van kapcsolva, ld. "Ismert korlátok".) **A játék immár HÁROM
zónás** (a felhasználó kifejezett kérésére a korábbi 3. zóna, "A Csövek",
teljesen kikerült — ld. "A záró (Minecraft) zóna" lejjebb): 1. "A Sírás"
(Könny-lény, +DRY EYES) → 2. "A Cirkusz" (Bubble, +TOO MUCH FUN) → 3. (immár
utolsó, korábban "4." volt) "A Minecraft-lerakat" — Apa drámai belépője
kockásra glitchelt avatárként, egy rövid FIGHT-beszólás, majd egy teljesen
egyedi záró-animáció (kivilágosodás → "System Reset: Happy 13th Birthday!"
felirat → Apa2 privát záró-sora → elsötétülés → automatikus visszatérés a
címképernyőre, gomb nélkül) — ld. "A záró (Minecraft) zóna" lejjebb a teljes
leírásért. Az 1-2. zóna után a játék visszatér a folyosóra és folytatódik a
séta a következő ellenfél-hotspotig; a záró zóna után NEM a régi
`#end-screen` jön (az csak tartalék-ág egy jövőbeli, `finalCinematic` nélküli
utolsó zónához), hanem a fenti egyedi animáció vezet egyenesen vissza a
címképernyőre.

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
                        overflow-t visszaallitani hidden-re. Harom UJ elem a
                        `#battle-stage`-ben (a ZONE_4 zaro-jelenetenek EREDETI,
                        harc-kepernyos valtozatahoz -- ez az utvonal jelenleg
                        egyetlen zonanal sem fut le ELESBEN, ld. "A záró
                        (Minecraft) zóna"): `#battle-image-flash` (a `line.image`
                        sorozat-mezo altal felvillantott kep, ld. js/battle.js
                        bejegyzest), `#style-tag` es `#ending-overlay` (a
                        `playFinalCinematic()` sajat, feher->fekete fedoje, ld.
                        ott) -- mindharom szerepel a `#battle-stage > *:not(...)`
                        blanket `position:relative`-szabaly kizarasi listajaban is
                        (style.css), mert sajat `position:absolute`-juk van. Az
                        `#overworld-stage`-ben egy PARHUZAMOS, azonos CSS-t
                        hasznalo elem-harmas van (`#overworld-image-flash`,
                        `#overworld-style-tag`, `#overworld-ending-overlay`) --
                        EZEKET hasznalja teny­legesen a zaro zona, ld. "A záró
                        (Minecraft) zóna".
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
                        (1) "legacy" -- a ZONE_4 (a zaro, Minecraft-temaju zona)
                        hasznalja, a regi lapos ACT-listas kor-logika (player turn ->
                        ACT -> reakcio -> ellenfel tamad -> dodge -> ismet, amig egy
                        "endsFight" ACT-ot nem valasztanak vagy el nem fogy a HP) --
                        FONTOS: a `dodge`/`enemy.attackLines` mezok OPCIONALISAK, ha
                        az osszes ACT `endsFight:true`, mert akkor `enemyAttack()`
                        sosem fut le (ld. ZONE_4, aminek nincs dodge-fazisa);
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
                        fuggetlenul. A `typeText()` egy `typingSoundFor(speaker)`
                        segedfuggvenyen keresztul a `js/zones.js`
                        `RECURRING_SPEAKER_TYPE_SOUNDS` tablajabol valaszt
                        karakterenkenti gepeles-hangot (alap `"type"`, ha a beszelo
                        nincs a tablaban) -- ld. "Harci dialogus: arcvaltas idozitese
                        es gepeles-hang" lejjebb. A zaro (Minecraft-temaju) zona miatt
                        `showSequence()` KET UJ, ALTALANOS sor-mezot ismer fel egy
                        dialogus-sor objektumon (`js/main.js`
                        `showOverworldDialogue()`-nak is van `line.sound`
                        tamogatasa, ugyanezzel a mintazattal):
                        - `line.sound` -- egy Engine-hangnevet jatszik le a sor
                          gepelesenek inditasakor (pl. a script "(snd_heavydamage.wav)"-
                          szeru jelolesei egy-egy sorhoz kotve).
                        - `line.image` (+ opcionalis `line.duration`, alap 2000ms) --
                          szoveg helyett egy kepet villant fel a kepernyo KOZEPEN
                          (`showCenterImage()`), majd folytatja a sorozatot; a
                          `text`/`portrait` mezoket ilyenkor figyelmen kivul hagyja.
                        `showCenterImage(imgEl, src, ms)`/`showStyleTag(tagEl, text,
                        holdMs)`/`playFinalCinematic(domTarget, cfg, onDone)` MIND
                        EXPLICIT DOM-celt/callback-et kapnak parameterkent (nem a
                        closure `dom.*`-jat olvassak mindig), es exportalva vannak a
                        `Battle` publikus API-jan -- ez teszi lehetove, hogy a zaro
                        zona sajat (overworld-stage-beli) elemeivel hivja meg
                        ugyanezt a logikat a harc-kepernyo helyett, ld. "A záró
                        (Minecraft) zóna" lejjebb a teljes leirasert. A `holdMs`
                        (opcionalis, `showStyleTag`-nel) felulirja mind a JS
                        resolve-kesest, mind (inline `animation-duration`-nel) a CSS
                        `.style-pop` animacio hosszat, hogy a felirat tovabb
                        kitartson a szokasos 1.1s-nal.
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
                        (pl. a szamitogep valaszto-doboza) idejere -- FONTOS: a
                        `pause()` MAR NEM allitja meg magat a frissitesi ciklust
                        (`update()`-et, ld. `loop()`), csak a jatekos-bemenetet es
                        a hotspot-figyelest, mert a korabbi teljes-leallas miatt a
                        lepes-animacio barmelyik kockan "fagyva" maradhatott (a
                        felhasznalo visszajelzese szerint furan nezett ki, ha a
                        karakter lepes kozben allt meg) -- igy viszont az `update()`
                        tovabbra is lefut, es a mozgas-animacio szepen visszaall az
                        allo kockara, mielott a jatekos tenylegesen megallna.
                        `Overworld.showCornerPopup(portrait, text, onDone, variant?, opts?)`
                        a kozos, ujrafelhasznalt sarok-buborek mind a szoba, mind a
                        folyoso rovid NPC-beszolasaihoz -- a szoveg gepelve jelenik
                        meg (mindig hanggal, karakterenkent a `js/zones.js`
                        `RECURRING_SPEAKER_TYPE_SOUNDS` tablaja szerint, ld. "Harci
                        dialogus: arcvaltas idozitese es gepeles-hang" lejjebb),
                        Enter/szokoz/kattintas eloszor kiirja a
                        teljes (aktualis oldalnyi) szoveget, majd tovabblapoz a
                        kovetkezo oldalra, ha a `text` tomb (tobb "oldal"), vagy --
                        az utolso oldalon -- bezarja a buborekot. Az opcionalis
                        `opts: {boxWidth?, portraitSize?, speaker?}` soronkent
                        felulirhatja a doboz/portré CSS-alapertelmezett meretet
                        (300px/40px), pl. egy szokasosnal hosszabb sornal (ld.
                        `js/zones.js` ZONE_1 Kecske-soranak `boxWidth`/`portraitSize`
                        mezoit), az `opts.speaker` pedig a fenti gepeles-hang
                        kivalasztasahoz kell (a `typeCornerText()` ezt olvassa ki
                        modul-allapotba, `cornerSpeaker` neven). A
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
                        `Overworld.removeFollower()` -- altalanos fuggveny: azonnal
                        eltunteti a kovető NPC-t (ha van) a JELENLEGI jelenetbol (nem
                        kell megvarni egy kovetkező `start()`-ot). A hivo felelossege,
                        hogy a scene-config `follower` mezojet is torolje/felulirja a
                        kovetkező `buildX Scene()`-hivasokban, kulonben az visszahozna.
                        `Overworld.removeFollowerWithEffect(delayMs)` -- UJ valtozat:
                        `delayMs` ideig meg valtozatlanul kovet/ul a follower, majd egy
                        `.follower-glitch-out` CSS-osztallyal lejatssza rajta ugyanazt a
                        `worldGlitch` animaciot, amit a szoba->folyoso atmenet hasznal
                        (ld. "Kepernyo-atmenetek" lejjebb), es csak ENNEK vegen tavolitja
                        el tenylegesen -- ezt hasznalja a 2. zona "Feki-vesztes"
                        mechanikaja (ld. lejjebb), a "GAME OVER..." popup bezarasa utan
                        hivva meg, nem egy fuggetlen idozitovel.
js/zones.js           - AZ EGYETLEN hely, ahol tényleges harc-tartalom van: szövegek,
                        ACT-ok, ellenfél-adatok, a `background` (zona-hatterkep) ES a
                        `companionChat` (a folyoson az adott zona elott felszedhetot
                        Kecske/Tenna/Queen rovid beszolasai) zónánként. **Jelenleg
                        csak a `companionChat[0]` (Kecske) sora jelenik meg
                        ténylegesen a folyosón** -- a Tenna/Queen bejegyzések
                        (`companionChat[1]`/`[2]`) tartalmilag megvannak, de nincs
                        hozzájuk sprite/hotspot a `js/main.js` `buildCorridorScene()`-
                        jében (ld. ott a megjegyzést). A ZONES tömb sorolja fel a
                        zónákat sorrendben -- **immár csak HÁROM elemmel**
                        (`[ZONE_1, ZONE_2, ZONE_4]`, a korábbi ZONE_3 teljesen ki
                        lett törölve a fájlból, ld. "A záró (Minecraft) zóna"
                        lejjebb). **A ZONE_1 kivétel**: nincs `intro`/`acts`/
                        `dodge`/`victoryLines` mezője, helyette `cornerIntro`/`rounds`/
                        `ending` -- ld. "Az 1. zóna FIGHT/ACT/SPARE harca" lejjebb. A
                        ZONE_2 változatlanul a régi (itt a "Hogyan adj hozzá egy új
                        zónát" szakaszban dokumentált) lapos formátumot használja
                        (`rounds`-os változatban, ld. "A 2. zóna FIGHT/ACT/SPARE
                        harca"). A ZONE_4 (a betűjele a névben megmaradt "4", bár a
                        ZONES tömbben immár a 3., egyben utolsó helyen áll) EGY
                        HARMADIK, EGYEDI formátumot használ -- NEM megy át a
                        `Battle.start()`-on/ACT-menü-motoron/`victory()`-n egyáltalán
                        (ld. "A záró (Minecraft) zóna" lejjebb), ezért nincs
                        `acts`/`dodge`/`background` mezője sem; helyettük
                        `fightImage:{src,duration}` (a régi, egyetlen ACT
                        `reactionLines`-ából kiemelve) és MINDEN soron explicit
                        `portrait` (a `js/main.js` `playZone4Finale()` a `js/battle.js`
                        exportált `showSequence()`-ét hívja meg közvetlenül, ami
                        technikailag ismerné a `resolvePortrait()`-es `enemy.name`
                        fallback-et is, de mivel `Battle.start()` sosem fut le ehhez a
                        zónához, nincs beállítva `currentZone`/`currentRoundZone` --
                        emiatt itt MINDIG explicit `portrait`-ra kell hagyatkozni). A
                        `styleTag`/`styleTagDuration`/`finalCinematic` mezői
                        ugyanazok maradtak, de a `js/main.js` `playZone4Finale()`
                        fogyasztja őket, nem a `js/battle.js` `victory()`.
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

Az alapértelmezett gépelés-hang (`assets/Sounds/snd_txtasg.wav`,
`Engine.loadSound("type", ...)`, `js/main.js`) minden ki nem hagyott (nem
szóköz) karakternél lejátszódik, HA a beszélőnek nincs saját hangja beállítva.
**Karakterenkénti gépelés-hang** ugyanis be van kötve: a `js/zones.js`
`RECURRING_SPEAKER_TYPE_SOUNDS` (a `RECURRING_SPEAKER_PORTRAITS` párja, ld.
fent) egy `speaker -> hangnév` térkép (KECSKE/QUEEN/TENNA/KÖNNY-LÉNY/BUBBLE/
CAINE/JAX), amit MIND a `js/battle.js` `typeText()` (egy `typingSoundFor(speaker)`
segédfüggvényen keresztül), MIND a `js/overworld.js` `typeCornerText()` (a
sarok-buborék saját, független gépelős logikája) figyelembe vesz. A fel nem
sorolt beszélők ("TE", "APA", "APA2") változatlanul az alapértelmezett
`"type"` hangot kapják. A battle.js oldalon ez a már eddig is mindenhol adott
`speaker` mezőn keresztül ingyen működik; az overworld.js oldalon
`Overworld.showCornerPopup(portrait, text, onDone, variant, opts)` kapott egy
`opts.speaker` mezőt, amit a hívóknak (Caine/Jax-vonalak, Kecske
folyosó-csevegés, Tenna/Queen szoba-sorok, Könny-lény/Bubble
viszontlátás-sorok, a Feki-vesztés utáni "GAME OVER" sor) explicit át kell
adniuk — ld. "Ismert korlátok" a teljes hívási lista végett.

## Az 1. zóna FIGHT/ACT/SPARE harca

Az 1. zóna (Könny-lény) a felhasználó kifejezett forgatókönyve alapján egy
sajátos, csak rá jellemző harc-rendszert kapott (a záró, Minecraft-témájú
zóna változatlanul a régi, egyszerű ACT-listás motort használja -- ld.
"Hogyan adj hozzá egy új zónát" és "A záró (Minecraft) zóna"). A teljes
adatformátum a `js/zones.js` `ZONE_1` objektumában van, a
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
    is beleértve), az egy külön, nagyobb (a zónák nagy részét érintő)
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
zónás fordulós FIGHT/ACT/SPARE rendszert (nem a záró zóna régi, egyszerű
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

## A záró (Minecraft) zóna

A felhasználó kifejezett kérésére a korábbi 3. zóna ("A Csövek",
Cső-Automata, +OVERCLOCKED) **teljesen kikerült** a `js/zones.js`-ből (a
`ZONES` tömb immár csak `[ZONE_1, ZONE_2, ZONE_4]`) — a régi tartalma a
git-előzményekben megmaradt. A korábbi 4. zóna (Roblox-lerakat, Blokkfejű
Véghiba) helyett **a `ZONE_4` most a záró, Minecraft-témájú zóna**, a
felhasználó szó szerinti, kész forgatókönyve alapján (ld. a régi "Hátralévő
munka" bejegyzést a git-történetben a pontos szövegért). A `ZONE_4`
azonosítója (`id`) a kódban megmaradt "zone4"-nek, annak ellenére, hogy a
`ZONES` tömbben immár a 3., egyben utolsó helyen áll.

**FONTOS, TÖBBKÖRÖS ÁTALAKÍTÁS** — a felhasználó két külön visszajelzés
alapján finomította ezt a jelenetet:

1. Az ELSŐ megvalósítás a harc-képernyőre (`#game-screen`) vitte be ezt a
   jelenetet, `Battle.start()`-on keresztül, a régi "legacy" ACT-menüs
   motorral. A felhasználó ezt visszadobta — *"Itt most nem kell bejönnie a
   zone4_bg_placeholder.png-nek mert itt az alaphelyen játszódik le az egész
   beszélgetés. És úgy kellene hogy legyen egy hotspot ami elindítja az
   animációt, utána a karakterrel ne lehessen már mozogni. Lemegy Kecske és
   Tenna szövege, utána megjelenik Apa, utána jöhet a többi párbeszéd."* —
   emiatt a teljes jelenet a folyosóra (overworld-screen) költözött, egy
   `js/main.js` `playZone4Finale()` orkesztrálva.
2. A MÁSODIK körben ez a folyosós verzió eredetileg a kisebb, corner-popup
   beszéd-buborékot (`Overworld.showCornerPopup()`/`showOverworldDialogue()`)
   használta a dialógushoz (mint a Caine-/Könny-lény-/Bubble-viszontlátás
   jelenetek) — a felhasználó ezt is pontosította: *"viszont a szövegeknek
   ebben a szövegdoboz stílusban kellene megjelenniük: dialogue_box_frame.png"*
   (a NAGYOBB, harci dialógus-dobozra utalva, jobb olvashatóság miatt). Emiatt
   a dialógus MOST MÁR egy ÚJ, `#overworld-dialogue-box` elemben jelenik meg
   (ugyanaz a `dialogue_box_frame.png` keret, mint a harci dialógus-dobozon),
   NEM a corner-popupban — ld. lejjebb a pontos mechanizmust.

A `ZONE_4` emiatt NEM megy át a `Battle.start()`-on/a harc-motoron
(`acts`/`dodge`/`background` mezői nincsenek is). Az `AskUserQuestion`-nal
tisztázott döntések (a hotspot automatikus, nincs külön "FIGHT" gomb, Apa
valódi sprite-ként bukkan fel a képen) mind ebbe a megvalósításba épültek
be, ld. lejjebb.

- **A hotspot automatikus** (`auto: true`, mint a többi zóna ajtaja) — a
  `buildCorridorScene()` `i === ZONES.length - 1` ága építi fel: NINCS
  `sprite`/`prompt` rajta (Apa nem áll ott a jelenet kezdetéig), csak az
  `onInteract` hívja meg `Overworld.pause()` + `playZone4Finale(zone,
  doorHotspot.xFrac, doorHotspot.yFrac)`-et. **Az id-je szándékosan
  `"final"`** (nem a többi zóna ajtajánál használt generikus `door${i}`) —
  a felhasználó kifejezett kérésére, hogy egyedi és könnyen visszakereshető
  legyen a kódban.
- **A `ZONE_4`-nek NINCS `companionChat`-je** (a felhasználó kifejezett
  kérésére) — emiatt a folyosón NEM jelenik meg a másik két zónánál látható
  "▶ Enter: odaszólsz Eriknek" (Kecske) és "Minecraft... mi más :)" (néma
  flavor-szöveg) hotspot-pár ennél a zónánál; a `buildCorridorScene()`
  `if (chat[0])` ága (`chat = zone.companionChat || []`) emiatt magától
  kimarad, nem kellett hozzá külön `i === ZONES.length - 1` kizárás.
- **`#overworld-dialogue-box`** (`index.html`, `#overworld-stage` gyereke)
  a harci `#dialogue-box` PONTOS párja — ugyanaz a `dialogue_box_frame.png`
  háttér, portré-doboz, `#overworld-dialogue-text`/`#overworld-continue-hint`
  gyerek-elemek, KOMBINÁLT CSS-szelektorokkal (`#dialogue-box,
  #overworld-dialogue-box { ... }` stb., `style.css`) — nincs duplikált
  deklaráció. `js/battle.js` `showSequence(lines, target, box)` mostantól
  EXPLICIT `box` paramétert kap (alapból `dom.dialogueBox`) — ez teszi
  lehetővé, hogy a `playZone4Finale()` a SAJÁT dobozával/target-jével hívja
  meg ugyanazt a gépelős logikát (`typeText()`), amit a harci dialógus is
  használ. A kattintásos-továbblépés is működik: `js/battle.js`
  `initDom()`-ja a `dom.overworldDialogueBox`-ra is felteszi ugyanazt az
  `advanceOrSkip` click-listenert, a billentyűzetes (Enter/szóköz)
  továbblépés pedig eleve GLOBÁLIS `window`-keydown-listener, nem
  doboz-specifikus, tehát automatikusan működik. `showSequence()` mostantól
  exportálva van a `Battle` publikus API-ján.
- **`#overworld-dialogue-box` FELÜLRE pozicionálva** (`top: 8px`, NEM
  `bottom: 8px`, mint a harci `#dialogue-box`) — a felhasználó kifejezett
  kérésére, hogy Kecske/Tenna/Apa sprite-jai (és a játékos saját karaktere)
  a folyosó alsó-középső részén látszódjanak, ne takarja ki őket a doboz.
  Ez az EGYETLEN vizuális eltérés a két doboz között — a `style.css`-ben a
  közös szabályok UTÁN egy `#overworld-dialogue-box`-specifikus felülírás
  (`top`/`bottom: auto`) végzi.
- **A doboz explicit el van rejtve, mielőtt a 4finger-kép megjelenne** —
  `overworldDialogueBox.classList.add("hidden")` közvetlenül a
  `Battle.showCenterImage(...)` hívás ELŐTT (`playZone4Finale()`), hogy a
  "Nahh jó, ezt nem hagyom..." sor szövege ne maradjon látható/takarja ki a
  felvillanó képet. A `Battle.showSequence()` a KÖVETKEZŐ hívásakor
  (`zone.victoryLines`-hoz) magától újra felfedi.
- **Három új hang, a felhasználó kérésére**:
  - `ZONE_4.fightImage.sound: "ultraswing"` — a 4finger-kép felvillanásakor
    szól. Ehhez `js/battle.js` `showCenterImage(imgEl, src, ms, sound)`
    kapott egy negyedik, opcionális paramétert (a `showSequence()`-en
    keresztüli `line.image`-hez ez NEM kell, mert ott a `line.sound` már
    korábban, generikusan lejátszódik — csak a közvetlen, `zone.fightImage`-
    féle hívásoknál szükséges).
  - `ZONE_4.victoryLines` APA2-sorának `sound: "vaporized"` mezője — ez a
    MEGLÉVŐ, általános `line.sound` mechanizmuson (`showSequence()`) megy,
    nem igényelt kódváltoztatást. Pontosan akkor szól, amikor a portré
    APA-ról APA2-re vált (a "Ha HA HAAAA" sor után, az APA2-sor
    megjelenésekor) — igen, ITT valóban megjelenik/lecserélődik a portré
    `apa2_placeholder.png`-re, ld. feljebb az "APA→APA2 arcváltás" pontot.
  - A "System Reset..." felirat megjelenésével egy időben (kb. 2mp alatt)
    elhalkul a háttérzene (`roomMusic`) — `js/battle.js` `playFinalCinematic()`
    kapott egy ÚJ, opcionális `onHeadingShown` callback-paramétert, ami
    pontosan a `cfg.heading` kiírásakor fut le; a tényleges hangerő-fade
    (`fadeOutMusic(audio, ms)`, `requestAnimationFrame`-alapú lineáris
    csökkentés, a végén `audio.pause()`) `js/main.js`-ben van, mert a
    `Battle` modul nem ismeri a `roomMusic` Audio-objektumot.
- **`js/main.js` `playZone4Finale(zone, apaXFrac, apaYFrac)`** a teljes
  jelenetet vezérli, sorrendben:
  1. `Battle.showSequence(zone.intro, overworldDialogueTarget,
     overworldDialogueBox)` — Kecske + Tenna.
  2. `Overworld.addSprite("zone4-apa", {src: zone.enemy.sprite, xFrac,
     yFrac, w: 91, h: 104, noFloat: true})` — Apa "drámai belépője": egy ÚJ,
     ÁLTALÁNOS `js/overworld.js` függvény-trió (`addSprite`/`updateSprite`/
     `removeSprite`, ld. ott a dokumentációt) dinamikusan felbukkantja a
     sprite-ot PONTOSAN a záró-hotspot pozíciójában (ugyanaz az xFrac/yFrac,
     mint amit a generikus ajtó-mintázat egyébként is használna) — ezt
     hívjuk meg a `zone.enemy.introLines`-t megjelenítő `showSequence()`
     ELŐTT, hogy a "BUMM" sorral egy időben tűnjön fel. A `w:91,h:104`
     (a korábbi `w:60`, majd `w:70,h:80` köztes értékekről véglegesítve) és
     a `noFloat:true` a felhasználó kérésére lettek belőve — ld. lejjebb
     "Valódi APA/APA2 grafika bekötve" utáni bullet-ök a pontos indoklásért.
  3. `Battle.showCenterImage(overworldImageFlash, zone.fightImage.src,
     zone.fightImage.duration, zone.fightImage.sound)` — a script "Megjelenik
     egy Kép a képernyő közepén... 2mp-ig" sora, KÖZVETLENÜL a "Nahh jó, ezt
     nem hagyom..." TE-sor után, gomb/menü-választás NÉLKÜL (a felhasználó
     kifejezett kérése — korábban ez egy kattintható "FIGHT" ACT volt, azt
     eltávolítottuk); a `zone.fightImage.sound` ("ultraswing") a kép
     felvillanásával egy időben szól.
  4. `Battle.showStyleTag(overworldStyleTag, zone.styleTag,
     zone.styleTagDuration)` — "+APPPAAAAAAA", 2800ms kitartással (a script
     "Ha lehet ezt több ideig kitartva" kérése).
  5. `Battle.showSequence(zone.victoryLines, ...)` — Apa "Ha HA HAAAA", majd
     (KÜLÖN sorként, külön explicit `portrait`-tal, NEM a `{{marker}}`-es
     mid-typing arcváltással) Apa2 első sora; utána a doboz explicit
     elrejtve (`overworldDialogueBox.classList.add("hidden")`).
  6. `Overworld.removeSprite("zone4-apa")`.
  7. `Battle.playFinalCinematic(overworldEndingDom, zone.finalCinematic,
     resolve)` — ld. lejjebb.
  8. A `#overworld-screen` elrejtése, `#title-screen` felfedése — közvetlenül,
     NEM a régi `#end-screen`/`restartBtn` úton keresztül.
  A `Overworld.pause()` csak EGYSZER, a jelenet legelején van meghívva —
  ellentétben a (mára lecserélt) `showOverworldDialogue()`-alapú
  megvalósítással, a `Battle.showSequence()` SOHA nem hívja meg az
  `Overworld.resume()`-ot, tehát a mozgás a teljes jelenet alatt
  megszakítás nélkül zárolva marad.
- **`js/battle.js` `showSequence`/`showCenterImage`/`showStyleTag`/
  `playFinalCinematic` MOST MÁR EXPLICIT DOM-célt (és `playFinalCinematic`
  esetén callback-et) kapnak paraméterként** (nem mindig a `dom.dialogueBox`/
  `dom.imageFlash`/`dom.styleTag`/`dom.ending*`-et olvassák a closure-ból),
  és MIND exportálva vannak a `Battle` publikus API-ján — ez teszi
  lehetővé, hogy a `playZone4Finale()` a SAJÁT (overworld-stage-beli)
  DOM-elemeivel hívja meg ugyanazt a logikát, amit a harc-képernyő is
  használ. A `js/battle.js` BELSŐ hívásai (`showSequence()` `line.image`-hez
  mindig `dom.imageFlash`-t ad át, `victory()` a style tag-hez/
  `finalCinematic`-hoz mindig a harc-képernyő saját elemeit) változatlanul
  a harc-képernyő elemeire mutatnak — a `victory()`-beli `finalCinematic`-ág
  jelenleg egyetlen zónánál sem fut le ténylegesen (tartalék-ág egy
  jövőbeli, valódi harc-képernyős záró-jelenethez), de a kód megmaradt,
  mert generikus, nem invazív.
- **NÉGY KÜLÖN DOM-elem-készlet, UGYANAZZAL a CSS-sel** (`index.html`/
  `style.css`): `#battle-image-flash`/`#overworld-image-flash`,
  `#style-tag`/`#overworld-style-tag`, `#ending-overlay`/
  `#overworld-ending-overlay` (+`-heading`/`-final-line`), ÉS `#dialogue-box`/
  `#overworld-dialogue-box` (+`-portrait`/`-dialogue-text-wrap`/
  `-speaker-name`/`-dialogue-text`/`-continue-hint`) — kombinált CSS
  szelektorokkal (`#a, #b { ... }`), hogy a deklarációk ne duplikálódjanak.
  Ugyanaz a minta, mint a `#corner-popup`/`#battle-corner-popup` párosnál
  (ld. lentebb) — két külön flex-kontextusban (overworld-stage vs
  battle-stage) kozeppontosuló elemet NEM érdemes keresztbe-huzalozni egy
  közös DOM-elemmel, mert a két stage eltérő paddinggel/hint-szöveggel
  középre igazít, és a pixel-pontos egyezés böngésző nélkül nem
  ellenőrizhető. `#overworld-dialogue-box`-nak (a másik hárommal ellentétben)
  van kezdeti `class="hidden"`-je, mert az overworld-screen más jeleneteiben
  (szoba, a másik két zóna folyosó-szakasza) nincs rá szükség.
- **`speaker` mezők "APA"/"APA2"-re állítva** (nem "ASGORE") — nincs
  látható hatása (a `#speaker-name`/`#overworld-speaker-name` sehol sincs
  megjelenítve), csak a kód olvashatóságát szolgálja. A
  `RECURRING_SPEAKER_PORTRAITS`/`asgore_placeholder*.png` fájlnevek
  VÁLTOZATLANOK maradtak.
- **MINDEN sornak explicit `portrait`-ja van** (a `TE` soroké `null`) — bár
  a zóna most már `Battle.showSequence()`-en (tehát a `resolvePortrait()`-es
  automatikán) keresztül fut, a `line.portrait`-ot MINDIG explicit adjuk
  meg (nem hagyatkozunk az `enemy.name`-matchelős fallback-re), mert ez
  volt az eredeti (corner-popup-alapú) megvalósítás mintázata, és nincs ok
  megváltoztatni.
- **`enemy.sprite`/`talkSprite` mostantól a felhasználó valódi, Minecraft-
  stílusú APA-rajzait használja** (`apa_placeholder.png`/`_talk.png`) — a
  korábbi, ideiglenes Asgore-portrék erről a helyről már lecserélve, ld.
  lejjebb "Valódi APA/APA2 grafika bekötve" a teljes leírásért.
- **`line.sound`** (ÚJ, általános `js/battle.js` `showSequence()`-mező, ld.
  "js/battle.js" bejegyzés fentebb — `js/main.js` `showOverworldDialogue()`-
  nak is van egy azonos nevű, azonos célú mezője, a Caine-/viszontlátás-
  jelenetek miatt, bár a zaró zóna már nem azt az útvonalat használja):
  Apa "BUMM" belépő-sora `sound: "heavydamage"`-dzsel szól meg.
- **Az "APA→APA2" arcváltás KÉT KÜLÖN dialógus-sorral van megoldva**, NEM a
  meglévő `{{marker}}`-es, egy-soron-belüli arcváltó mechanizmussal (ld.
  "Harci dialógus: arcváltás időzítése" fentebb) — a script "Ha HA HAAAA -
  pukk eltűnik és megjelenik helyette APA2" egy önálló nevetés-sor, amit egy
  ÚJ beszélő (APA2) egy ÚJ, teljes soros mondata követ. Az APA2-sor
  `sound: "vaporized"` mezője a felhasználó kérésére pontosan az átváltás
  pillanatában szól.
- **`line.transitionAnim` (ÚJ, általános `showSequence()`-mező)** — egy
  N-kockás animációt játszik le a PORTRÉ HELYÉN, mielőtt a sor tényleges
  portréja megjelenne, hogy eltakarja a hirtelen karakter-váltást. Az
  APA2-sor `transitionAnim: {frames: [...8 db apa_transition_0N.png...],
  frameMs: 150}` mezője használja — ld. `js/battle.js` `playTransitionAnim()`.
  A 8 kocka a felhasználó kész, Minecraft-stílusú rajza (`apa_transition_01
  -08.png`, 53×57px, ld. lejjebb "Valódi APA/APA2 grafika bekötve"), NEM
  placeholder. Általános/újrafelhasználható mechanizmus, bármelyik jövőbeli
  dialógus-sor használhatja, nem zóna-specifikus.
  - **A felhasználó kérésére UGYANEZ az átmenet a folyosón álló Apa-sprite-on
    is lejátszódik, DE KÜLÖN, NAGYOBB fájlokkal** (`apa_world_transition_01
    -08.png`, 71×77px) — a két animáció szinkronban fut, mert
    `playTransitionAnim(imgEl, anim, onFrame)` kapott egy harmadik,
    opcionális `onFrame(i)` callback-et, ami minden kockaváltáskor lefut.
    `js/main.js` `overworldDialogueTarget` ezt `onTransitionFrame`-ként adja
    át (a `showSequence()`-nek átadott `target` objektum SAJÁT mezőjeként,
    nem a `battle.js`-en keresztül), és `Overworld.updateSprite("zone4-apa",
    ...)`-vel frissíti a világ-sprite-ot — a `battle.js` szándékosan nem
    nyúl közvetlenül az Overworld-modulhoz (ld. "Nem nyul a
    battle.js/engine.js-hez" elv), ezért ez a hívó (`playZone4Finale()`)
    felelőssége a callback-en keresztül. Egy MÁSIK, opcionális
    `target.onTransitionEnd`-hook PONTOSAN akkor fut le, amikor a
    dialógus-doboz portréja már a végleges képre váltott —
    `playZone4Finale()` ezt használja arra, hogy a világ-sprite-ot IS
    ugyanekkor a végleges, valódi `apa2_placeholder.png`-re váltsa (nem csak
    az utolsó átmenet-kockán marad).
- **`playFinalCinematic(domTarget, cfg, onDone, onHeadingShown)`**
  (`js/battle.js`) egy teljesen egyedi, önálló záró-animáció, NEM a
  megosztott `#scene-fade`-re építve (az csak feketére tud váltani, ez
  viszont előbb KIVILÁGOSODIK). Sorrend: (1) a fedő átlátszóból FEHÉRRE
  fade-el (`.ending-visible`, 1.4s CSS-átmenet), `"won"` hang; (2) a
  `cfg.heading` szöveg ("System Reset: Happy 13th Birthday!") azonnal
  megjelenik (nem gépelve — a script "megjelenik" szava alapján), `"splat"`
  hang, és lefut az opcionális `onHeadingShown()` callback (`js/main.js` ezt
  használja a háttérzene ~2mp alatti elhalkítására, ld. lejjebb); (3)
  hatásszünet (1.2s); (4) a `cfg.finalLine` (Apa2 utolsó sora) a szokásos
  `typeText()`-tel gépelődik ki, egy `continueHint` DOM-céllal
  (`#ending-continue-hint`/`#overworld-ending-continue-hint`, ugyanaz a "▶
  kattints / szóköz" stílus, mint a dialógus-dobozoknál) — a felhasználó
  eredetileg "teljesen automatikus" gépelést kért erre a sorra, majd
  pontosította, hogy Enterrel/kattintással kell tovább léptetni, ezért ez
  KATTINTÁS/ENTER-RE VÁR, nem a régi (azóta törölt) `autoType()`
  segédfüggvénnyel megy; (5) rövid szünet (0.9s); (6) a fedő
  `.ending-blackout` osztállyal feketére vált (1s CSS-átmenet), `"step2"`
  hang — a szöveg színe szándékosan marad fekete, hogy a háttérrel együtt
  "elnyelje" magát; (7) `onDone()` — a `playZone4Finale()` ekkor vált a
  címképernyőre. A `dom.endingOverlay`/`dom.overworldEndingOverlay`
  mindkettő kapott egy `click`-listenert (`advanceOrSkip`) `initDom()`-ban,
  a billentyűzetes Enter/szóköz pedig eleve globálisan működik.
- **A visszatérés a címképernyőre TELJES OLDAL-ÚJRATÖLTÉS
  (`window.location.reload()`), NEM csak képernyő-váltás** — a felhasználó
  kifejezett kérése ("frissíteni kellene a böngészőt, hogy minden cash,
  cookie, zene resetelődjön"). `playZone4Finale()` a `playFinalCinematic()`
  (immár Enterre váró) befejezése UTÁN egyenesen ezt hívja — mivel a
  projekt NEM használ `localStorage`/cookie-t, ez gyakorlatilag azt
  jelenti, hogy MINDEN JS-modul-állapot (`zone1Defeated`, `zone2Spared`,
  stb.) és minden lejátszás alatt álló `Audio` (zene) is nullázódik, mintha
  a játékos manuálisan frissítette volna az oldalt — NEM a régi
  `#end-screen`/`restartBtn` utat használja (az továbbra is a kódban van,
  elérhetetlen, ártalmatlan tartalék UI-ként).
- **Valódi APA/APA2 grafika bekötve** — a felhasználó kész, Minecraft-stílusú
  pixel-artot készített, ez váltotta fel a régi `asgore_placeholder*.png`
  placeholdereket: `apa_placeholder.png`/`apa_placeholder_talk.png` (APA
  világ-sprite/portré), `apa2_placeholder.png`/`apa2_placeholder_talk.png`
  (APA2 világ-sprite/portré — FONTOS, hogy `apa2_placeholder.png` NEM a
  dialógus-portré, hanem a folyosón álló sprite képe, ld. lejjebb). Az
  `enemy.sprite`/`talkSprite` és minden explicit `portrait` mező ezekre lett
  átállítva a régi asgore-fájlnevek helyett.
- **`tools/gen_assets.py`-ből a `apa2_placeholder`/`apa_transition_0N`/
  `apa_world_transition_0N` `blob_sprite()`-hívások törölve lettek**, egy
  FIGYELEM-kommenttel helyettesítve, nehogy valaki véletlenül újragenerálja
  (felülírva) ezeket a mára valódi, kézzel rajzolt fájlokat.
- **`Overworld.addSprite("zone4-apa", ...)` végleges mérete `w:91,h:104,
  noFloat:true`** (`js/main.js` `playZone4Finale()` — a fejlesztés közben
  volt egy `w:60`, majd egy köztes `w:70,h:80` állapot is, ld. "Ismert
  korlátok" a végső 30%-os méretnövelés/`noFloat` indoklásáért), hogy a
  nagyobb `apa_world_transition_0N.png` (71×77) kockák ne zsugorodjanak
  össze — mivel a felhasználó minden kockát (idle ÉS átmenet) explicit
  vízszintesen-középre/függőlegesen-alulra igazított
  (`object-fit:contain`+`object-position:bottom`, ld. `.overworld-npc`),
  egy ÁLLANDÓ dobozméret (ami `addSprite()`-tól `updateSprite()`-ig sosem
  változik) biztosítja, hogy a kockák között ne "ugorjon" a szereplő.

## Az overworld-jelenetek (szoba + folyosó) hangolása

Mindkét jelenet ugyanazt a `js/overworld.js`-t használja, a `js/main.js`-ben
összeállított scene-config objektumokkal:

- `ROOM_SCENE` (`js/main.js`): `walkBounds` és a `hotspots` lista (`computer`,
  `shelf`, `tv`) `xFrac`/`yFrac`/`radius` értékei a `#overworld-stage` méretéhez
  (640×480) viszonyított arányok/px-ek, szemre belőve a `bazsa_szoba.png`-hez.
- `buildCorridorScene()` (`js/main.js`): a `DOOR_FRACTIONS` (a 3 zóna-belépési
  pont közepe a teljes világ-szélesség arányában) és az ehhez képest eltolt
  Kecske-hotspot (jelenleg az egyetlen folyosói kísérő-NPC, ld. lejjebb)
  pozíciók pontosan a
  `CORRIDOR_ZONE_BACKGROUNDS` (`corridor_zone1_bg_placeholder.png`,
  `corridor_zone2_bg_placeholder.png`, `corridor_zone4_bg_placeholder.png`
  -- a korábbi `corridor_zone3_bg_placeholder.png` már nincs használatban,
  ld. "A záró (Minecraft) zóna" fentebb) 3, egyenlőtlen szélességű
  szakaszához igazodnak (`CORRIDOR_SEGMENT_WIDTHS = [1100, 1302, 1024]`,
  mindhárom már a végleges, kézzel/AI-jal készült rajz szélessége). A
  folyosó háttere **3 külön fájl**, nem egy összefűzött kép -- az
  `Overworld` (`bgSrc` tömb, ld. fent) egymás mellé illeszti őket. Ez azért
  fontos, mert ha egy zónához saját (kézzel rajzolt) háttér készül, azt elég
  a megfelelő `corridor_zoneN_bg_placeholder.png` néven lecserélni -- nem
  kell újragenerálni vagy összefűzni a többivel. **Figyelem:** a
  `DOOR_FRACTIONS`/`walkBounds` a TÉNYLEGES (`CORRIDOR_SEGMENT_WIDTHS`-ből
  számolt) szélességekből származnak, nem egyenletes harmadolásból -- ha egy
  háttérkép szélessége megint változik, ezt az értéket (és a
  `buildCorridorScene()` hardcodeolt `walkBounds`-fractionjeit, ld. az ott
  lévő megjegyzést a 3. zóna kivétele miatti újraszámolásról) manuálisan
  újra kell hangolni.

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

- **KRITIKUS HIBA, KÉT KÖRBEN JAVÍTVA: a Feki-glitch (`removeFollowerWithEffect()`)
  a gyakorlatban láthatatlan volt / "1-2px arrébb ugrik, aztán hirtelen
  eltűnik" (felhasználói visszajelzés).** Az ELSŐ javítási kísérlet (a közös
  `worldGlitch` helyett egy `filter`/`clip-path`-only `followerGlitch`
  keyframes bevezetése) csak részben oldotta meg a problémát — a gyökér-ok
  ugyanis KÉTFÉLE volt:
  1. Feki pozícióját egy JS-beli inline `transform` adja
     (`updateFollowerVisualPosition()`); egy CSS-animáció ugyanazon
     property-jének keyframe-jei FELÜLÍRJÁK (nem összeadják) az inline
     értéket — az első javítás ezt úgy kerülte ki, hogy a keyframes
     EGYÁLTALÁN NEM animált `transform`-ot, de ez viszont elvette a
     "remegés" vizuális jelét is, és a filter-animáció önmagában (GPU-réteg
     váltás/subpixel-kerekítés) apró, oda nem illő pozíció-ugrást
     okozhatott.
  2. Az animáció `filter:brightness(0)`-ra végződött, ami egy átlátszó
     hátterű PNG ALFA-csatornáját NEM érinti — Feki emiatt egy fekete
     sziluetté vált, majd az `el.remove()` ezt a még látható sziluettet
     tüntette el hirtelen, "pukkanás"-szerűen.
  **Végleges javítás:** `js/overworld.js` `removeFollowerWithEffect()` a
  glitch indításakor a MÁR BEFAGYASZTOTT `style.transform` értéket egy
  `--glitch-base-transform` CSS-változóba menti; a `style.css`
  `followerGlitch` keyframes minden lépése `transform: var(--glitch-base-
  transform) translate(...)`-ot ad meg — a JS-beli pozíció így MINDIG
  benne marad az animált transformban (nem íródik felül), a keyframe-ek
  csak egy kis, SZÁNDÉKOS remegést adnak hozzá. A keyframes emellett
  `opacity`-t is fokozatosan 0-ra viszi (nem csak a `filter`-t), így az
  `el.remove()` már egy teljesen láthatatlan elemet távolít el.
- **Feki eltűnése előtt 1000ms késleltetés** — a felhasználó kérésére a
  "GAME OVER..." popup bezárása UTÁN is vár még 1mp-et (`js/main.js`,
  `Overworld.removeFollowerWithEffect(1000)`), mielőtt elindulna a fenti
  glitch — így van egy észrevehető pillanat, amikor Feki még ott áll,
  mielőtt eltűnne.
- **`line.transitionAnim` (záró zóna, APA→APA2) indítása előtt 500ms
  szünet** — a felhasználó kérésére `js/battle.js` `showSequence()` az
  előző sor (a "Ha HA HAAAA" nevetés) tovább-léptetése UTÁN, de MÉG a
  `playTransitionAnim()` (a 8 kockás átmenet) elindítása ELŐTT egy
  `wait(500)`-at szúr be — így van egy érzékelhető szünet, mielőtt a
  karakter-váltás elkezdődne, nem azonnal, ugrásszerűen indul.
- **`Overworld.updateSprite(id, src, sizeOpts?)`** — a harmadik, opcionális
  `sizeOpts:{w,h?}` paraméterrel a dinamikus sprite DOBOZÁNAK mérete is
  újraállítható hívásonként (nem csak a kép), az `addSprite()`-nál megadott
  `xFrac`/`yFrac` ALSÓ-KÖZÉPPONT körül (ez az elemen `dataset.xFrac`/
  `dataset.yFrac`-ként van elmentve) — a doboz alja és vízszintes közepe
  rögzítve marad, csak felfelé/oldalra nő vagy zsugorodik. Ezt használja a
  záró (Minecraft-témájú) zóna: az `apa_placeholder.png`/`apa2_placeholder.png`
  állókép mérete (`ZONE4_APA_SIZE`, `js/main.js`, 91×104) és a 8 kockás
  `apa_world_transition_0N.png` átmenet-animáció mérete korábban UGYANAZT a
  fix dobozt használta (nem lehetett külön méretezni őket anélkül, hogy a
  szereplő "ugorjon" a kockák között) — a felhasználó kérésére szétválasztva:
  az átmenet-animáció a `ZONE4_APA_TRANSITION_SCALE` (1.35) szorzóval
  LÁTHATÓAN NAGYOBB, mint az állókép, majd `onTransitionEnd`-nél
  visszaáll `ZONE4_APA_SIZE`-ra. A szorzó a `ZONE4_APA_TRANSITION_SCALE`
  konstans módosításával egyszerűen hangolható.
- **Karakterenkénti gépelés-hang** — a felhasználó kérésére a `js/battle.js`
  `typeText()` ÉS a `js/overworld.js` `typeCornerText()` (a sarok-buborék
  saját, független gépelős logikája) is a `js/zones.js`
  `RECURRING_SPEAKER_TYPE_SOUNDS` (ÚJ, mindkét modul számára közös) térképet
  használja `speaker` szerint — a fel nem sorolt beszélők ("TE", "APA",
  "APA2") változatlanul az alapértelmezett `"type"` hangot kapják. A
  battle.js oldalon ez ingyen működik minden zónánál, mert a `speaker` már
  eddig is mindenhol adott volt; az overworld.js oldalon viszont
  `Overworld.showCornerPopup(portraitSrc, text, onDone, variant, opts)`
  kapott egy ÚJ `opts.speaker` mezőt, amit `showOverworldDialogue()`
  (`line.speaker`) és több `js/main.js`-beli hívás (Caine/Jax vonalak,
  Kecske folyosó-csevegés, Tenna/Queen szoba-sorok, Könny-lény/Bubble
  viszontlátás-sorok, a Feki-vesztés utáni "GAME OVER" sor) explicit ad át.
- **A 2. zóna (Cirkusz, Bubble) saját zenét kapott** —
  `The-Amazing-Digital-Circus-Main-Theme.mp3` (`bubbleMusic`), ugyanazzal a
  pause/resume mintázattal, mint az 1. zóna Isaac-szobája (`isaacMusic`):
  `buildCorridorScene()` `i === 1` ága (a még le nem győzött/kegyelmezett
  Bubble-ajtó) állítja le a `roomMusic`-ot és indítja el a `bubbleMusic`-ot,
  az `enterZone()` callback-je (`zoneIndex === 1`) váltja vissza, függetlenül
  a harc kimenetelétől.
- **Feki eltűnése MOST MÁR a "GAME OVER..." popup Enterrel/kattintással
  történő bezárása UTÁN indul**, nem egy fix 1000ms-es időzítővel — a
  felhasználó visszajelzése szerint a korábbi (egyidejű) verziónál nem volt
  látható a glitch-effekt (feltehetően a popup eltakarta Feki pozícióját,
  vagy a figyelem máshol volt). `Overworld.removeFollowerWithEffect(0)`-t
  most a popup `onDone`-jából hívjuk. A CSS-animáció is kapott egy
  `forwards` fill-mode-ot, hogy a végén (fekete/láthatatlan állapotban)
  maradjon a törlésig, ne "pattanjon vissza" látszólag egy kockára.
- **Az APA "világ-sprite"-ja (`Overworld.addSprite("zone4-apa", ...)`,
  `js/main.js` `playZone4Finale()`) `noFloat: true`-t kapott** (nem lebeg
  fel-le, mint egy sima NPC) **és 30%-kal nagyobb lett** (91×104, a korábbi
  70×80 helyett) — mindkettő a felhasználó kifejezett kérése. Ugyanez a
  doboz (`w`/`h`/`xFrac`/`yFrac`) határozza meg az APA→APA2 világ-átmenet
  (8 kockás `apa_world_transition_0N.png`) méretét/pozícióját is, mivel a
  teljes jelenet (álló Apa → átmenet → álló Apa2) UGYANAZT a fix dobozt
  használja — ha ezt kell módosítani, ez az egyetlen hely.
- **KRITIKUS HIBA, JAVÍTVA: `finishZone()` (`js/battle.js`) egy régi,
  elavult szignatúrával hívta a `showStyleTag()`-et** (`showStyleTag(text)`
  a jelenlegi `showStyleTag(tagEl, text, holdMs)` helyett, ld. "js/battle.js"
  architektúra-bejegyzés fentebb) — ez a `showCenterImage`/`showStyleTag`/
  `playFinalCinematic` DOM-cél-paraméterezős átalakítása (ld. "A záró
  (Minecraft) zóna") után maradt le egyetlen hívási helyen. A `tagEl`
  helyén egy STRING (`zoneData.styleTag`) érkezett, aminek nincs
  `.classList`-je — ez egy elkapatlan `TypeError`-t dobott
  (`Cannot read properties of undefined (reading 'remove')`), ami
  CSENDBEN megszakította a promise-láncot. Mivel `finishZone()` MINDEN
  fordulós (rounds-módú) zóna FIGHT/SPARE zárásánál lefut
  (`resolveEnding()`-ből), ez lefagyasztotta a játékot minden fordulós
  zóna végén (1. zóna Isaac-szoba ÉS 2. zóna Cirkusz egyaránt) — a
  felhasználó élesben megtalálta és jelentette. Javítva: a hívás mostantól
  `showStyleTag(dom.styleTag, ...)`.
- **A "spiral" dodge-mintázat visszapattanása (`bounce`) mostantól
  KONFIGURÁLHATÓ, nem hardkódolt** — korábban `js/engine.js`
  `spawnBullet()` MINDEN spiral-lövedéket automatikusan
  `bounce:true`-val hozott létre (eredetileg a 2. zóna kérésére), ami az
  1. zóna 3. fordulóján NEM kívánt viselkedés volt (a felhasználó szerint
  ott a lövedékeknek csak tovább kellene menniük a falon, nem
  visszapattanniuk). Mostantól `spawnConfig.bounce` dönti el (alapból
  `false`) — a `ZONE_2` 2. fordulója explicit `bounce: true`-t kapott a
  korábbi viselkedés megőrzéséhez, a `ZONE_1` 3. fordulója változatlanul
  nem ad meg semmit (tehát nem pattan).
- **A "Mozgás: nyilak / WASD..." hint-szöveg mostantól csak a Bazsa-szobában
  látható** — a felhasználó kérésére a címképernyő és a harc-képernyő saját
  hint-szövege teljesen törölve lett (`index.html`), az overworld-screen
  `#room-hint`-je pedig `js/main.js` `enterGlitchWorld()`-jében explicit
  elrejtődik, amint a játékos elhagyja a szobát (a játék soha nem tér
  vissza `ROOM_SCENE`-be, így nincs szükség arra, hogy valaha újra
  megjelenjen).
- **Feki (2. zóna, ajándék-vesztés) eltűnése most már "glitch"-es, nem
  azonnali** — a felhasználó kérésére `Overworld.removeFollowerWithEffect(delayMs)`
  (ÚJ, `js/overworld.js`) 1000ms késleltetés után lejátssza rajta UGYANAZT
  a `worldGlitch` CSS-animációt, amit a szoba→folyosó átvezetés használ
  (`.follower-glitch-out`, ld. style.css — külön szabály, mert az eredeti
  `#game-viewport.screen-glitch` szelektor ID-hez van kötve), és csak ennek
  végén távolítja el ténylegesen. A `followerCfg` csak a glitch KEZDETÉN
  nullázódik (nem már a híváskor), hogy a `delayMs` alatt Feki még
  rendesen kövessen/üljön, és a JS-beli pozíció-frissítés ne ütközzön a
  CSS-animáció `transform`-jával.
- A teljes játék fix 800×640 belső felbontásra épül, amit a `main.js` felskáláz
  az ablakmérethez (letterboxolva) — ez szándékos (Undertale/Deltarune-minta),
  nem hiba, ha oldalt/felül-alul fekete sáv látszik.
- A halál/újraindítás ág (`gameOver()` a battle.js-ben, HP elfogyása egy
  dodge-fázisban) az 1. zóna fordulós harcában már élesben letesztelve
  (böngészőben, a dodge-fázis nehézségét ideiglenesen felturbózva, hogy
  tényleg elfogyjon a HP) — a retry helyesen a haláleset szerinti fordulót
  próbálja újra, ld. "Az 1. zóna FIGHT/ACT/SPARE harca". EZ A
  `finishZone()`-fedő bugtól FÜGGETLEN ág, azt nem érintette. A záró
  (Minecraft-témájú) zóna régi (legacy) ACT-listás halál-ága még
  leteszteletlen (bár a `ZONE_4`-nek jelenleg nincs is dodge-fázisa, ld.
  "A záró (Minecraft) zóna", így ez az ág valójában nem is fut le nála).
- **A 3. zóna kivétele miatt újraszámolt folyosó-`walkBounds`-fractionök
  (`js/main.js` `buildCorridorScene()`) még NEM lettek élesben
  letesztelve** (ld. a fájl tetején lévő szabályt: a tesztelést a
  felhasználó végzi) — a számok a régi, 4-zónás fractionökből lettek
  matematikailag levezetve (abszolút pixel-pozíció megtartásával, ld. az
  ottani kommentet), úgyhogy elvileg pontosnak kellene lenniük, de érdemes
  végigsétálni a folyosón (a `DEBUG_WALKBOUNDS`/`DEBUG_HOTSPOTS` zöld/piros
  debug-keretei bekapcsolva vannak) különös tekintettel a 2. zóna utáni,
  most már közvetlenül a záró zónába vezető szakaszra.
- **A záró-animáció (`playFinalCinematic()`) időzítése (a fade-ek/szünetek
  hossza) szemre lett belőve, élesben nem letesztelve** — ha túl gyorsnak
  vagy túl lassúnak érződik, a `js/battle.js` `playFinalCinematic()`-ben
  lévő `wait(...)` hívások ms-értékei egyszerűen állíthatók.
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

**A 3. zóna kivétele és a 4. zóna Minecraft-témájú záró-jelenetté alakítása
KÉSZ** (a felhasználó kifejezett kérése alapján, a jelen menetben
végrehajtva) — a teljes technikai leírás "A záró (Minecraft) zóna"
szakaszban van fentebb. Szó szerint: *"A harmadik zónát ki kell venni, a 4
zóna legyen a záró minecraftos zóna. Ahol a végével lezárjuk."* Ez két nagy
változást jelentett:

1. **A 3. zóna ("A Csövek", Cső-Automata, +OVERCLOCKED) teljesen kikerült** a
   játékból — a korábbi 4 zónás lánc (1. Sírás → 2. Cirkusz → 3. Csövek →
   4. Roblox-lerakat) 3 zónássá rövidült (1. Sírás → 2. Cirkusz → 3./utolsó,
   immár Minecraft-témájú zóna).
2. **A 4. zóna Minecraft-témájúra váltott** (a korábbi Roblox/"BLOKKFEJŰ
   VÉGHIBA" tartalom helyett), és ITT kapta meg a játék a teljes
   zárójelenetet — a felhasználó ehhez kész, végleges szöveget adott, ami a
   régi `ZONE_4.victoryLines`-ban lévő `[SZERKESZTENDŐ]` placeholdert
   felváltotta/kibővítette. **A felhasználó SZÓ SZERINTI forgatókönyve**
   (ez pontosan így lett átvéve, nem parafrazálva — megtalálható szó
   szerint a `js/zones.js` `ZONE_4` mezőiben is):

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
   DESIGN.md "Szereplők" szakasza).

**A megvalósítás előtt feltett kérdésekre adott válaszok** (`AskUserQuestion`,
ld. "A záró (Minecraft) zóna" szakasz a pontos technikai megvalósításért):

- **`speaker` átnevezés**: nem lett külön megkérdezve (kiderült, hogy nincs
  látható hatása, mivel a `#speaker-name` mindig rejtve van) — a `speaker`
  mezők "APA"/"APA2"-re lettek állítva a `ZONE_4`-ben, de a
  `RECURRING_SPEAKER_PORTRAITS`/`asgore_placeholder*.png` fájlnevek
  változatlanul "ASGORE"/"asgore" maradtak.
- **Zóna-kivétel mechanikája**: a `ZONES` tömbből a `ZONE_3` teljesen
  törölve (nem kikommentelve) — a git-előzményekben megmarad, ha valaha
  vissza kellene hozni.
- **APA→APA2 arckép-váltás**: KÉT KÜLÖN dialógus-sor lett, nem a
  `{{marker}}`-es mid-typing váltás — ld. "A záró (Minecraft) zóna" a
  pontos indoklásért.
- **APA2 portré**: "Egyszerű placeholder generálva" — a felhasználó
  választása a három felkínált opció közül; `apa2_placeholder.png` a
  `tools/gen_assets.py` `blob_sprite()`-jával generálva.
- **`4finger_placeholder.png`**: már a menet elején létezett (a
  felhasználó korábban pótolta) — nem kellett generálni.
- **`+APPPAAAAAAA` stílus-felirat kitartása**: `showStyleTag(text, holdMs)`
  paraméterezhető lett (`zoneData.styleTagDuration`), ld. "js/battle.js"
  architektúra-bejegyzés.
- **Fényesedő képernyő + felirat + elsötétülés**: "Teljesen egyedi
  animáció" — a felhasználó választása; a `#scene-fade`-től FÜGGETLEN, saját
  `#ending-overlay` lett (mert az előbbi csak feketére tud váltani, ez a
  jelenet viszont előbb kivilágosodik), ld. `playFinalCinematic()`.
- **"a játék az elejére ugrik"**: "Teljesen automatikus" — a felhasználó
  választása; nincs `restartBtn`-szerű gomb a záró-jelenet után, a
  `finalReset` eredmény automatikusan visszavált a címképernyőre.
- **A "dialogue_box_frame.png"-vel kapcsolatos eredeti kérés** ("A 4. zóna
  beszélgetéseit ebbe a nagyobb dialogue_box_frame.png-vel old meg, az
  jobban olvasható") a felhasználó pontosítása szerint nem új/nagyobb
  asset-et vagy CSS-méretezést jelentett, hanem azt, hogy a záró-jelenet
  BESZÉLGETÉSEI (nem a kivilágosodós rész) a MÁR MEGLÉVŐ, szokásos
  `#dialogue-box`-ot használják, mint minden más zóna — ez már eleve így
  működött (a `ZONE_4` "legacy" módban, `showSequence()`-en keresztül), nem
  igényelt külön munkát.

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
  (`Overworld.removeFollowerWithEffect()`, `fekiGone` — a "glitch"-es
  eltűnés a "GAME OVER..." popup bezárása után indul, ld. "Ismert
  korlátok").
- **A `bazsa_szoba.png` (a gyerek szobája), az Isaac-szoba/Könny-lény harc ÉS
  a 2. zóna (Cirkusz/Bubble) a felhasználó szerint EBBEN A FORMÁJÁBAN KÉSZ.**
- **Új: a 3. zóna kikerült, a (immár utolsó, 3. helyen álló) ZONE_4
  Minecraft-témájú záró-jelenetté alakult** a felhasználó kész, végleges
  záró-szövege alapján — ld. "A záró (Minecraft) zóna" szakasz a teljes
  technikai leírásért. Röviden: `ZONES` immár 3 elemű, a folyosó
  `CORRIDOR_SEGMENT_WIDTHS`/`walkBounds`-fractionjei újraszámolva a rövidebb
  világhoz, a `ZONE_4` Apa (belső kulcsban "APA"/"APA2") drámai belépőjével
  és egy teljesen egyedi záró-animációval zár — automatikusan, felhasználói
  interakció nélkül visszatérve a címképernyőre.
- **Második kör (felhasználói visszajelzés alapján): a teljes zaró-jelenet
  ÁTKÖLTÖZÖTT a harc-képernyőről a folyosóra (overworld-screen)** — a
  felhasználó nem akarta, hogy a `zone4_bg_placeholder.png` "bejöjjön",
  mert a beszélgetés "az alaphelyen" (a folyosón) játszódik. Ld. "A záró
  (Minecraft) zóna" szakasz a teljes leírásért. Röviden: a `ZONE_4` már NEM
  megy át a `Battle.start()`-on, hanem egy új `js/main.js`
  `playZone4Finale()` orkesztrálja; Apa egy ÚJ, általános
  `Overworld.addSprite()`/`removeSprite()` függvénnyel dinamikusan bukkan
  fel a folyosón (nem áll ott előre); nincs többé kattintható "FIGHT" gomb,
  minden automatikusan folyik a "Nahh jó, ezt nem hagyom..." sor után; a
  `js/battle.js` `showCenterImage`/`showStyleTag`/`playFinalCinematic`
  explicit DOM-célt kapó, exportált függvényekké lettek, hogy az
  overworld-képernyő saját (duplikált, de azonos CSS-t használó)
  elemeivel is meghívhatók legyenek.
- **Harmadik kör (újabb felhasználói visszajelzés): a párbeszédek a
  NAGYOBB, `dialogue_box_frame.png`-s dobozban jelennek meg, nem a kisebb
  corner-popup buborékban** — *"viszont a szövegeknek ebben a szövegdoboz
  stílusban kellene megjelenniük: dialogue_box_frame.png"*. A `playZone4Finale()`
  emiatt már NEM `showOverworldDialogue()`-t hív a dialógushoz, hanem a
  szintén exportált `Battle.showSequence()`-et, egy ÚJ `#overworld-dialogue-box`
  elemmel (a harci `#dialogue-box` pontos párja, ugyanazzal a
  `dialogue_box_frame.png` kerettel) — ld. "A záró (Minecraft) zóna" a
  teljes leírásért. A harc-képernyős `zone4_bg_placeholder.png` immár
  teljesen használaton kívül van.
- **Negyedik/ötödik kör (vizuál-fázis + hibajavítások, felhasználói
  tesztelés alapján): valódi APA/APA2 grafika, 8 kockás átmenet-animációk,
  karakterenkénti gépelés-hang, a 2. zóna saját zenéje, és több kritikus
  bugfix** — ld. "Ismert korlátok" a teljes, friss listáért. Röviden: a
  `finishZone()` elavult `showStyleTag()`-hívása (ami minden fordulós zóna
  végén lefagyasztotta a játékot) javítva; a "spiral" dodge-minta
  visszapattanása zóna-szinten konfigurálhatóvá vált (az 1. zóna 3.
  fordulóján kikapcsolva, a 2. zónáén megtartva); `Overworld.pause()` már
  nem fagyasztja meg a lépés-animációt; a hint-szöveg csak a Bazsa-szobában
  látszik; Feki eltűnése a "GAME OVER..." popup bezárása után indul, glitch-
  effekttel; és az APA világ-sprite-ja `noFloat`-ot kapott, 30%-kal nagyobb
  lett.

1. ~~Motor-prototípus~~ — kész (1. zóna)
2. ~~Tartalom~~ — kész (a 3, egyenlő súlyú zóna megírva, lásd `js/zones.js`);
   **az 1. ÉS 2. zóna harca a felhasználó konkrét forgatókönyve alapján
   kibővült egy-egy FIGHT/ACT/SPARE rendszerré** (ld. "Az 1. zóna..." és "A
   2. zóna FIGHT/ACT/SPARE harca (Bubble)"), **a 3. (záró, Minecraft-témájú)
   zóna pedig a régi, egyszerűbb (legacy) formátumon marad, de egy egyedi
   záró-animációval bővítve** (ld. "A záró (Minecraft) zóna").
3. **Vizuál** (folyamatban): a placeholder zóna-hátterek/folyosó-háttér/
   ellenfél-sprite-ok lecserélése saját rajzokra (ugyanazokkal a
   fájlnevekkel az `assets/sprites/` mappában, akkor semmit nem kell
   kódban módosítani — legfeljebb a `ROOM_SCENE`/`buildCorridorScene()`
   hotspot-pozíciókat a `main.js`-ben). A folyosó MINDHÁROM zónás szakasza
   (`corridor_zone1_bg_placeholder.png`, `corridor_zone2_bg_placeholder.png`,
   `corridor_zone4_bg_placeholder.png`) már kész, végleges rajz — a
   harc-képernyők HÁTTERE (`zoneN_bg_placeholder.png`, a `#zone-bg`-be
   kerülő kép, nem a folyosóé) viszont még mindegyik zónánál a régi,
   generált placeholder — az APA/APA2 grafika ezzel szemben már valódi,
   kézzel rajzolt Minecraft-stílusú art (ld. "A záró (Minecraft) zóna",
   "Valódi APA/APA2 grafika bekötve").
   A harc-képernyő UI-ja (HP-csík, ACT-doboz, párbeszéd-keret, SOUL, Game
   Over) már valódi, kibányászott Deltarune-assetekkel megy (lásd
   `tools/slice_ui_assets.py`) — ide tartozó, még kihasznált stretch goal: a
   `Battle Box`/`Battleback` animáció-sorozatok (jelenleg csak statikus
   kockaként/nem használva) pop-in/animált háttérré alakítása.
4. **Hang**: a szoba/folyosó, az Isaac-szoba ÉS MOST MÁR a 2. zóna (Cirkusz/
   Bubble) is saját háttérzenét kapott (`roomMusic`/`isaacMusic`/
   `bubbleMusic`, ld. "Jelenlegi állapot" és "A 2. zóna FIGHT/ACT/SPARE
   harca (Bubble)"), néhány effekt is (gépelés — MOST MÁR karakterenként
   eltérő, ld. "Harci dialógus: arcváltás időzítése és gépelés-hang" —,
   zóna-indítás, glitch, joker-nevetés, flavor-szöveg, a 2. zóna
   ajándék-visszaszámlálója, és a záró-zóna hangjai —
   `heavydamage`/`ultraswing`/`vaporized`/`won`/`splat`/`step2`, ld.
   `js/main.js` `Engine.loadSound()` hívásait) — de a legtöbb generált beep
   (`assets/sfx/*.wav`) még cserére vár a beszerzett valódi
   `assets/Sounds/`-beli hangokra, és a záró (Minecraft-témájú) zónának
   nincs saját háttérzenéje.
5. ~~Összefűzés~~ — kész (cím → szoba → gép-választás → folyosó → mind a 3 zóna
   → Apa-zárás/`playFinalCinematic()` → automatikus visszatérés a
   címképernyőre, egyben, teljesképernyős skálázással)
6. ~~Polish~~ — a `ZONE_4` egykori `[SZERKESZTENDŐ]` placeholder-sora
   KÉSZ: a felhasználó végleges apa-fiú poénja/közös programja a teljes,
   egyedi záró-jelenettel együtt beépítve, ld. "A záró (Minecraft) zóna".
7. **Teszt**: teljes végigjátszás, ideális esetben tényleges böngészőben, más gépen is —
   ez a menet csak kódból/`node --check`-kel lett ellenőrizve (ld.
   CLAUDE.md legelső sora: a tesztelést a felhasználó végzi saját maga),
   különös tekintettel a folyosó új `walkBounds`-fractionjeire (a 3. zóna
   kivétele miatt újraszámolva, ld. `js/main.js` `buildCorridorScene()`
   megjegyzését) és a záró-animáció időzítésére/olvashatóságára.

## Futtatás / tesztelés

Nincs build lépés, nincs szerver szükséges: `index.html` megnyitása böngészőben elég.
Fejlesztés közben `node --check js/*.js`-sel érdemes szintaxist ellenőrizni módosítás
után, mielőtt böngészőben tesztelsz.
