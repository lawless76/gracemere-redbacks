# Gracemere Redbacks Soccer Club — Website

Astro-powered static site with Decap CMS for content editing, served by Nginx in Docker, deployed via GitHub Actions to Dockge on TrueNAS.

## Tech Stack

| Layer | Tool |
|---|---|
| Site framework | [Astro](https://astro.build) (static output) |
| Content management | [Decap CMS](https://decapcms.org) (web UI at `/admin`) |
| Contact form | [Formspree](https://formspree.io) (free tier) |
| Container | Docker / Nginx |
| CI/CD | GitHub Actions → ghcr.io |
| Deployment | Dockge on TrueNAS (`http://10.0.1.252:5000`) |

---

## One-Time Setup

### 1. Install dependencies and test locally

```bash
npm install
npm run dev
# → http://localhost:4321
```

### 2. Set up Formspree (contact form)

1. Go to [formspree.io](https://formspree.io) and create a free account
2. Click **New Form** → name it "Redbacks Contact" → copy the form ID (e.g. `xpwzabcd`)
3. Open `src/pages/contact.astro` and replace `YOUR_FORMSPREE_ID` with your ID

### 3. Set up Decap CMS (content editor login)

Decap CMS uses GitHub OAuth so editors can log in with their GitHub account and edit content via a web UI.

**3a. Create a GitHub OAuth App**

Go to [github.com/settings/developers](https://github.com/settings/developers) → **OAuth Apps** → **New OAuth App**

| Field | Value |
|---|---|
| Application name | Gracemere Redbacks CMS |
| Homepage URL | `http://10.0.1.252:5000` |
| Authorization callback URL | `http://10.0.1.252:5000/admin/` |

Click **Register application**, then copy the **Client ID**.

**3b. Add the Client ID to the config**

Open `public/admin/config.yml` and replace `YOUR_GITHUB_OAUTH_APP_CLIENT_ID` with the Client ID.

Commit and push — GitHub Actions will rebuild the site automatically.

### 4. Make GHCR package public

After the first GitHub Actions run:

1. Go to [github.com/lawless76](https://github.com/lawless76) → **Packages** → `gracemere-redbacks`
2. **Package settings** → **Change visibility** → **Public**

### 5. Set up Dockge stack

In Dockge, create (or update) a stack named `gracemere-redbacks` and paste the contents of `docker-compose.yml`.

No `.env` file is needed — the Astro site has no secrets.

---

## Deploy Workflow

```
Edit content in /admin  →  Decap commits to GitHub
          OR
Edit code locally       →  git push origin main
                               ↓
                   GitHub Actions: npm ci → npm run build → Docker build → push to ghcr.io
                               ↓
                   In Dockge: Pull → Restart
                               ↓
                   Site live at http://10.0.1.252:5000
```

---

## Content Editing (Decap CMS)

Editors visit `http://10.0.1.252:5000/admin/` and log in with GitHub.

| What to edit | Where in the CMS |
|---|---|
| News posts (create/edit/delete) | **News Posts** collection |
| About Us page content | **Pages → About Us** |
| Programs page content | **Pages → Programs** |

Home page hero text, contact details, and footer links are in the source files and require a code edit + push.

---

## Project Structure

```
src/
  content/
    news/           ← Markdown files for news posts (managed by Decap CMS)
    pages/
      about.md      ← About page content (managed by Decap CMS)
      programs.md   ← Programs page content (managed by Decap CMS)
  layouts/
    BaseLayout.astro
  components/
    Header.astro
    Footer.astro
  pages/
    index.astro     ← Home page
    about.astro
    programs.astro
    contact.astro
    news/
      index.astro   ← News listing
      [slug].astro  ← Individual news post
  styles/
    global.css
public/
  admin/
    index.html      ← Decap CMS loader
    config.yml      ← Decap CMS configuration
  uploads/          ← Images uploaded via CMS
```

---

## FAQ

**Decap CMS says "Unable to authenticate"**
Check the GitHub OAuth App callback URL is exactly `http://10.0.1.252:5000/admin/` (with trailing slash), and that the Client ID in `public/admin/config.yml` is correct.

**I pushed code but the site hasn't updated**
Go to Dockge, open the `gracemere-redbacks` stack, click **Pull** then **Restart**.

**I edited content in the CMS but the site hasn't changed**
The CMS commits to GitHub, which triggers GitHub Actions to rebuild. Wait ~2 minutes, then pull and restart in Dockge.

**How do I add a new page?**
Create a new `.astro` file in `src/pages/` and add the nav link in `src/components/Header.astro`. Then push to GitHub.

**How do I change the site colours or fonts?**
Edit the CSS variables at the top of `src/styles/global.css`.
