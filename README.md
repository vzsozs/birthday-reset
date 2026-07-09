# Project: Birthday Reset — 1. fázis: harc-motor prototípus

## Megnyitás
Nyisd meg az `index.html` fájlt bármelyik böngészőben (dupla kattintás elég, nem kell szerver).

## Mi működik most
- Cím-képernyő → "A Sírás" zóna intro dialógusa (Queen, Kecske, Tenna cameo)
- Deltarune-stílusú harc a Könny-lény ellen: SOUL-doboz mozgatás nyilakkal/WASD-vel, lövedék-dodge, HP csík
- ACT-menü: "ADJ ZSEBKENDŐT" (közbenső) és "NE SÍRJ" (lezáró akció)
- Stílus-pont felirat (+DRY EYES), győzelmi dialógus, vég-képernyő
- Placeholder sprite-ok (`assets/sprites/`) és hangeffektek (`assets/sfx/`) — mindegyik cserélhető

## Irányítás
- Mozgás dodge közben: nyilak vagy WASD
- Dialógus továbbléptetés / gépelés kihagyása: kattintás vagy szóköz/Enter
- ACT-menü: nyilak/WASD a választáshoz, Enter/szóköz a megerősítéshez (kattintás is működik) — a teljes játék végigvihető csak billentyűzettel

## Mit kell cserélni később
Minden `*_placeholder.png` fájl a `assets/sprites/` mappában ideiglenes — ezekre kell majd a saját rajzokat tenni (ugyanazzal a fájlnévvel, ugyanolyan arányban működik a legegyszerűbben). A hangok (`assets/sfx/`) egyszerű generált beep-ek, ugyanígy cserélhetők valódi effektekre/zenére.

## Következő fázisok (a design dokumentum szerint)
1. ~~Motor-prototípus~~ ✅ (ez a fájl)
2. Tartalom: a másik 3 zóna szövegei (Cirkusz, Csövek, Roblox-lerakat) + ACT-ok
3. Vizuál: a placeholder sprite-ok cseréje / bővítése
4. Hang: valódi zenei alap és effektek
5. Zónák összefűzése egy lineáris láncba
6. Polish, átmenetek
7. Teszt

A `js/zones.js` fájlban van az 1. zóna teljes tartalma — ez a m