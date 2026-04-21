# blobs

Static image host for CocoIndex. Drop a file, get a URL.

**Served at:** https://cocoindex.io/blobs/

## Add an image

Put it under `public/` — the on-disk path becomes the URL path.

```
public/docs/img/examples/foo/cover.png
→ https://cocoindex.io/blobs/docs/img/examples/foo/cover.png
```

Commit & push to `main`. The [Pages workflow](.github/workflows/astro.yml) builds and deploys.

## Local dev

```sh
npm install
npm run dev      # → http://127.0.0.1:4321/blobs/
npm run build
```

The index page at `/` auto-lists every image under `public/`.
