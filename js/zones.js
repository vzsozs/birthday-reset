/*
 * zones.js
 * A tartalom: szovegek, ACT-ok, ellenfel-adatok zonankent.
 * Eddig csak az 1. zona (A Sirlas) van kesz -- ez a motor-prototipus.
 * A tovabbi harom zona (Cirkusz, Csovek, Roblox-lerakat) ugyanezt a
 * mintat koveti majd, csak uj adat-objektumkent kell felvenni ide,
 * es a main.js-ben lancolni a zone1 utan.
 */
const ZONE_1 = {
  id: "zone1_siras",
  background: "assets/sprites/zone1_bg_placeholder.png",
  intro: [
    { speaker: "QUEEN", text: "ÓÓÓ, NÉZD MÁR. A VALÓSÁGOD ÉPP MOST VÁLTOTT „OLCSÓ-GAGYI” MÓDBA.", portrait: "assets/sprites/queen_placeholder_talk.png" },
    { speaker: "QUEEN", text: "SZERENCSÉRE NÁLAM VAN A RESET-KÓD. DE ELŐBB KI KELL TAKARÍTANI PÁR HIBÁT.", portrait: "assets/sprites/queen_placeholder_talk.png" },
    {
      speaker: "KECSKE",
      text: "Ez a padló... szerintem sír. {{meglepett}}Az még jó, vagy ez most baj?",
      portrait: "assets/sprites/kecske_placeholder.png",
      faces: { meglepett: "assets/sprites/kecske_placeholder_talk.png" },
    },
    { speaker: "TENNA", text: "Nem, nem, ez tuti csak egy laza kábel... vagy a router. Mindig a router.", portrait: "assets/sprites/tenna_placeholder.png" },
    { speaker: "KECSKE", text: "Oké, gyere, nézzük meg mi szivárog itt.", portrait: "assets/sprites/kecske_placeholder.png" },
  ],
  enemy: {
    name: "KÖNNY-LÉNY",
    sprite: "assets/sprites/enemy_konnyleny_placeholder.png",
    introLines: [
      { speaker: "KÖNNY-LÉNY", text: "*A Könny-lény felbukkan a padlóhasadékból. Csöpög.*" },
    ],
    attackLines: [
      { speaker: "KÖNNY-LÉNY", text: "*A Könny-lény könnycseppeket zápor-szerűen ereget rád!*" },
    ],
  },
  dodge: {
    duration: 4200,
    rate: 380,
    speed: 110,
    size: [7, 12],
  },
  acts: [
    {
      id: "adj_zsepit",
      label: "ACT: ADJ ZSEBKENDŐT",
      repeatable: false,
      reactionLines: [
        { speaker: "TE", text: "Odanyújtasz egy zsebkendőt a Könny-lénynek." },
        { speaker: "KÖNNY-LÉNY", text: "*A Könny-lény meglepődik. Egy pillanatra abbahagyja... aztán folytatja.*" },
      ],
      endsFight: false,
    },
    {
      id: "ne_sirj",
      label: "ACT: NE SÍRJ",
      repeatable: false,
      reactionLines: [
        { speaker: "TE", text: "Határozottan azt mondod: „Ne sírj, csak rossz felbontásban vagy renderelve.”" },
        { speaker: "KÖNNY-LÉNY", text: "*A Könny-lény elgondolkodik ezen. Aztán megnyugszik, és szárazra törli magát.*" },
      ],
      endsFight: true,
    },
  ],
  styleTag: "+DRY EYES",
  victoryLines: [
    { speaker: "QUEEN", text: "NAGYSZERŰ. EGGYEL KEVESEBB NEDVESSÉGGEL TERHELT HIBA A RENDSZEREMBEN.", portrait: "assets/sprites/queen_placeholder.png" },
    { speaker: "KECSKE", text: "Ez... simán ment. Mehetünk tovább?", portrait: "assets/sprites/kecske_placeholder.png" },
    { speaker: "TENNA", text: "Mondtam, hogy a router volt. Na jó, majdnem biztos.", portrait: "assets/sprites/tenna_placeholder.png" },
    { speaker: "RENDSZER", text: "1. ZÓNA KÉSZ — A PROTOTÍPUS ITT VÉGET ÉR. A TOVÁBBI ZÓNÁK KÖVETKEZNEK." },
  ],
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
  intro: [
    { speaker: "QUEEN", text: "RENDSZER-FRISSÍTÉS. VAGY INKÁBB: RENDSZER-ÖSSZEOMLÁS, DE CIRKUSZI FÉNYEKKEL.", portrait: "assets/sprites/queen_placeholder.png" },
    { speaker: "KECSKE", text: "Szerintem ez most tényleg egy digitális circus lett.", portrait: "assets/sprites/kecske_placeholder.png" },
    { speaker: "KECSKE", text: "Nézd meg azt a padlót, az még saját magát sem veszi komolyan.", portrait: "assets/sprites/kecske_placeholder.png" },
    { speaker: "TENNA", text: "Csak újraindítom ezt a villanykörtét... vagy inkább a wifi-t hibáztatom megint.", portrait: "assets/sprites/tenna_placeholder.png" },
    { speaker: "KECSKE", text: "Várj, ott volt valaki a sarokban! ...Vagy már nincs is ott.", portrait: "assets/sprites/kecske_placeholder.png" },
  ],
  enemy: {
    name: "TÚLBOLDOG BOHÓC-NPC",
    sprite: "assets/sprites/enemy_bohoc_placeholder.png",
    introLines: [
      { speaker: "BOHÓC-NPC", text: "*Egy túl-színes bohóc-avatar pattan elő, mögötte egy Roblox-szörny statisztál mint „attrakció”.*" },
      { speaker: "BOHÓC-NPC", text: "ÉLMÉNYT NYÚJTOK NEKED! ÉLMÉNYT! (a keze közben kicsit átfordul saját magán)" },
    ],
    attackLines: [
      { speaker: "BOHÓC-NPC", text: "*Konfetti-lövedékeket köp feléd, túl sok lelkesedéssel!*" },
    ],
  },
  dodge: {
    duration: 4400,
    rate: 340,
    speed: 120,
    size: [6, 11],
  },
  acts: [
    {
      id: "koszonj_vissza",
      label: "ACT: KÖSZÖNJ VISSZA TÚL LELKESEN",
      repeatable: false,
      reactionLines: [
        { speaker: "TE", text: "Túlzott lelkesedéssel visszaintesz és üvöltesz: „SZIA NEKEM IS SZUPER ÉLMÉNY!”" },
        { speaker: "BOHÓC-NPC", text: "*A Bohóc-NPC összezavarodik, a mosolya egy pillanatra 3 kockát ugrik.*" },
      ],
      endsFight: false,
    },
    {
      id: "reklam_paródia",
      label: "ACT: PARÓDIÁZD A REKLÁMSZÖVEGÉT",
      repeatable: false,
      reactionLines: [
        { speaker: "BOHÓC-NPC", text: "MOST 20%-KAL TÖBB ÉLMÉNY, HA MOST RENDELSZ—" },
        { speaker: "KECSKE", text: "„—most 20%-kal több élmény, ha MOST rendelsz!” Kösz, nem kell.", portrait: "assets/sprites/kecske_placeholder.png" },
        { speaker: "BOHÓC-NPC", text: "*A Bohóc-NPC leáll, mintha nem lenne előre megírva erre a válasz.*" },
      ],
      endsFight: true,
    },
  ],
  styleTag: "+TOO MUCH FUN",
  victoryLines: [
    { speaker: "QUEEN", text: "A CIRKUSZ-MODUL LEÁLLÍTVA. VALAMI OKBÓL MÉG MINDIG HALLOM A TAPSOT.", portrait: "assets/sprites/queen_placeholder.png" },
    { speaker: "KECSKE", text: "Az a fickó megint eltűnt. Mindig lemaradok róla.", portrait: "assets/sprites/kecske_placeholder.png" },
    { speaker: "TENNA", text: "A villanykörte kész. Szóljatok, ha megint sötét lesz — az is a wifi hibája.", portrait: "assets/sprites/tenna_placeholder.png" },
    { speaker: "RENDSZER", text: "2. ZÓNA KÉSZ." },
  ],
  companionChat: [
    { speaker: "KECSKE", text: "Ez most komolyan konfetti-szagú." },
    { speaker: "TENNA", text: "A villanykörte állítólag jól van. Állítólag." },
    { speaker: "QUEEN", text: "A TAPS-HANGERŐ IRÁNYÍTHATATLAN. ÉRDEKES.", portrait: "assets/sprites/queen_placeholder.png" },
  ],
};

const ZONE_3 = {
  id: "zone3_csovek",
  background: "assets/sprites/zone3_bg_placeholder.png",
  intro: [
    { speaker: "QUEEN", text: "IPARI HIBAÜZENET ÉSZLELVE. SÖTÉT-PIROS. GYORS. NEM AZ ÉN STÍLUSOM, DE MENJÜNK.", portrait: "assets/sprites/queen_placeholder.png" },
    { speaker: "KECSKE", text: "Miért lett hirtelen minden ilyen... feszes? Mintha a játék is sietne.", portrait: "assets/sprites/kecske_placeholder.png" },
    { speaker: "TENNA", text: "Csak összekötök pár kábelt. A sávszélesség megint szánalmas.", portrait: "assets/sprites/tenna_placeholder.png" },
    { speaker: "KECSKE", text: "Oké, ez gyors lesz. Kapkodjunk.", portrait: "assets/sprites/kecske_placeholder.png" },
  ],
  enemy: {
    name: "CSŐ-AUTOMATA",
    sprite: "assets/sprites/enemy_csoautomata_placeholder.png",
    introLines: [
      { speaker: "CSŐ-AUTOMATA", text: "*Egy fémcsövekből összerakott automata csattan ki a padlóból, túl gyorsan mozogva.*" },
    ],
    attackLines: [
      { speaker: "CSŐ-AUTOMATA", text: "*Fémszilánk-lövedékeket lő, alig van idő reagálni!*" },
    ],
  },
  dodge: {
    duration: 3600,
    rate: 260,
    speed: 155,
    size: [5, 9],
  },
  acts: [
    {
      id: "sebesseg_troll",
      label: "ACT: SEBESSÉG-TROLL",
      repeatable: false,
      reactionLines: [
        { speaker: "TE", text: "Olyan gyorsan vágsz oda egy beszólást, hogy az Automata le sem tudja fordítani." },
        { speaker: "CSŐ-AUTOMATA", text: "*ÉRTELMEZÉSI... HIBA... újratöltés...*" },
      ],
      endsFight: false,
    },
    {
      id: "vészfék",
      label: "ACT: HÚZD MEG A VÉSZFÉKET",
      repeatable: false,
      reactionLines: [
        { speaker: "TE", text: "Megtalálsz egy vészféket a csövek közt, és jó erősen meghúzod." },
        { speaker: "CSŐ-AUTOMATA", text: "*Az Automata lelassul, majd udvariasan leáll, mint akit tényleg meg kellett állítani.*" },
      ],
      endsFight: true,
    },
  ],
  styleTag: "+OVERCLOCKED",
  victoryLines: [
    { speaker: "QUEEN", text: "SEBESSÉG-REKORD. NEM MINDEN HIBÁM ILYEN EGYÜTTMŰKÖDŐ.", portrait: "assets/sprites/queen_placeholder.png" },
    { speaker: "KECSKE", text: "Na, ez pörgős volt. Kicsit ki is fulladtam.", portrait: "assets/sprites/kecske_placeholder.png" },
    { speaker: "TENNA", text: "A kábelek rendben. Most már csak a sávszélesség a hibás. Mint mindig.", portrait: "assets/sprites/tenna_placeholder.png" },
    { speaker: "RENDSZER", text: "3. ZÓNA KÉSZ." },
  ],
  companionChat: [
    { speaker: "KECSKE", text: "Miért kell itt mindig futni?" },
    { speaker: "TENNA", text: "A sávszélesség tényleg szánalmas. Mondtam." },
    { speaker: "QUEEN", text: "SEBESSÉG NÖVEKSZIK. STÍLUSOM CSÖKKEN.", portrait: "assets/sprites/queen_placeholder.png" },
  ],
};

const ZONE_4 = {
  id: "zone4_roblox",
  background: "assets/sprites/zone4_bg_placeholder.png",
  intro: [
    { speaker: "QUEEN", text: "OKÉ. ITT LECSAPÓDOTT MINDEN, AMIT AZ ELŐZŐ HÁROM ZÓNA NEM TUDOTT FELDOLGOZNI.", portrait: "assets/sprites/queen_placeholder.png" },
    { speaker: "KECSKE", text: "Miért van itt minden... kockákból? Ez most tudatos stílus, vagy csak feladta a motor?", portrait: "assets/sprites/kecske_placeholder.png" },
    { speaker: "TENNA", text: "Utoljára szólok bele: ez SEM router-hiba. Ez már a rendszer alja.", portrait: "assets/sprites/tenna_placeholder.png" },
    { speaker: "TENNA", text: "De van ám jó hírem: innen van rendszergazda-jogom a kapuhoz. Csak intézzétek el ezt itt.", portrait: "assets/sprites/tenna_placeholder.png" },
    { speaker: "IDEGEN NPC", text: "friend request?" },
    { speaker: "KECSKE", text: "Senki nem válaszol neki. Soha.", portrait: "assets/sprites/kecske_placeholder.png" },
  ],
  enemy: {
    name: "BLOKKFEJŰ VÉGHIBA",
    sprite: "assets/sprites/enemy_blokkfeju_placeholder.png",
    introLines: [
      { speaker: "BLOKKFEJŰ VÉGHIBA", text: "*Egy túl nagy fejű, szögletes avatar tornyosul fel a szemétdomb tetején.*" },
    ],
    attackLines: [
      { speaker: "BLOKKFEJŰ VÉGHIBA", text: "*Kockás loot-ládákat pörget feléd — mindegyik más színű, de üresek.*" },
    ],
  },
  dodge: {
    duration: 4500,
    rate: 320,
    speed: 140,
    size: [6, 13],
  },
  acts: [
    {
      id: "tulkomplikalas",
      label: "ACT: MUTASS EGY 3×3-AS CRAFT-RECEPTET",
      repeatable: false,
      reactionLines: [
        { speaker: "TE", text: "Előhúzol egy teljesen fölösleges, 3×3-as craftolási receptet." },
        { speaker: "BLOKKFEJŰ VÉGHIBA", text: "*A Blokkfejű Véghiba lefagy a komplexitástól. Egy pillanatra betűkockákra esik szét.*" },
      ],
      endsFight: false,
    },
    {
      id: "kikapcsolo",
      label: "ACT: NYOMD MEG A KIKAPCSOLÓT",
      repeatable: false,
      reactionLines: [
        { speaker: "TE", text: "Megtalálod a nagy, piros KI gombot, és minden habozás nélkül megnyomod." },
        { speaker: "BLOKKFEJŰ VÉGHIBA", text: "*A Blokkfejű Véghiba udvariasan összecsuklik, mint egy rosszul mentett fájl.*" },
      ],
      endsFight: true,
    },
  ],
  styleTag: "+CUBED",
  victoryLines: [
    { speaker: "QUEEN", text: "UTOLSÓ HIBA ELHÁRÍTVA. RENDSZER-ÁLLAPOTOM... ŐSZINTÉN? SE JÓ, SE ROSSZ.", portrait: "assets/sprites/queen_placeholder.png" },
    { speaker: "KECSKE", text: "Szóval ennyi volt? Ez most tényleg vége?", portrait: "assets/sprites/kecske_placeholder.png" },
    { speaker: "TENNA", text: "Kapu nyitva. Mondtam, hogy van hozzá jogom. Most az egyszer nem a wifi volt.", portrait: "assets/sprites/tenna_placeholder.png" },
    { speaker: "ASGORE", text: "Nahát. Kiderült, hogy tényleg nem a Roblox volt a hiba.", portrait: "assets/sprites/asgore_placeholder.png" },
    { speaker: "ASGORE", text: "Rendben. Elég a szerver-hibákból mára. Itt a System Admin kulcs — ez most már a tiéd.", portrait: "assets/sprites/asgore_placeholder.png" },
    { speaker: "ASGORE", text: "[SZERKESZTENDŐ: ide jön a köztetek lévő privát poén / közös program.]", portrait: "assets/sprites/asgore_placeholder.png" },
    { speaker: "RENDSZER", text: "SYSTEM RESET — HAPPY 13TH BIRTHDAY!" },
  ],
  companionChat: [
    { speaker: "KECSKE", text: "Ez a hely mintha kockákból lenne összerakva." },
    { speaker: "TENNA", text: "Innen már látom a kaput. Majdnem ott vagyunk." },
    { speaker: "QUEEN", text: "RENDSZERÁLLAPOT: FÁRADT, DE FUNKCIONÁLIS.", portrait: "assets/sprites/queen_placeholder.png" },
  ],
};

const ZONES = [ZONE_1, ZONE_2, ZONE_3, ZONE_4];
