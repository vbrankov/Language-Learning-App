# Language Learning Web Application

A React + TypeScript web application for language learning through translation exercises.

## Features

- **Lesson List**: Browse all available lessons with progress tracking
- **Quiz Modes**: 
  - Type answers manually
  - Multiple choice (5 options)
- **Translation Directions**: Practice both source→destination and destination→source
- **Algorithm A**: Random selection with automatic removal of mastered sentences
- **Progress Tracking**: All progress saved in localStorage
- **Statistics**: Track correct/incorrect counts, accuracy, and last practice time

## Technology Stack

- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- localStorage for data persistence

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── data/              # Lesson database
│   ├── pages/             # React pages/routes
│   │   ├── HomePage.tsx
│   │   ├── QuizSettingsPage.tsx
│   │   └── QuizPage.tsx
│   ├── utils/             # Utilities
│   │   ├── ProgressManager.ts
│   │   ├── QuizAlgorithms.ts
│   │   └── timeAgo.ts
│   ├── types.ts           # TypeScript type definitions
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## How to Use

1. **Select a Lesson**: Click on any lesson from the home page
2. **Configure Quiz**: Choose translation direction, answer mode, and algorithm
3. **Practice**: Answer questions - correct answers advance automatically, incorrect ones show the correct answer
4. **Track Progress**: Return to home to see your progress statistics

## Data Structure

The app uses an enhanced lesson database with:
- Sequential IDs for lessons and sentences
- Source and destination language pairs
- Progress tracking keyed by sentence IDs

## Future Enhancements

- Algorithm B (priority-based selection)
- Spaced repetition
- Voice synthesis and recognition
- Reading stories and dialogs
- Multi-device sync
- Mobile responsive design
