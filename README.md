# 🎬 Letterboxd GitHub Stats Card

A dynamic, high-performance SVG stats card that displays your recently logged [Letterboxd](https://letterboxd.com) films directly inside your GitHub profile `README.md`.

---

## ✨ Features

- **No Official API Key Required:** Automatically parses Letterboxd's public RSS feed (`https://letterboxd.com/<username>/rss/`).
- **GitHub Camo Friendly:** Poster images are automatically fetched and encoded into Base64 Data URIs so GitHub's Content Security Policy doesn't block them.
- **Multiple Themes:** Supports `letterboxd` (default), `dark`, `light`, `tokyonight`, `dracula`, `catppuccin`, and `transparent`.
- **Customizable:** Adjust number of films (1–6), hide borders, toggle watch dates, and customize width.
- **Aggressive Edge Caching:** Headers pre-configured (`Cache-Control`) to deliver rapid loading times without hitting rate limits.

---

## 🚀 Quick Deploy to Vercel

Deploy your own instance to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/letterboxd-readme-stats)

Or deploy manually via the Vercel CLI:

```bash
npm install -g vercel
vercel
```

---

## 📌 Usage in GitHub Profile

Once deployed to Vercel, embed the image in your GitHub `README.md`:

### Markdown
```markdown
[![Letterboxd Recent Watches](https://your-vercel-app.vercel.app/api?username=YOUR_LETTERBOXD_USERNAME)](https://letterboxd.com/YOUR_LETTERBOXD_USERNAME/)
```

### HTML (Centered)
```html
<p align="center">
  <a href="https://letterboxd.com/YOUR_LETTERBOXD_USERNAME/">
    <img src="https://your-vercel-app.vercel.app/api?username=YOUR_LETTERBOXD_USERNAME&theme=letterboxd" alt="Letterboxd Recent Films" />
  </a>
</p>
```

---

## ⚙️ Query Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `username` | `string` | **(Required)** | Your Letterboxd username |
| `count` | `number` | `4` | Number of movies to show (min: 1, max: 6) |
| `theme` | `string` | `letterboxd` | Color theme (`letterboxd`, `dark`, `light`, `tokyonight`, `dracula`, `catppuccin`, `transparent`) |
| `hide_border` | `boolean` | `false` | Set to `true` to remove the outer card border |
| `show_date` | `boolean` | `true` | Show watched date if movie is unrated |
| `width` | `number` | `495` | Custom card width in pixels |

### Examples:

- **Letterboxd Theme (Default):**
  ```markdown
  https://your-vercel-app.vercel.app/api?username=davidehrlich&theme=letterboxd
  ```

- **GitHub Dark Theme (3 Movies):**
  ```markdown
  https://your-vercel-app.vercel.app/api?username=davidehrlich&theme=dark&count=3
  ```

- **Tokyo Night Theme without border:**
  ```markdown
  https://your-vercel-app.vercel.app/api?username=davidehrlich&theme=tokyonight&hide_border=true
  ```

- **Transparent Background (great for dual light/dark mode):**
  ```markdown
  https://your-vercel-app.vercel.app/api?username=davidehrlich&theme=transparent
  ```

---

## 🛠️ Local Development

1. Clone or navigate to the project directory:
   ```bash
   cd letterboxd-github-card
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the local dev server using the Vercel CLI:
   ```bash
   npx vercel dev
   ```

4. Open `http://localhost:3000/api?username=YOUR_USERNAME` in your browser.
