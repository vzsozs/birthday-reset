# Project: Birthday Reset — összefoglaló (2026-07-09)

Ez a fájl egy pillanatkép: hol tart a projekt ma, mi a teljes jelenlegi
forgatókönyv (a ténylegesen megírt szövegekkel), és mi van még hátra. A
technikai/fejlesztési részletekért lásd a `CLAUDE.md`-t, az eredeti
design-elveket a `DESIGN.md`-t — ez a fájl a kettő gyors, egyben-olvasható
összefoglalója.

---

## 1. Jelenlegi állapot — mi működik már most, egyben

A játék elejétől a végéig **egyben, hiba nélkül végigjátszható**:

```
cím-képernyő
  → bejárható szoba (szabad mozgás nyilakkal/WASD-vel)
  → a számítógéphez érve: narrációs választó-doboz (Start / Inkább kimegyek apához)
  → glitch-átmenet
  → oldalra scrollozó folyosó (kamera követi a játékost, ambient NPC-k/ellenfelek útközben)
  → 1. zóna: "A Sírás"      (automatikus belépés az ajtónál)
  → vissza a folyosóra → 2. zóna: "A Cirkusz"
  → vissza a folyosóra → 3. zóna: "A Csövek"
  → vissza a folyosóra → 4. zóna: "A Roblox-lerakat" → Tenna kapunyitása → Asgore-jelenet
  → vég-képernyő ("HAPPY 13TH BIRTHDAY!")
```

Teljesképernyős, skálázott megjelenítés (fix 800×640 belső felbontás, mint
Undertale/Deltarune, felskálázva az ablakmérethez). Irányítás billentyűzettel
és egérrel/kattintással is végig működik.

**Vizuál:** a placeholder grafikák egy része már valódi karakter-sprite-okra
lett cserélve (Kecske, Tenna, Queen, Asgore portréi + a főszereplő
overworld-sprite-ja) — ezek kézzel kivágott kockák a beszerzett sprite-lapokból
(`Erik.png`, `Tenna.png`, `Queen.png`, `Apa.png`, `Bazsa.png`). A 4 zóna
háttere, a folyosó háttere és a maradék ellenfél-sprite-ok egyelőre még
generált placeholderek.

---

## 2. Teljes forgatókönyv (a jelenleg megírt szöveg, jelenetről jelenetre)

### Cím-képernyő
> **PROJECT: BIRTHDAY RESET** — "Deltarune-stílusú szülinapi kaland"
> [KATTINTS A KEZDÉSHEZ]

### Szoba-jelenet
A játékos szabadon mozog a gyerekszobában. A számítógéphez érve felugrik egy
szövegdoboz:

> *(uhh, ma még nem játszottam, pedig már reggel 7:30 van.)*
> **[START]** **[INKÁBB KIMEGYEK APÁHOZ]**

Ha a játékos a "kimegyek apához"-t választja:

1. kattintásra — jobb alsó sarokban, Tenna portréval:
   > **TENNA:** Biztos? Egy jó kis játék még nem árthat...
2. kattintásra — Queen portréval:
   > **QUEEN:** SYSTEM ERROR. KOCKA VAGYOK, AKKOR IS JÁTSZOM 10 PERCET.

   Ezután a "kimegyek apához" gomb szövege magától **"START"**-ra vált — innentől
   mindkét gomb ugyanazt csinálja.

Start után rövid glitch-villanás, majd a folyosó.

### Folyosó (átvezető séta a 4 zóna között)
Szabad mozgás, a kamera követi a játékost. Útközben látható (tisztán vizuális,
nem interaktív) NPC/ellenfél-sprite-ok: Kecske, a Könny-lény, Tenna, a
Bohóc-NPC, Queen, a Cső-Automata, a Blokkfejű Véghiba — mindegyik nagyjából
a saját zónája ajtaja előtt. Az ajtóhoz érve automatikusan indul a zóna.

---

### 1. zóna — "A Sírás" (Isaac-hangulat)

**Bevezető:**
> **QUEEN:** ÓÓÓ, NÉZD MÁR. A VALÓSÁGOD ÉPP MOST VÁLTOTT „OLCSÓ-GAGYI” MÓDBA.
> **QUEEN:** SZERENCSÉRE NÁLAM VAN A RESET-KÓD. DE ELŐBB KI KELL TAKARÍTANI PÁR HIBÁT.
> **KECSKE:** Ez a padló... szerintem sír. Az még jó, vagy ez most baj?
> **TENNA:** Nem, nem, ez tuti csak egy laza kábel... vagy a router. Mindig a router.
> **KECSKE:** Oké, gyere, nézzük meg mi szivárog itt.

**Ellenfél:** KÖNNY-LÉNY
> *A Könny-lény felbukkan a padlóhasadékból. Csöpög.*
> *(támadáskor)* A Könny-lény könnycseppeket zápor-szerűen ereget rád!

**ACT-ok:**
- **ADJ ZSEBKENDŐT** → *Odanyújtasz egy zsebkendőt a Könny-lénynek.* / *Meglepődik, egy pillanatra abbahagyja... aztán folytatja.*
- **NE SÍRJ** (záró ACT) → *„Ne sírj, csak rossz felbontásban vagy renderelve.”* / *A Könny-lény elgondolkodik, megnyugszik, szárazra törli magát.*

**Stílus-pont:** `+DRY EYES`

**Győzelem:**
> **QUEEN:** NAGYSZERŰ. EGGYEL KEVESEBB NEDVESSÉGGEL TERHELT HIBA A RENDSZEREMBEN.
> **KECSKE:** Ez... simán ment. Mehetünk tovább?
> **TENNA:** Mondtam, hogy a router volt. Na jó, majdnem biztos.

---

### 2. zóna — "A Cirkusz" (Amazing Digital Circus-hangulat)

**Bevezető:**
> **QUEEN:** RENDSZER-FRISSÍTÉS. VAGY INKÁBB: RENDSZER-ÖSSZEOMLÁS, DE CIRKUSZI FÉNYEKKEL.
> **KECSKE:** Szerintem ez most tényleg egy digitális circus lett.
> **KECSKE:** Nézd meg azt a padlót, az még saját magát sem veszi komolyan.
> **TENNA:** Csak újraindítom ezt a villanykörtét... vagy inkább a wifi-t hibáztatom megint.
> **KECSKE:** Várj, ott volt valaki a sarokban! ...Vagy már nincs is ott.

**Ellenfél:** TÚLBOLDOG BOHÓC-NPC
> *Egy túl-színes bohóc-avatar pattan elő, mögötte egy Roblox-szörny statisztál mint „attrakció”.*
> ÉLMÉNYT NYÚJTOK NEKED! ÉLMÉNYT! *(a keze közben kicsit átfordul saját magán)*
> *(támadáskor)* Konfetti-lövedékeket köp feléd, túl sok lelkesedéssel!

**ACT-ok:**
- **KÖSZÖNJ VISSZA TÚL LELKESEN** → *„SZIA NEKEM IS SZUPER ÉLMÉNY!”* / *A mosolya egy pillanatra 3 kockát ugrik.*
- **PARÓDIÁZD A REKLÁMSZÖVEGÉT** (záró ACT) → a Bohóc-NPC reklámszövegbe kezd, Kecske hangosan leparodizálja, mire a Bohóc-NPC leáll.

**Stílus-pont:** `+TOO MUCH FUN`

**Győzelem:**
> **QUEEN:** A CIRKUSZ-MODUL LEÁLLÍTVA. VALAMI OKBÓL MÉG MINDIG HALLOM A TAPSOT.
> **KECSKE:** Az a fickó megint eltűnt. Mindig lemaradok róla.
> **TENNA:** A villanykörte kész. Szóljatok, ha megint sötét lesz — az is a wifi hibája.

---

### 3. zóna — "A Csövek" (Ultrakill-hangulat)

**Bevezető:**
> **QUEEN:** IPARI HIBAÜZENET ÉSZLELVE. SÖTÉT-PIROS. GYORS. NEM AZ ÉN STÍLUSOM, DE MENJÜNK.
> **KECSKE:** Miért lett hirtelen minden ilyen... feszes? Mintha a játék is sietne.
> **TENNA:** Csak összekötök pár kábelt. A sávszélesség megint szánalmas.
> **KECSKE:** Oké, ez gyors lesz. Kapkodjunk.

**Ellenfél:** CSŐ-AUTOMATA
> *Egy fémcsövekből összerakott automata csattan ki a padlóból, túl gyorsan mozogva.*
> *(támadáskor)* Fémszilánk-lövedékeket lő, alig van idő reagálni!

**ACT-ok:**
- **SEBESSÉG-TROLL** → olyan gyors beszólás, hogy az Automata nem tudja lefordítani ("ÉRTELMEZÉSI... HIBA...").
- **HÚZD MEG A VÉSZFÉKET** (záró ACT) → az Automata udvariasan leáll, "mint akit tényleg meg kellett állítani."

**Stílus-pont:** `+OVERCLOCKED`

**Győzelem:**
> **QUEEN:** SEBESSÉG-REKORD. NEM MINDEN HIBÁM ILYEN EGYÜTTMŰKÖDŐ.
> **KECSKE:** Na, ez pörgős volt. Kicsit ki is fulladtam.
> **TENNA:** A kábelek rendben. Most már csak a sávszélesség a hibás. Mint mindig.

---

### 4. zóna — "A Roblox-lerakat"

**Bevezető:**
> **QUEEN:** OKÉ. ITT LECSAPÓDOTT MINDEN, AMIT AZ ELŐZŐ HÁROM ZÓNA NEM TUDOTT FELDOLGOZNI.
> **KECSKE:** Miért van itt minden... kockákból? Ez most tudatos stílus, vagy csak feladta a motor?
> **TENNA:** Utoljára szólok bele: ez SEM router-hiba. Ez már a rendszer alja.
> **TENNA:** De van ám jó hírem: innen van rendszergazda-jogom a kapuhoz. Csak intézzétek el ezt itt.
> **IDEGEN NPC:** friend request?
> **KECSKE:** Senki nem válaszol neki. Soha.

**Ellenfél:** BLOKKFEJŰ VÉGHIBA
> *Egy túl nagy fejű, szögletes avatar tornyosul fel a szemétdomb tetején.*
> *(támadáskor)* Kockás loot-ládákat pörget feléd — mindegyik más színű, de üresek.

**ACT-ok:**
- **MUTASS EGY 3×3-AS CRAFT-RECEPTET** → a Véghiba lefagy a komplexitástól, betűkockákra esik szét.
- **NYOMD MEG A KIKAPCSOLÓT** (záró ACT) → udvariasan összecsuklik, "mint egy rosszul mentett fájl."

**Stílus-pont:** `+CUBED`

**Záró jelenet (győzelem után, egyben):**
> **QUEEN:** UTOLSÓ HIBA ELHÁRÍTVA. RENDSZER-ÁLLAPOTOM... ŐSZINTÉN? SE JÓ, SE ROSSZ.
> **KECSKE:** Szóval ennyi volt? Ez most tényleg vége?
> **TENNA:** Kapu nyitva. Mondtam, hogy van hozzá jogom. Most az egyszer nem a wifi volt.
> **ASGORE:** Nahát. Kiderült, hogy tényleg nem a Roblox volt a hiba.
> **ASGORE:** Rendben. Elég a szerver-hibákból mára. Itt a System Admin kulcs — ez most már a tiéd.
> **ASGORE:** *[SZERKESZTENDŐ: ide jön a köztetek lévő privát poén / közös program.]*
> **RENDSZER:** SYSTEM RESET — HAPPY 13TH BIRTHDAY!

### Vég-képernyő
> **HAPPY 13TH BIRTHDAY!**
> Project: Birthday Reset — Complete.
> [ÚJRA A CÍMKÉPERNYŐRE]

---

## 3. Hátralévő munka

1. **A `[SZERKESZTENDŐ]` sor kitöltése** (`js/zones.js`, `ZONE_4` `victoryLines`) —
   Asgore záró, privát poénja/közös programja. Ezt csak te tudod megírni,
   ez az egyetlen ténylegesen "blokkoló" hiányzó tartalom.
2. **Vizuál (folyamatban):**
   - Kész: Kecske, Tenna, Queen, Asgore portréi + a főszereplő overworld-sprite-ja
     (valódi, kivágott karakter-grafika).
   - Hátra van: a 4 zóna háttere, a folyosó háttere, és a 4 ellenfél
     (Könny-lény, Bohóc-NPC, Cső-Automata, Blokkfejű Véghiba) sprite-ja —
     ezek egyelőre generált placeholderek.
   - Eldöntendő: mire használjuk a beküldött, de még be nem épített
     `Cyber City.png`, `Cyber Field.png`, `TV World.png`, `Cliffs.png`,
     `Anime Transformation.png` fájlokat (jelenleg egyik zónánkhoz sem
     illeszkednek egyértelműen).
   - Housekeeping: a nagy, sokkockás forrás-sprite-lapok (`Erik.png`,
     `Tenna.png`, `Queen.png`, `Apa.png`, `Bazsa.png`) egyelőre az
     `assets/sprites/`-ban maradtak — érdemes-e külön almappába rendezni őket.
3. **Hang:** a generált beep-hangeffektek (menü-blip, találat, style-pont,
   győzelem) lecserélése valódi zenére/effektekre.
4. **Polish:** átmenetek finomítása a zónák között, playtestelés közbeni
   apró hangolások (pl. a folyosó ajtó-hotspotjainak/ambient NPC-k
   pozíciójának pontosítása, ha az új háttérgrafikákkal esetleg nem stimmel).
5. **Halál-ág tesztelése:** a `gameOver()` (HP elfogy → újrapróbálkozás)
   implementálva van, de eddig nem sikerült ténylegesen kipróbálni éles
   játékban (a dodge-fázis rövid és könnyű) — érdemes explicit letesztelni.
6. **Végső teszt:** teljes végigjátszás, ideális esetben másik gépen/böngészőben is.

## 4. Amit *nem* kell újra eldönteni (már lezárt döntések)

- A teljes játékmenet (szoba → folyosó → 4 zóna → zárás) szerkezete kész és
  működik, nem kell újratervezni.
- A tónus-szabályok (nincs tanmese, rövid szövegek, a négy zóna egyenlő
  súlyú) érvényesülnek a jelenlegi szövegekben.
- A karakter-sprite-ok forrása (ripped/beszerzett sprite-lapok saját rajz
  helyett) tudatos döntés volt — lásd a `CLAUDE.md` "Karakter-sprite-ok"
  szakaszát.
