# Language Learning App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A web app for learning languages through translation exercises. It works with any language pair and any database — you bring the content, the app handles the learning.

**[Try it with the A1 English–Serbian database →](https://vbrankov.github.io/Language-Learning-App/?db=https://vbrankov.github.io/Language-Learning-DB/a1_english_serbian.json)**

---

## How it works

The app loads a lesson database from a URL you provide:

```
https://vbrankov.github.io/Language-Learning-App/?db=<your-database-url>
```

Anyone can create a database and share a link — no server required. Databases are plain JSON files hosted on GitHub Pages.

---

## Features

- **Multiple quiz modes** — type your answer, multiple choice, or speak it aloud
- **Both directions** — translate from source to target language and back
- **Smart repetition** — correct answers are removed from the pool; wrong ones stay until mastered
- **Progress tracking** — all progress saved locally in your browser
- **Voice support** — text-to-speech and speech recognition (where supported by the browser)

---

## Available databases

| Database | Level | Link |
|----------|-------|------|
| [A1 English–Serbian](https://github.com/vbrankov/Language-Learning-DB) | A1 | [Launch](https://vbrankov.github.io/Language-Learning-App/?db=https://vbrankov.github.io/Language-Learning-DB/a1_english_serbian.json) |

---

## Creating your own database

See [DATABASE_DESIGN.md](DATABASE_DESIGN.md) for the methodology — how to choose words, design lessons, and write sentences that build on each other.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the technical step-by-step — forking, editing in the browser, using AI to generate content, publishing on GitHub Pages, and submitting improvements via pull request.

---

## Running locally

```bash
cd frontend
npm install
npm run dev
```

Open `https://localhost:5173/Language-Learning-App/?db=<your-database-url>`.

---

## Technology

- React 18 + TypeScript
- Vite
- Tailwind CSS
- localStorage for progress (no backend)
