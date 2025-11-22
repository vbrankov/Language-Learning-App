# Language Learning Web Application - Project Specification

## Overview

A web application for language learning through translation exercises. Users select lessons, translate sentences between source and destination languages, and track their learning progress over time.

## Technology Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Data Persistence**: localStorage (no backend initially)
- **Hosting**: Vercel (static frontend)
- **Development**: Claude Code linked to VS Code

## Core Features

### 1. Lesson List View
- Display all available lessons with titles
- Show progress summary per lesson (completion rate, accuracy)
- Allow user to select a lesson to practice

### 2. Quiz Interface
- Present sentences one at a time
- Two directions: source→destination or destination→source
- Text input for user's answer
- Check answer (case-insensitive exact match initially)
- Show correct/incorrect feedback
- Display correct answer when wrong
- Progress through all sentences in lesson

### 3. Progress Tracking
- Track per sentence: correct count, incorrect count, last attempted
- Track per lesson: completion rate, overall accuracy
- Persist in localStorage across sessions
- Display stats dashboard

### 4. Export/Import
- Export progress as JSON file (backup)
- Import progress from JSON file (restore/transfer)

## Data Structures

### Lesson Database (enhanced with IDs)

```json
{
  "version": "1.0",
  "sourceLanguage": "English",
  "destinationLanguage": "Serbian",
  "lastUpdated": "2024-11-19",
  "nextLessonId": 31,
  "nextSentenceId": 481,
  "lessons": [
    {
      "id": 1,
      "title": "Greetings",
      "sentences": [
        {
          "id": 1,
          "source": "Hello",
          "destination": "Zdravo"
        },
        {
          "id": 2,
          "source": "Good morning",
          "destination": "Dobro jutro"
        }
      ]
    }
  ]
}
```

### User Progress (localStorage)

```json
{
  "sentences": {
    "1": {
      "correct": 5,
      "incorrect": 2,
      "lastAttempted": "2024-11-19T10:30:00Z"
    },
    "2": {
      "correct": 3,
      "incorrect": 0,
      "lastAttempted": "2024-11-19T10:25:00Z"
    }
  },
  "settings": {
    "theme": "light"
  }
}
```

## Development Tasks

### Task 1: ID Assignment Tool

Create a CLI tool that processes raw lesson JSON and assigns stable integer IDs.

**Input**: Raw JSON (array of lessons with sentences, no IDs)

**Output**: Enhanced JSON with IDs and counters

**Logic**:
- Assign sequential IDs to lessons (1, 2, 3...)
- Assign sequential IDs to sentences globally (1, 2, 3...)
- Track nextLessonId and nextSentenceId counters
- Add metadata (version, sourceLanguage, destinationLanguage, lastUpdated)

### Task 2: Migration Tool

Create a CLI tool that maps old enhanced database to new raw database, preserving IDs where content matches.

**Input**: 
- Old enhanced JSON (with IDs)
- New raw JSON (without IDs)

**Output**:
- New enhanced JSON (with preserved IDs where content matches)
- Migration report

**Logic**:
1. Match lessons by title (fuzzy match for minor changes)
2. Match sentences by exact text (source + destination)
3. Preserve IDs for matched content
4. Assign new IDs for new content
5. Report deleted content (orphaned progress)
6. Ask user only for ambiguous cases (e.g., "Is 'Greeting' same as 'Greetings'?")

### Task 3: React Application

**Pages/Components**:

```
App
├── HomePage (lesson list)
│   └── LessonCard (shows title, progress stats)
├── QuizPage
│   ├── QuestionDisplay (shows source sentence)
│   ├── AnswerInput (text input)
│   ├── Feedback (correct/incorrect display)
│   └── ProgressBar (current position in lesson)
├── StatsPage
│   ├── OverallStats (total correct/incorrect, streak)
│   └── LessonStats (per-lesson breakdown)
└── SettingsPage
    ├── ExportButton
    └── ImportButton
```

**Progress Manager Module**:

```typescript
interface SentenceProgress {
  correct: number;
  incorrect: number;
  lastAttempted: string;
}

interface UserProgress {
  sentences: Record<number, SentenceProgress>;
  settings: Record<string, any>;
}

class ProgressManager {
  static getProgress(): UserProgress;
  static recordAnswer(sentenceId: number, isCorrect: boolean): void;
  static getLessonStats(lessonId: number, sentences: Sentence[]): LessonStats;
  static getSentencesNeedingPractice(): SentenceProgress[];
  static exportProgress(): void;
  static importProgress(file: File): void;
}
```

## Design Guidelines

- Desktop-first layout (mobile responsiveness later)
- Clean, distraction-free quiz interface
- Clear visual feedback for correct/incorrect answers
- Progress indicators on lesson cards
- Minimal dependencies

## Input File

The raw lesson database is provided as: `lessons_1_to_30_bilingual_complete.json`

This needs to be processed by the ID Assignment Tool first.

## Future Extensibility (Do Not Implement Now)

The architecture should accommodate future additions:
- Voice synthesis (text-to-speech for sentences)
- Voice recognition (speech-to-text for answers)
- Reading stories (long text display)
- Dialogs (turn-by-turn conversations)
- Spaced repetition algorithm
- Answer flexibility (equivalent phrases)
- User authentication
- Multi-device sync via backend
- Mobile-responsive design

## Constraints

- No authentication required initially
- No backend required initially
- Exact match for answers (case-insensitive)
- Use "source" and "destination" language terminology (not hardcoded language names)

## Deliverables

1. ID Assignment Tool (Node.js CLI script)
2. Migration Tool (Node.js CLI script)
3. React application with all core features
4. Enhanced lesson database (processed from raw input)
5. README with setup and usage instructions
