# How to Design a Language Learning Database

This document describes the methodology for creating a high-quality language database from scratch — from choosing words, to grouping them into lessons, to writing sentences.

---

## The big picture

A database is built in three stages:

1. **Choose words** — collect a set of words and phrases worth teaching.
2. **Design lessons** — group words into themed lessons and order them by importance.
3. **Write sentences** — compose example sentences using only words already introduced.

The order of these stages matters. Good word and lesson design makes sentence writing straightforward. Poor design makes it nearly impossible to write natural sentences with only the known vocabulary.

---

## Stage 1 — Choose your words

### Use an existing frequency list

You do not need to invent a word list from scratch. Frequency lists already exist for most languages — these rank words by how often they appear in everyday speech and writing. The most frequent words are the most useful ones to teach.

Good sources:
- **Wiktionary frequency lists** — free, available for many languages.
- **OpenSubtitles frequency lists** — based on movie and TV subtitles, so they reflect spoken language.
- **Anki decks** — many shared decks for popular language pairs contain curated word lists.
- **CEFR word lists** — the Common European Framework of Reference (A1, A2, B1…) publishes recommended vocabulary for each level.

### How many words to aim for

| Level | Target vocabulary |
|-------|-------------------|
| A1    | 500–800 words     |
| A2    | 1,000–1,500 words |
| B1    | 2,000–2,500 words |

For a first database, 500–800 words (A1) is a realistic and highly useful target.

### Filter the list

A raw frequency list contains a lot of noise — very technical words, proper nouns, words that only make sense in writing. Go through the list and:

- Remove proper nouns (names, cities, brands).
- Remove words that are too technical for the target level.
- Add important words that are missing — some common phrases ("excuse me", "how much?") may not rank highly on frequency lists but are essential for communication.
- Mark words that come in natural groups (e.g., days of the week, family members, numbers) — these will form lessons together.

---

## Stage 2 — Design your lessons

### Lesson size: 6–12 words

Each lesson should introduce between **6 and 12 new words**. This is small enough to be digestible in one session, and large enough to write varied, natural sentences.

If a natural group (e.g., all twelve months) has more than 12 entries, split it into two lessons.

### Two types of lessons

**Thematic lessons** — words connected by topic:
- Food and drink
- Body parts
- Transportation
- Weather
- Numbers 1–10

**Functional lessons** — words connected by their grammatical role or communicative purpose:
- Greetings and farewells
- Question words (who, what, where, when, why, how)
- Personal pronouns (I, you, he, she…)
- Common verbs (be, have, want, go, come)
- Conjunctions and connectors (and, but, because, so)

In practice, many lessons are a mix of both.

### Order lessons by communicative importance

The first lessons should contain the words a learner needs most urgently — words that unlock the ability to say and understand basic things. Later lessons can introduce more specialized vocabulary.

A suggested ordering principle:

1. **Core function words first** — pronouns, the verbs "to be" and "to have", basic question words, yes/no, greetings. These appear in almost every sentence.
2. **High-frequency verbs next** — go, come, want, need, know, see, give, take.
3. **Essential nouns and adjectives** — people, places, time, numbers, basic descriptors (big, small, good, bad).
4. **Thematic groups** — food, transportation, health, work, etc.
5. **Refinement vocabulary** — more specific words, nuance, formal register.

A useful test: *Can a learner say something meaningful after the first five lessons?* If not, the ordering may need adjustment.

### The sentence constraint

Every sentence in a lesson can only use:
- Words introduced in **this lesson**, and
- Words introduced in **all previous lessons**.

This constraint is central to the design. It is what forces you to order lessons carefully. If you find it difficult to write natural sentences for a lesson because essential connecting words are missing, that is a sign you need to introduce those connecting words in an earlier lesson.

Before writing sentences, list the full vocabulary available at each stage. A simple spreadsheet works well:

| Lesson | New words | Total available words |
|--------|-----------|-----------------------|
| 1      | hello, goodbye, yes, no, please, thank you | 6 |
| 2      | I, you, he, she, we, they, am, is, are | 15 |
| 3      | man, woman, boy, girl, name, friend | 21 |
| …      | …         | …                     |

---

## Stage 3 — Write sentences

### General principles

- **Write sentences you might actually say or hear.** Avoid combinations that are grammatically correct but would never occur in real life ("The green idea sleeps furiously").
- **Cover different sentence types.** Include statements, questions, and negatives. Include first, second, and third person. Include singular and plural.
- **Increase complexity gradually.** Early lessons in a section can have short, simple sentences. Later lessons can combine two clauses, add qualifiers, and so on.
- **Aim for 10–20 sentences per lesson.** Fewer than 10 gives the learner too little practice. More than 20 becomes repetitive.

### Using AI to help write sentences

Once you have a word list for a lesson and know which words were introduced before it, you can ask an AI (Claude, ChatGPT, etc.) to generate the sentences for you. A good prompt:

> I am building a language learning database. The target language is **[language]**.
>
> The learner already knows these words:
> [paste the full list of all words introduced so far]
>
> This lesson introduces these new words:
> [paste the new words for this lesson]
>
> Please write 15 natural sentences for this lesson. Each sentence must only use words from the combined list above. Include a mix of statements, questions, and negatives. Provide both the English and [target language] versions.

Verify that the output actually respects the constraint — AI models sometimes slip in words that haven't been introduced yet.

### Handling alternatives

Some sentences have more than one correct translation. Store these as alternatives rather than picking just one. This is especially important when:
- Formal and informal registers differ (e.g., Serbian "ti" vs. "vi").
- Regional variants exist (e.g., ekavian vs. ijekavian in Serbian).
- Word order is flexible and multiple orderings are equally natural.

---

## Common mistakes

**Too many new words per lesson.** If a lesson introduces 20 words, learners cannot absorb them all and sentence writing becomes very difficult. Split the lesson.

**Lessons in the wrong order.** If lesson 5 introduces "and" and "but", you will find it nearly impossible to write natural sentences for lessons 1–4 without using those words. Conjunctions, pronouns, and the verb "to be" need to come first.

**Sentences that require unknown words.** Always check that every word in every sentence has been introduced in this or a previous lesson. This is the most common quality issue in AI-generated content.

**Unnatural sentences.** Sentences like "The bread is my friend" or "He gives the dog to the woman" are grammatically correct but sound strange. If a sentence makes a native speaker pause, replace it.

**Ignoring gender and agreement.** Many languages have grammatical gender, case, and agreement rules. Make sure translations are grammatically correct — adjectives agree with nouns, verbs agree with subjects, pronouns are in the right case.

---

## Example: designing the first three lessons

**Available words after downloading a frequency list (top 30):**
hello, goodbye, yes, no, please, thank you, sorry, excuse me, I, you, he, she, we, they, be (am/is/are), have, a, the, man, woman, boy, girl, name, friend, good, bad, big, small, and, but

**Lesson 1 — Greetings & Essentials (functional)**
New words: hello, goodbye, yes, no, please, thank you, sorry, excuse me
→ These 8 words give the learner the ability to greet, agree, disagree, and be polite.

**Lesson 2 — Pronouns & "To Be" (functional)**
New words: I, you, he, she, we, they, am, is, are
→ Combined with lesson 1, the learner can now say "Yes, I am here" or "He is good."

**Lesson 3 — Basic Nouns & Adjectives (thematic + descriptors)**
New words: man, woman, boy, girl, friend, name, good, bad
→ Now sentences like "I am a good friend" or "She is a woman" become possible.

Notice that "and" and "but" are held back until lesson 4 or later — as soon as they are introduced, sentence variety increases dramatically.

---

## Checklist before publishing

- [ ] Each lesson has 6–12 new words.
- [ ] Lessons are ordered so that earlier lessons provide the building blocks for later ones.
- [ ] Every sentence uses only words from this lesson and previous lessons.
- [ ] Sentences are natural — a native speaker would actually say them.
- [ ] Translations are grammatically correct, including gender agreement and case.
- [ ] Common alternatives are listed (formal/informal, regional variants).
- [ ] The database has been tested in the app and all sentences display correctly.
