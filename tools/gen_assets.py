"""
Ideiglenes (placeholder) sprite- es hangfajlok generalasa a Project: Birthday Reset
prototipushoz. Ezeket kesobb le kell cserelni sajat rajzokra / hangokra.
"""
import math
import struct
import wave
import os
import random

from PIL import Image, ImageDraw, ImageFont

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPRITES = os.path.join(BASE, "assets", "sprites")
SFX = os.path.join(BASE, "assets", "sfx")

try:
    FONT = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 14)
    FONT_SMALL = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 11)
except Exception:
    FONT = ImageFont.load_default()
    FONT_SMALL = FONT


def label(draw, w, h, text, fill=(255, 255, 255, 255)):
    bbox = draw.textbbox((0, 0), text, font=FONT_SMALL)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((w - tw) / 2, h - th - 6), text, font=FONT_SMALL, fill=fill)
    tag_bbox = draw.textbbox((0, 0), "PLACEHOLDER", font=FONT_SMALL)
    tagw = tag_bbox[2] - tag_bbox[0]
    draw.text(((w - tagw) / 2, 4), "PLACEHOLDER", font=FONT_SMALL, fill=(255, 80, 80, 255))


def save(img, name):
    path = os.path.join(SPRITES, name)
    img.save(path)
    print("sprite:", path)


def soul_heart():
    w = h = 64
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx, cy = w / 2, h / 2 - 4
    r = 14
    d.ellipse((cx - r * 1.4, cy - r * 0.6, cx, cy + r * 0.8), fill=(255, 30, 30, 255))
    d.ellipse((cx, cy - r * 0.6, cx + r * 1.4, cy + r * 0.8), fill=(255, 30, 30, 255))
    d.polygon([(cx - r * 1.4, cy + r * 0.2), (cx + r * 1.4, cy + r * 0.2), (cx, cy + r * 2.0)],
               fill=(255, 30, 30, 255))
    save(img, "soul_heart.png")


def blob_sprite(name, fill, label_text, shape="rect"):
    w = h = 128
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pad = 14
    if shape == "rect":
        d.rounded_rectangle((pad, pad + 10, w - pad, h - pad), radius=10, outline=(255, 255, 255, 255),
                             width=3, fill=fill)
    else:
        d.ellipse((pad, pad + 10, w - pad, h - pad), outline=(255, 255, 255, 255), width=3, fill=fill)
    label(d, w, h, label_text)
    save(img, name)


def room_player_sprite():
    w, h = 32, 44
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # egyszerű, felülnézetből is működő chibi-sziluett -- ideiglenes, a szoba-
    # hátterhez képest kis méretű, hogy ne üssön el annyira mint a csata-blobok
    d.ellipse((8, 22, 24, 42), fill=(70, 150, 90, 255))  # zold polo / test
    d.ellipse((10, 2, 22, 14), fill=(235, 200, 160, 255))  # fej (bor)
    d.rectangle((10, 2, 22, 8), fill=(60, 40, 30, 255))  # haj
    d.ellipse((6, 30, 12, 38), fill=(70, 150, 90, 255))  # bal kar
    d.ellipse((20, 30, 26, 38), fill=(70, 150, 90, 255))  # jobb kar
    save(img, "player_room_placeholder.png")


def zone_bg(filename, base_color, label_text, pattern="tile"):
    w, h = 640, 480
    img = Image.new("RGBA", (w, h), base_color)
    d = ImageDraw.Draw(img)

    if pattern == "tile":
        line_color = tuple(min(255, c + 30) for c in base_color[:3]) + (255,)
        for x in range(0, w, 40):
            d.line([(x, 0), (x, h)], fill=line_color, width=1)
        for y in range(0, h, 40):
            d.line([(0, y), (w, y)], fill=line_color, width=1)
        d.line([(120, 460), (170, 380), (140, 320), (210, 250), (170, 160)],
               fill=(60, 60, 60, 255), width=5)
    elif pattern == "stripes":
        alt = tuple(min(255, c + 45) for c in base_color[:3]) + (255,)
        for i, x in enumerate(range(0, w, 60)):
            d.rectangle([x, 0, x + 60, h], fill=(alt if i % 2 else base_color))
    elif pattern == "pipes":
        pipe_color = tuple(max(0, c - 30) for c in base_color[:3]) + (255,)
        for x in range(30, w, 110):
            d.rectangle([x, 0, x + 55, h], fill=pipe_color, outline=(10, 10, 10, 255), width=3)
    elif pattern == "blocks":
        random.seed(sum(base_color[:3]))
        for _ in range(50):
            bx = random.randint(0, w - 40)
            by = random.randint(0, h - 40)
            size = random.randint(20, 55)
            shade = random.randint(-30, 30)
            c = tuple(max(0, min(255, ch + shade)) for ch in base_color[:3]) + (255,)
            d.rectangle([bx, by, bx + size, by + size], fill=c, outline=(0, 0, 0, 255))

    label(d, w, h, label_text)
    save(img, filename)


def corridor_bg():
    # Kulon fajl zonankent (corridor_zoneN_bg_placeholder.png), nem egyetlen
    # osszefuzott kep -- igy ha kesobb sajat rajzra cserelodik egy zona
    # folyoso-szakasza, csak azt az egy fajlt kell lecserelni, a masik
    # haromhoz nem kell ujra futtatni ezt a scriptet. A main.js
    # buildCorridorScene()-je egy bgSrc-tombkent kapja meg a 4 fajlt, az
    # Overworld.js pedig egymas mella illeszti oket (ld. CLAUDE.md).
    seg_w = 1100
    h = 480
    zones = [
        ((210, 200, 180, 255), "ZONA 1: A SIRAS"),
        ((200, 60, 160, 255), "ZONA 2: A CIRKUSZ"),
        ((60, 20, 20, 255), "ZONA 3: A CSOVEK"),
        ((70, 110, 70, 255), "ZONA 4: ROBLOX-LERAKAT"),
    ]

    for i, (color, text) in enumerate(zones):
        img = Image.new("RGBA", (seg_w, h), color)
        d = ImageDraw.Draw(img)
        door_w, door_h = 80, 170
        dx = seg_w // 2 - door_w // 2
        dy = h - door_h - 40
        d.rectangle([dx, dy, dx + door_w, dy + door_h], fill=(15, 15, 15, 255),
                    outline=(255, 255, 255, 255), width=4)
        d.text((24, 20), text, font=FONT, fill=(255, 255, 255, 255))
        d.text((24, 46), "PLACEHOLDER", font=FONT_SMALL, fill=(255, 80, 80, 255))
        save(img, f"corridor_zone{i + 1}_bg_placeholder.png")


def tear_bullet():
    w = h = 24
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse((6, 8, 18, 20), fill=(90, 170, 255, 255))
    d.polygon([(6, 10), (18, 10), (12, 0)], fill=(90, 170, 255, 255))
    save(img, "tear_bullet.png")


def make_beep(filename, freq=440.0, dur=0.12, vol=0.3, kind="square", sweep_to=None):
    rate = 22050
    n = int(rate * dur)
    path = os.path.join(SFX, filename)
    with wave.open(path, "w") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(rate)
        frames = bytearray()
        for i in range(n):
            t = i / rate
            f_now = freq
            if sweep_to is not None:
                f_now = freq + (sweep_to - freq) * (i / n)
            phase = 2 * math.pi * f_now * t
            if kind == "square":
                sample = 1.0 if math.sin(phase) >= 0 else -1.0
            else:
                sample = math.sin(phase)
            envelope = min(1.0, (n - i) / (n * 0.3)) if i > n * 0.7 else 1.0
            val = int(sample * vol * envelope * 32767)
            frames += struct.pack("<h", val)
        f.writeframes(bytes(frames))
    print("sfx:", path)


def make_jingle(filename, notes, note_dur=0.09, vol=0.28):
    rate = 22050
    path = os.path.join(SFX, filename)
    with wave.open(path, "w") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(rate)
        frames = bytearray()
        for freq in notes:
            n = int(rate * note_dur)
            for i in range(n):
                t = i / rate
                sample = math.sin(2 * math.pi * freq * t)
                envelope = min(1.0, (n - i) / (n * 0.25)) if i > n * 0.75 else 1.0
                val = int(sample * vol * envelope * 32767)
                frames += struct.pack("<h", val)
        f.writeframes(bytes(frames))
    print("sfx:", path)


if __name__ == "__main__":
    # FIGYELEM: ezt a blokkot mar NEM biztonsagos egyben, teljesen ujra
    # lefuttatni -- a kecske_placeholder.png (es masok) idokozben valodi,
    # kezzel kivagott kepre cserelodtek (ld. CLAUDE.md "Karakter-sprite-ok"),
    # a corridor_bg() pedig felulirna a mar vegleges corridor_zone1/2_bg_
    # placeholder.png rajzokat is. Uj, MEG NEM letezo placeholder
    # hozzaadasakor inkabb csak azt az egy fuggvenyhivast futtasd le kulon
    # (pl. `python -c "import gen_assets as g; g.blob_sprite(...)"`), ne az
    # egesz fajlt.
    os.makedirs(SPRITES, exist_ok=True)
    os.makedirs(SFX, exist_ok=True)

    soul_heart()
    tear_bullet()
    room_player_sprite()
    blob_sprite("player_placeholder.png", (60, 130, 220, 255), "PLAYER")
    blob_sprite("kecske_placeholder.png", (230, 220, 140, 255), "KECSKE", shape="ellipse")
    blob_sprite("queen_placeholder.png", (140, 60, 160, 255), "QUEEN")
    blob_sprite("tenna_placeholder.png", (200, 140, 60, 255), "TENNA", shape="ellipse")
    blob_sprite("caine_placeholder.png", (180, 30, 50, 255), "CAINE")
    blob_sprite("enemy_konnyleny_placeholder.png", (80, 150, 220, 255), "KONNY-LENY")
    blob_sprite("enemy_bohoc_placeholder.png", (230, 60, 140, 255), "BOHOC-NPC", shape="ellipse")
    blob_sprite("enemy_bubble_placeholder.png", (120, 200, 230, 255), "BUBBLE", shape="ellipse")
    blob_sprite("enemy_csoautomata_placeholder.png", (200, 30, 30, 255), "CSO-AUTOMATA")
    blob_sprite("enemy_blokkfeju_placeholder.png", (60, 200, 90, 255), "BLOKKFEJU")
    blob_sprite("asgore_placeholder.png", (170, 60, 50, 255), "ASGORE")

    zone_bg("zone1_bg_placeholder.png", (210, 200, 180, 255), "ZONA 1: A SIRAS", pattern="tile")
    zone_bg("zone2_bg_placeholder.png", (200, 60, 160, 255), "ZONA 2: A CIRKUSZ", pattern="stripes")
    zone_bg("zone3_bg_placeholder.png", (60, 20, 20, 255), "ZONA 3: A CSOVEK", pattern="pipes")
    zone_bg("zone4_bg_placeholder.png", (70, 110, 70, 255), "ZONA 4: ROBLOX-LERAKAT", pattern="blocks")
    corridor_bg()

    make_beep("menu_blip.wav", freq=880, dur=0.05, vol=0.25, kind="square")
    make_beep("menu_move.wav", freq=520, dur=0.04, vol=0.2, kind="square")
    make_beep("hit.wav", freq=140, dur=0.15, vol=0.35, kind="square", sweep_to=60)
    make_jingle("style_point.wav", [660, 880, 1320], note_dur=0.08)
    make_jingle("victory.wav", [523, 659, 784, 1046], note_dur=0.13)

    print("done")
