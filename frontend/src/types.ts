// Core data types for the language learning database

export interface Sentence {
  id: number;
  sentences: Array<string | string[]>; // one entry per language; each can be an array of alternatives
}

export interface Lesson {
  id: number;
  title: string | string[]; // indexed by language, e.g. ["English title", "Serbian title"]
  words: string[];
  sentences: Sentence[];
}

export interface LessonDatabase {
  version: string;
  languages: string[]; // e.g. ["English", "Serbian"]
  lastUpdated: string;
  nextLessonId: number;
  nextSentenceId: number;
  metadata: Record<string, any>;
  lessons: Lesson[];
}

// User progress tracking

export interface SentenceProgress {
  correct: number;
  incorrect: number;
  lastAttempted: string; // ISO date string
}

export interface UserProgress {
  sentences: Record<number, SentenceProgress>; // key is sentence ID
  settings: {
    theme?: string;
    [key: string]: any;
  };
}

// Quiz configuration

export type QuizDirection = 'source-to-dest' | 'dest-to-source' | 'source-to-source' | 'dest-to-dest';
export type QuizMode = 'type' | 'multiple-choice' | 'speak';
export type QuizAlgorithm = 'A' | 'B';

export interface QuizSettings {
  lessonId: number;
  direction: QuizDirection;
  mode: QuizMode;
  algorithm: QuizAlgorithm;
  englishVoice?: string;
  serbianVoice?: string;
}

// Lesson statistics for display

export interface LessonStats {
  lessonId: number;
  totalSentences: number;
  attemptedSentences: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number; // 0-100
  lastAttempted: string | null; // ISO date string or null
}
