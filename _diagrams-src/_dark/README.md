# Dark diagram variants

The docs site (cocoindex.io/docs, "Category Standard" dark theme) uses
`<name>-dark.svg` next to each original example diagram.

- Generator-made flow/stage SVGs (cream ground, JetBrains Mono) are converted
  by `restyle.py`: same geometry and text, dark palette, no tracked-caps
  kicker, sentence-case box labels, Geist fonts.

      python3 restyle.py <dir-of-originals> <out-dir>

  Run it again after regenerating an original, then rename the output to
  `<name>-dark.svg` under `public/docs-v1/img/examples/<slug>/`.
- PNG and glyph-path diagrams were redrawn by hand in the same shapes; edit
  those `-dark.svg` files directly.
- `scene/` folders hold the small WebP sample images used by the docs
  example scenes.
