# Change Guide — Gracemere Redbacks Website

This document explains every architectural and design decision made when building this project. It will be updated as the site evolves.

---

## Version 1.0.0 — Initial Build

### Why WordPress?

WordPress was chosen because:
- Content editors (non-developers) can update pages by pasting from Word — no code skills needed
- The WordPress block editor (Gutenberg) preserves Word formatting (headings, bold, bullet points, tables) on paste
- It has a massive ecosystem of free plugins if new features are needed later (e.g. event calendars, photo galleries, registration forms)
- It runs reliably in Docker with the official `wordpress` image
- It is the world's most-used CMS, so support and documentation are easy to find

---

### Why Docker + Dockge?

The site runs in Docker so:
- The entire environment (WordPress + database) is reproducible — no "works on my machine" problems
- Updates are deployed by simply pulling a new image, not by manually copying files
- Dockge provides a simple web UI to manage the stack without needing to SSH and run commands

The stack has two containers:
- **wordpress** — the custom-built image with the theme baked in
- **db** — MySQL 8 database

---

### Why GitHub Actions?

GitHub Actions automatically builds a new Docker image every time you push to the `main` branch. This means:
- You only need to push your code — the build happens in the cloud for free
- The image is stored in GitHub Container Registry (`ghcr.io`) — also free
- You don't need Docker installed on your local machine to deploy

The workflow (`.github/workflows/deploy.yml`) uses GitHub's own `GITHUB_TOKEN` secret — no manual credentials to manage.

---

### Why a custom WordPress theme (not an off-the-shelf theme)?

An off-the-shelf theme would require:
- Finding a theme that matches the club branding
- Installing and configuring a page-builder plugin
- Managing theme updates that could break customisations

A custom theme means:
- Full control over the design and colours
- No page-builder bloat or licensing fees
- Easy to maintain — one developer can understand the entire codebase
- Colours are defined as CSS variables at the top of `style.css`, so a rebrand is a one-line change

---

### Colour Scheme

Extracted directly from the club logo:

| Variable | Hex | Use |
|---|---|---|
| `--color-primary` | `#7A2535` | Buttons, accents, nav hover, category tags |
| `--color-primary-dark` | `#5C1A28` | Button hover states |
| `--color-primary-light` | `#9B3545` | Footer links, hero subtext |
| `--color-dark` | `#0D0D0D` | Header, hero, dark sections |
| `--color-white` | `#FFFFFF` | Background, card backgrounds |

To change any colour globally, update the value in `wp-content/themes/redbacks/style.css` under `:root { }`.

---

### Contact Form — Why not a plugin?

The contact form is built into the theme (no plugin required) because:
- Fewer plugins = fewer security vulnerabilities and update headaches
- The form submits via AJAX (no page reload) for a better user experience
- The PHP handler in `functions.php` emails submissions to the WordPress admin email
- It's easy to read and modify — all in one place

How it works:
1. User fills in the form on `/contact`
2. JavaScript (`theme.js`) intercepts the submit event and sends data to WordPress AJAX (`/wp-admin/admin-ajax.php`)
3. WordPress validates the data and sends an email using `wp_mail()`
4. A success or error message is shown on the page

To change where form submissions go: **WordPress Admin → Settings → General → Administration Email Address**

---

### Placeholder Logo

The current theme uses a ⚽ emoji as a placeholder logo. To replace it:
1. Go to **WordPress Admin → Appearance → Customize → Site Identity**
2. Upload the real logo PNG (recommend transparent background, at least 200px tall)
3. Click Publish

The `header.php` file checks `has_custom_logo()` — if a logo is set via the Customizer, it shows that image; otherwise it falls back to the emoji placeholder.

---

### Media Uploads and Docker Volumes

WordPress media uploads (photos, PDFs, etc.) are stored in a Docker **named volume** (`wp_uploads`), not inside the container image. This means:
- Uploaded files survive image updates and container restarts
- You never need to re-upload images when deploying a new version of the site
- The volume is managed by Docker — it persists until explicitly deleted

The theme files (CSS, PHP, JS) ARE baked into the image so they update automatically on redeploy.

---

### WordPress Database

The MySQL database is also stored in a Docker named volume (`db_data`). This means:
- All page content, posts, settings, and user accounts persist across restarts
- The database is not in Git (it shouldn't be — it contains passwords and private data)
- To back up: use a WordPress backup plugin (e.g. UpdraftPlus) or `mysqldump`

---

### Security Decisions

- Passwords are stored in `.env` (not committed to Git — see `.gitignore`)
- Contact form submissions are validated server-side and use a WordPress nonce to prevent CSRF attacks
- User input is sanitised with WordPress functions (`sanitize_text_field`, `sanitize_email`, etc.) before use
- `.env.example` is committed as a template — it contains no real secrets

---

## Planned Future Changes

These are things that could be added when needed:

- **Custom logo** — replace the emoji placeholder once the final logo file is provided
- **Social media links** — add Facebook/Instagram icons to the footer
- **Events/fixtures page** — could use a free plugin like "The Events Calendar" or a custom post type
- **Sponsor logos** — a sponsor grid section on the homepage
- **Online registration form** — could link to an external platform (e.g. PlayFootball) or use a form plugin
- **SSL/HTTPS** — when the site goes to a public domain, add an SSL certificate via Nginx reverse proxy + Let's Encrypt
- **Custom domain** — update `SITE_URL` in `.env` and DNS records when a domain is registered
