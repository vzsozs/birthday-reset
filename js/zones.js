/*
 * zones.js
 * A tartalom: szovegek, ACT-ok, ellenfel-adatok zonankent.
 * Eddig csak az 1. zona (A Sirlas) van kesz -- ez a motor-prototipus.
 * A tovabbi harom zona (Cirkusz, Csovek, Roblox-lerakat) ugyanezt a
 * mintat koveti majd, csak uj adat-objektumkent kell felvenni ide,
 * es a main.js-ben lancolni a zone1 utan.
 */

// Tobb zonaban is megszolalo kiserok/karakterek alapertelmezett (mindig a
// "_talk" valtozatu) arckepei -- ha egy dialogus-sor nem ad meg sajat
// `portrait`-ot, de a `speaker` itt szerepel, a js/battle.js
// resolvePortrait()-je ezt hasznalja a dialogus-doboz portrejakent (ld.
// CLAUDE.md "Mindig legyen arckep" dontest). MAR MEGADOTT portrait-okat ez
// nem ir felul -- csak a hianyzokat tolti ki.
const RECURRING_SPEAKER_PORTRAITS = {
  KECSKE: "assets/sprites/kecske_placeholder_talk.png",
  QUEEN: "assets/sprites/queen_placeholder_talk.png",
  TENNA: "assets/sprites/tenna_placeholder_talk.png",
  ASGORE: "assets/sprites/asgore_placeholder_talk.png",
};

const ZONE_1 = {
  id: "zone1_siras",
  background: "assets/sprites/zone1_bg_placeholder.png",
  speakerPortraits: RECURRING_SPEAKER_PORTRAITS,
  // Fordulos FIGHT/ACT/SPARE harc -- ld. js/battle.js startRoundBattle()
  // dokumentaciojat a teljes adatformatumhoz. Jelenleg csak ez az 1. zona
  // hasznalja ezt a formatumot, a 2-4. zona a regi (intro/acts/dodge/
  // victoryLines) "legacy" formatumon marad.
  // A cornerIntro a Queen_room.png/Tenna_room.png portrekat hasznalja (NEM
  // a _talk valtozatot) -- ezek ugyanazok a kepek, amiket a Bazsa-szoba
  // Tenna/Queen beszolasai is hasznalnak (ld. js/main.js TENNA_LINE/
  // QUEEN_LINE), a felhasznalo kifejezett kerese szerint, hogy a harci
  // sarok-buborek pontosan ugyanugy nezzen ki, mint a szobaban.
  cornerIntro: [
    {
      speaker: "QUEEN",
      portrait: "assets/sprites/Queen_room.png",
      text: "Úgy Látom Egy Sírós Gyerek Elállja Az Utat. Kellemetlen. Javaslom A Törlőkendő Használatát.",
    },
    {
      speaker: "TENNA",
      portrait: "assets/sprites/Tenna_room.png",
      text: "Hagyd a kendőt, Queen! Nézd azt a drámát! Ez igazi nézettség! Csináljunk belőle műsort kölyök!",
    },
  ],
  enemy: {
    name: "KÖNNY-LÉNY",
    sprite: "assets/sprites/enemy_konnyleny_placeholder.png",
    // A felhasznalo kifejezett kerese szerint mindig ez latszik, amikor a
    // Könny-lény beszel (ld. js/battle.js resolvePortrait()/enemyPortrait).
    talkSprite: "assets/sprites/enemy_konnyleny_placeholder_talk.png",
    introLines: [
      { speaker: "KÖNNY-LÉNY", text: "*A Könny-lény elkezd hisztizni szinte már zokog." },
    ],
  },
  rounds: [
    {
      // 1. Fordulo
      enemyLine: { speaker: "KÖNNY-LÉNY", text: "Minden... elveszett... A kapcsolat megszakadt a szerverrel..." },
      dodge: { duration: 6800, rate: 600, speed: 280, size: [7, 12], pattern: "rain" },
      options: [
        {
          type: "fight",
          label: "FIGHT",
          reactionLines: [
            { speaker: "TE", text: "Nekimész a Könny-lénynek." },
            { speaker: "KÖNNY-LÉNY", text: "*A könnyei hirtelen vörösre váltanak.*" },
          ],
        },
        {
          type: "act",
          id: "megkerdez",
          label: "ACT: MEGKÉRDEZ",
          reactionLines: [
            { speaker: "TE", text: "Megkérdezed, mi történt." },
            { speaker: "KÖNNY-LÉNY", text: "A Neon Unikornisom... elcseréltem egy sima macskára... Átvertek az Adopt Me-ben!" },
          ],
        },
      ],
    },
    {
      // 2. Fordulo -- a bevezeto (preLines) attol fugg, mit valasztott a
      // jatekos az 1. fordulban (ld. js/battle.js runRound()
      // "lastChoiceType"): ACT eseten az alapertelmezett preLines jon,
      // FIGHT eseten a rovidebb preLinesIfPrevFight.
      preLines: [
        { speaker: "TENNA", portrait: "assets/sprites/tenna_placeholder.png", text: "Átverés a virtuális kisállatokkal? Ez a legősibb trükk a tévézés történetében! Imádom!" },
        { speaker: "QUEEN", portrait: "assets/sprites/queen_placeholder.png", text: "Ez Tragikus. Én Is Elcseréltem Volna A Macskát. De Csak Azért Mert A Macskák Nem Tudnak Kereket Csereként Használni." },
      ],
      preLinesIfPrevFight: [
        { speaker: "QUEEN", portrait: "assets/sprites/queen_placeholder.png", text: "Tyíí, Ebből Baj Lesz. System_Crashed_Error: 0x00000D" },
      ],
      dodge: { duration: 6800, rate: 560, speed: 250, size: [6, 11], pattern: "bounce", life: 3600 },
      options: [
        {
          type: "fight",
          label: "FIGHT",
          // enemyPortraitAfter: a dialogue-box "beszelo" arckepe (talk-dying).
          // enemyFieldAfter: a kepernyo kozepen allando harci sprite (sima dying).
          enemyPortraitAfter: "assets/sprites/enemy_konnyleny_placeholder_talk-dying-01.png",
          enemyFieldAfter: "assets/sprites/enemy_konnyleny_placeholder-dying-01.png",
          reactionLines: [
            { speaker: "TE", text: "Tovább ütöd." },
            { speaker: "KÖNNY-LÉNY", text: "*Az élete gyorsan fogy. A támadásai egyre kaotikusabbak.*" },
          ],
        },
        {
          type: "act",
          id: "vigasztal",
          label: "ACT: VIGASZTAL",
          reactionLines: [
            { speaker: "TE", text: "Megpróbálod megnyugtatni." },
            { speaker: "KÖNNY-LÉNY", text: "Te nem érted! Az a pet 400 Robuxba került!" },
          ],
        },
        {
          type: "act",
          id: "roblox_tanc",
          label: "ACT: ROBLOX TÁNC",
          mercy: 50,
          reactionLines: [
            { speaker: "TE", text: "Elkezded járni az ikonikus Roblox alap-táncot." },
            { speaker: "KÖNNY-LÉNY", text: "Ez a... /e dance? Te is ismered?" },
          ],
        },
      ],
    },
    {
      // 3. Fordulo -- az enemyLine csak akkor hangzik el, ha a jatekos a 2.
      // fordulban PONT a ROBLOX TÁNC-ot valasztotta (ld. js/battle.js
      // runRound() "lastChoiceId"), egyebkent kimarad.
      enemyLine: { speaker: "KÖNNY-LÉNY", text: "Lehet, hogy... nem vagyok egyedül a szerveren?" },
      enemyLineRequiresPrevChoice: "roblox_tanc",
      dodge: { duration: 6800, rate: 220, speed: 250, size: [6, 10], pattern: "spiral", spiralStep: 0.35, arms: 3 },
      options: [
        {
          type: "fight",
          label: "FIGHT",
          enemyPortraitAfter: "assets/sprites/enemy_konnyleny_placeholder_talk-dying-02.png",
          enemyFieldAfter: "assets/sprites/enemy_konnyleny_placeholder-dying-02.png",
          reactionLines: [
            { speaker: "TE", text: "Utoljára nekimész." },
            { speaker: "KÖNNY-LÉNY", text: "*Majdnem vereséget szenved -- de az utolsó erejével még egyszer visszatámad.*" },
          ],
        },
        {
          type: "act",
          id: "oof_korus",
          label: "ACT: OOF KÓRUS",
          // +50 (osszeadodik a korabbi mercy-vel, ld. js/battle.js
          // runRound()) -- ha a jatekos a 2. fordulban mar valasztotta a
          // ROBLOX TÁNC-ot (szinten +50), a ketto egyutt eleri a 100-at.
          mercy: 50,
          reactionLines: [
            { speaker: "TE", text: "Megkéred Queent és Tennát, hogy veled együtt utánozzák a klasszikus Roblox halál-hangot." },
            { speaker: "QUEEN", portrait: "assets/sprites/queen_placeholder.png", text: "Rendben. OOF." },
            { speaker: "TENNA", portrait: "assets/sprites/tenna_placeholder.png", text: "OOF! (Ez jó volt a mikrofonba?)" },
            { speaker: "KÖNNY-LÉNY", text: "*Teljesen megdöbben.*" },
          ],
        },
      ],
    },
  ],
  // A 4. "fordulo" mar nem tamad -- csak egy FIGHT/SPARE zaro-valasztas
  // (ld. js/battle.js resolveEnding()). SPARE csak akkor sikerul, ha a
  // Spare-mero (mercy) mar elerte a 100-at (roblox_tanc + oof_korus egyutt,
  // vagy onmagaban az oof_korus); kulonben a failLines utan a FIGHT-
  // kimenetellel zarul.
  ending: {
    spare: {
      lines: [
        { speaker: "KÖNNY-LÉNY", text: "Köszönöm. Azt hiszem, ideje kicsit offline lennem és sétálni egyet." },
        { speaker: "KÖNNY-LÉNY", text: "Amúgy is lejárt a képernyőidőm." },
        { speaker: "TE", text: "A Könny-lény elpárolog, és hátrahagy egy kis sárga kockát." },
        { speaker: "QUEEN", portrait: "assets/sprites/queen_placeholder.png", text: "EGY VIRTUÁLIS KIEGÉSZÍTŐ. FELSZERELHETED VÉDEKEZÉS GYANÁNT. HA MÁR MINDENKI EZT CSINÁLJA." },
      ],
      failLines: [
        { speaker: "KÖNNY-LÉNY", text: "*Még nem áll készen erre.*" },
      ],
    },
    fight: {
      // Nincs kulon "talk-die" arckep -- a die allapotnak nincs kulonallo
      // "beszelo" valtozata, igy a dialogue-box portreja es a kozepso harci
      // sprite is ugyanarra a kepre vaknak.
      enemyPortrait: "assets/sprites/enemy_konnyleny_placeholder-die.png",
      enemyField: "assets/sprites/enemy_konnyleny_placeholder-die.png",
      roomDecoration: true,
      lines: [
        { speaker: "TE", text: "A Könny-lény elcsendesedik." },
        { speaker: "QUEEN", portrait: "assets/sprites/queen_placeholder.png", text: "Ez Kicsit Durva Volt. De Legalább Megszáradt A Padló." },
      ],
    },
  },
  styleTag: "+DRY EYES",
  // Rovid, opcionalis beszolasok a folyoson, mielott a jatekos belep a
  // zonaba -- a Battle.start() intro-jatol elteroen ezeket csak akkor latja,
  // ha odamegy az adott NPC-hez.
  companionChat: [
    {
      speaker: "KECSKE",
      // Tomb = tobb "oldal", Enter/szokozzel lapozhato (ld. Overworld.showCornerPopup()).
      text: [
        "Figyelj, számításaim szerint 98%-os valószínűséggel egy Roblox-szivárgás történt a szobádban.",
        "A szoba struktúrája kezd gagyivá válni.",
        "Ha nem állítjuk meg a fertőzést, az egész szobád -Ohh My God!- szintre süllyed.",
      ],
      // Ennel a (szokasosnal hosszabb) sornal szelesebb doboz es nagyobb
      // portré -- ld. js/main.js corridorFlavor()/Overworld.showCornerPopup().
      // A CSS-alapertelmezett 300px/40px, ha nincs itt megadva.
      boxWidth: 380,
      portraitSize: 70,
    },
    { speaker: "TENNA", text: "A vezetékek itt még rendben vannak. Egyelőre." },
    { speaker: "QUEEN", text: "MEGJEGYZÉS: A PADLÓ MOST NEDVESEBB A SZOKÁSOSNÁL.", portrait: "assets/sprites/queen_placeholder_talk.png" },
  ],
};

const ZONE_2 = {
  id: "zone2_cirkusz",
  background: "assets/sprites/zone2_bg_placeholder.png",
  speakerPortraits: RECURRING_SPEAKER_PORTRAITS,
  intro: [
    { speaker: "QUEEN", text: "RENDSZER-FRISSÍTÉS. VAGY INKÁBB: RENDSZER-ÖSSZEOMLÁS, DE CIRKUSZI FÉNYEKKEL.", portrait: "assets/sprites/queen_placeholder.png" },
    { speaker: "KECSKE", text: "Szerintem ez most tényleg egy digitális circus lett.", portrait: "assets/sprites/kecske_placeholder_talk.png" },
    { speaker: "KECSKE", text: "Nézd meg azt a padlót, az még saját magát sem veszi komolyan.", portrait: "assets/sprites/kecske_placeholder_talk.png" },
    { speaker: "TENNA", text: "Csak újraindítom ezt a villanykörtét... na jó inkább a wifi-t hibáztatom megint.", portrait: "assets/sprites/tenna_placeholder.png" },
    { speaker: "KECSKE", text: "Várj, ott volt valaki a sarokban! ...Vagy már nincs is ott.", portrait: "assets/sprites/kecske_placeholder_talk.png" },
  ],
  // Fordulos FIGHT/ACT/SPARE harc (ugyanaz a rendszer, mint az 1. zonaban --
  // ld. js/battle.js startRoundBattle() dokumentaciojat). Ez az elso zona a
  // 2-4. kozul, ami athozza ezt a formatumot a regi (intro/acts/dodge/
  // victoryLines) "legacy" formatumrol.
  enemy: {
    // A `name` szandekosan megegyezik a dialogus-sorok `speaker`-ivel --
    // ld. js/battle.js resolvePortrait(), ami erre a mezore pontosan
    // illeszt. `talkSprite`: ez jelenik meg a dialogue-boxban, amikor
    // Bubble beszel (ld. resolvePortrait()/startRoundBattle()) -- a `sprite`
    // (allo/harci-mezo kep) valtozatlanul kulon marad. Meg NINCS kulon
    // dying-progresszio -- ha kesobb tobb allapot-kep keszul, a FIGHT
    // opciokhoz `enemyPortraitAfter`/`enemyFieldAfter`-t erdemes felvenni
    // (ld. ZONE_1 peldajat).
    name: "BUBBLE",
    sprite: "assets/sprites/enemy_bubble_placeholder.png",
    talkSprite: "assets/sprites/enemy_bubble_placeholder_talk.png",
    introLines: [
      { speaker: "BUBBLE", text: "Ó, ÜDV! MICSODA CSODÁS LÁTOGATÓK! DE HA KIPUKKANSZ..." },
      { speaker: "BUBBLE", text: "TUDJÁTOK, HOGY A LÉGGÖMBÖK SZERETNEK SZOROSAN ÖLELNI? MERT ÉN IGEN!" },
      { speaker: "BUBBLE", text: "AKKOR IS CSAK A KONFETTI MARAD, AMI MEG A TAKARÍTÁS! SZÓVAL, MARADJATOK EGY DARABBAN, VAGY... NEM!" },
    ],
  },
  rounds: [
    {
      // 1. Fordulo -- Bubble meg nem tamad kulon sorral, csak Kecske/Tenna
      // kommentalja a dodge-fazis elott.
      preLines: [
        { speaker: "KECSKE", portrait: "assets/sprites/kecske_placeholder_talk.png", text: "Ez a dolog... szó szerint egy beszélő szappanbuborék? Ez annyira logikátlan, hogy fáj!" },
        { speaker: "TENNA", portrait: "assets/sprites/tenna_placeholder.png", text: "Hagyd, a Wi-Fi jel nem stabil, emiatt jelenik meg minden fura dolog. Üsd ki, vagy mondj neki valamit!" },
      ],
      // A felhasznalo kerese szerint a pattogo buborekok NEM tunnek el
      // (life: Infinity, ld. js/engine.js bounce-logikaja). tearImages:
      // meret szerint valasztott lovedek-textura (ld. js/engine.js
      // draw()/tearImageFor()) -- a size [6,11] tartomany also/kozepso/felso
      // harmada donti el, melyik kep jon.
      dodge: {
        duration: 6800,
        rate: 560,
        speed: 250,
        size: [6, 11],
        pattern: "bounce",
        life: Infinity,
        tearImages: { small: "bubbleSmall", normal: "bubbleNormal", large: "bubbleLarge" },
      },
      options: [
        {
          type: "fight",
          label: "FIGHT",
          reactionLines: [{ speaker: "TE", text: "Nekimész Bubble-nek." }],
        },
        {
          type: "act",
          id: "koszonj_vissza",
          label: "ACT: KÖSZÖNJ VISSZA TÚL LELKESEN",
          mercy: 50,
          reactionLines: [{ speaker: "TE", text: "„HÉ! BUBBLE! NAGYON ÖRÜLÜNK, HOGY ITT LEHETÜNK!”" }],
        },
        {
          type: "act",
          id: "szurd_meg",
          label: "ACT: SZÚRD MEG EGY TŰVEL",
          reactionLines: [{ speaker: "TE", text: "Elővesz egy tűt, és megpiszkálod vele Bubble-t." }],
        },
      ],
    },
    {
      // 2. Fordulo -- preLinesByChoice: az elozo (1.) fordulo PONTOS
      // valasztasa szerint (fight / koszonj_vissza / szurd_meg), ld.
      // js/battle.js runRound() dokumentaciojat.
      preLinesByChoice: {
        fight: [
          { speaker: "BUBBLE", text: "AU! EZ NEM VOLT CÉLSZERŰ! A KONFETTIJEIM KÉSZEN ÁLLNAK A VISSZAVÁGÁSRA!" },
          { speaker: "TE", text: "Ez most tényleg mérges? Futás!" },
        ],
        koszonj_vissza: [
          { speaker: "BUBBLE", text: "Ó! ILYEN LELKES VAGY! MÁR MAJDNEM MEGFEJELTEM A KÉPERNYŐT AZ ÖRÖMTŐL! DE A SZABÁLYOK, AZOK SZABÁLYOK!" },
          { speaker: "TENNA", portrait: "assets/sprites/tenna_placeholder.png", text: "Úgy tűnik, zavarban van a kedvességtől. Talán le tudod nyugtatni?" },
        ],
        szurd_meg: [
          { speaker: "BUBBLE", text: "EZ... EZ NEM VOLT... FAIR PLAY! MOST MÁR CSAK AZON GONDOLKODOM, HOGY KIPUKKASZTALAK-E TITEKET!" },
        ],
      },
      // A felhasznalo kerese szerint a spiral-lovedekek is visszapattannak
      // (ld. js/engine.js spawnBullet() "spiral" aga), es ugyanazt a meret
      // szerinti buborek-textura-keszletet hasznaljak, mint az 1. fordulo.
      dodge: {
        duration: 6800,
        rate: 260,
        speed: 250,
        size: [6, 10],
        pattern: "spiral",
        spiralStep: 0.35,
        arms: 3,
        tearImages: { small: "bubbleSmall", normal: "bubbleNormal", large: "bubbleLarge" },
      },
      options: [
        {
          type: "fight",
          label: "FIGHT",
          reactionLines: [{ speaker: "TE", text: "Végezzünk ezzel." }],
        },
        {
          type: "act",
          id: "enekelj",
          label: "ACT: ÉNEKELJ EGY CIRKUSZI DALT",
          mercy: 50,
          // [SZERKESZTENDŐ]: placeholder reakcio, a felhasznalo eredeti
          // szovege csak "(Lehet békés megoldás)"-t irt ide, konkret sorok
          // nelkul.
          reactionLines: [
            { speaker: "TE", text: "Elkezdesz énekelni egy vidám cirkuszi dallamot." },
            { speaker: "BUBBLE", text: "Ó! EZ... EGÉSZEN FÜLBEMÁSZÓ! ALIG BÍROM MEGÁLLNI, HOGY NE PUKKANJAK SZÉT AZ ÖRÖMTŐL!" },
          ],
        },
        {
          type: "act",
          id: "korai_spare",
          label: "SPARE",
          // Meg tul korai -- nincs mercy-hatasa, csak egy elutasito sor,
          // utana megy tovabb a zaro fordulora (ld. js/battle.js
          // resolveEnding() preLinesByMercy-jet). A felhasznalo kerese
          // szerint sima ACT-cimke, nincs kulon SPARE-ikonja.
          reactionLines: [
            { speaker: "TE", text: "Hagyd abba, nem akarunk bántani!" },
            // [SZERKESZTENDŐ]: placeholder Bubble-elutasitas, a felhasznalo
            // eredeti szovege csak "(Még nem fog működni, túl korai)"-t irt.
            { speaker: "BUBBLE", text: "MÉG NEM, KÖLYÖK! A TÖRTÉNET MÉG NEM ÉRT VÉGET!" },
          ],
        },
      ],
    },
  ],
  // A 3. "fordulo" mar nem tamad -- csak egy FIGHT/SPARE zaro-valasztas
  // (ld. js/battle.js resolveEnding()), a felgyult mercy alapjan valasztott
  // bevezetovel (preLinesByMercy: "peaceful" ha mindket beke-ACT-ot
  // valasztottad -- KÖSZÖNJ VISSZA + ÉNEKELJ -- "aggressive" ha egyiket
  // sem, kulonben "mixed"). SPARE csak akkor sikerul, ha mercy mar elerte
  // a 100-at.
  ending: {
    preLinesByMercy: {
      peaceful: [
        { speaker: "BUBBLE", text: "VÁRJ... TI NEM IS AKARTOK KIPUKKASZTANI? MILYEN UNALMAS! DE... TALÁN... IGAZATOK VAN. A KONFETTI TAKARÍTÁSA AMÚGY IS BORZALMAS." },
      ],
      aggressive: [
        { speaker: "BUBBLE", text: "NA ELÉG VOLT! ITT AZ IDŐ A NAGY FINÁLÉRA!" },
      ],
      mixed: [
        { speaker: "TENNA", portrait: "assets/sprites/tenna_placeholder.png", text: "A jel stabilizálódott! Most! Döntsd el!" },
      ],
    },
    spare: {
      lines: [
        { speaker: "TE", text: "Na, ezt megúsztuk. Bár még mindig nem értem, miért volt itt egy beszélő buborék." },
        { speaker: "TENNA", portrait: "assets/sprites/tenna_placeholder.png", text: "Ne kérdezz. A rendszerfrissítések mindig ilyen furák. Menjünk, mielőtt megjelenik egy kislány vagy egy bohóc is." },
      ],
      // [SZERKESZTENDŐ]: placeholder elutasitas arra az esetre, ha a
      // jatekos a zaro fordulban probalna SPARE-t valasztani, mielott
      // elerte volna a 100 mercy-t -- a felhasznalo szovege ezt az esetet
      // nem irta le kulon.
      failLines: [{ speaker: "BUBBLE", text: "HA, MOST MÁR TÉNYLEG KÉSŐ EHHEZ!" }],
    },
    fight: {
      // A felhasznalo kerese szerint Bubble NEM tunik el nyomtalanul --
      // kipukkanva egy tocsara (puddle.png) valt, mar a harc kozben is,
      // pontosan amikor a stilus-felirat (+TOO MUCH FUN) megjelenik (ld.
      // js/battle.js finishZone(), ami enemyPortrait/enemyField-et meg a
      // showStyleTag() elott allitja be). Ugyanez a kep marad utana a
      // folyoson is diszitesként, ld. js/main.js buildCorridorScene().
      enemyPortrait: "assets/sprites/puddle.png",
      enemyField: "assets/sprites/puddle.png",
      lines: [
        { speaker: "TE", text: "...hát, ez megtörtént. Rengeteg konfetti van a cipőmben." },
        { speaker: "TENNA", portrait: "assets/sprites/tenna_placeholder.png", text: "Gratulálok. Most már csak azt kellene kitalálni, hogyan magyarázzuk meg ezt a supportnak." },
      ],
    },
  },
  styleTag: "+TOO MUCH FUN",
  // Felulirja a js/battle.js DEFAULT_GAMEOVER_LINES-jat (ami mindig Queen +
  // Kecske ket sorbol all) -- a felhasznalo kerese szerint itt csak Queen
  // beszel, mas szoveggel. [SZERKESZTENDŐ]: a felhasznalo csak annyit kert,
  // hogy "legyen más a szöveg", konkret sort nem adott meg, ez helyettesito.
  gameOverLines: [
    { speaker: "QUEEN", text: "RENDSZERHIBA: A KIPUKKANÁS HAMARABB TÖRTÉNT, MINT KELLETT VOLNA. ÚJRATÖLTÉS." },
  ],
  companionChat: [
    // Ez a bejegyzes csak "van companionChat" jelzokent kell a Caine-
    // hotspot letrehozasahoz (js/main.js buildCorridorScene()) -- a
    // tenyleges, tobbsoros Caine-beszelgetes mar NEM innen jon, hanem a
    // js/main.js CAINE_DIALOGUE_LINES konstansabol (showOverworldDialogue()).
    { speaker: "CAINE", text: "Hölgyeim és uraim, illetve te: ISTEN HOZOTT A DIGITÁLIS CIRKUSZBAN!" },
    { speaker: "TENNA", text: "A villanykörte állítólag jól van. Állítólag." },
    { speaker: "QUEEN", text: "A TAPS-HANGERŐ IRÁNYÍTHATATLAN. ÉRDEKES.", portrait: "assets/sprites/queen_placeholder.png" },
  ],
};

// ZONE_3 ("A Csövek", Ultrakill-es) a felhasznalo kifejezett kerese szerint
// KIKERULT a jatekbol -- a ZONE_4 lett a zaro zona, Minecraft-temaval, ld.
// CLAUDE.md "Hatralevo munka" / DESIGN.md. A regi ZONE_3-tartalom (Cso-
// Automata, +OVERCLOCKED) a git-elozmenyekben megmaradt, ha valaha vissza
// kellene hozni.

// A zaro (immar 3. es egyben utolso) zona -- Apa (korabban "Asgore")
// drámai belepovel jelenik meg Minecraft-kockava valva, majd egy rovid
// "beszolas" utan egy teljesen egyedi zaro-animacio kovetkezik (ld.
// js/battle.js playFinalCinematic()). A felhasznalo kifejezett kerese
// szerint EZ A TELJES JELENET MAR NEM A HARC-KEPERNYON, hanem a folyoson
// ("az alaphelyen") jatszodik le -- ld. js/main.js playZone4Finale(), amit
// a folyoso zaro-hotspotja indit el (buildCorridorScene()). Emiatt ez a
// zona NEM megy at a Battle.start()-on/battle.js ACT-menu-motorjan, igy
// nincs `acts`/`dodge`/`background` mezoje -- helyettuk egy `fightImage`
// mezo (a korabbi, egyetlen ACT reactionLines-abol kiemelve) es explicit
// `portrait` minden soron (a resolvePortrait()-fele automatikus arckep-
// kitoltes csak battle.js-en keresztul mukodik, ezt a zonat viszont
// showOverworldDialogue()/Overworld.showCornerPopup() jeleniti meg). A
// `speaker` mezokben "APA"/"APA2" szerepel (nem "ASGORE") -- a folyoson
// sincs lathato beszelo-nev, ez csak a kod olvashatosagat szolgalja.
const ZONE_4 = {
  id: "zone4_minecraft",
  speakerPortraits: RECURRING_SPEAKER_PORTRAITS,
  intro: [
    { speaker: "KECSKE", text: "Minecraft? Komolyan? Már csak egy zombi hiányzik, aki megpróbál megenni, miközben próbálom megérteni a 'kocka-logikát'.", portrait: "assets/sprites/kecske_placeholder_talk.png" },
    { speaker: "TENNA", text: "Ez már nem a Wi-Fi. Ez a rendszer alaprétege. Valaki nagyon szereti a retro voxel-stílust... várj, figyelj!", portrait: "assets/sprites/tenna_placeholder.png" },
  ],
  enemy: {
    name: "APA",
    // A folyoson dinamikusan felbukkano "dramai belepo" sprite kepe --
    // ld. js/main.js playZone4Finale() Overworld.addSprite() hivasat.
    sprite: "assets/sprites/asgore_placeholder.png",
    talkSprite: "assets/sprites/asgore_placeholder_talk.png",
    introLines: [
      // sound: a script "(snd_heavydamage.wav)" jelolese Apa drámai
      // belepojenel -- ld. js/main.js showOverworldDialogue() line.sound
      // tamogatasat. Explicit portrait, mert nincs resolvePortrait()
      // automatika ezen a delivery-utvonalon.
      {
        speaker: "APA",
        text: "BUMM. Drámai belépő, a sors elkerülhetetlen végzete... még mindig működik, vagy már túl öreg vagyok ehhez a digitális bohóckodáshoz?",
        portrait: "assets/sprites/asgore_placeholder_talk.png",
        sound: "heavydamage",
      },
      { speaker: "TE", text: "Apa? Miért vagy... kocka alakú?", portrait: null },
      { speaker: "TE", text: "Nahh jó, ezt nem hagyom...", portrait: null },
    ],
  },
  // A script "Megjelenik egy Kép a képernyő közepén... 2mp-ig" sora -- a
  // "Nahh jó, ezt nem hagyom..." TE-sor utan KOZVETLENUL, automatikusan
  // (nincs kulon "FIGHT" menu-valasztas, a felhasznalo kifejezett kerese
  // szerint), ld. js/main.js playZone4Finale() Battle.showCenterImage()
  // hivasat. sound: a felhasznalo kerese szerint ekkor szol.
  fightImage: { src: "assets/sprites/4finger_placeholder.png", duration: 2000, sound: "ultraswing" },
  styleTag: "+APPPAAAAAAA",
  // A script kerese szerint ("Ha lehet ezt több ideig kitartva") a
  // szokasos 1100ms-nel jval tovabb kitart -- ld. showStyleTag(text, holdMs).
  styleTagDuration: 2800,
  victoryLines: [
    { speaker: "APA", text: "Ha HA HAAAA", portrait: "assets/sprites/asgore_placeholder_talk.png" },
    // "pukk eltűnik és megjelenik helyette APA2" -- kulon sor, kulon
    // (meg kesz kepre varo, egyelore gen_assets.py-stilusu placeholder)
    // portrettal, ld. tools/gen_assets.py "apa2_placeholder" bejegyzeset.
    // sound: a felhasznalo kerese szerint pontosan az atvaltas
    // pillanataban (a portre APA2-re cserelodesekor) szol. transitionAnim:
    // egy 4-kockas placeholder-animacio (ld. tools/gen_assets.py
    // "apa_transition_0N" bejegyzeseit), ami eltakarja a hirtelen
    // karakter-valtast, mielott a valodi APA2-portre megjelenne -- a
    // felhasznalo sajat rajzra fogja cserelni kesobb, ld.
    // js/battle.js playTransitionAnim().
    {
      speaker: "APA2",
      text: "Tudom, tudom. A világok, a harcok, a szép grafikák. De figyelj...",
      portrait: "assets/sprites/apa2_placeholder.png",
      sound: "vaporized",
      transitionAnim: {
        frames: [
          "assets/sprites/apa_transition_01.png",
          "assets/sprites/apa_transition_02.png",
          "assets/sprites/apa_transition_03.png",
          "assets/sprites/apa_transition_04.png",
        ],
        frameMs: 150,
      },
    },
  ],
  // A jelenet utani, teljesen egyedi zaro-animacio (kivilagosodas -> "System
  // Reset" felirat -> hatasszunet -> Apa2 zaro sora -> elsotetules ->
  // automatikus visszaters a cimkepernyore) -- ld. js/battle.js
  // playFinalCinematic(), meghivva js/main.js playZone4Finale()-bol.
  finalCinematic: {
    heading: "System Reset: Happy 13th Birthday!",
    finalLine:
      "Reseteljük ezt az egészet. A legjobb dolgok úgysem a kódokban vannak, menjünk inkább medencézni. A valódi víznek legalább nincsenek textúrahibái.",
  },
  // Szandekosan NINCS companionChat -- a felhasznalo kerese szerint a
  // folyoson nincs kulon "Enter: odaszolsz Eriknek"/"Minecraft... mi mas"
  // hotspot ennel a zonanal (ld. js/main.js buildCorridorScene(), ami
  // `zone.companionChat || []`-t hasznal, tehat ures marad a kecske/
  // minecraft hotspot-par letrehozasa).
};

const ZONES = [ZONE_1, ZONE_2, ZONE_4];
