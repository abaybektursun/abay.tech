# abay.tech

Personal website and portfolio.

## Structure

```
abay.tech/
├── application/           # Main Next.js app
│   ├── src/               # App source code
│   ├── slides/            # Slidev presentation
│   └── sst.config.ts      # SST infrastructure
```

## Development

```bash
cd application

# Main site
pnpm dev

# Slides (separate terminal)
cd slides && pnpm dev
```

## Deployment

```bash
cd application
pnpm sst deploy
```

Deploys:
- **abay.tech** — Main site (Next.js)
- **slides.abay.tech** — Presentation (Slidev)
