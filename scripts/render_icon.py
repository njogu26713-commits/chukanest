from PIL import Image, ImageDraw
from pathlib import Path

for size in (192, 512):
    scale = size / 512
    image = Image.new("RGBA", (size, size), "#1B6B45")
    draw = ImageDraw.Draw(image)
    def xy(values):
        return tuple(round(value * scale) for value in values)
    draw.rounded_rectangle(xy((0, 0, 512, 512)), radius=round(116 * scale), fill="#1B6B45")
    draw.rounded_rectangle(xy((112, 110, 400, 420)), radius=round(108 * scale), fill="#FAFAF6")
    draw.arc(xy((102, 164, 410, 332)), start=180, end=360, fill="#2F8F5E", width=round(24 * scale))
    draw.line([xy((190, 292)), xy((233, 335)), xy((324, 237))], fill="#1B6B45", width=round(27 * scale), joint="curve")
    r = round(15 * scale)
    draw.ellipse(xy((153-r, 222-r, 153+r, 222+r)), fill="#C9A227")
    draw.ellipse(xy((359-r, 222-r, 359+r, 222+r)), fill="#C9A227")
    image.save(Path("public/icons") / f"chukanest-{size}.png")
