# Creating a Language Database

This guide is for language learning experts who want to create or improve a database for this app — no programming experience required.

---

## What you'll need

- A free [GitHub account](https://github.com/signup)
- A web browser — that's it. Nothing to install.

---

## Concepts in plain English

| Term | What it means |
|------|---------------|
| **Fork** | Your own personal copy of a database on GitHub. You can change it freely without affecting the original. |
| **Branch** | A working area inside your fork where you make your edits. The main version stays untouched until you're happy with your changes. |
| **Pull request** | A request to the original author to review your changes and merge them into the main database. |

---

## Step 1 — Fork an existing database

The easiest way to start is to fork an existing database and modify it.

The [A1 English–Serbian database](https://github.com/vbrankov/Language-Learning-DB) is a good starting point — it has 106 lessons and 5,887 sentences you can learn from or build on.

1. Go to the database repository you want to fork.
2. Make sure you're logged in to GitHub.
3. Click **Fork** in the top-right corner.
4. Click **Create fork**. GitHub creates your own copy at `https://github.com/YOUR-USERNAME/REPO-NAME`.

> Your fork is completely independent. You can experiment freely.

---

## Step 2 — Enable your database as a live website

Once you have a fork, you can publish it so anyone can use it in the Language Learning App.

1. Go to your fork on GitHub.
2. Click **Settings** → **Pages** (in the left sidebar).
3. Under **Source**, choose **Deploy from a branch**, select `main`, folder `/ (root)`, and click **Save**.

After a minute or two, your database file will be live at:
```
https://YOUR-USERNAME.github.io/REPO-NAME/your-database.json
```

You can then open it in the app with:
```
https://vbrankov.github.io/Language-Learning-App/?db=https://YOUR-USERNAME.github.io/REPO-NAME/your-database.json
```

---

## Step 3 — Create a branch

Before making any edits, create a branch. This keeps your work organised and makes it easy to submit changes later.

1. On your fork, click the branch selector (it says **main**) near the top-left.
2. Type a short name for your branch, e.g. `add-food-vocabulary` or `fix-lesson-12`.
3. Click **Create branch**.

You are now working on your new branch.

---

## Step 4 — Edit the database

You have two good options: editing manually in the browser, or asking an AI to write the content for you.

---

### Option A — Edit manually in the browser

GitHub has a full editor built in. No installation needed.

1. Go to your fork on GitHub and make sure your branch is selected.
2. Press the `.` key (period) on your keyboard. This opens **github.dev**, a full code editor in your browser.
3. In the file tree on the left, click your database JSON file.
4. Make your changes. The editor highlights errors in red if the JSON structure breaks.
5. When done, click the **Source Control** icon in the left sidebar (looks like a branch), write a short description of your changes, and click **Commit & Push**.

#### Database format

The database is a JSON file. Here is a complete minimal example:

```json
{
  "version": "3.0",
  "languages": ["English", "Serbian"],
  "lessons": [
    {
      "title": ["At the Market", "Na pijaci"],
      "words": [["apple", "jabuka"], ["bread", "hleb"], "cheap", "expensive"],
      "sentences": [
        ["An apple a day.", "Jedna jabuka dnevno."],
        ["The bread is cheap.", ["Hleb je jeftin.", "Kruh je jeftin."]]
      ]
    }
  ]
}
```

Key rules:
- `languages` lists the languages in order. Each sentence is an array with one entry per language — `sentence[0]` is always the first language, `sentence[1]` the second.
- `title` follows the same order as `languages`.
- `words` lists vocabulary introduced in the lesson. Each entry can be a plain string (source language only) or a language-indexed array like `["apple", "jabuka"]`.
- If a translation has multiple valid alternatives, use an array for that slot: `["option 1", "option 2"]`.
- Lessons and sentences have no IDs — their position in the array is their identity. **Do not reorder existing lessons or sentences** unless you intend to create a new version of the database.

---

### Option B — Ask an AI to write the content

This is the fastest approach. You describe what you want, the AI writes the JSON, and you paste it in.

**Works with:** [Claude](https://claude.ai), [ChatGPT](https://chat.openai.com), or any capable AI assistant.

#### How to prompt the AI

Paste this into the chat, filling in the parts in `[brackets]`:

---

> I am building a language learning database. I need you to generate lessons in a specific JSON format.
>
> The format for one lesson is:
> ```json
> {
>   "title": ["Source language title", "Target language title"],
>   "words": [["word1", "translation1"], ["word2", "translation2"]],
>   "sentences": [
>     ["Source language sentence.", "Target language sentence."],
>     ["Another sentence.", ["Alternative 1.", "Alternative 2."]]
>   ]
> }
> ```
>
> Rules:
> - No IDs — lessons and sentences are identified by their position in the array.
> - Each lesson should have 10–20 sentences.
> - Sentences should only use vocabulary introduced in that lesson or earlier lessons.
> - If a translation has common alternatives, list them as an array for that language slot.
>
> Please generate [number] lessons about [topic, e.g. "food and shopping"] for [language pair, e.g. "English to French"] at [level, e.g. A1] level.

---

The AI will produce valid JSON that you can copy directly into github.dev.

> **Tip:** You can have a real conversation with the AI. Ask it to adjust difficulty, add more sentences, change vocabulary, fix a translation — just like talking to a colleague.

#### Using GitHub Copilot (built into github.dev)

If you prefer to stay entirely within GitHub, you can use GitHub Copilot — GitHub's own AI assistant, available directly inside github.dev.

1. Open github.dev (press `.` on your repo).
2. Click the **Copilot chat icon** in the left sidebar.
3. Describe what you need: *"Add 10 sentences about daily routines in Italian, following the existing format in this file."*
4. Copilot will generate the JSON inline.

GitHub Copilot requires a GitHub account with Copilot enabled (free for individuals as of 2025).

---

## Step 5 — Submit your changes for review (pull request)

Once you're happy with your edits:

1. Go to your fork on GitHub.
2. GitHub will show a banner: **"Your branch is ahead of the original"** with a **Compare & pull request** button. Click it.
3. Write a short description of what you changed and why.
4. Click **Create pull request**.

The original author will review your changes and can accept, discuss, or suggest improvements before merging them.

---

## Tips

- **Start small.** Try adding or correcting a single sentence before doing a whole lesson.
- **Check IDs.** The most common mistake is duplicate IDs. Make sure every lesson and sentence has a unique number, and update `nextLessonId` / `nextSentenceId` at the top of the file.
- **Test your changes.** After committing, wait a minute for GitHub Pages to rebuild, then open your live database URL in the app to verify everything works.
- **Ask questions.** Open an [Issue](../../issues) on this repository if you need help.
