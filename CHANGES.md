# Change Guide — Gracemere Redbacks Website

A record of every major decision made when building and evolving this project.

---

## Version 2.0.0 — Migration from WordPress to Astro

### Why migrate from WordPress to Astro?

The original WordPress build worked but came with operational complexity:
- Required two Docker containers (WordPress + MySQL) running at all times
- Required a database backup strategy to avoid losing content
- WordPress core and plugin updates needed regular attention
- The Docker image was large (~500MB+)

Astro solves all of these because:
- The site is **pre-built to static HTML** — no PHP, no database, no runtime server
- The Docker image is tiny (just Nginx serving flat files)
- Content lives in **Markdown files in the Git repository** — versioned, backed up, no database needed
- Builds are fast and the deployed site is extremely fast to load

---

### Why Decap CMS?

Content editors still need a web UI — they shouldn't have to edit Markdown files directly in GitHub. Decap CMS provides:
- A web UI at `/admin` that looks and works like a traditional CMS
- GitHub OAuth login — no separate user accounts to manage
- Edits are committed to the Git repo automatically, which triggers a rebuild
- No server required — it communicates directly with the GitHub API from the browser

---

### Why Formspree for the contact form?

A static site can't run server-side PHP to send emails. Options considered:
- **Formspree (chosen)** — free tier, simple, no backend needed, submissions emailed directly
- Netlify Forms — only works on Netlify hosting
- Self-hosted email handler — adds complexity and a server requirement

Formspree requires only a single endpoint URL in the form's `action` attribute.

---

### Why Nginx over other static file servers?

Nginx was already in use and is the industry standard for serving static files. Key configuration decisions:

- `absolute_redirect off` and `port_in_redirect off` — critical when Docker maps a non-standard external port (5200) to Nginx's internal port 80. Without these, Nginx strips the port from redirects, causing browsers to land on TrueNAS (which runs on port 80).
- `try_files $uri $uri/index.html $uri.html` — serves Astro's pre-rendered HTML without triggering directory redirects.

---

### Why is Astro built in GitHub Actions, not in the Dockerfile?

Building Astro inside the Dockerfile would require Node.js in the image, making it large and slow to build. Instead:
- GitHub Actions runs `npm install` and `npm run build` to produce the `dist/` folder
- The Dockerfile is a single-stage build: just copy `dist/` into `nginx:alpine`
- The final image is small and fast

---

### Colour Scheme

Extracted from the club logo — unchanged from v1.0.0:

| Variable | Hex | Use |
|---|---|---|
| `--color-primary` | `#7A2535` | Buttons, accents, nav hover, category tags |
| `--color-primary-dark` | `#5C1A28` | Button hover, announcement bar |
| `--color-primary-light` | `#9B3545` | Footer links, hero subtext |
| `--color-dark` | `#0D0D0D` | Header, footer, hero, dark sections |
| `--color-white` | `#FFFFFF` | Page background, card backgrounds |

To change any colour globally, update the value in `src/styles/global.css` under `:root { }`.

---

### Fonts

- **Oswald** (Google Fonts) — headings, nav, buttons. Bold and athletic — suits a sports club.
- **Open Sans** (Google Fonts) — body text. Clean and readable at all sizes.

---

### Home Page Sections

The home page was designed by referencing local Brisbane soccer club sites. Sections in order:

1. **Announcement bar** — slim maroon strip above the nav on every page. Update the text in `src/layouts/BaseLayout.astro`.
2. **Hero** — dark background with maroon gradient overlay. Supports a real background photo via the `--hero-bg` CSS variable.
3. **Stats strip** — maroon band with 4 club statistics. Update the numbers in `src/pages/index.astro`.
4. **Feature cards** — 4 cards explaining why to join the club.
5. **Registration cards** — dark section with clickable cards per team type, linking to the programs page.
6. **About strip** — brief club description with a link to the About page.
7. **Latest news** — automatically shows the 3 most recent non-draft news posts.
8. **Sponsor strip** — placeholder logo row. Replace the placeholder divs with `<img>` tags when sponsors are confirmed.
9. **CTA banner** — maroon call-to-action linking to Programs and Contact.

---

### Logo and Favicon

- Logo file: `public/gracemere-redbacks-logo-banner.png` — displayed at 120px height in both header and footer.
- Favicon: `public/favicon.png` — referenced in `src/layouts/BaseLayout.astro`.
- To update either, replace the file in `public/` and push.

---

### Social Media

Facebook and Instagram icon links appear in:
- The header (desktop only — hidden on mobile to save space)
- The footer (always visible)

Update the URLs in `src/components/Header.astro` and `src/components/Footer.astro`.

---

### Hero Background Photo

The hero currently uses a dark colour + maroon gradient. To add a real action photo:

1. Upload the photo via Decap CMS (it will land in `public/uploads/`)
2. In `src/pages/index.astro`, add a `style` attribute to the hero section:

```html
<section class="hero" style="--hero-bg:url('/uploads/your-photo.jpg')">
```

The existing gradient overlay will keep the text readable regardless of the photo.

---

### Deployment Port

The site runs on port **5200** externally (Docker maps `5200 → 80` inside the container). All OAuth callback URLs and internal links should use port 5200.

---

## Version 1.0.0 — Original WordPress Build

### Why WordPress?

WordPress was chosen because:
- Content editors (non-developers) can update pages by pasting from Word — no code skills needed
- The WordPress block editor (Gutenberg) preserves Word formatting on paste
- It has a large ecosystem of plugins for future features
- It runs reliably in Docker with the official `wordpress` image

### Why a custom WordPress theme?

An off-the-shelf theme would require page-builder plugins and ongoing update management. A custom theme gave full control over design with no bloat.

### Why Docker + Dockge?

The entire environment was reproducible and deployable without SSH. Dockge provided a simple web UI for stack management.

The stack had two containers:
- **wordpress** — custom-built image with the theme baked in
- **db** — MySQL 8 database

Both were replaced in v2.0.0 by a single Nginx container serving pre-built static files.

---

## Planned Future Changes

- **Hero photo** — add a real action photo to the hero section once available
- **Sponsor logos** — replace placeholder boxes with real sponsor images
- **Events/fixtures page** — a page showing the season schedule
- **Online registration link** — link the registration cards to an external platform (e.g. PlayFootball / Squadi)
- **SSL/HTTPS** — add a certificate via Nginx reverse proxy + Let's Encrypt when a public domain is registered
- **Custom domain** — update the Decap CMS OAuth App URLs and `docker-compose.yml` when a domain is set up
