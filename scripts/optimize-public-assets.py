from pathlib import Path
from PIL import Image

root = Path('/home/ubuntu/kaba-premium-redesign/client/public/assets/kaba')
outputs = {
    'hero-dakar.jpg': ('hero-dakar.webp', 1600, 82),
    'land-dakar.jpg': ('land-dakar.webp', 1400, 82),
    'property-ngor.jpg': ('property-ngor.webp', 1200, 82),
    'property-almadies.jpg': ('property-almadies.webp', 1200, 82),
    'header-kaba.png': ('header-kaba.webp', 900, 88),
    'header-kaba-transparent.png': ('header-kaba-transparent.webp', 900, 88),
    'icon-kaba.png': ('icon-kaba.webp', 512, 90),
    'logo-kaba.png': ('logo-kaba.webp', 900, 88),
    'monogram.png': ('monogram.webp', 512, 90),
}

for source_name, (target_name, max_width, quality) in outputs.items():
    source = root / source_name
    if not source.exists():
        continue
    image = Image.open(source).convert('RGBA' if 'A' in Image.open(source).getbands() else 'RGB')
    if image.width > max_width:
        height = round(image.height * max_width / image.width)
        image = image.resize((max_width, height), Image.Resampling.LANCZOS)
    image.save(root / target_name, 'WEBP', quality=quality, method=6)
    print(f'{target_name}: {(root / target_name).stat().st_size} bytes')
