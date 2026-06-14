# Mitaali's Mandala Portfolio — README

## Project Structure

```
mandala-portfolio/
├── index.html          ← Main page
├── style.css           ← All styles
├── gallery.js          ← Dynamic gallery + lightbox logic
├── images/
│   ├── manifest.json   ← Image list (update when adding new images)
│   ├── mandala1.jpg
│   ├── mandala3.jpg
│   └── ...
└── README.md
```

---

## Adding New Images

1. Drop your image file into the `images/` folder.
2. Open `images/manifest.json` and add the filename to the array:

```json
[
  "mandala1.jpg",
  "mandala3.jpg",
  "my-new-piece.jpg"
]
```

That's it — the gallery rebuilds itself from the manifest on every page load.

**Supported formats:** JPG, JPEG, PNG, WEBP

---

## Image Optimization Guide

### Recommended Dimensions
| Use case          | Width      | Format  |
|-------------------|------------|---------|
| Portrait mandala  | 1200px     | WebP    |
| Square mandala    | 1400×1400  | WebP    |
| Landscape         | 1600px     | WebP    |

### Quality Settings
- **WebP:** quality 82–88 (best size/quality balance)
- **JPEG:** quality 85, progressive encoding, strip metadata
- **PNG:** only for pieces with hard geometric edges; use lossless

### Tools (free)
- **Squoosh** (squoosh.app) — browser-based, best control
- **Sharp** (Node.js CLI) — batch processing for many files
- **ImageOptim** (Mac app) — drag and drop

### One-liner with Sharp (Node.js):
```bash
npx sharp-cli -i images/*.jpg -o images/ --format webp --quality 85
```

### Do NOT:
- Crop or stretch your art to a fixed aspect ratio — the masonry layout handles varied sizes naturally
- Resize below 800px wide — it'll look soft on retina screens
- Use gigantic originals (>4000px) — they slow load times

---

## Deployment

### GitHub Pages
1. Push the project to a GitHub repo.
2. Go to Settings → Pages → Source: `main` branch, `/ (root)`.
3. Your site is live at `https://yourusername.github.io/mandala-portfolio/`

### Netlify (recommended — free tier, fast CDN)
1. Drag and drop the entire `mandala-portfolio/` folder onto [netlify.com/drop](https://netlify.com/drop)
2. Done. You get a live HTTPS URL instantly.
3. For custom domain: Site Settings → Domain Management.

### Vercel
1. `npm i -g vercel`
2. `cd mandala-portfolio && vercel`
3. Follow the prompts — it's deployed.

---

## Auto-manifest (Netlify/Vercel serverless — optional upgrade)

If you want zero manual steps when adding images, add a tiny serverless function that reads the `images/` directory and returns the manifest automatically. This replaces the manual `manifest.json` step.

**Netlify function** (`netlify/functions/images.js`):
```js
const fs = require('fs');
const path = require('path');

exports.handler = async () => {
  const dir = path.join(__dirname, '../../images');
  const files = fs.readdirSync(dir)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(files),
  };
};
```

Then change `MANIFEST_PATH` in `gallery.js` to `/.netlify/functions/images`.

---

## SEO Checklist Before Going Live
- [ ] Replace `og:image` meta tag with an actual mandala image URL
- [ ] Add `<link rel="canonical" href="https://yourdomain.com">` 
- [ ] Add a `favicon.ico` or SVG favicon
- [ ] Confirm all images have meaningful `alt` text (the gallery generates these from filenames automatically)

---

## Browser Support
Chrome 90+, Firefox 90+, Safari 14+, Edge 90+  
IE is not supported (uses CSS `columns`, `IntersectionObserver`, `backdrop-filter`).
