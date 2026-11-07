# My Portfolio

A personal portfolio with a draggable 3D ID badge, built with **React + Three.js + Vite**.

---

## 1. Edit your content

Everything you need to change is in **`src/data.js`**: your name, bio, projects, socials, and more.

- **Your photo:** put it in the `public` folder (for example `public/photo.jpg`), then set `photo: '/photo.jpg'`.
  It appears on the 3D badge and in the About section.
- **Project screenshots:** put them in `public/projects/`, then set `image: '/projects/my-app.png'`.
- **Spotify section:** paste a playlist link into `music.playlist`. Leave it empty to hide the section.
- **Contact form:** see step 5 below.

## 2. Run it on your computer

Open **Terminal** in this folder and run:

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5173. The page refreshes by itself every time you save a file.
Press `Ctrl + C` in Terminal to stop the server.

---

## 3. Upload to GitHub

### a) One-time setup

1. Create a free account at https://github.com.
2. Tell git who you are (use the same email as your GitHub account):

   ```bash
   git config --global user.name "Your Name"
   ```

   ```bash
   git config --global user.email "you@example.com"
   ```

3. Log in to GitHub from Terminal (the GitHub CLI is already installed). Choose **GitHub.com → HTTPS → Login with a web browser**:

   ```bash
   gh auth login
   ```

### b) Save your project in git (first time only)

Run these inside the `Portfolio` folder:

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "First version of my portfolio"
```

> `node_modules` is listed in `.gitignore`, so it is **not** uploaded. That's correct: Vercel installs it by itself.

### c) Create the GitHub repository and push

```bash
gh repo create portfolio --public --source=. --remote=origin --push
```

Open https://github.com/YOUR-USERNAME/portfolio to see your code online.

*(Prefer the website? Click **New repository** on github.com, name it `portfolio`, don't add a README,
then run the two commands GitHub shows under "…or push an existing repository from the command line".)*

---

## 4. Deploy on Vercel

1. Go to https://vercel.com and click **Sign Up → Continue with GitHub**.
2. Click **Add New… → Project**.
3. Find your `portfolio` repository and click **Import**.
4. Vercel detects **Vite** automatically. Leave the settings as they are:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click **Deploy** and wait about a minute.
6. You now have a live link like `https://portfolio-yourname.vercel.app`.

**Change the link name:** Project → **Settings → Domains** → edit the `.vercel.app` name (for example `yourname.vercel.app`).

---

## 5. Updating your site later

Every push to GitHub redeploys the site automatically:

```bash
git add .
```

```bash
git commit -m "Update projects"
```

```bash
git push
```

Wait about a minute, then refresh your Vercel link.

---

## 6. Make the contact form send emails (optional, free)

1. Sign up at https://formspree.io and create a new form.
2. Copy the endpoint, which looks like `https://formspree.io/f/abcdwxyz`.
3. Paste it into `contactForm.formspreeEndpoint` in `src/data.js`, then push.

Until you do this, the form opens the visitor's email app with the message already filled in.

---

## Project structure

```
src/
  data.js              ← your content (edit this)
  styles.css           ← colors, fonts, layout
  components/
    Lanyard.jsx        ← the 3D swinging badge
    Hero.jsx  About.jsx  Portfolio.jsx  Contact.jsx  Music.jsx  Footer.jsx
    Starfield.jsx      ← animated star background
    Loader.jsx  Nav.jsx  Social.jsx  Icons.jsx
public/                ← images, photo, resume PDF, favicon
```

**Change the main color:** in `src/styles.css`, edit `--accent` at the top (for example `#a855f7` for purple).
