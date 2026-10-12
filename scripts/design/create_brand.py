"""Create original Moxgraph SVG concepts and final outlined assets (no web fonts)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/brand'
OUT.mkdir(parents=True, exist_ok=True)
INK, GREEN = '#172f35', '#176451'
# A card and a broad pen nib. This original geometry is also legible at 16 px.
MARK = '<defs><mask id="nib"><rect width="64" height="64" fill="white"/><path d="m25 41 10-11" stroke="black" stroke-width="2"/><circle cx="36" cy="29" r="2.5" fill="black"/></mask></defs><rect x="10" y="6" width="40" height="52" rx="7" fill="none" stroke="currentColor" stroke-width="4"/><path d="m24 41 5-16 10-5 5 10-10 12-10-1Z" fill="currentColor" mask="url(#nib)"/>'
CONCEPTS = [MARK,
 '<rect x="10" y="6" width="40" height="52" rx="7" fill="none" stroke="currentColor" stroke-width="4"/><path d="m21 42 10-18 12 16" fill="none" stroke="currentColor" stroke-width="3"/><g fill="currentColor"><circle cx="21" cy="42" r="4"/><circle cx="31" cy="24" r="4"/><circle cx="43" cy="40" r="4"/></g>',
 '<rect x="10" y="6" width="40" height="52" rx="7" fill="none" stroke="currentColor" stroke-width="4"/><path d="m18 43 5-20 5 15 9-15 1 20 7-3" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>']

def svg(content, width, height, label, color=GREEN):
 return f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-label="{label}" style="color:{color}">{content}</svg>\n'

# Original geometric lettering. Every letter is a path, with no font dependency.
letters = [
 ('M0 30V10M0 17C0 7 13 7 13 17V30M13 17C13 7 26 7 26 17V30', 35),
 ('M20 20A10 10 0 1 1 0 20A10 10 0 1 1 20 20', 29),
 ('M0 10L18 30M18 10L0 30', 27),
 ('M20 20A10 10 0 1 1 0 20A10 10 0 1 1 20 20M20 10V34Q20 46 3 40', 29),
 ('M0 30V10M0 20Q0 8 13 10', 22),
 ('M20 20A10 10 0 1 1 0 20A10 10 0 1 1 20 20M20 10V30', 29),
 ('M0 40V10M0 20A10 10 0 1 0 20 20A10 10 0 1 0 0 20', 29),
 ('M0 0V30M0 20C0 7 20 7 20 20V30', 26),
]
x, paths = 0, []
for path, advance in letters:
 paths.append(f'<path transform="translate({x} 0)" d="{path}"/>'); x += advance
wordmark = f'<g transform="translate(72 10)" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">{"".join(paths)}</g>'
width = 72 + x
for name, color in [('mark', GREEN), ('mark-ink', INK), ('mark-white', '#ffffff')]:
 content = MARK
 (OUT / f'{name}.svg').write_text(svg(content, 64, 64, 'Moxgraph', color), encoding='utf-8')
for name, color in [('wordmark', GREEN), ('wordmark-ink', INK), ('wordmark-white', '#ffffff')]:
 content = MARK + wordmark
 (OUT / f'{name}.svg').write_text(svg(content, width, 64, 'Moxgraph', color), encoding='utf-8')
(OUT / 'favicon.svg').write_text(svg('<rect width="64" height="64" rx="14" fill="#f4f7f3"/>' + MARK, 64, 64, 'Moxgraph'), encoding='utf-8')
board = '<rect width="1050" height="300" fill="#f5f6f2"/>'
for i, (mark, title, detail) in enumerate(zip(CONCEPTS, ['01 / Card & nib — selected', '02 / Connected cards', '03 / Signature'], ['A clear link between a card and its artist.', 'A graph of cards, people and connections.', 'A loose monogram with a handwritten feel.'])):
 left = 25 + i * 345
 board += f'<g transform="translate({left} 25)"><rect width="325" height="250" rx="12" fill="white"/><g transform="translate(125 28)" color="{GREEN}">{mark}</g><text x="22" y="142" font-family="Segoe UI, sans-serif" font-size="18" font-weight="600" fill="{INK}">{title.replace("&", "&amp;")}</text><text x="22" y="179" font-family="Segoe UI, sans-serif" font-size="12" fill="#56676b">{detail}</text></g>'
(OUT / 'concepts.svg').write_text(svg(board, 1050, 300, 'Three original Moxgraph logo concepts'), encoding='utf-8')
print(f'Created SVG brand assets in {OUT}')
