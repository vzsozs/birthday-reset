"""
Valodi Deltarune UI-elemek kivagasa a beszerzett ("ripped") sprite-lapokbol
tiszta, egyedi PNG-kke, az assets/sprites/ui/ mappaba.

A forras-lapok (assets/sprites/HUD.png, "Battle Menu.png", Soul.png, Speech
Bubbles.png, assets/UI/UI icons.png) tobb, egymastol fuggetlen UI-sablont
tartalmaznak egyetlen nagy kepen -- ez a script mindig ugyanazokat a
(kezzel, pixel-pontosan megkeresett) teglalapokat vagja ki, es a hatterszint
(a ripped lap sajat "cella-hattere", nem a jatek fekete/atlatszo hattere)
teszi atlatszova szin-kulcsolassal (color-key), hogy a jatekban barmilyen
hatter ele lehessen tenni oket.

Ujra lefuttathato: mindig felulirja az assets/sprites/ui/ tartalmat.
"""
import math
import os

from PIL import Image

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPRITES = os.path.join(BASE, "assets", "sprites")
UI_SRC = os.path.join(BASE, "assets", "UI")
OUT = os.path.join(SPRITES, "ui")


def load(*parts):
    return Image.open(os.path.join(BASE, *parts)).convert("RGBA")


def color_key(img, bg_colors, thresh=20):
    """Az img pixeleit atlatszova teszi ott, ahol a szin kozel van barmelyik
    bg_colors bejegyzeshez (euklideszi tavolsag < thresh)."""
    img = img.copy()
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if min(math.dist((r, g, b), bg) for bg in bg_colors) < thresh:
                px[x, y] = (0, 0, 0, 0)
    return img


def autocrop(img, pad=1):
    bbox = img.getbbox()
    if not bbox:
        return img
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(img.width, x1 + pad)
    y1 = min(img.height, y1 + pad)
    return img.crop((x0, y0, x1, y1))


def save(img, name):
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, name)
    img.save(path)
    print("ui-asset:", path, img.size)


def act_icon():
    # assets/UI/UI icons.png: 6 ikon egy sorban (FIGHT, ACT, ITEM, SPARE,
    # DEFEND, MAGIC), fejenkent pontosan 33px cella (198px / 6).
    sheet = load("assets", "UI", "UI icons.png")
    crop = sheet.crop((33, 0, 64, 33))
    crop = autocrop(crop)
    save(crop, "act_icon.png")


def fight_icon():
    # 0. cella (FIGHT) -- ugyanaz a 33px-es racs, mint act_icon()-nal.
    sheet = load("assets", "UI", "UI icons.png")
    crop = sheet.crop((0, 0, 31, 33))
    crop = autocrop(crop)
    save(crop, "fight_icon.png")


def spare_icon():
    # 3. cella (SPARE).
    sheet = load("assets", "UI", "UI icons.png")
    crop = sheet.crop((99, 0, 130, 33))
    crop = autocrop(crop)
    save(crop, "spare_icon.png")


def hp_bar_frame():
    # "Battle Menu.png" valojaban a "Battle - HUD" reference-lapot tartalmazza
    # (a ket ripped fajlnev fel van cserelve a tartalomhoz kepest). A KRIS
    # HP-csik keretet vagjuk ki, a csik hatterszinet (kek) es a kitoltetlen
    # reszt (fekete) tesszuk atlatszova, hogy sajat szinu kitoltest tehessunk
    # mogeje.
    sheet = load("assets", "sprites", "Battle Menu.png")
    crop = sheet.crop((19, 567, 147, 609))
    crop = color_key(crop, [(0, 38, 255), (0, 0, 0)], thresh=10)
    crop = autocrop(crop)
    save(crop, "hp_bar_frame.png")


def dialogue_box_frame():
    # assets/sprites/HUD.png valojaban a KrisUI menu-sablon lapot tartalmazza
    # (ld. fenti megjegyzes a felcserelt fajlnevekrol). A "Text box Ch1+2"
    # sarok-csillag diszitesu dobozkeretet vagjuk ki. FONTOS: csak a hatter
    # lilat kulcsoljuk atlatszova (a doboz-teglalapon kivuli, a kerekitett
    # sarkok "levagott" resze) -- a belso fekete terulet szandekosan MARAD
    # opak, kulonben a jatekban a doboz sarkai (a kerekitett kereten kivul)
    # feketen jelennenek meg atlatszo helyett.
    sheet = load("assets", "sprites", "HUD.png")
    crop = sheet.crop((0, 552, 600, 720))
    crop = color_key(crop, [(147, 87, 147)], thresh=10)
    crop = autocrop(crop)
    save(crop, "dialogue_box_frame.png")


def soul_heart_red():
    sheet = load("assets", "sprites", "Soul.png")
    crop = sheet.crop((0, 14, 22, 36))
    crop = color_key(crop, [(73, 65, 130), (120, 100, 198)], thresh=10)
    crop = autocrop(crop)
    save(crop, "soul_heart_red.png")


def tear_bullet_real():
    sheet = load("assets", "sprites", "Soul.png")
    crop = sheet.crop((365, 140, 412, 175))
    crop = color_key(crop, [(255, 255, 255), (73, 65, 130)], thresh=10)
    crop = autocrop(crop)
    save(crop, "tear_bullet_real.png")


def speech_bubble():
    sheet = load("assets", "sprites", "Speech Bubbles.png")
    crop = sheet.crop((0, 0, 150, 90))
    crop = color_key(crop, [(138, 90, 157), (195, 134, 255)], thresh=15)
    crop = autocrop(crop)
    save(crop, "speech_bubble.png")


if __name__ == "__main__":
    act_icon()
    fight_icon()
    spare_icon()
    hp_bar_frame()
    dialogue_box_frame()
    soul_heart_red()
    tear_bullet_real()
    speech_bubble()
    print("done")
